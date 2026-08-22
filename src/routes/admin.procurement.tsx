import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Check, X, Truck, MessageCircle, Plus, Trash } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { inr } from "@/lib/mock-data";
import { getMaterialRequests, createMaterialRequest, updateMaterialRequestStatus, deleteMaterialRequest } from "@/server/procurement";

export const Route = createFileRoute("/admin/procurement")({
  head: () => ({ meta: [{ title: "Procurement · Naushik Admin" }] }),
  loader: () => getMaterialRequests(),
  component: AdminProcurement,
});

function AdminProcurement() {
  const router = useRouter();
  const dbReqs = Route.useLoaderData();
  const allReqs = Array.isArray(dbReqs) ? dbReqs : [];

  const pending = allReqs.filter((m: any) => m.status === "pending");
  const approved = allReqs.filter((m: any) => m.status === "approved");
  const totalValue = allReqs.reduce((s: any, m: any) => s + (m.amount || 0), 0);

  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ item: "", project: "", qty: "", unit: "nos", amount: "" });

  const filteredReqs = filter === "all" ? allReqs : allReqs.filter((m: any) => m.status === filter);

  const handleCreate = async () => {
    if (!formData.item) return;
    setSubmitting(true);
    try {
      await createMaterialRequest({ data: { ...formData, qty: Number(formData.qty) || 0, amount: Number(formData.amount) || 0, requestedBy: "Admin" } });
      toast.success("PO created successfully");
      setOpen(false);
      setFormData({ item: "", project: "", qty: "", unit: "nos", amount: "" });
      router.invalidate();
    } catch (e) {
      toast.error("Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await updateMaterialRequestStatus({ data: { id, status } });
      toast.success(`Request ${status}`);
      router.invalidate();
    } catch(e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterialRequest({ data: id });
      toast.success("Request deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete request");
    }
  };

  return (
    <AppShell title="Procurement">
      <PageHeader
        title="Material requests"
        description="Review, approve and track procurement requests from all sites."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" />Create PO</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5"><Label>Item</Label><Input value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Project</Label><Input value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Unit</Label><Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                </div>
                <div className="space-y-1.5"><Label>Estimated Amount (₹)</Label><Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
              </div>
              <DialogFooter><Button disabled={submitting} onClick={handleCreate}>Save PO</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Pending Approval" value={String(pending.length)} hint="No data yet" icon={ShoppingCart} accent="warning" />
        <KpiCard label="Approved (week)" value={String(approved.length)} hint="No data yet" icon={Check} accent="success" />
        <KpiCard label="In Transit" value="0" hint="No data yet" icon={Truck} accent="blue" />
        <KpiCard label="Request Value (MTD)" value={inr(totalValue)} hint="No data yet" icon={ShoppingCart} accent="gold" />
      </div>

      <Card className="mt-6">
        <div className="border-b border-border p-4">
          <Tabs value={filter} onValueChange={setFilter} className="min-w-0 max-w-full">
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
              {filteredReqs.length > 0 ? (
                filteredReqs.map((m: any) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{m.item}</div>
                      <div className="text-xs text-muted-foreground">{m.id} · {m.date ? new Date(m.date).toLocaleDateString() : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{m.project}</div>
                      <div className="text-xs text-muted-foreground">{m.requestedBy}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{m.qty}{m.unit ? ` ${m.unit}` : ''}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{inr(m.amount || 0)}</td>
                    <td className="px-4 py-3"><StatusBadge value={m.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge value={m.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {m.status === "pending" && (
                          <>
                            <Button onClick={() => handleStatus(m.id, "rejected")} size="icon" variant="outline" className="h-8 w-8" aria-label="Reject"><X className="h-3.5 w-3.5" /></Button>
                            <Button onClick={() => handleStatus(m.id, "approved")} size="icon" className="h-8 w-8" aria-label="Approve"><Check className="h-3.5 w-3.5" /></Button>
                          </>
                        )}
                        <Button variant="outline" size="icon" className="h-8 w-8 border-success/40 text-success hover:bg-success/10 hover:text-success" aria-label="WhatsApp" asChild>
                          <a href={`https://wa.me/919999999999?text=Regarding%20procurement%20of%20${encodeURIComponent(m.item)}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /></a>
                        </Button>
                        <Button onClick={() => handleDelete(m.id)} variant="outline" size="icon" className="h-8 w-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No procurement requests found for this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {filteredReqs.length > 0 ? (
            filteredReqs.map((m: any) => (
              <div key={m.id} className="p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{m.item}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.project} · {m.qty}{m.unit ? ` ${m.unit}` : ''}</div>
                  </div>
                  <StatusBadge value={m.status} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge value={m.priority} />
                  <span className="text-sm font-bold tabular-nums">{inr(m.amount)}</span>
                </div>
                {m.status === "pending" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button onClick={() => handleStatus(m.id, "rejected")} size="sm" variant="outline">Reject</Button>
                    <Button onClick={() => handleStatus(m.id, "approved")} size="sm">Approve</Button>
                  </div>
                )}
                {m.status !== "pending" && (
                  <div className="mt-3 flex justify-end">
                    <Button onClick={() => handleDelete(m.id)} size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">Delete</Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No procurement requests found for this status.
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  );
}