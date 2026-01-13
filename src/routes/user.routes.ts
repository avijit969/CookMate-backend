import { Context, Hono } from "hono";
import {
  createUser,
  getUser,
  loginUser,
  logoutUser,
  updateUserDetails,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = new Hono();

router.get("/", isAuthenticated, getUser);
router.put("/", isAuthenticated, updateUserDetails);
router.post("/", createUser);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);

export default router;
