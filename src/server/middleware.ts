import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "vinxi/http";
import { verifyToken } from "../lib/auth-crypto";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const token = getCookie("auth_token");
  
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    throw new Error("Unauthorized: Invalid token");
  }

  return await next({
    context: {
      userId: payload.userId as number,
      role: payload.role as string,
    },
  });
});
