import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderKanban, Users, ShoppingCart, Boxes, Wallet,
  FileBarChart2, ShieldCheck, ClipboardList, HardHat, Package, Wrench,
  AlertTriangle, FileText, Moon, Sun, LogOut, Menu, Bell, Search, Settings, Download, Plus
} from "lucide-react";
import { useRole, type Role } from "@/lib/role-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SyncIndicator } from "@/components/app/sync-indicator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; badge?: string; }

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/workforce", label: "Workforce", icon: Users },
  { to: "/admin/procurement", label: "Procurement", icon: ShoppingCart },
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
  { to: "/site/issues", label: "Issues & Safety", icon: AlertTriangle },
  { to: "/site/documents", label: "Documents", icon: FileText },
];

const MOBILE_NAV: Record<Role, NavItem[]> = {
  admin: [ADMIN_NAV[0], ADMIN_NAV[1], ADMIN_NAV[3], ADMIN_NAV[4], ADMIN_NAV[5]],
  site: [SITE_NAV[0], SITE_NAV[2], SITE_NAV[4], SITE_NAV[7], SITE_NAV[3]],
};

function BrandIcon() {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-primary font-black text-xl shadow-sm">
      N
    </div>
  );
}

function SidebarContent({ items, currentPath, onNavigate }: { items: NavItem[]; currentPath: string; onNavigate?: () => void; }) {
  const { user, role } = useRole();
  return (
    <div className="flex h-full flex-col items-center bg-sidebar dark:bg-sidebar/60 dark:backdrop-blur-2xl dark:border-r dark:border-white/5 text-sidebar-foreground pt-6 pb-6">
      <div className="mb-8">
        <BrandIcon />
      </div>
      <div className="flex-1 flex flex-col items-center gap-4 w-full px-4 overflow-y-auto no-scrollbar">
        {items.map((item) => {
          const active = currentPath === item.to || currentPath.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={item.label}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                active ? "bg-background/20 text-white shadow-inner" : "text-sidebar-foreground/70 hover:bg-background/10 hover:text-white",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-white")} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-gold-foreground border-2 border-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto pt-6 flex flex-col items-center gap-4 w-full">
         <Link to="/settings" title="Settings" className="flex h-12 w-12 items-center justify-center rounded-2xl text-sidebar-foreground/70 hover:bg-background/10 hover:text-white">
            <Settings className="h-5 w-5" />
         </Link>
         <Link 
            to="/" 
            title="Sign out" 
            onClick={async () => {
              try {
                const { logout } = await import("@/server/auth");
                const { clearClientMe } = await import("@/lib/auth-client");
                clearClientMe();
                await logout();
              } catch (e) {
                // ignore
              }
            }} 
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sidebar-foreground/70 hover:bg-background/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
         </Link>
         <Avatar className="h-10 w-10 border-2 border-background/20">
            <AvatarFallback className="bg-gold text-gold-foreground text-xs font-bold">
              {user.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
            </AvatarFallback>
         </Avatar>
      </div>
    </div>
  );
}

function TopBar({ items, currentPath }: { items: NavItem[]; currentPath: string; }) {
  const [dark, setDark] = useState(false);
  const { user, updateUser, role } = useRole();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pin, setPin] = useState("");
  const [boardData, setBoardData] = useState({ name: "", client: "", location: "", manager: "", budget: "" });
  const [isExporting, setIsExporting] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [managersList, setManagersList] = useState<any[]>([]);
  const [locationsList, setLocationsList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isNewBoardOpen) {
      if (managersList.length === 0) {
        import("@/server/workforce").then((m) => {
          m.getSiteManagers().then(setManagersList).catch(console.error);
        });
      }
      if (locationsList.length === 0) {
        import("@/server/sites").then((s) => {
          s.getSites().then(setLocationsList).catch(console.error);
        });
      }
    }
  }, [isNewBoardOpen]);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user]);
  
  useEffect(() => { 
    const isDark = localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setDark(isDark); 
  }, []);

  const saveProfile = async () => {
    updateUser({ name, email });
    try {
      const { updateProfile } = await import("@/server/auth");
      await updateProfile({ data: { name, email, pin: pin || null } });
      toast.success("Profile and PIN updated successfully!");
      setIsSettingsOpen(false);
      setPin(""); // reset pin field
    } catch (err) {
      toast.error("Failed to update profile settings");
    }
  };
  
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const handleCreateBoard = async () => {
    if (!boardData.name.trim()) {
      toast.error("Project Name cannot be empty");
      return;
    }
    setIsCreatingBoard(true);
    try {
      const { createProject } = await import("@/server/projects");
      await createProject({ data: { ...boardData, budget: Number(boardData.budget) || 0 } });
      toast.success("New project created!");
      setIsNewBoardOpen(false);
      setBoardData({ name: "", client: "", location: "", manager: "", budget: "" });
      router.invalidate();
    } catch (e) {
      toast.error("Failed to create project");
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const { getProjects } = await import("@/server/projects");
      const projects = await getProjects();
      const csv = ["Project ID,Name,Client,Location,Budget,Spent,Status"];
      projects.forEach((p: any) => csv.push(`${p.projectId},"${p.name}","${p.client || ''}","${p.location || ''}",${p.budget},${p.spent},${p.status}`));
      const blob = new Blob([csv.join("\\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "naushik_projects_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to Excel successfully");
      setIsExportOpen(false);
    } catch (e) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { getProjects } = await import("@/server/projects");
      const projects = await getProjects();
      
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Project Portfolio Export", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
      
      const tableData = projects.map((p: any) => [
        p.projectId,
        p.name,
        p.client || "-",
        p.location || "-",
        `Rs. ${p.budget?.toLocaleString() || "0"}`,
        `Rs. ${p.spent?.toLocaleString() || "0"}`,
        p.status
      ]);

      autoTable(doc, {
        startY: 36,
        head: [["ID", "Name", "Client", "Location", "Budget", "Spent", "Status"]],
        body: tableData,
      });

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "naushik_projects_export.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to PDF successfully");
      setIsExportOpen(false);
    } catch (e) {
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-10">
        {/* Brand Logo & Name (Visible on mobile and tablet) */}
        <Link to={role === "admin" ? "/admin/dashboard" : "/site/dashboard"} className="flex items-center gap-2.5 lg:hidden">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sidebar text-sidebar-foreground font-black text-lg shadow-sm">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground leading-none">Naushik</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">Cloud</span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Real-time sync active</span>
        </div>
      </div>

      <div className="relative hidden md:flex items-center flex-1 max-w-md mx-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search or type command" className="h-11 w-full rounded-full pl-11 bg-background border-border/50 shadow-sm focus-visible:ring-primary/20" />
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
        <div className="hidden lg:flex items-center rounded-full bg-primary/10 p-1">
           <button onClick={() => dark && toggleTheme()} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all", !dark ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              Light
           </button>
           <button onClick={() => !dark && toggleTheme()} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all", dark ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Moon className="h-3.5 w-3.5" /> Dark
           </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border/50 bg-background shadow-sm hover:bg-accent relative">
              <Bell className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="flex flex-col gap-2 text-center p-4">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
              <p className="text-sm font-semibold">No new notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile Dropdown (Includes settings, theme toggle, and logout) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary p-0.5">
              <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-sm cursor-pointer">
                <AvatarFallback className="bg-gold text-gold-foreground text-xs font-bold">
                  {user.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-xl bg-popover/95 backdrop-blur-xl border border-border/60">
            <DropdownMenuLabel className="p-2 font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-foreground">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                <div className="pt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                    {role === "admin" ? "Admin" : "Site Manager"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-500 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium cursor-pointer hover:bg-accent">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={toggleTheme}
              className="flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer hover:bg-accent"
            >
              <div className="flex items-center gap-2.5">
                {dark ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                <span>{dark ? "Dark mode" : "Light mode"}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-bold">
                {dark ? "ON" : "OFF"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={async () => {
                try {
                  const { logout } = await import("@/server/auth");
                  const { clearClientMe } = await import("@/lib/auth-client");
                  clearClientMe();
                  await logout();
                  window.location.href = "/";
                } catch (e) {
                  window.location.href = "/";
                }
              }}
              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-destructive focus:text-destructive cursor-pointer hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="hidden lg:flex h-10 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 shadow-sm gap-2 px-4">
               <Download className="h-4 w-4" /> Export data
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>Select the data you want to export.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant="outline" disabled={isExporting} onClick={handleExportExcel}>{isExporting ? "Exporting..." : "Export as Excel"}</Button>
              <Button variant="outline" disabled={isExporting} onClick={handleExportPDF}>{isExporting ? "Exporting..." : "Export as PDF"}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isNewBoardOpen} onOpenChange={setIsNewBoardOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-full bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 shadow-glass gap-2 px-5 hidden sm:flex">
               Add new board
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription>Setup a new project board.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label>Project Name</Label>
                <Input placeholder="e.g. Phase 2 Construction" value={boardData.name} onChange={(e) => setBoardData({ ...boardData, name: capitalize(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Input placeholder="Client Name" value={boardData.client} onChange={(e) => setBoardData({ ...boardData, client: capitalize(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input list="location-suggestions" placeholder="Project Location" value={boardData.location} onChange={(e) => setBoardData({ ...boardData, location: capitalize(e.target.value) })} />
                <datalist id="location-suggestions">
                  {locationsList.map((loc) => (
                    <option key={loc.id} value={loc.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Manager</Label>
                <Select value={boardData.manager} onValueChange={(val) => setBoardData({ ...boardData, manager: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managersList.map((m) => (
                      <SelectItem key={m.id} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Budget (₹)</Label>
                <Input type="number" placeholder="0" value={boardData.budget} onChange={(e) => setBoardData({ ...boardData, budget: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={isCreatingBoard} onClick={handleCreateBoard}>{isCreatingBoard ? "Saving..." : "Save Project"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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

function GlobalLoading() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isPending) { setShow(false); return; }
    // Only show bar if navigation takes > 200ms (cache misses / slow fetches)
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, [isPending]);

  if (!show) return null;
  return (
    <>
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary/20 overflow-hidden">
        <div className="h-full w-1/3 bg-primary" style={{ animation: 'indeterminate 1s infinite linear' }} />
      </div>
    </>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const { role } = useRole();
  const items = role === "admin" ? ADMIN_NAV : SITE_NAV;
  const mobileItems = MOBILE_NAV[role];
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <GlobalLoading />
      <aside className="sticky top-0 hidden h-screen w-[104px] shrink-0 lg:block py-6 pl-0">
        <div className="h-full w-full rounded-r-[3rem] overflow-hidden shadow-2xl">
           <SidebarContent items={items} currentPath={currentPath} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-visible">
        <TopBar items={items} currentPath={currentPath} />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 pb-24 lg:pb-12">{children}</main>
      </div>
      <BottomNav items={mobileItems} currentPath={currentPath} />
    </div>
  );
}