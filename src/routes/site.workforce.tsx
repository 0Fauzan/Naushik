import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Users } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { workers as mockWorkers } from "@/lib/mock-data";
import { enqueueAction } from "@/lib/offline/queue";

export const Route = createFileRoute("/site/workforce")({
  head: () => ({ meta: [{ title: "Workforce · Naushik Site" }] }),
  component: SiteWorkforce,
});

type Status = "present" | "absent" | "leave";

function SiteWorkforce() {
  const [state, setState] = useState<Record<string, Status>>(
    Object.fromEntries(mockWorkers.map(w => [w.id, w.status]))
  );
  const [saving, setSaving] = useState(false);
  const present = Object.values(state).filter(s => s === "present").length;
  const absent = Object.values(state).filter(s => s === "absent").length;
  const leave = Object.values(state).filter(s => s === "leave").length;

  const save = async () => {
    setSaving(true);
    const date = new Date().toISOString().slice(0, 10);
    await enqueueAction("attendance.save", `Attendance ${date} · ${present} present`, {
      date, entries: state, summary: { present, absent, leave },
    });
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    toast.success(online ? "Attendance saved — syncing" : "Saved offline — will sync when online");
    setSaving(false);
  };

  return (
    <AppShell title="Workforce">
      <PageHeader
        title="Attendance — 25 Jun 2026"
        description="Mark attendance and track today's deployment."
        actions={<Button size="sm" disabled={saving} onClick={save}><Save className="mr-1.5 h-3.5 w-3.5" />Save</Button>}
      />

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        <KpiCard label="Present" value={String(present)} icon={Users} accent="success" />
        <KpiCard label="Absent" value={String(absent)} icon={Users} accent="destructive" />
        <KpiCard label="On leave" value={String(leave)} icon={Users} accent="warning" />
        <KpiCard label="Productivity" value="91%" delta={4} icon={Users} accent="gold" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Workers</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {mockWorkers.map((w) => (
            <div key={w.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-muted text-xs font-bold">{w.name.split(" ").map(s => s[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{w.name}</div>
                <div className="truncate text-xs text-muted-foreground">{w.trade} · {w.id}</div>
              </div>
              <div className="flex shrink-0 gap-1">
                {(["present", "absent", "leave"] as Status[]).map((s) => {
                  const active = state[w.id] === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setState((p) => ({ ...p, [w.id]: s }))}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                        active
                          ? s === "present" ? "bg-success text-success-foreground" : s === "absent" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s[0].toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Today's deployment</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { trade: "Masons", count: 24 },
              { trade: "Bar Benders", count: 18 },
              { trade: "Carpenters", count: 12 },
              { trade: "Electricians", count: 8 },
              { trade: "Plumbers", count: 6 },
              { trade: "Welders", count: 4 },
              { trade: "Helpers", count: 14 },
              { trade: "Operators", count: 5 },
            ].map((t) => (
              <div key={t.trade} className="rounded-md border border-border p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.trade}</div>
                <div className="mt-1 text-lg font-bold tabular-nums">{t.count}</div>
              </div>
            ))}
          </div>
          {/* keep status badge used somewhere to avoid unused warnings */}
          <div className="mt-4 text-xs text-muted-foreground">Workforce status legend: <StatusBadge value="present" /> <StatusBadge value="absent" /> <StatusBadge value="leave" /></div>
        </CardContent>
      </Card>
    </AppShell>
  );
}