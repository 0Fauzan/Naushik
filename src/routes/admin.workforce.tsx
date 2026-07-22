import { createFileRoute } from "@tanstack/react-router";
import { Users, Phone, MessageCircle, TrendingUp, UserPlus } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { siteManagers, workforceTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/workforce")({
  head: () => ({ meta: [{ title: "Workforce · Naushik Admin" }] }),
  component: AdminWorkforce,
});

function AdminWorkforce() {
  return (
    <AppShell title="Workforce">
      <PageHeader
        title="Workforce & Site Managers"
        description="Capacity, productivity and assignments across the portfolio."
        actions={<Button size="sm"><UserPlus className="mr-1 h-4 w-4" />Add Manager</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Site Managers" value="24" delta={6} icon={Users} accent="blue" />
        <KpiCard label="Active Workers" value="510" delta={3} icon={Users} accent="success" />
        <KpiCard label="Avg. Productivity" value="87%" delta={2} icon={TrendingUp} accent="gold" />
        <KpiCard label="Open Roles" value="12" hint="3 critical" icon={UserPlus} accent="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Site Managers</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {siteManagers.map((m) => (
              <div key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border p-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {m.name.split(" ").map(s => s[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{m.name}</span>
                    <StatusBadge value={m.status} />
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.project} · {m.experience} yrs · ★ {m.rating}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Call"><Phone className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-success/40 text-success hover:bg-success/10 hover:text-success" aria-label="WhatsApp" asChild>
                    <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /></a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workers — 8 week trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={workforceTrend} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="workers" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}