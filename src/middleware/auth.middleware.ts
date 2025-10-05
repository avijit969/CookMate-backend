import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

export const isAuthenticated = async (c: Context, next: Next) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = c.req.header("Authorization");
    const cookieToken = getCookie(c, "token");
    const token =
      cookieToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : "");
    if (!token) {
      return c.json({ error: "Unauthorized: Token missing" }, 401);
    }
    const decoded = await verify(token, process.env.ACCESS_TOKEN_SECRET!);
    if (!decoded) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
    c.set("user", decoded);
    await next();
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
};
