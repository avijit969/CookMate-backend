import { Context } from "hono";
import db from "../db";
import { comment, like, save, user } from "../db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

// LIKES 
// Toggle Like (Like if not liked, Unlike if already liked)
export const toggleLike = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const { recipeId } = await c.req.json();

    if (!recipeId) {
      return c.json({ message: "Recipe ID is required" }, 400);
    }

    const existingLike = await db.query.like.findFirst({
      where: and(eq(like.userId, userId), eq(like.recipeId, recipeId)),
    });

    if (existingLike) {
      // Unlike
      await db
        .delete(like)
        .where(and(eq(like.userId, userId), eq(like.recipeId, recipeId)))
        .execute();
      return c.json({ message: "Recipe unliked successfully", liked: false }, 200);
    } else {
      // Like
      await db.insert(like).values({ userId, recipeId }).execute();
      return c.json({ message: "Recipe liked successfully", liked: true }, 201);
    }
  } catch (error: any) {
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
};

// Get Likes Count for a Recipe
export const getRecipeLikes = async (c: Context) => {
  try {
    const { recipeId } = c.req.param();

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(like)
      .where(eq(like.recipeId, recipeId))
      .execute();

    const count = Number(result[0]?.count || 0);

    return c.json({ count }, 200);
  } catch (error: any) {
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
};

// COMEMNTS 
// Add Comment
export const addComment = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const { recipeId, content } = await c.req.json();

    if (!recipeId || !content) {
      return c.json({ message: "Recipe ID and content are required" }, 400);
    }

    const newComment = await db
      .insert(comment)
      .values({ userId, recipeId, content })
      .returning()
      .execute();

    return c.json(
      { message: "Comment added successfully", comment: newComment[0] },
      201
    );
  } catch (error: any) {
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
};

// Delete Comment
export const deleteComment = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const { commentId } = c.req.param();

    const existingComment = await db.query.comment.findFirst({
      where: eq(comment.id, commentId),
    });

    if (!existingComment) {
      return c.json({ message: "Comment not found" }, 404);
    }

    if (existingComment.userId !== userId) {
      return c.json({ message: "Unauthorized to delete this comment" }, 403);
    }

    await db.delete(comment).where(eq(comment.id, commentId)).execute();

    return c.json({ message: "Comment deleted successfully" }, 200);
  } catch (error: any) {
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
};

// Get Comments for a Recipe
export const getRecipeComments = async (c: Context) => {
  try {
    const { recipeId } = c.req.param();

    const comments = await db.query.comment.findMany({
      where: eq(comment.recipeId, recipeId),
      with: {
        user: {
            columns: { name: true, avatar: true },
        },
      },
      orderBy: [desc(comment.createdAt)],
    });

    return c.json({ comments }, 200);
  } catch (error: any) {
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
};

// SAVES 
// Toggle Save (Save if not saved, Unsave if already saved)
export const toggleSave = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const { recipeId } = await c.req.json();

    if (!recipeId) {
      return c.json({ message: "Recipe ID is required" }, 400);
    }

    const existingSave = await db.query.save.findFirst({
      where: and(eq(save.userId, userId), eq(save.recipeId, recipeId)),
    });

    if (existingSave) {
      // Unsave
      await db
        .delete(save)
        .where(and(eq(save.userId, userId), eq(save.recipeId, recipeId)))
        .execute();
      return c.json({ message: "Recipe removed from saved", saved: false }, 200);
    } else {
      // Save
      await db.insert(save).values({ userId, recipeId }).execute();
      return c.json({ message: "Recipe saved successfully", saved: true }, 201);
    }
  } catch (error: any) {
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
};

// Get Saved Recipes for User
export const getUserSavedRecipes = async (c: Context) => {
    try {
      const userId = c.get("user").id;
  
      const savedRecipes = await db.query.save.findMany({
        where: eq(save.userId, userId),
        with: {
            recipe: {
                with: {
                    createdBy: {
                        columns: { name: true, avatar: true },
                    }
                }
            }
        },
        orderBy: [desc(save.createdAt)],
      });
  
      const recipes = savedRecipes.map(s => s.recipe);
  
      return c.json({ recipes }, 200);
    } catch (error: any) {
      return c.json({ message: "Internal Server Error", error: error.message }, 500);
    }
  };
