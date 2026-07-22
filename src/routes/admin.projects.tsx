import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, Download, Search } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projects, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "Projects · Naushik Admin" }] }),
  component: AdminProjects,
});

function AdminProjects() {
  return (
    <AppShell title="Projects">
      <PageHeader
        title="Project portfolio"
        description={`${projects.length} projects across 6 cities · ₹${(projects.reduce((s, p) => s + p.budget, 0) / 1e7).toFixed(1)} Cr total budget`}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Project</Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs defaultValue="all" className="min-w-0 max-w-full">
            <TabsList className="flex w-full max-w-full overflow-x-auto sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="delayed">Delayed</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search projects…" className="h-9 w-full pl-8 sm:w-64" />
            </div>
            <Button variant="outline" size="sm" className="shrink-0"><Filter className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Project</th>
                <th className="px-4 py-3 text-left font-semibold">Client / Manager</th>
                <th className="px-4 py-3 text-left font-semibold">Timeline</th>
                <th className="px-4 py-3 text-left font-semibold">Budget</th>
                <th className="px-4 py-3 text-left font-semibold">Progress</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id} · {p.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{p.client}</div>
                    <div className="text-xs text-muted-foreground">{p.manager}</div>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    <div>{p.startDate}</div>
                    <div className="text-muted-foreground">→ {p.endDate}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <div className="font-semibold">{inr(p.budget)}</div>
                    <div className="text-xs text-muted-foreground">Spent {inr(p.spent)}</div>
                  </td>
                  <td className="px-4 py-3" style={{ minWidth: 140 }}>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="h-1.5 flex-1" />
                      <span className="w-9 text-right text-xs font-semibold tabular-nums">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-border md:hidden">
          {projects.map((p) => (
            <div key={p.id} className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.client} · {p.location}</div>
                </div>
                <StatusBadge value={p.status} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Progress value={p.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-semibold tabular-nums">{p.progress}%</span>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{inr(p.spent)} of {inr(p.budget)}</span>
                <span>{p.manager}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}