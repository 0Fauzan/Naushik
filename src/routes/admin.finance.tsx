import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, AlertOctagon, CreditCard } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { inr } from "@/lib/mock-data";
import { getProjects } from "@/server/projects";
import { getMetrics } from "@/server/metrics";
import { createStatement } from "@/server/finance";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "Finance · Naushik Admin" }] }),
  loader: async () => {
    const [projects, metrics] = await Promise.all([getProjects(), getMetrics()]);
    return { projects, metrics };
  },
  component: AdminFinance,
});

function AdminFinance() {
  const loaderData = Route.useLoaderData();
  const projects = Array.isArray(loaderData.projects) ? loaderData.projects : [];
  const kpiTrend = loaderData.metrics?.kpiTrend || [];
  
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [statementType, setStatementType] = useState("cashflow");
  const [statementPeriod, setStatementPeriod] = useState("mtd");
  const router = useRouter();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await createStatement({ data: { type: statementType, period: statementPeriod } });
      
      // Generate a mock PDF download to simulate the statement file
      const csv = [`Statement Type,Period\\n"${statementType}","${statementPeriod}"`];
      const blob = new Blob([csv.join("\\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance_statement_${statementType}_${statementPeriod}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Statement generated and saved.");
      setOpen(false);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to generate statement");
    } finally {
      setGenerating(false);
    }
  };

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const cashflow = kpiTrend.map((k) => ({ month: k.month, inflow: k.planned * 1.8, outflow: k.actual * 1.6 }));

  return (
    <AppShell title="Finance">
      <PageHeader
        title="Financial command centre"
        description="Budgets, expenses, vendor payments and variance analysis."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Generate Statement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate Financial Statement</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label>Statement Type</Label>
                  <Select value={statementType} onValueChange={setStatementType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashflow">Cash Flow</SelectItem>
                      <SelectItem value="pnl">Profit & Loss</SelectItem>
                      <SelectItem value="balance">Balance Sheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Period</Label>
                  <Select value={statementPeriod} onValueChange={setStatementPeriod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtd">Month to Date</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={generating} onClick={handleGenerate}>
                  {generating ? "Generating..." : "Download PDF"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Portfolio Budget" value={inr(totalBudget)} hint="No data yet" icon={Wallet} accent="blue" />
        <KpiCard label="Spent to Date" value={inr(totalSpent)} hint="No data yet" icon={CreditCard} accent="gold" />
        <KpiCard label="Utilisation" value={`${totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0}%`} hint="No data yet" icon={TrendingUp} accent="success" />
        <KpiCard label="Cost Overrun" value={inr(0)} hint="No data yet" icon={AlertOctagon} accent="destructive" />
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
            <div className="text-sm text-muted-foreground py-8 text-center">No pending payments.</div>
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