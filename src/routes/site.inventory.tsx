import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { inventory } from "@/lib/mock-data";

export const Route = createFileRoute("/site/inventory")({
  head: () => ({ meta: [{ title: "Site Inventory · Naushik" }] }),
  component: SiteInventory,
});

function SiteInventory() {
  const site = inventory.filter(i => i.location.startsWith("Site"));
  const low = site.filter(i => i.stock < i.minStock);
  return (
    <AppShell title="Site Inventory">
      <PageHeader title="Site stock" description="Materials physically present at your site." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard label="Items on site" value={String(site.length)} icon={Boxes} accent="blue" />
        <KpiCard label="Low stock" value={String(low.length)} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Consumed today" value="42 units" icon={Boxes} accent="success" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Stock log</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {site.map((i) => {
            const pct = Math.min(100, Math.round((i.stock / (i.minStock * 2)) * 100));
            const isLow = i.stock < i.minStock;
            return (
              <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{i.name}</span>
                    {isLow && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">LOW</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{i.location}</div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </div>
                <div className="text-right text-sm font-bold tabular-nums">{i.stock} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span></div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}