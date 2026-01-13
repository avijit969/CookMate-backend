import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import userRouter from "./routes/user.routes";
import recipeRouter from "./routes/recipe.routes";
import uploadRouter from "./routes/upload.routes";
import redisClinet from "./helper/redis";
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
app.get("/api/rest-cache", (c : Context)=>{
  redisClinet.flushAll();
  return c.json({ message: "Rest cache cleared successfully" }, 200);
});
export default app;
