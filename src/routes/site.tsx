import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";

export const Route = createFileRoute("/site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <RoleProvider initial="site">
      <Outlet />
    </RoleProvider>
  );
}