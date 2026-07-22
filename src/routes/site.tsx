import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { getMe } from "@/server/auth";

export const Route = createFileRoute("/site")({
  beforeLoad: async () => {
    try {
      await getMe();
    } catch (err) {
      throw redirect({ to: "/" });
    }
  },
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <RoleProvider initial="site">
      <Outlet />
    </RoleProvider>
  );
}