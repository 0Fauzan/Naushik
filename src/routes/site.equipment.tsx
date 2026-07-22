import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Activity, AlertOctagon, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { equipment } from "@/lib/mock-data";

export const Route = createFileRoute("/site/equipment")({
  head: () => ({ meta: [{ title: "Equipment · Naushik Site" }] }),
  component: SiteEquipment,
});

function SiteEquipment() {
  const breakdown = equipment.filter(e => e.status === "breakdown").length;
  return (
    <AppShell title="Equipment">
      <PageHeader
        title="Equipment & plant"
        description="Allocation, utilisation and maintenance across the site."
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" />Maintenance request</Button>}
      />

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        <KpiCard label="Total Units" value={String(equipment.length)} icon={Wrench} accent="blue" />
        <KpiCard label="Operational" value={String(equipment.filter(e => e.status === "operational").length)} icon={Activity} accent="success" />
        <KpiCard label="Breakdown" value={String(breakdown)} icon={AlertOctagon} accent="destructive" />
        <KpiCard label="Avg. Utilisation" value="58%" delta={4} icon={Activity} accent="gold" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Equipment list</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {equipment.map((e) => (
            <div key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-md border border-border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{e.name}</span>
                  <StatusBadge value={e.status} />
                </div>
                <div className="text-xs text-muted-foreground">{e.id} · {e.project} · next service {e.nextService}</div>
                <Progress value={e.utilisation} className="mt-2 h-1.5" />
              </div>
              <div className="text-right text-sm font-bold tabular-nums">{e.utilisation}%</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}