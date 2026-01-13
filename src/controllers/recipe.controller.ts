import { Context } from "hono";
import db from "../db";
import { ingredient, recipe, user } from "../db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import redisClinet from "../helper/redis";
import { count } from "drizzle-orm";

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
      with: {
        ingredients: true,
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
      with: {
        ingredients: true,
        createdBy: {
          columns: { name: true, email: true, avatar: true },
        },
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

export { createRecipe, getAllRecipes };
