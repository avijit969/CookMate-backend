import { Context } from "hono";
import db from "../db";
import { ingredient, recipe, user } from "../db/schema";
import { eq, ilike, like } from "drizzle-orm/sql/expressions/conditions";
import redisClinet from "../helper/redis";
import { count, SQL } from "drizzle-orm";

// create new recipe
const createRecipe = async (c: Context) => {
  try {
    const { title, ingredients, instructions, description ,image} =
      await c.req.json();
    if (!title || !ingredients || !instructions) {
      return c.json(
        {
          message:
            "title, ingredients, instructions[{name, type, quantity, unit}], description are required",
        },
        400
      );
    }

    const user = c.get("user");
    const userId = user?.id;

    const newRecipe = await db
      .insert(recipe)
      .values({ title, userId, instructions, description ,image })
      .returning({
        id: recipe.id,
        title: recipe.title,
      })
      .execute();

    if (!newRecipe.length) {
      return c.json({ error: "Failed to create recipe" }, 500);
    }

    const addIngredients = ingredients.map((ing: any) => ({
      ...ing,
      recipeId: newRecipe[0].id,
    }));

    await db.insert(ingredient).values(addIngredients).execute();

    // Cache the new recipe immediately
    await redisClinet.setEx(
      `recipe:${newRecipe[0].id}`,
      3600,
      JSON.stringify({
        ...newRecipe[0],
        ingredients: addIngredients,
      })
    );
    return c.json(
      { message: "Recipe created successfully", recipe: newRecipe[0] },
      201
    );
  } catch (error: any) {
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};

// get recipe by id with cache
export const getRecipeById = async (c: Context) => {
  const { id } = c.req.param();
  console.log(id)
  if (!id) {
    return c.json({ error: "Recipe ID is required" }, 400);
  }

  try {
    //    Check Redis cache first
    const cachedRecipe = await redisClinet.get(`recipe:${id}`);
    if (cachedRecipe) {
      console.log("Serving from cache");
      return c.json({ recipe: JSON.parse(cachedRecipe) }, 200);
    }

    // Fetch from DB
    const foundRecipe = await db.query.recipe.findFirst({
      where: eq(recipe.id, id),
      columns:{
        title:true,
        image:true,
        description:true,
        instructions:true,
      },
      with: {
        ingredients: true,
        likes:{
          columns:{
            userId:true
          }
        },
        createdBy:{
          columns:{
            name:true,
            email:true,
            avatar:true,
          }
        },
      },
    });

    if (!foundRecipe) {
      return c.json({ error: "Recipe not found" }, 404);
    }

    await redisClinet.setEx(`recipe:${id}`, 100, JSON.stringify(foundRecipe));

    return c.json({ recipe: foundRecipe }, 200);
  } catch (err: any) {
    console.error("Error fetching recipe:", err);
    return c.json(
      { message: "Internal Server Error", error: err.message },
      500
    );
  }
};

// get all recipes with cache
const getAllRecipes = async (c: Context) => {
  try {
    // Parse pagination params
    const { page = "1", limit = "10" } = c.req.query();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Check Redis cache first
    const cacheKey = `all_recipes:${pageNum}:${limitNum}`;
    const cachedData = await redisClinet.get(cacheKey);

    if (cachedData) {
      console.log("✅ Serving from cache");
      return c.json(JSON.parse(cachedData), 200);
    }

    // Count total recipes
    const countResult = await db
      .select({ value: count() })
      .from(recipe)
      .execute();
    const totalCount = Number(countResult[0]?.value || 0);

    // Fetch paginated recipes with relations
    const recipes = await db.query.recipe.findMany({
      columns:{
        id:true,
        title:true,
        image:true,
        description:true,
        createdAt:true
      },
      with: {
        createdBy: {
          columns: { name: true, avatar: true },
        },
        likes:{
          columns:{userId:true},
        }
      },
      limit: limitNum,
      offset,
    });

    const hasNextPage = offset + recipes.length < totalCount;

    const responseData = {
      page: pageNum,
      limit: limitNum,
      count: totalCount,
      hasNextPage,
      recipes,
    };

    // Cache the response (for 5 minutes)
    await redisClinet.setEx(cacheKey, 300, JSON.stringify(responseData));

    return c.json(responseData, 200);
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};

const deleteRecipeByID = async(c:Context)=>{
  const {id} = c.req.param();
  const userId = c.get("user").id;

  const recipeDb = await db.query.recipe.findFirst({
    where: eq(recipe.id, id),
    with: {
      createdBy: true,
    },
  });

  if (!recipeDb) {
    return c.json({ error: "Recipe not found" }, 404);
  }

  if (recipeDb?.userId !== userId) {
    return c.json({ error: "You are not authorized to delete this recipe" }, 401);
  }

  await db.delete(recipe).where(eq(recipe.id, id)).execute();

  // delete recipe from cache
  await redisClinet.del(`recipe:${id}`);

  return c.json({ message: "Recipe deleted successfully" }, 200);
}

// get the recipe by name
const getRecipeByName = async (c:Context)=>{
  const {name} = c.req.param();
  console.log(name)

  // get recipe from cache
  const cachedRecipe = await redisClinet.get(`recipe:${name}`);
  if (cachedRecipe) {
    console.log("✅ Serving from cache");
    return c.json(JSON.parse(cachedRecipe), 200);
  }

  const recipeDb = await db.query.recipe
  .findFirst({
    where: ilike(recipe.title, `%${name}%`),
    columns:{
      title:true,
      image:true,
      description:true,
    },
    with: {
      createdBy: {
        columns: { name: true, email: true, avatar: true },
      },
    },
  });

  console.log(recipeDb)
  // set recipe to cache
  await redisClinet.setEx(`recipe:${name}`, 300, JSON.stringify(recipeDb));
  if (!recipeDb) {
    return c.json({ error: "Recipe not found" }, 404);
  }

  // cache the recipe for 5 minutes
  await redisClinet.setEx(`recipe:${name}`, 300, JSON.stringify(recipeDb));

  return c.json({ recipe: recipeDb }, 200);
}

// get all recipe of particular user
const getAllRecipeByUser = async (c:Context)=>{
  const userId=c.get("user").id;
  console.log(userId)
  // get recipe from cache
  const cachedRecipe = await redisClinet.get(`recipe:${userId}`);
  if (cachedRecipe) {
    console.log("✅ Serving from cache");
    return c.json({recipes:JSON.parse(cachedRecipe)}, 200);
  }
  const recipes = await db.query.recipe.findMany({
    where:eq(recipe.userId,userId),
    columns:{
      id:true,
      title:true,
      image:true,
      description:true,
    },
    with:{
      createdBy:{
        columns:{name:true,email:true,avatar:true}
      },
      likes:{
        columns:{userId:true},
      },
    }
  })
  // set recipe to cache
 if(recipes){
   await redisClinet.setEx(`recipe:${userId}`,300,JSON.stringify(recipes))
 }
  if (!recipes) {
    return c.json({ error: "Recipe not found" }, 404);
  }
  return c.json({ recipes }, 200);
}

// update recipe by id
const updateRecipeByID = async (c:Context)=>{
  const {id} = c.req.param();
  const userId = c.get("user").id;
  
  const {
    title,instructions,description,image ,ingredients
  } =await c.req.json()
  console.log("ingredients",JSON.stringify(ingredients,null,2))
  console.log("title",title)
  console.log("instructions",instructions)
  console.log("description",description)
  console.log("image",image)
  const recipeDb = await db.query.recipe.findFirst({
    where: eq(recipe.id, id),
    with: {
      createdBy: true,
    },
  });

  if (!recipeDb) {
    return c.json({ error: "Recipe not found" }, 404);
  }

  if (recipeDb?.userId !== userId) {
    return c.json({ error: "You are not authorized to update this recipe" }, 401);
  }

  const updatedRecipe = await db
    .update(recipe)
    .set({ title, instructions, description , image})
    .where(eq(recipe.id, id))
    .returning()
    .execute();

    // some performance issue but i will improve in latter 
  await db.delete(ingredient).where(eq(ingredient.recipeId, id)).execute();
  
  if(ingredients && ingredients.length > 0){
    const recipeIngredients = ingredients.map((ing:any)=>({
      recipeId: id,
      name: ing.name,
      type: ing.type,
      quantity: ing.quantity,
      unit: ing.unit
    }))
    await db.insert(ingredient).values(recipeIngredients).execute();
  }
  
  return c.json({ message: "Recipe updated successfully", recipe: updatedRecipe[0] }, 200);
}

export { 
  createRecipe, 
  getAllRecipes,
  deleteRecipeByID,
  getRecipeByName,
  getAllRecipeByUser,
  updateRecipeByID
 };
