import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { getProjectDetails } from "@/server/projects";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, User, Calendar, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/admin/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project Details · Naushik Admin" }] }),
  loader: ({ params }) => getProjectDetails({ data: Number(params.projectId) }),
  component: ProjectDetails,
});

function ProjectDetails() {
  const router = useRouter();
  const { project, requests, inventoryItems, projectIssues } = Route.useLoaderData();

  if (!project) {
    return (
      <AppShell title="Project Details">
        <PageHeader title="Project not found" description="The project you are looking for does not exist." />
      </AppShell>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <AppShell title="Project Details">
      <PageHeader
        title={project.name}
        description={`Client: ${project.client || "Unknown"}`}
        actions={<StatusBadge value={project.status} />}
      />

      <div className="space-y-4">
        {/* Project Info Card — horizontal on mobile, sidebar on desktop */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 text-sm mb-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Location</div>
                <span className="font-medium">{project.location || "—"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Manager</div>
                <span className="font-medium">{project.manager || "—"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Timeline</div>
                <span className="font-medium text-xs">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "TBD"}
                  {" – "}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "TBD"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <IndianRupee className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Budget</div>
                <span className="font-medium">{formatCurrency(project.budget || 0)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Budget Spent</span>
                <span className="font-semibold">{formatCurrency(project.spent || 0)}</span>
              </div>
              <Progress value={((project.spent || 0) / (project.budget || 1)) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Details Tabs */}
        <Card className="overflow-hidden">
          <Tabs defaultValue="activity" className="w-full">
            {/* Scrollable tab list for mobile */}
            <div className="border-b px-2 pt-2 overflow-x-auto no-scrollbar">
              <TabsList className="flex w-max min-w-full gap-1 bg-transparent p-0 h-auto">
                <TabsTrigger value="activity" className="shrink-0 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2.5 px-3">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="materials" className="shrink-0 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2.5 px-3">
                  Materials ({requests.length})
                </TabsTrigger>
                <TabsTrigger value="inventory" className="shrink-0 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2.5 px-3">
                  Inventory ({inventoryItems.length})
                </TabsTrigger>
                <TabsTrigger value="issues" className="shrink-0 text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-2.5 px-3">
                  Issues ({projectIssues.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="activity" className="p-4 sm:p-6">
              <p className="text-sm text-muted-foreground mb-4">Latest updates across all modules for this project.</p>
              {requests.length === 0 && projectIssues.length === 0 ? (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-lg p-8 text-center">No recent activity recorded for this project.</div>
              ) : (
                <div className="space-y-3">
                  {[...requests.map(r => ({ ...r, _type: 'request' as const, _date: new Date(r.date) })),
                    ...projectIssues.map(i => ({ ...i, _type: 'issue' as const, _date: new Date(i.date) }))]
                    .sort((a, b) => b._date.getTime() - a._date.getTime())
                    .slice(0, 5)
                    .map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm border-b pb-3 last:border-0">
                        <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${item._type === 'request' ? 'bg-blue-500/10 text-blue-500' : 'bg-destructive/10 text-destructive'}`}>
                          {item._type === 'request' ? <IndianRupee className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm leading-snug">
                            {item._type === 'request' ? `Material: ${item.qty} ${item.unit || ''} ${item.item}` : `Issue: ${item.title}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <StatusBadge value={item.status} /> · {item._date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials" className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[480px]">
                  <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Item</th>
                      <th className="px-4 py-3 font-semibold">Qty</th>
                      <th className="px-4 py-3 font-semibold">Requested By</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {requests.length > 0 ? requests.map(req => (
                      <tr key={req.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium">{req.item}</td>
                        <td className="px-4 py-3">{req.qty}{req.unit ? ` ${req.unit}` : ''}</td>
                        <td className="px-4 py-3">{req.requestedBy || 'System'}</td>
                        <td className="px-4 py-3"><StatusBadge value={req.status} /></td>
                        <td className="px-4 py-3 tabular-nums">{new Date(req.date).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">No material requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[380px]">
                  <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Item Name</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Qty</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inventoryItems.length > 0 ? inventoryItems.map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium">{inv.item}</td>
                        <td className="px-4 py-3">{inv.category || 'General'}</td>
                        <td className="px-4 py-3">{inv.qty}{inv.unit ? ` ${inv.unit}` : ''}</td>
                        <td className="px-4 py-3"><StatusBadge value={inv.status} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">No inventory assigned.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="issues" className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[380px]">
                  <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Priority</th>
                      <th className="px-4 py-3 font-semibold">Raised By</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectIssues.length > 0 ? projectIssues.map(iss => (
                      <tr key={iss.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium">{iss.title}</td>
                        <td className="px-4 py-3"><StatusBadge value={iss.priority} /></td>
                        <td className="px-4 py-3">{iss.raisedBy || 'System'}</td>
                        <td className="px-4 py-3"><StatusBadge value={iss.status} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">No issues reported.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  );
}
