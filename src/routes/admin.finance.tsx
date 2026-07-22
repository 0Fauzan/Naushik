import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, AlertOctagon, CreditCard } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { projects, inr, kpiTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "Finance · Naushik Admin" }] }),
  component: AdminFinance,
});

function AdminFinance() {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const cashflow = kpiTrend.map((k) => ({ month: k.month, inflow: k.planned * 1.8, outflow: k.actual * 1.6 }));

  return (
    <AppShell title="Finance">
      <PageHeader
        title="Financial command centre"
        description="Budgets, expenses, vendor payments and variance analysis."
        actions={<Button size="sm">Generate Statement</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Portfolio Budget" value={inr(totalBudget)} icon={Wallet} accent="blue" />
        <KpiCard label="Spent to Date" value={inr(totalSpent)} delta={6} icon={CreditCard} accent="gold" />
        <KpiCard label="Utilisation" value={`${Math.round((totalSpent / totalBudget) * 100)}%`} delta={3} icon={TrendingUp} accent="success" />
        <KpiCard label="Cost Overrun" value={inr(28_400_000)} delta={-2} icon={AlertOctagon} accent="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Cash inflow vs outflow</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cashflow} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} unit="L" />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="inflow" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="outflow" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vendor payments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Ultratech Cement Ltd.", due: "₹18.4 L", days: 3 },
              { name: "TATA Steel Tinplate", due: "₹42.7 L", days: 7 },
              { name: "ACC Ready Mix", due: "₹9.8 L", days: 1 },
              { name: "Saint-Gobain Glass", due: "₹6.3 L", days: 14 },
            ].map((v) => (
              <div key={v.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{v.name}</div>
                  <div className="text-xs text-muted-foreground">Due in {v.days} day{v.days > 1 ? "s" : ""}</div>
                </div>
                <div className="text-sm font-bold tabular-nums">{v.due}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Project budget utilisation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {projects.map((p) => {
            const pct = Math.round((p.spent / p.budget) * 100);
            return (
              <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">{inr(p.spent)} of {inr(p.budget)}</div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </div>
                <div className="w-12 text-right text-sm font-bold tabular-nums">{pct}%</div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}