import { createFileRoute } from "@tanstack/react-router";
import { Plus, MessageCircle, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issues } from "@/lib/mock-data";

export const Route = createFileRoute("/site/issues")({
  head: () => ({ meta: [{ title: "Issues & Safety · Naushik Site" }] }),
  component: SiteIssues,
});

function SiteIssues() {
  const open = issues.filter(i => i.status !== "resolved").length;
  return (
    <AppShell title="Issues & Safety">
      <PageHeader
        title="Site issues, safety & risk"
        description="Report incidents, track resolution and escalate when needed."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success" asChild>
            <a href="https://wa.me/919847012345" target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /> Escalate to admin</a>
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        <KpiCard label="Open" value={String(open)} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Critical" value={String(issues.filter(i => i.priority === "critical").length)} icon={AlertTriangle} accent="destructive" />
        <KpiCard label="Resolved (week)" value="9" delta={12} icon={AlertTriangle} accent="success" />
        <KpiCard label="MTTR (days)" value="1.8" delta={-15} icon={AlertTriangle} accent="blue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Issue log</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {issues.map((i) => (
              <div key={i.id} className="rounded-md border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <span className="text-sm font-semibold leading-tight">{i.title}</span>
                  <StatusBadge value={i.priority} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{i.id}</span><span>·</span>
                  <span className="capitalize">{i.type}</span><span>·</span>
                  <span>{i.raisedBy}</span><span>·</span>
                  <span className="tabular-nums">{i.date}</span>
                  <StatusBadge value={i.status} className="ml-auto" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Report new issue</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Short summary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select defaultValue="safety">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="delay">Delay</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select defaultValue="high">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} placeholder="What happened, where, who's involved, suggested action…" />
            </div>
            <Button className="w-full"><Plus className="mr-1 h-4 w-4" />Report issue</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}