import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { getClientMe } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
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