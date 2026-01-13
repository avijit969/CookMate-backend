import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import userRouter from "./routes/user.routes";
import recipeRouter from "./routes/recipe.routes";
import uploadRouter from "./routes/upload.routes";
import redisClinet from "./helper/redis";
import { welcomeHtmlTemplate } from "./templates/welcome";
import loggedInDeviceRoutes from "./routes/device.routes";
import { readFile } from "node:fs/promises";
import { docsHtml } from "./templates/docs";
const app = new Hono();

app.use(logger());
// api entry point route
app.get("/", (c) => {
  return c.html(welcomeHtmlTemplate);
});
// health check route
app.get("/api/health", (c) => {
  return c.json({ message: "Everything run smoothly 😊" }, 200);
});

// docs route
app.get("/docs", async (c) => {
  try {
    const mdContent = await readFile("API_DOCUMENTATION.md", "utf-8");
    return c.html(docsHtml(mdContent));
  } catch (error) {
    return c.text("Failed to load documentation: " + error, 500);
  }
});


// all api routes
app.route("/api/users", userRouter);
app.route("/api/recipes", recipeRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/logged-in-devices", loggedInDeviceRoutes);


// cache clear route
app.get("/api/rest-cache", (c : Context)=>{
  redisClinet.flushAll();
  return c.json({ message: "Rest cache cleared successfully 😊" }, 200);
});
export default app;
