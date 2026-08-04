import { createFileRoute } from "@tanstack/react-router";
import { Search, Download } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAuditLogs } from "@/server/audit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Logs · Naushik Admin" }] }),
  loader: async () => {
    const auditLogs = await getAuditLogs();
    return { auditLogs };
  },
  component: AdminAudit,
});

function AdminAudit() {
  const loaderData = Route.useLoaderData();
  const auditLogs = Array.isArray(loaderData.auditLogs) ? loaderData.auditLogs : [];

  function exportPdf() {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("System Audit Trail", 14, 14);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 20);
    autoTable(doc, {
      startY: 26,
      head: [["When", "User", "Action", "Entity", "From", "To"]],
      body: auditLogs.map((a) => [new Date(a.date).toLocaleString(), a.user, a.action, a.entity, (a as any).from ?? "—", (a as any).to ?? "—"]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save(`audit-log-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
  return (
    <AppShell title="Audit Logs">
      <PageHeader
        title="System audit trail"
        description="Every action, by every user, with before/after values — for compliance and forensics."
        actions={<Button variant="outline" size="sm" onClick={exportPdf}><Download className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>}
      />

      <Card>
        <div className="flex gap-2 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by user, action, entity…" className="h-9 pl-8" />
          </div>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">When</th>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Entity</th>
                <th className="px-4 py-3 text-left font-semibold">From</th>
                <th className="px-4 py-3 text-left font-semibold">To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">{new Date(a.date).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold">{a.user}</td>
                  <td className="px-4 py-3">{a.action}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.entity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{(a as any).from ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{(a as any).to ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-border md:hidden">
          {auditLogs.map((a) => (
            <div key={a.id} className="p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{a.user}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{new Date(a.date).toLocaleString()}</span>
              </div>
              <div className="mt-1">{a.action} · <span className="font-mono text-xs">{a.entity}</span></div>
              {(a as any).from && <div className="mt-1 text-xs text-muted-foreground">{(a as any).from} → <span className="text-foreground">{(a as any).to}</span></div>}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}