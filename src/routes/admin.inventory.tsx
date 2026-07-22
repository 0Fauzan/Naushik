import { createFileRoute } from "@tanstack/react-router";
import { Boxes, AlertTriangle, ArrowLeftRight, TrendingDown, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { inventory, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory · Naushik Admin" }] }),
  component: AdminInventory,
});

function AdminInventory() {
  const lowStock = inventory.filter(i => i.stock < i.minStock);
  const totalValue = inventory.reduce((s, i) => s + i.stock * i.rate, 0);

  return (
    <AppShell title="Inventory">
      <PageHeader
        title="Central & site inventory"
        description="Live stock across central warehouse and active sites."
        actions={
          <>
            <Button variant="outline" size="sm"><ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />Transfer</Button>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Item</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Items Tracked" value={String(inventory.length)} icon={Boxes} accent="blue" />
        <KpiCard label="Inventory Value" value={inr(totalValue)} delta={4} icon={Boxes} accent="gold" />
        <KpiCard label="Low Stock Alerts" value={String(lowStock.length)} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Consumption (week)" value="₹38.2 L" delta={-3} icon={TrendingDown} accent="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Stock by item</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.map((i) => {
                const pct = Math.min(100, Math.round((i.stock / (i.minStock * 2)) * 100));
                const low = i.stock < i.minStock;
                return (
                  <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{i.name}</span>
                        {low && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">LOW</span>}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{i.category} · {i.location}</div>
                      <Progress value={pct} className="mt-2 h-1.5" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums">{i.stock} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span></div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">min {i.minStock} · {inr(i.rate)}/{i.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Low stock alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lowStock.map((i) => (
              <div key={i.id} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <div className="text-sm font-semibold">{i.name}</div>
                <div className="text-xs text-muted-foreground">{i.location}</div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-warning font-bold tabular-nums">{i.stock} {i.unit}</span>
                  <span className="text-muted-foreground tabular-nums">min {i.minStock}</span>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && <div className="text-sm text-muted-foreground">All items above threshold.</div>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}