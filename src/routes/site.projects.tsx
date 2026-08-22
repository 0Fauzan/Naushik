import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Calendar, IndianRupee, Image as ImageIcon, FileText } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location || "N/A"}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.startDate ? new Date(p.startDate).toLocaleDateString() : "TBD"} → {p.endDate ? new Date(p.endDate).toLocaleDateString() : "TBD"}</span>
                <span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {inr(p.budget || 0)}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Progress" value={`${p.progress || 0}%`} />
                <Stat label="Spent" value={inr(p.spent || 0)} />
                <Stat label="Client" value={p.client || "N/A"} />
              </div>
              <Progress value={p.progress || 0} className="mt-4 h-1.5" />
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
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: "Foundation & Basements", done: true },
                    { name: "Superstructure L1–L6", done: true },
                    { name: "Superstructure L7–L14", done: false, current: true, pct: 42 },
                    { name: "Façade & Glazing", done: false },
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
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    <DocChip name="Structural GA Rev C" />
                    <DocChip name="L7 Inspection Report" />
                    <DocChip name="Pour Card L8" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0 space-y-3">
                {[
                  { name: "Foundation & Basements", done: true, dates: "Jan 2026 - Mar 2026", status: "completed" },
                  { name: "Superstructure L1–L6", done: true, dates: "Apr 2026 - Jun 2026", status: "completed" },
                  { name: "Superstructure L7–L14", done: false, current: true, pct: 42, dates: "Jul 2026 - Sep 2026", status: "in-progress" },
                  { name: "Façade & Glazing", done: false, dates: "Oct 2026 - Nov 2026", status: "planned" },
                  { name: "MEP & Interiors", done: false, dates: "Dec 2026 - Feb 2027", status: "planned" },
                  { name: "Testing & Handover", done: false, dates: "Mar 2027", status: "planned" },
                ].map((m, idx) => (
                  <div key={m.name} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{m.name}</span>
                        <StatusBadge value={m.status} />
                      </div>
                      <span className="text-xs text-muted-foreground">{m.dates}</span>
                      {m.current && <Progress value={m.pct} className="mt-2 h-1.5" />}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="documents" className="mt-0 space-y-2">
                {[
                  { name: "Structural GA Rev C.dwg", size: "14.2 MB", type: "Drawing", date: "2026-06-15" },
                  { name: "L7 Concrete Inspection Report.pdf", size: "2.4 MB", type: "Inspection", date: "2026-06-18" },
                  { name: "Pour Card L8 Slab.pdf", size: "1.1 MB", type: "Pour Card", date: "2026-06-20" },
                  { name: "Approved BOQ Schedule.xlsx", size: "4.8 MB", type: "BOQ", date: "2026-05-10" },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-sm">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.type} · {doc.size} · {doc.date}</div>
                      </div>
                    </div>
                    <DocChip name="Download" />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    "L7 Slab Concreting",
                    "Column Rebar Inspection",
                    "Excavation North Wing",
                    "Tower Crane Setup",
                  ].map((caption, i) => (
                    <div key={i} className="group relative aspect-[4/3] rounded-lg border border-border bg-gradient-to-br from-muted via-muted/60 to-muted/30 p-3 flex flex-col justify-between">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <div className="text-xs font-medium text-foreground bg-background/80 backdrop-blur-sm p-1 rounded">
                        {caption}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-3">
                {[
                  { title: "L7 Slab Inspection Approved", user: "Quality Engineer", time: "Yesterday, 4:30 PM" },
                  { title: "Batching Plant Concrete Delivered (40 m³)", user: "Logistics", time: "Yesterday, 11:15 AM" },
                  { title: "DPR Submitted for 24 Jun 2026", user: "Site Engineer", time: "2 days ago" },
                  { title: "Material Request #PO-2026-08 Approved", user: "Project Admin", time: "3 days ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg border border-border">
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-muted-foreground">By {item.user}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </TabsContent>
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