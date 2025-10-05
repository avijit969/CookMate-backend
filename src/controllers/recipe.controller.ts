import { Context } from "hono";
import db from "../db";
import { ingredient, recipe } from "../db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { createClient } from "redis";

// Initialize Redis client once
const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

// Connect once when module loads
(async () => {
  try {
    await client.connect();
    console.log("Redis connected");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

const createRecipe = async (c: Context) => {
  try {
    const { title, ingredients, instructions, description } =
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
      .values({ title, userId, instructions, description })
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
    await client.setEx(
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

export const getRecipeById = async (c: Context) => {
  const { id } = c.req.param();

  if (!id) {
    return c.json({ error: "Recipe ID is required" }, 400);
  }

  try {
    //    Check Redis cache first
    const cachedRecipe = await client.get(`recipe:${id}`);
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

    await client.setEx(`recipe:${id}`, 100, JSON.stringify(foundRecipe));

    return c.json({ recipe: foundRecipe }, 200);
  } catch (err: any) {
    console.error("Error fetching recipe:", err);
    return c.json(
      { message: "Internal Server Error", error: err.message },
      500
    );
  }
};

export { createRecipe };
