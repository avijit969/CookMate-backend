import { Context } from "hono";
import db from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../helper/hashPassword";
import { verifyHashPassword } from "../helper/verifyHashPassword";
import { generateAccessToken } from "../helper/generateAccessToken";
import { deleteCookie, setCookie } from "hono/cookie";
const getAllUsers = async (c: Context) => {
  const users = await db.select().from(user);
  return c.json(users);
};
const createUser = async (c: Context) => {
  try {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) {
      return c.json({ error: "All fields are required" }, 400);
    }
    const isUserExist = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .execute();

    if (isUserExist.length) {
      return c.json({ message: "User already exist" }, 400);
    }
    const hashedPassword = await hashPassword(password);

    const newUser = await db
      .insert(user)
      .values({ name, email, password: hashedPassword })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .execute();

    return c.json(
      { message: "User created successfully", user: newUser[0] },
      201
    );
  } catch (error: any) {
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};
const loginUser = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .execute();
    if (!existingUser.length) {
      return c.json({ error: "User not found" }, 404);
    }
    const isPasswordMatch = await verifyHashPassword(
      password,
      existingUser[0].password
    );
    if (!isPasswordMatch) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    const accessToken = await generateAccessToken(
      { id: existingUser[0].id },
      c
    );
    setCookie(c, "token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    });

    return c.json({ message: "User logged in successfully", accessToken }, 200);
  } catch (error: any) {
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};
const logoutUser = async (c: Context) => {
  deleteCookie(c, "token");
  return c.json({ message: "User logged out successfully" }, 200);
};
export { getAllUsers, createUser, loginUser, logoutUser };
