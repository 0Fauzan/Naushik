import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { getMe } from "@/server/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    try {
      await getMe();
    } catch (err) {
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleProvider initial="admin">
      <Outlet />
    </RoleProvider>
  );
}