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

      <div className="grid gap-6 md:grid-cols-4">
        {/* Project Info Card */}
        <Card className="md:col-span-1 p-6 space-y-4">
          <h3 className="font-semibold border-b pb-2">Project Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> <span className="text-foreground">{project.location || "No location set"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" /> <span className="text-foreground">{project.manager || "No manager assigned"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> 
              <span className="text-foreground">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} 
                {" - "} 
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4" /> 
              <span className="text-foreground">Budget: {formatCurrency(project.budget || 0)}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{project.progress || 0}%</span>
            </div>
            <Progress value={project.progress || 0} className="h-2" />
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Budget Spent</span>
              <span className="font-semibold">{formatCurrency(project.spent || 0)}</span>
            </div>
            <Progress value={((project.spent || 0) / (project.budget || 1)) * 100} className="h-2" />
          </div>
        </Card>

        {/* Details Tabs */}
        <Card className="md:col-span-3">
          <Tabs defaultValue="activity" className="w-full">
            <div className="border-b px-4 py-2">
              <TabsList>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="materials">Material Requests ({requests.length})</TabsTrigger>
                <TabsTrigger value="inventory">Inventory ({inventoryItems.length})</TabsTrigger>
                <TabsTrigger value="issues">Issues ({projectIssues.length})</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="activity" className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Latest updates across all modules for this project.</p>
              {requests.length === 0 && projectIssues.length === 0 ? (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-lg p-8 text-center">No recent activity recorded for this project.</div>
              ) : (
                <div className="space-y-4">
                  {/* Just showing a combined mock feed of the most recent 5 items */}
                  {[...requests.map(r => ({ ...r, _type: 'request', _date: new Date(r.date) })), 
                    ...projectIssues.map(i => ({ ...i, _type: 'issue', _date: new Date(i.date) }))]
                    .sort((a, b) => b._date.getTime() - a._date.getTime())
                    .slice(0, 5)
                    .map((item, i) => (
                      <div key={i} className="flex items-start gap-4 text-sm border-b pb-4 last:border-0">
                        <div className={`mt-0.5 rounded-full p-1.5 ${item._type === 'request' ? 'bg-blue-500/10 text-blue-500' : 'bg-destructive/10 text-destructive'}`}>
                          {item._type === 'request' ? <IndianRupee className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {item._type === 'request' ? `Material Request: ${item.qty} ${item.unit} ${item.item}` : `Issue: ${item.title}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Status: <span className="font-medium">{item.status}</span> · {item._date.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials" className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
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
                      <td className="px-4 py-3">{new Date(req.date).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">No material requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="inventory" className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item Name</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Qty in Stock</th>
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
            </TabsContent>

            <TabsContent value="issues" className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
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
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  );
}
