import { Hono } from "hono";
import { logger } from "hono/logger";
import userRouter from "./routes/user.routes";
import recipeRouter from "./routes/recipe.routes";
const app = new Hono();

app.use(logger());
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/api/users", userRouter);
app.route("/api/recipes", recipeRouter);
export default app;
