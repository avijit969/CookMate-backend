import { Hono } from "hono";
import {
  createRecipe,
  getRecipeById,
  getAllRecipes,
} from "../controllers/recipe.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = new Hono();

router.post("/", isAuthenticated, createRecipe);
router.get("/:id", getRecipeById);
router.get("/", getAllRecipes);
export default router;
