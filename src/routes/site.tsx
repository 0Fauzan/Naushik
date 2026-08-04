import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { getMe } from "@/server/auth";

export const Route = createFileRoute("/site")({
  beforeLoad: async () => {
    try {
      const res = await getMe();
      if (!res.success) throw new Error();
      return { dbUser: res.user };
    } catch (err) {
      throw redirect({ to: "/" });
    }
  },
  component: SiteLayout,
});

function SiteLayout() {
  const { dbUser } = Route.useRouteContext();
  return (
    <RoleProvider initial="site" initialUser={dbUser}>
      <Outlet />
    </RoleProvider>
  );
}