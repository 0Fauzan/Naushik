import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Check, X, Truck, MessageCircle, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { materialRequests, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/procurement")({
  head: () => ({ meta: [{ title: "Procurement · Naushik Admin" }] }),
  component: AdminProcurement,
});

function AdminProcurement() {
  const pending = materialRequests.filter(m => m.status === "pending");
  const approved = materialRequests.filter(m => m.status === "approved");
  const totalValue = materialRequests.reduce((s, m) => s + m.amount, 0);

  return (
    <AppShell title="Procurement">
      <PageHeader
        title="Material requests"
        description="Review, approve and track procurement requests from all sites."
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" />Create PO</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Pending Approval" value={String(pending.length)} icon={ShoppingCart} accent="warning" />
        <KpiCard label="Approved (week)" value={String(approved.length)} delta={12} icon={Check} accent="success" />
        <KpiCard label="In Transit" value="6" icon={Truck} accent="blue" />
        <KpiCard label="Request Value (MTD)" value={inr(totalValue)} delta={8} icon={ShoppingCart} accent="gold" />
      </div>

      <Card className="mt-6">
        <div className="border-b border-border p-4">
          <Tabs defaultValue="all" className="min-w-0 max-w-full">
            <TabsList className="flex w-full max-w-full overflow-x-auto sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending {pending.length > 0 && <span className="ml-1 rounded-full bg-warning/20 px-1.5 text-[10px] font-bold text-warning">{pending.length}</span>}</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Request</th>
                <th className="px-4 py-3 text-left font-semibold">Project / Requested by</th>
                <th className="px-4 py-3 text-left font-semibold">Qty</th>
                <th className="px-4 py-3 text-left font-semibold">Value</th>
                <th className="px-4 py-3 text-left font-semibold">Priority</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {materialRequests.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{m.item}</div>
                    <div className="text-xs text-muted-foreground">{m.id} · {m.date}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{m.project}</div>
                    <div className="text-xs text-muted-foreground">{m.requestedBy}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{m.qty} {m.unit}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{inr(m.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge value={m.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge value={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {m.status === "pending" && (
                        <>
                          <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Reject"><X className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" className="h-8 w-8" aria-label="Approve"><Check className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      <Button size="icon" variant="outline" className="h-8 w-8 border-success/40 text-success hover:bg-success/10 hover:text-success" aria-label="WhatsApp" asChild>
                        <a href="https://wa.me/919847012345" target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /></a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {materialRequests.map((m) => (
            <div key={m.id} className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.item}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.project} · {m.qty} {m.unit}</div>
                </div>
                <StatusBadge value={m.status} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusBadge value={m.priority} />
                <span className="text-sm font-bold tabular-nums">{inr(m.amount)}</span>
              </div>
              {m.status === "pending" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}