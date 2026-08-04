import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { getMe } from "@/server/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    try {
      const res = await getMe();
      if (!res.success) throw new Error();
      return { dbUser: res.user };
    } catch (err) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { dbUser } = Route.useRouteContext();
  return (
    <RoleProvider initial="admin" initialUser={dbUser}>
      <Outlet />
    </RoleProvider>
  );
}