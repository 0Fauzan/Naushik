import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie } from "vinxi/http";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { hashPassword, verifyPassword, signToken } from "../lib/auth-crypto";

export const register = createServerFn("POST", async (data: { email: string; password: string; pin?: string }) => {
  const { email, password, pin } = data;

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);
  const pinHash = pin ? await hashPassword(pin) : null;

  const [newUser] = await db
    .insert(users)
    .values({ email, passwordHash, pinHash, role: "user" })
    .returning();

  const token = await signToken({ userId: newUser.id, role: newUser.role });
  
  setCookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { success: true, userId: newUser.id };
});

export const login = createServerFn("POST", async (data: { email: string; password: string }) => {
  const { email, password } = data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = await signToken({ userId: user.id, role: user.role });
  
  setCookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { success: true, userId: user.id };
});

export const loginWithPin = createServerFn("POST", async (data: { email: string; pin: string }) => {
  const { email, pin } = data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !user.pinHash) {
    throw new Error("Invalid PIN or email");
  }

  const isValid = await verifyPassword(pin, user.pinHash); // We use the same bcrypt verification for PINs
  if (!isValid) {
    throw new Error("Invalid PIN");
  }

  const token = await signToken({ userId: user.id, role: user.role });
  
  setCookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return { success: true, userId: user.id };
});

export const logout = createServerFn("POST", async () => {
  deleteCookie("auth_token");
  return { success: true };
});
