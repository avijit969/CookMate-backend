import { Hono } from "hono";
import { uploadImage } from "../controllers/upload.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = new Hono();

router.post("/", isAuthenticated, uploadImage);

export default router;
