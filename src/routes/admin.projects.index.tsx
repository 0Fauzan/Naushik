import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, Download, Search, MoreVertical, Edit, Trash } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate, useRouter, Link } from "@tanstack/react-router";
import { inr } from "@/lib/mock-data";
import { getProjects, createProject, updateProject, deleteProject } from "@/server/projects";

type ProjectSearch = {
  search?: string;
};

export const Route = createFileRoute("/admin/projects/")({
  head: () => ({ meta: [{ title: "Projects · Naushik Admin" }] }),
  validateSearch: (search: Record<string, unknown>): ProjectSearch => {
    return {
      search: search.search as string | undefined,
    }
  },
  loader: () => getProjects(),
  component: AdminProjects,
});

function AdminProjects() {
  const router = useRouter();
  const navigate = useNavigate();
  const projects = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { search } = Route.useSearch();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(search || "");
  
  const [formData, setFormData] = useState({ name: "", client: "", location: "", manager: "", budget: "" });

  const filteredProjects = projects.filter((p) => {
    if (filter !== "all" && p.status?.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.name?.toLowerCase().includes(q) && 
        !p.client?.toLowerCase().includes(q) && 
        !p.location?.toLowerCase().includes(q) &&
        !p.manager?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleExportExcel = () => {
    try {
      const csv = ["Project ID,Name,Client,Location,Budget,Spent,Status"];
      projects.forEach((p: any) => csv.push(`${p.projectId},"${p.name}","${p.client || ''}","${p.location || ''}",${p.budget},${p.spent},${p.status}`));
      const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "naushik_projects_export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to Excel successfully");
      setIsExportOpen(false);
    } catch (e) {
      toast.error("Failed to export data");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Project Portfolio Export", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
      
      const tableData = projects.map((p: any) => [
        p.projectId,
        p.name,
        p.client || "-",
        p.location || "-",
        `Rs. ${p.budget?.toLocaleString() || "0"}`,
        `Rs. ${p.spent?.toLocaleString() || "0"}`,
        p.status
      ]);

      autoTable(doc, {
        startY: 36,
        head: [["ID", "Name", "Client", "Location", "Budget", "Spent", "Status"]],
        body: tableData,
      });

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "naushik_projects_export.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to PDF successfully");
      setIsExportOpen(false);
    } catch (e) {
      toast.error("Failed to export PDF");
    }
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateProject({ data: { id: editingId, ...formData, budget: Number(formData.budget) || 0 } });
        toast.success("Project updated successfully");
      } else {
        await createProject({ data: { ...formData, budget: Number(formData.budget) || 0 } });
        toast.success("Project created successfully");
      }
      setOpen(false);
      setFormData({ name: "", client: "", location: "", manager: "", budget: "" });
      setEditingId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject({ data: id });
      toast.success("Project deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete project");
    }
  };

  const openEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      client: project.client || "",
      location: project.location || "",
      manager: project.manager || "",
      budget: String(project.budget || 0)
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", client: "", location: "", manager: "", budget: "" });
    setOpen(true);
  };

  return (
    <AppShell title="Projects">
      <PageHeader
        title="Project portfolio"
        description={`${projects.length} projects across 6 cities · ₹${(projects.reduce((s, p) => s + (p.budget || 0), 0) / 1e7).toFixed(1)} Cr total budget`}
        actions={
          <>
            <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Projects Data</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button variant="outline" onClick={handleExportExcel}>Export as Excel</Button>
                  <Button variant="outline" onClick={handleExportPDF}>Export as PDF</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setEditingId(null);
                setFormData({ name: "", client: "", location: "", manager: "", budget: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />New Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingId ? "Edit Project" : "Create New Project"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5"><Label>Project Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Client</Label><Input value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Manager</Label><Input value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Budget (₹)</Label><Input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} /></div>
                </div>
                <DialogFooter><Button disabled={submitting} onClick={handleSave}>Save Project</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={filter} onValueChange={setFilter} className="min-w-0 max-w-full">
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
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search projects…" className="h-9 w-full pl-8 sm:w-64" />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0"><Filter className="h-3.5 w-3.5" /></Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <div className="grid gap-2 text-sm">
                    <Label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Active Projects</Label>
                    <Label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Delayed Projects</Label>
                    <Label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> On Hold Projects</Label>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Apply Filters</Button>
                </div>
              </PopoverContent>
            </Popover>
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
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to="/admin/projects/$projectId" params={{ projectId: String(p.id) }} className="font-semibold hover:underline block">{p.name}</Link>
                    <div className="text-xs text-muted-foreground">{p.projectId || p.id} · {p.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{p.client}</div>
                    <div className="text-xs text-muted-foreground">{p.manager}</div>
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    <div>{p.startDate ? new Date(p.startDate).toLocaleDateString() : "N/A"}</div>
                    <div className="text-muted-foreground">→ {p.endDate ? new Date(p.endDate).toLocaleDateString() : "N/A"}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <div className="font-semibold">{inr(p.budget || 0)}</div>
                    <div className="text-xs text-muted-foreground">Spent {inr(p.spent || 0)}</div>
                  </td>
                  <td className="px-4 py-3" style={{ minWidth: 140 }}>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress || 0} className="h-1.5 flex-1" />
                      <span className="w-9 text-right text-xs font-semibold tabular-nums">{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {p.id != null && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(p); }}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-border md:hidden">
          {filteredProjects.map((p) => (
            <div key={p.id} className="p-4 hover:bg-muted/10">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2">
                <div className="min-w-0">
                  <Link to="/admin/projects/$projectId" params={{ projectId: String(p.id) }} className="truncate text-sm font-semibold hover:underline block">{p.name}</Link>
                  <div className="truncate text-xs text-muted-foreground">{p.client} · {p.location}</div>
                </div>
                <StatusBadge value={p.status} />
                <div onClick={(e) => e.stopPropagation()}>
                  {p.id != null && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(p); }}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Progress value={p.progress || 0} className="h-1.5 flex-1" />
                <span className="text-xs font-semibold tabular-nums">{p.progress || 0}%</span>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{inr(p.spent || 0)} of {inr(p.budget || 0)}</span>
                <span>{p.manager}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}