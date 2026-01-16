import { Hono } from "hono";
import {
  createRecipe,
  getRecipeById,
  getAllRecipes,
  getRecipeByName,
  getAllRecipeByUser,
  deleteRecipeByID,
  updateRecipeByID,
} from "../controllers/recipe.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = new Hono();

router.post("/", isAuthenticated, createRecipe);
router.get("/recipe/:id", getRecipeById);
router.get("/", getAllRecipes);
router.get("/search/:name",isAuthenticated, getRecipeByName);
router.get("/user", isAuthenticated, getAllRecipeByUser);
router.put("/recipe/:id",isAuthenticated, updateRecipeByID);
router.delete("/recipe/:id",isAuthenticated, deleteRecipeByID);
export default router;
