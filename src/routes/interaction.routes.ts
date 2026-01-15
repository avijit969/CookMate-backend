import { Hono } from "hono";
import { isAuthenticated } from "../middleware/auth.middleware";
import {
  toggleLike,
  getRecipeLikes,
  addComment,
  deleteComment,
  getRecipeComments,
  toggleSave,
  getUserSavedRecipes,
  updateComment,
} from "../controllers/interaction.controller";

const interactionRouter = new Hono();

// Likes
interactionRouter.post("/like", isAuthenticated, toggleLike);
interactionRouter.get("/like/:recipeId", getRecipeLikes);

// Comments
interactionRouter.post("/comment", isAuthenticated, addComment);
interactionRouter.delete("/comment/:commentId", isAuthenticated, deleteComment);
interactionRouter.get("/comment/:recipeId", getRecipeComments);
interactionRouter.put("/comment/:commentId", isAuthenticated, updateComment);
// Saves
interactionRouter.post("/save", isAuthenticated, toggleSave);
interactionRouter.get("/save", isAuthenticated, getUserSavedRecipes);

export default interactionRouter;
