import { createFileRoute } from "@tanstack/react-router";
import {
  FolderKanban, Building2, AlertOctagon, Users, ShoppingCart, Wallet, TrendingUp, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { KpiCard } from "@/components/app/kpi-card";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { projects, kpiTrend, expenseBreakdown, workforceTrend, materialRequests, auditLogs, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard · Naushik" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const active = projects.filter(p => p.status === "active").length;
  const delayed = projects.filter(p => p.status === "delayed").length;
  const pending = materialRequests.filter(m => m.status === "pending").length;
  return (
    <AppShell title="Portfolio Dashboard">
      <PageHeader
        title="Good morning, Krishnan"
        description="Here's what's happening across the portfolio today, 25 Jun 2026."
        actions={
          <>
            <Button variant="outline" size="sm">Export PDF</Button>
            <Button size="sm">+ New Project</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Projects" value={String(projects.length)} delta={8} icon={FolderKanban} accent="blue" />
        <KpiCard label="Active" value={String(active)} delta={4} icon={Building2} accent="success" />
        <KpiCard label="Delayed" value={String(delayed)} delta={-2} icon={AlertOctagon} accent="destructive" />
        <KpiCard label="Site Managers" value="24" delta={6} icon={Users} accent="gold" />
        <KpiCard label="Pending Requests" value={String(pending)} hint="Awaiting your approval" icon={ShoppingCart} accent="warning" />
        <KpiCard label="Budget Utilised" value="63%" delta={3} icon={Wallet} accent="blue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Planned vs Actual Progress</CardTitle>
              <p className="text-xs text-muted-foreground">Portfolio weighted % completion</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={kpiTrend} margin={{ left: -20, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="planned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="planned" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#planned)" />
                <Area type="monotone" dataKey="actual" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#actual)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Current quarter · {inr(expenseBreakdown.reduce((s, e) => s + e.amount, 0))}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => inr(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {expenseBreakdown.map((e, i) => (
                <div key={e.category} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: `var(--color-chart-${(i % 5) + 1})` }} />
                    {e.category}
                  </span>
                  <span className="font-semibold tabular-nums">{inr(e.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Top Projects</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all <ChevronRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{p.name}</span>
                    <StatusBadge value={p.status} />
                  </div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.client} · {p.location} · {p.manager}</div>
                  <Progress value={p.progress} className="mt-2 h-1.5" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{p.progress}%</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">{inr(p.spent)} / {inr(p.budget)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workforce on Site</CardTitle>
            <p className="text-xs text-muted-foreground">Last 8 weeks · all projects</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={workforceTrend} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="workers" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {auditLogs.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm"><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{a.action.toLowerCase()}</span> <span className="font-medium">{a.entity}</span></div>
                    <div className="text-xs text-muted-foreground">{a.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Material Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {materialRequests.filter(m => m.status === "pending").map((m) => (
                <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md border border-border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{m.item}</span><StatusBadge value={m.priority} /></div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{m.project} · {m.qty} {m.unit} · {m.requestedBy}</div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Reject</Button>
                    <Button size="sm" className="h-7 px-2 text-xs">Approve</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}