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
import { projects, dprs, materialRequests, issues, workers } from "@/lib/mock-data";

export const Route = createFileRoute("/site/dashboard")({
  head: () => ({ meta: [{ title: "Site Dashboard · Naushik" }] }),
  component: SiteDashboard,
});

function SiteDashboard() {
  const myProject = projects[0]; // Marina Bay Tower
  const present = workers.filter(w => w.status === "present").length;
  const myPending = materialRequests.filter(m => m.project === myProject.name && m.status === "pending").length;
  const openIssues = issues.filter(i => i.project === myProject.name && i.status !== "resolved").length;

  return (
    <AppShell title="Site Dashboard">
      <PageHeader title="Good morning, Rajesh" description={`${myProject.name} · ${myProject.location} · Day 489 of 808`} />

      {/* Site banner */}
      <Card className="mb-6 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-gold/8">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3 w-3" /> {myProject.location} <span>·</span> <CloudSun className="h-3 w-3" /> 31°C · partly cloudy
            </div>
            <h3 className="mt-1 text-xl font-bold tracking-tight">{myProject.name}</h3>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={myProject.progress} className="h-2 flex-1" />
              <span className="text-sm font-bold tabular-nums">{myProject.progress}%</span>
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
        <KpiCard label="Workers Present" value={`${present}/${workers.length}`} icon={HardHat} accent="success" hint="86% attendance" />
        <KpiCard label="Today's Progress" value="+0.4%" delta={4} icon={ClipboardList} accent="blue" />
        <KpiCard label="Pending Materials" value={String(myPending)} icon={Package} accent="warning" />
        <KpiCard label="Open Issues" value={String(openIssues)} icon={AlertTriangle} accent="destructive" />
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
                  {d.date.slice(8, 10)}
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
                  <div>{d.issues} issue{d.issues !== 1 ? "s" : ""}</div>
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
            {issues.filter(i => i.status !== "resolved").map((i) => (
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
            {issues.filter(i => i.status !== "resolved").length === 0 && (
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