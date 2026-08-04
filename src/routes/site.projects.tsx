import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Calendar, IndianRupee, Image as ImageIcon, FileText } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inr } from "@/lib/mock-data";
import { getProjects } from "@/server/projects";

export const Route = createFileRoute("/site/projects")({
  head: () => ({ meta: [{ title: "My Projects · Naushik Site" }] }),
  loader: () => getProjects(),
  component: SiteProjects,
});

function SiteProjects() {
  const dbProjects = Route.useLoaderData();
  const projects = Array.isArray(dbProjects) ? dbProjects : [];
  const mine = projects.length > 0 ? [projects[0]] : [];
  return (
    <AppShell title="My Projects">
      <PageHeader title="Assigned projects" description="Project overview, timeline, documents and history." />

      {mine.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[1fr_auto]">
            <div className="p-5">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">{p.name}</h3>
                <StatusBadge value={p.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.startDate} → {p.endDate}</span>
                <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {inr(p.budget)}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Progress" value={`${p.progress}%`} />
                <Stat label="Spent" value={inr(p.spent)} />
                <Stat label="Client" value={p.client} />
              </div>
              <Progress value={p.progress} className="mt-4 h-1.5" />
            </div>
          </div>

          <Tabs defaultValue="overview" className="border-t border-border">
            <TabsList className="ml-4 mt-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { name: "Foundation & Basements", done: true },
                  { name: "Superstructure L1–L6", done: true },
                  { name: "Superstructure L7–L14", done: false, current: true, pct: 42 },
                  { name: "Façade & Glazing", done: false },
                  { name: "MEP & Interiors", done: false },
                  { name: "Handover", done: false },
                ].map((m) => (
                  <div key={m.name} className={`rounded-md border p-3 ${m.current ? "border-gold bg-gold/5" : "border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{m.name}</span>
                      {m.done && <StatusBadge value="completed" />}
                      {m.current && <StatusBadge value="in-progress" />}
                    </div>
                    {m.current && <Progress value={m.pct} className="mt-2 h-1.5" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[4/3] rounded-md border border-border bg-gradient-to-br from-muted via-muted/60 to-muted/30 grid place-items-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <DocChip name="Structural GA Rev C" />
                <DocChip name="L7 Inspection Report" />
                <DocChip name="Pour Card L8" />
              </div>
            </CardContent>
          </Tabs>
        </Card>
      ))}

      {mine.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <MapPin className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold tracking-tight">No projects assigned</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            You currently do not have any projects assigned to you. Once an admin assigns a project, it will appear here.
          </p>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

function DocChip({ name }: { name: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:border-primary/40">
      <FileText className="h-3 w-3 text-muted-foreground" /> {name}
    </button>
  );
}