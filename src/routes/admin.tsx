import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleProvider initial="admin">
      <Outlet />
    </RoleProvider>
  );
}