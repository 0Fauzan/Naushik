import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2, FileText, FileSpreadsheet, Download } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <AppShell title="Reports & Analytics">
      <PageHeader
        title="Reports library"
        description="Generate, schedule and export operational and financial reports."
        actions={<Button size="sm">+ Custom Report</Button>}
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
                <Button variant="outline" size="sm" className="flex-1"><FileText className="mr-1.5 h-3.5 w-3.5" />PDF</Button>
                <Button variant="outline" size="sm" className="flex-1"><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />Excel</Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Download"><Download className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}