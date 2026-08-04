import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "site";

export interface UserProfile {
  name: string;
  email: string;
}

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
}

const Ctx = createContext<RoleCtx | null>(null);

const DEFAULT_USERS: Record<Role, UserProfile> = {
  admin: { name: "Admin", email: "admin@naushik.co" },
  site: { name: "Manager", email: "manager@naushik.co" },
};

export function RoleProvider({ initial, initialUser, children }: { initial: Role; initialUser?: any; children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(initial);

  const [users, setUsers] = useState<Record<Role, UserProfile>>(() => {
    const defaultState = { ...DEFAULT_USERS };
    if (initialUser && initialUser.name) {
      defaultState[initial].name = initialUser.name;
    }
    if (initialUser && initialUser.email) {
      defaultState[initial].email = initialUser.email;
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("naushik.users");
      if (stored) {
        setUsers(JSON.parse(stored));
      }
    } catch { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("naushik.role", role); } catch { }
  }, [role]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUsers(prev => {
      const newUsers = {
        ...prev,
        [role]: { ...prev[role], ...data }
      };
      try { localStorage.setItem("naushik.users", JSON.stringify(newUsers)); } catch { }
      return newUsers;
    });
  };

  return (
    <Ctx.Provider value={{ role, setRole: setRoleState, user: users[role], updateUser }}>{children}</Ctx.Provider>
  );
}

export function useRole() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRole must be used within RoleProvider");
  return v;
}