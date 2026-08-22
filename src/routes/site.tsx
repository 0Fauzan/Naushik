import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { getClientMe } from "@/lib/auth-client";

export const Route = createFileRoute("/site")({
  beforeLoad: async ({ context }) => {
    if ((context as any)?.dbUser) {
      return { dbUser: (context as any).dbUser };
    }
    try {
      const res = await getClientMe();
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