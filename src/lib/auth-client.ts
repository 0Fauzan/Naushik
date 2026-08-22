import { getMe } from "@/server/auth";

let cachedUser: { user: any; timestamp: number } | null = null;

export async function getClientMe(force = false) {
  const now = Date.now();
  if (!force && cachedUser && now - cachedUser.timestamp < 60_000) {
    return { success: true, user: cachedUser.user };
  }
  const res = await getMe();
  if (res?.success) {
    cachedUser = { user: res.user, timestamp: now };
  }
  return res;
}

export function clearClientMe() {
  cachedUser = null;
}
