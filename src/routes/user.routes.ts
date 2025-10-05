import { Context, Hono } from "hono";
import {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = new Hono();

router.get("/", isAuthenticated, getAllUsers);
router.post("/", createUser);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);

export default router;
