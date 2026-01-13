import { Context } from "hono";
import db from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../helper/hashPassword";
import { verifyHashPassword } from "../helper/verifyHashPassword";
import { generateAccessToken } from "../helper/generateAccessToken";
import { deleteCookie, setCookie } from "hono/cookie";
import { sendEmail } from "../helper/resend";
import { getVerificationEmailTemplate, getWelcomeEmailTemplate } from "../helper/emails";

// get authenticated user details
const getUser = async (c: Context) => {
  const userId = c.get("user").id;
  const dbUser = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    })
    .from(user)
    .where(eq(user.id, userId))
    .execute();
  return c.json(dbUser[0]);
};

// create new user
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
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await db
      .insert(user)
      .values({ 
        name, 
        email, 
        password: hashedPassword,
        verificationCode,
        isVerified: false
      })
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .execute();

    // Send Verification Email
    const emailHtml = getVerificationEmailTemplate(name, verificationCode);
    
    // Fire and forget email sending (or await if critical)
    sendEmail(email, "Your CookMate Verification Code", emailHtml).catch(err => console.error("Failed to send verification email", err));

    return c.json(
      { message: "User created successfully. Please check your email for the verification code.", user: newUser[0] },
      201
    );
  } catch (error: any) {
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};

const verifyUser = async (c: Context) => {
  try {
    const { token } = await c.req.json();
    if (!token) {
      return c.json({ error: "Verification token is required" }, 400);
    }

    const userToVerify = await db
      .select()
      .from(user)
      .where(eq(user.verificationCode, token))
      .execute();

    if (!userToVerify.length) {
      return c.json({ error: "Invalid or expired verification token" }, 400);
    }

    const verifiedUser = userToVerify[0];

    // Update user to verified
    await db
      .update(user)
      .set({ isVerified: true, verificationCode: null }) // Clear code
      .where(eq(user.id, verifiedUser.id))
      .execute();

    // Send Welcome Email
    const welcomeHtml = getWelcomeEmailTemplate(verifiedUser.name);
    sendEmail(verifiedUser.email, "Welcome to CookMate!", welcomeHtml).catch(err => console.error("Failed to send welcome email", err));

    return c.json({ message: "Account verified successfully!" }, 200);

  } catch (error: any) {
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};

// login user and give access token
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

// logout user and delete access token
const logoutUser = async (c: Context) => {
  deleteCookie(c, "token");
  return c.json({ message: "User logged out successfully" }, 200);
};

// update the user avatar
const updateUserDetails = async (c: Context) => {
  try {
    const { name, avatar } = await c.req.json();
    console.log(name, avatar);
    if (!name && !avatar) {
      return c.json({ message: "Name or avatar is required" }, 400);
    }
    const userId = c.get("user").id;
    const updatedUser = await db
      .update(user)
      .set({ name, avatar })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      })
      .execute();
    return c.json({ message: "User updated successfully", user: updatedUser[0] }, 200);
  } catch (error: any) {
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
};
export { getUser, createUser, loginUser, logoutUser, updateUserDetails, verifyUser };
