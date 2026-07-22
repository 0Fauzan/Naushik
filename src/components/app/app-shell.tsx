import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderKanban, Users, ShoppingCart, Boxes, Wallet,
  FileBarChart2, ShieldCheck, ClipboardList, HardHat, Package, Wrench,
  AlertTriangle, FileText, Moon, Sun, LogOut, Menu, Bell, Search, MessageCircle,
} from "lucide-react";
import { useRole, type Role } from "@/lib/role-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SyncIndicator } from "@/components/app/sync-indicator";

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; badge?: string; }

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/workforce", label: "Workforce", icon: Users },
  { to: "/admin/procurement", label: "Procurement", icon: ShoppingCart, badge: "2" },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/finance", label: "Finance", icon: Wallet },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
];

const SITE_NAV: NavItem[] = [
  { to: "/site/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/site/projects", label: "Projects", icon: FolderKanban },
  { to: "/site/dpr", label: "Daily Reports", icon: ClipboardList },
  { to: "/site/workforce", label: "Workforce", icon: HardHat },
  { to: "/site/materials", label: "Materials", icon: Package },
  { to: "/site/inventory", label: "Inventory", icon: Boxes },
  { to: "/site/equipment", label: "Equipment", icon: Wrench },
  { to: "/site/issues", label: "Issues & Safety", icon: AlertTriangle, badge: "3" },
  { to: "/site/documents", label: "Documents", icon: FileText },
];

const MOBILE_NAV: Record<Role, NavItem[]> = {
  admin: [ADMIN_NAV[0], ADMIN_NAV[1], ADMIN_NAV[3], ADMIN_NAV[4], ADMIN_NAV[5]],
  site: [SITE_NAV[0], SITE_NAV[2], SITE_NAV[4], SITE_NAV[7], SITE_NAV[3]],
};

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gold text-gold-foreground font-black text-base shadow-sm">N</div>
      <div className="min-w-0">
        <div className="text-sm font-bold tracking-tight text-sidebar-foreground leading-tight">Naushik</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Associates</div>
      </div>
    </div>
  );
}

function NavList({ items, currentPath, onNavigate }: { items: NavItem[]; currentPath: string; onNavigate?: () => void; }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const active = currentPath === item.to || currentPath.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-gold" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-gold/90 px-1.5 py-0.5 text-[10px] font-bold text-gold-foreground">{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ items, currentPath, onNavigate }: { items: NavItem[]; currentPath: string; onNavigate?: () => void; }) {
  const { user, role } = useRole();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
          {role === "admin" ? "Headquarters" : "Site Office"}
        </div>
        <NavList items={items} currentPath={currentPath} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
              {user.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-sidebar-foreground/60">{role === "admin" ? "Administrator" : "Site Manager"}</div>
          </div>
          <Link to="/" className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, items, currentPath }: { title: string; items: NavItem[]; currentPath: string; }) {
  const { user, role } = useRole();
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 overflow-visible border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:gap-3 sm:px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent items={items} currentPath={currentPath} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <div className="hidden text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:block">{role === "admin" ? "Admin Portal" : "Site Portal"}</div>
        <h1 className="truncate text-base font-bold tracking-tight md:text-lg">{title}</h1>
      </div>

      <div className="relative hidden lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects, requests, workers…" className="h-9 w-72 pl-9" />
      </div>

      <div className="hidden sm:block">
        <SyncIndicator />
      </div>

      <Button variant="outline" size="sm" className="hidden gap-1.5 border-success/40 bg-success/5 text-success hover:bg-success/10 hover:text-success lg:inline-flex" asChild>
        <a href="https://wa.me/919847012345" target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </Button>

      <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme} className="hidden sm:inline-flex">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="ml-auto h-9 shrink-0 gap-2 px-1.5 sm:ml-0 sm:px-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
                {user.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate text-sm font-medium lg:inline">{user.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={8} className="z-50 w-56">
          <DropdownMenuLabel>
            <div className="text-sm font-semibold">{user.name}</div>
            <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/">Switch role</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/">Sign out</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function BottomNav({ items, currentPath }: { items: NavItem[]; currentPath: string; }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = currentPath === item.to || currentPath.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />}
            <Icon className="h-5 w-5" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const { role } = useRole();
  const items = role === "admin" ? ADMIN_NAV : SITE_NAV;
  const mobileItems = MOBILE_NAV[role];
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarContent items={items} currentPath={currentPath} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-visible">
        <TopBar title={title} items={items} currentPath={currentPath} />
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <BottomNav items={mobileItems} currentPath={currentPath} />
    </div>
  );
}