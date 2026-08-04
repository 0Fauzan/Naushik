import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getInventory } from "@/server/inventory";

export const Route = createFileRoute("/site/inventory")({
  head: () => ({ meta: [{ title: "Site Inventory · Naushik" }] }),
  loader: () => getInventory(),
  component: SiteInventory,
});

function SiteInventory() {
  const dbInventory = Route.useLoaderData();
  const inventory = Array.isArray(dbInventory) ? dbInventory : [];
  const site = inventory.filter((i: any) => (i.location || i.project || "").startsWith("Site") || (i.location || i.project || "") === "Marina Bay Tower");
  const low = site.filter((i: any) => (i.stock ?? i.qty ?? 0) < (i.minStock ?? 0));
  return (
    <AppShell title="Site Inventory">
      <PageHeader title="Site stock" description="Materials physically present at your site." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <KpiCard label="Items on site" value={String(site.length)} hint="No data yet" icon={Boxes} accent="blue" />
        <KpiCard label="Low stock" value={String(low.length)} hint="No data yet" icon={AlertTriangle} accent="warning" />
        <KpiCard label="Consumed today" value="0 units" hint="No data yet" icon={Boxes} accent="success" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Stock log</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {site.map((i: any) => {
            const stock = i.stock ?? i.qty ?? 0;
            const minStock = i.minStock ?? 0;
            const pct = Math.min(100, Math.round((stock / (minStock * 2 || 10)) * 100));
            const isLow = stock < minStock;
            return (
              <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{i.name || i.item}</span>
                    {isLow && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">LOW</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{i.location || i.project}</div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </div>
                <div className="text-right text-sm font-bold tabular-nums">{stock} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span></div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}