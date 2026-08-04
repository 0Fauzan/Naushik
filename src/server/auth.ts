import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const register = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; name?: string; whatsappNumber?: string; pin?: string; role?: string }) => data)
  .handler(async ({ data }) => {
  const { email, password, name, whatsappNumber, pin, role } = data;
  const { db } = await import("../db");
  const { users } = await import("../db/schema");
  const { hashPassword, signToken } = await import("../lib/auth-crypto");

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);
  const pinHash = pin ? await hashPassword(pin) : null;

  const [newUser] = await db
    .insert(users)
    .values({ 
      name: name || "User", 
      email, 
      passwordHash, 
      pinHash, 
      whatsappNumber,
      role: role || "user" 
    })
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

export const login = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: any }) => {
  console.log("LOGIN CALLED WITH:", data);
  try {
    const { email, password } = data;
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { verifyPassword, signToken } = await import("../lib/auth-crypto");

    console.log("Querying user:", email);
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      console.log("User not found");
      throw new Error("Invalid email or password");
    }

    console.log("Verifying password for user ID:", user.id);
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      console.log("Invalid password");
      throw new Error("Invalid email or password");
    }

    console.log("Signing token");
    const token = await signToken({ userId: user.id, role: user.role });
    
    console.log("Setting cookie");
    setCookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    console.log("Login successful");
    return { success: true, userId: user.id };
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    throw err;
  }
});

export const loginWithPin = createServerFn({ method: "POST" })
  .validator((data: { email: string; pin: string }) => data)
  .handler(async ({ data }) => {
  const { email, pin } = data;
  const { db } = await import("../db");
  const { users } = await import("../db/schema");
  const { verifyPassword, signToken } = await import("../lib/auth-crypto");

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

export const logout = createServerFn({ method: "POST" })
  .handler(async () => {
  deleteCookie("auth_token");
  return { success: true };
});

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context as any;
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return { 
      success: true, 
      user: { 
        name: user?.name, 
        email: user?.email, 
        role: user?.role,
        whatsappNumber: user?.whatsappNumber,
        whatsappNotifications: user?.whatsappNotifications
      } 
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name?: string; email?: string; pin?: string | null; whatsappNumber?: string | null; whatsappNotifications?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const { name, email, pin, whatsappNumber, whatsappNotifications } = data;
    const { userId } = context as any;
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { hashPassword } = await import("../lib/auth-crypto");
    
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;
    if (whatsappNotifications !== undefined) updates.whatsappNotifications = whatsappNotifications;

    if (pin !== undefined) {
      if (pin && pin.length === 4) {
        updates.pinHash = await hashPassword(pin);
      } else if (pin === null) {
        updates.pinHash = null;
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, userId));
    }
    return { success: true };
  });
