import { Hono } from "hono";
import { logger } from "hono/logger";
import userRouter from "./routes/user.routes";
import recipeRouter from "./routes/recipe.routes";
import uploadRouter from "./routes/upload.routes";
const app = new Hono();

app.use(logger());
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.get("/api/health", (c) => {
  return c.json({ message: "Everything run smoothly" }, 200);
});
app.route("/api/users", userRouter);
app.route("/api/recipes", recipeRouter);
app.route("/api/upload", uploadRouter);
export default app;
