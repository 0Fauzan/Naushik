import { createFileRoute } from "@tanstack/react-router";
import { Users, Phone, MessageCircle, TrendingUp, UserPlus, MoreVertical, Edit, Trash } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { getSiteManagers, createSiteManager, updateSiteManager, deleteSiteManager } from "@/server/workforce";
import { getMetrics } from "@/server/metrics";

export const Route = createFileRoute("/admin/workforce")({
  head: () => ({ meta: [{ title: "Workforce · Naushik Admin" }] }),
  loader: async () => {
    const [managers, metrics] = await Promise.all([getSiteManagers(), getMetrics()]);
    return { managers, metrics };
  },
  component: AdminWorkforce,
});

function AdminWorkforce() {
  const router = useRouter();
  const loaderData = Route.useLoaderData();
  const dbManagers = Array.isArray(loaderData.managers) ? loaderData.managers : [];
  const allManagers = dbManagers;
  const workforceTrend = loaderData.metrics?.workforceTrend || [];

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [experience, setExperience] = useState("");

  const handleSave = async () => {
    if (!name || !project) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateSiteManager({ data: { id: editingId, name, project, experience: Number(experience) || 0 } });
        toast.success("Manager updated successfully");
      } else {
        await createSiteManager({ data: { name, project, experience: Number(experience) || 0 } });
        toast.success("Manager added successfully");
      }
      setOpen(false);
      setName(""); setProject(""); setExperience(""); setEditingId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to save manager");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSiteManager({ data: id });
      toast.success("Manager deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete manager");
    }
  };

  const openEdit = (manager: any) => {
    setEditingId(manager.id);
    setName(manager.name);
    setProject(manager.project);
    setExperience(String(manager.experience));
    setOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setName(""); setProject(""); setExperience("");
    setOpen(true);
  };

  return (
    <AppShell title="Workforce">
      <PageHeader
        title="Workforce & Site Managers"
        description="Capacity, productivity and assignments across the portfolio."
        actions={
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditingId(null);
              setName(""); setProject(""); setExperience("");
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}><UserPlus className="mr-1 h-4 w-4" />Add Manager</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Edit Site Manager" : "Add Site Manager"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5"><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Assigned Project</Label><Input value={project} onChange={e => setProject(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Years of Experience</Label><Input type="number" value={experience} onChange={e => setExperience(e.target.value)} /></div>
              </div>
              <DialogFooter><Button disabled={submitting} onClick={handleSave}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Site Managers" value="0" hint="No data yet" icon={Users} accent="blue" />
        <KpiCard label="Active Workers" value="0" hint="No data yet" icon={Users} accent="success" />
        <KpiCard label="Avg. Productivity" value="0%" hint="No data yet" icon={TrendingUp} accent="gold" />
        <KpiCard label="Open Roles" value="0" hint="0 critical" icon={UserPlus} accent="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Site Managers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {allManagers.map((m) => (
              <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border p-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {m.name.split(" ").map(s => s[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to="/admin/projects" search={{ search: m.name }} className="truncate text-sm font-semibold hover:underline cursor-pointer text-brand">{m.name}</Link>
                    <StatusBadge value={m.status} />
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.project} · {m.experience} yrs · ★ {m.rating}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Call" asChild>
                    <a href="tel:+919999999999"><Phone className="h-3.5 w-3.5" /></a>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-success/40 text-success hover:bg-success/10 hover:text-success" aria-label="WhatsApp" asChild>
                    <a href={`https://wa.me/919999999999?text=Hi%20${encodeURIComponent(m.name)}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /></a>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(m)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(m.id)} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workers — 8 week trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={workforceTrend} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="workers" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}