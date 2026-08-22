import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardList, HardHat, Package, AlertTriangle, MessageCircle, CheckCircle2,
  CloudSun, MapPin, ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/server/projects";
import { getWorkers } from "@/server/workers";
import { getMaterialRequests } from "@/server/procurement";
import { getIssues } from "@/server/issues";
import { getDprs } from "@/server/dpr";
import { useRole } from "@/lib/role-context";
export const Route = createFileRoute("/site/dashboard")({
  head: () => ({ meta: [{ title: "Site Dashboard · Naushik" }] }),
  loader: async () => {
    const [projects, workers, materialRequests, issues, dprs] = await Promise.all([
      getProjects(),
      getWorkers(),
      getMaterialRequests(),
      getIssues(),
      getDprs(),
    ]);
    return { projects, workers, materialRequests, issues, dprs };
  },
  component: SiteDashboard,
});

function SiteDashboard() {
  const loaderData = Route.useLoaderData();
  const projects = Array.isArray(loaderData.projects) ? loaderData.projects : [];
  const workers = Array.isArray(loaderData.workers) ? loaderData.workers : [];
  const materialRequests = Array.isArray(loaderData.materialRequests) ? loaderData.materialRequests : [];
  const issues = Array.isArray(loaderData.issues) ? loaderData.issues : [];
  const dprs = Array.isArray(loaderData.dprs) ? loaderData.dprs : [];

  const myProject = projects[0];
  const present = workers.filter(w => w.status === "present").length;
  const myPending = myProject ? materialRequests.filter((m: any) => m.project === myProject.name && m.status === "pending").length : 0;
  const openIssues = myProject ? issues.filter((i: any) => i.project === myProject.name && i.status !== "resolved").length : 0;

  const { user } = useRole();
  const managerName = myProject?.manager || user.name;

  return (
    <AppShell title="Site Dashboard">
      <PageHeader 
        title={`Good morning, ${(myProject?.manager || user.name).split(" ")[0]}`} 
        description={myProject ? `${myProject.name} · ${myProject.location || "No Location"}` : "No active project assigned"} 
      />

      {/* Site banner */}
      <Card className="mb-6 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-gold/8">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3 w-3" /> {myProject?.location || "N/A"} <span>·</span> <CloudSun className="h-3 w-3" /> 31°C · partly cloudy
            </div>
            <h3 className="mt-1 text-xl font-bold tracking-tight">{myProject?.name || "No Project"}</h3>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={myProject?.progress || 0} className="h-2 flex-1" />
              <span className="text-sm font-bold tabular-nums">{myProject?.progress || 0}%</span>
            </div>
          </div>
          <Button asChild><Link to="/site/dpr">Submit today's DPR <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>

      {/* Quick actions (mobile-first) */}
      <div className="mb-6 grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { to: "/site/dpr", label: "Submit DPR", icon: ClipboardList, color: "bg-primary/10 text-primary" },
          { to: "/site/workforce", label: "Attendance", icon: HardHat, color: "bg-success/10 text-success" },
          { to: "/site/materials", label: "Request", icon: Package, color: "bg-gold/15 text-gold" },
          { to: "/site/issues", label: "Report Issue", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to} className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 text-center transition-all hover:border-primary/40 hover:shadow-sm">
              <div className={`grid h-10 w-10 place-items-center rounded-md ${a.color}`}><Icon className="h-5 w-5" /></div>
              <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Workers Present" value={`${present}/${workers.length}`} hint="No data yet" icon={HardHat} accent="success" />
        <KpiCard label="Today's Progress" value="0%" hint="No data yet" icon={ClipboardList} accent="blue" />
        <KpiCard label="Pending Materials" value={String(myPending)} hint="No data yet" icon={Package} accent="warning" />
        <KpiCard label="Open Issues" value={String(openIssues)} hint="No data yet" icon={AlertTriangle} accent="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent DPRs</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/site/dpr" className="text-xs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {dprs.slice(0, 4).map((d) => (
              <div key={d.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-md border border-border p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold">
                  {d.date ? String(d.date).slice(8, 10) : "--"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{d.id}</span>
                    <StatusBadge value={d.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{d.workCompleted}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground tabular-nums">
                  <div className="font-semibold text-foreground">{d.workers} pax</div>
                  <div>{d.progress}% progress</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Open issues</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success" asChild>
              <a href="https://wa.me/919847012345" target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /> Admin</a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.filter((i: any) => i.status !== "resolved").map((i: any) => (
              <div key={i.id} className="rounded-md border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <span className="text-sm font-semibold leading-tight">{i.title}</span>
                  <StatusBadge value={i.priority} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{i.id} · {i.type}</span>
                  <StatusBadge value={i.status} />
                </div>
              </div>
            ))}
            {issues.filter((i: any) => i.status !== "resolved").length === 0 && (
              <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> No open issues. Clean site.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}