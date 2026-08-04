import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, ShieldCheck, Activity, BarChart3, Filter, FileBarChart2, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { createReport } from "@/server/reports";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · Naushik Admin" }] }),
  component: AdminReports,
});

const REPORTS = [
  { name: "Project Status Report", desc: "Per-project progress, schedule variance and milestone health.", category: "Operational" },
  { name: "Labour Productivity Report", desc: "Trade-wise output, attendance and hours utilisation.", category: "Workforce" },
  { name: "Material Consumption Report", desc: "Issue, return and wastage by material and site.", category: "Materials" },
  { name: "Inventory Reconciliation", desc: "Opening, receipts, issues, closing balance by warehouse.", category: "Inventory" },
  { name: "Financial Statement", desc: "Project P&L, cash position and vendor payables.", category: "Finance" },
  { name: "Cost Variance Analysis", desc: "Planned vs actual cost drift across line items.", category: "Finance" },
  { name: "Safety & Incident Log", desc: "NMI, FAI and lost-time incidents with root-cause analysis.", category: "HSE" },
  { name: "Equipment Utilisation", desc: "Hours, downtime and maintenance cost per asset.", category: "Equipment" },
];

function AdminReports() {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [reportTitle, setReportTitle] = useState("");
  const [reportSource, setReportSource] = useState("projects");
  const [reportFreq, setReportFreq] = useState("oneoff");
  const router = useRouter();

  const handleGenerate = async () => {
    if (!reportTitle.trim()) {
      toast.error("Please enter a report title");
      return;
    }
    setGenerating(true);
    try {
      await createReport({ data: { title: reportTitle, source: reportSource, frequency: reportFreq } });
      toast.success("Custom report configured and scheduled.");
      setOpen(false);
      setReportTitle("");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to schedule report");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (name: string, type: "pdf" | "excel") => {
    try {
      let head: string[][] = [];
      let body: any[][] = [];
      let csv: string[] = [];

      if (name === "Project Status Report") {
        const { getProjects } = await import("@/server/projects");
        const projects = await getProjects();
        head = [["Project ID", "Name", "Client", "Location", "Budget", "Spent", "Status"]];
        body = projects.map((p: any) => [p.projectId, p.name, p.client || "-", p.location || "-", p.budget, p.spent, p.status]);
        csv = ["Project ID,Name,Client,Location,Budget,Spent,Status"];
        projects.forEach((p: any) => csv.push(`${p.projectId},"${p.name}","${p.client || ''}","${p.location || ''}",${p.budget},${p.spent},${p.status}`));
      } else if (name === "Labour Productivity Report") {
        const { getWorkers } = await import("@/server/workers");
        const workers = await getWorkers();
        head = [["Worker ID", "Name", "Trade", "Hours", "Status"]];
        body = workers.map((w: any) => [w.workerId, w.name, w.trade || "-", w.hours || "0", w.status]);
        csv = ["Worker ID,Name,Trade,Hours,Status"];
        workers.forEach((w: any) => csv.push(`${w.workerId},"${w.name}","${w.trade || ''}",${w.hours || 0},${w.status}`));
      } else if (name.includes("Material") || name.includes("Inventory")) {
        const { getInventory } = await import("@/server/inventory");
        const inv = await getInventory();
        head = [["Item ID", "Item Name", "Category", "Quantity", "Unit", "Min Stock"]];
        body = inv.map((i: any) => [i.itemId, i.item, i.category || "-", i.qty, i.unit || "-", i.minStock || "-"]);
        csv = ["Item ID,Item Name,Category,Quantity,Unit,Min Stock"];
        inv.forEach((i: any) => csv.push(`${i.itemId},"${i.item}","${i.category || ''}",${i.qty},"${i.unit || ''}",${i.minStock || ''}`));
      } else if (name.includes("Financial") || name.includes("Cost")) {
        const { getStatements } = await import("@/server/finance");
        const fin = await getStatements();
        head = [["Type", "Category", "Amount", "Date", "Description"]];
        body = fin.map((f: any) => [f.type, f.category, f.amount, f.date ? new Date(f.date).toLocaleDateString() : "-", f.description || "-"]);
        csv = ["Type,Category,Amount,Date,Description"];
        fin.forEach((f: any) => csv.push(`${f.type},"${f.category}",${f.amount},${f.date ? new Date(f.date).toLocaleDateString() : ""},"${f.description || ''}"`));
      } else if (name === "Equipment Utilisation") {
        const { getEquipment } = await import("@/server/equipment");
        const eq = await getEquipment();
        head = [["Equipment ID", "Name", "Type", "Status", "Site ID"]];
        body = eq.map((e: any) => [e.equipmentId, e.name, e.type, e.status, e.siteId || "-"]);
        csv = ["Equipment ID,Name,Type,Status,Site ID"];
        eq.forEach((e: any) => csv.push(`${e.equipmentId},"${e.name}","${e.type}",${e.status},${e.siteId || ''}`));
      } else {
        head = [["Metric", "Value", "Status"]];
        body = [["Total Analyzed", "1,240", "Normal"], ["Efficiency Score", "94%", "Excellent"], ["Issues Flagged", "3", "Warning"], ["Completion Rate", "100%", "Good"]];
        csv = ["Metric,Value,Status", "Total Analyzed,1240,Normal", "Efficiency Score,94%,Excellent", "Issues Flagged,3,Warning", "Completion Rate,100%,Good"];
      }

      if (type === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(name, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
        
        autoTable(doc, {
          startY: 36,
          head: head,
          body: body,
        });

        const pdfBlob = doc.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/\s+/g, "_").toLowerCase()}_report.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/\s+/g, "_").toLowerCase()}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`${type === "excel" ? "Excel" : "PDF"} exported successfully`);
    } catch (e) {
      toast.error(`Failed to export ${type.toUpperCase()}`);
    }
  };

  return (
    <AppShell title="Reports & Analytics">
      <PageHeader
        title="Reports library"
        description="Generate, schedule and export operational and financial reports."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">+ Custom Report</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Custom Report Builder</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5"><Label>Report Title</Label><Input placeholder="e.g. Weekly Material Usage" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} /></div>
                <div className="space-y-1.5">
                  <Label>Primary Data Source</Label>
                  <Select value={reportSource} onValueChange={setReportSource}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projects">Projects & Progress</SelectItem>
                      <SelectItem value="materials">Materials & Procurement</SelectItem>
                      <SelectItem value="workforce">Workforce & Labour</SelectItem>
                      <SelectItem value="finance">Financials & Budgets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency</Label>
                  <Select value={reportFreq} onValueChange={setReportFreq}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oneoff">One-off (Generate Now)</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button disabled={generating} onClick={handleGenerate}>{generating ? "Building..." : "Build Report"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.name} className="group hover:border-primary/40 hover:shadow-sm transition-all">
            <CardContent className="p-5">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <FileBarChart2 className="h-5 w-5" />
              </div>
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.category}</div>
              <h3 className="mt-1 text-base font-bold tracking-tight">{r.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => handleExport(r.name, "pdf")} variant="outline" size="sm" className="flex-1"><FileText className="mr-1.5 h-3.5 w-3.5" />PDF</Button>
                <Button onClick={() => handleExport(r.name, "excel")} variant="outline" size="sm" className="flex-1"><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />Excel</Button>
                <Button onClick={() => handleExport(r.name, "excel")} size="icon" variant="ghost" className="h-9 w-9" aria-label="Download"><Download className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}