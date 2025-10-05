import { Hono } from "hono";
import { createRecipe, getRecipeById } from "../controllers/recipe.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = new Hono();

router.post("/", isAuthenticated, createRecipe);
router.get("/:id", getRecipeById);
export default router;
