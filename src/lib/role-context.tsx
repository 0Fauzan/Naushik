import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "site";

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  user: { name: string; email: string };
}

const Ctx = createContext<RoleCtx | null>(null);

const USERS: Record<Role, { name: string; email: string }> = {
  admin: { name: "S. Krishnan", email: "admin@naushik.co" },
  site: { name: "Rajesh Kumar", email: "rajesh@naushik.co" },
};

export function RoleProvider({ initial, children }: { initial: Role; children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(initial);
  useEffect(() => {
    try { localStorage.setItem("naushik.role", role); } catch {}
  }, [role]);
  return (
    <Ctx.Provider value={{ role, setRole: setRoleState, user: USERS[role] }}>{children}</Ctx.Provider>
  );
}

export function useRole() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRole must be used within RoleProvider");
  return v;
}