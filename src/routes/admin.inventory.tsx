import { createFileRoute } from "@tanstack/react-router";
import { Boxes, AlertTriangle, ArrowLeftRight, TrendingDown, Plus, ArrowRightLeft, MoreVertical, Edit, Trash } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { inr } from "@/lib/mock-data";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, transferInventory } from "@/server/inventory";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory · Naushik Admin" }] }),
  loader: () => getInventory(),
  component: AdminInventory,
});

function AdminInventory() {
  const router = useRouter();
  const dbItems = Route.useLoaderData();
  const allItems = Array.isArray(dbItems) ? dbItems : [];

  const totalValue = allItems.reduce((s: any, i: any) => s + (i.value || 0), 0);
  const criticalItems = allItems.filter((i: any) => i.status === "critical").length;
  const inTransit = 0; // Replace when inTransit data is available

  const [open, setOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ item: "", category: "", project: "", qty: "", unit: "nos", value: "", minStock: "" });

  const [transferData, setTransferData] = useState({ sourceItemId: "", targetProject: "", qty: "" });
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!transferData.sourceItemId || !transferData.targetProject || !transferData.qty) {
      toast.error("Please fill all fields");
      return;
    }
    const sourceItem = allItems.find(i => i.itemId === transferData.sourceItemId);
    if (!sourceItem) {
      toast.error("Source Item ID not found");
      return;
    }
    setIsTransferring(true);
    try {
      await transferInventory({ data: { sourceId: sourceItem.id, targetProject: transferData.targetProject, qty: Number(transferData.qty) } });
      toast.success("Transfer initiated successfully");
      setIsTransferOpen(false);
      setTransferData({ sourceItemId: "", targetProject: "", qty: "" });
      router.invalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate transfer");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSave = async () => {
    if (!formData.item) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateInventoryItem({ data: { id: editingId, ...formData, qty: Number(formData.qty) || 0, value: Number(formData.value) || 0, minStock: Number(formData.minStock) || 0 } });
        toast.success("Item updated successfully");
      } else {
        await createInventoryItem({ data: { ...formData, qty: Number(formData.qty) || 0, value: Number(formData.value) || 0, minStock: Number(formData.minStock) || 0 } });
        toast.success("Item added successfully");
      }
      setOpen(false);
      setFormData({ item: "", category: "", project: "", qty: "", unit: "nos", value: "", minStock: "" });
      setEditingId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInventoryItem({ data: id });
      toast.success("Item deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete item");
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      item: item.item || item.name,
      category: item.category || "",
      project: item.project || item.location || "",
      qty: String(item.qty || item.stock || 0),
      unit: item.unit || "nos",
      value: String(item.value || 0),
      minStock: String(item.minStock || 0)
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ item: "", category: "", project: "", qty: "", unit: "nos", value: "", minStock: "" });
    setOpen(true);
  };

  return (
    <AppShell title="Inventory">
      <PageHeader
        title="Central & site inventory"
        description="Live stock across central warehouse and active sites."
        actions={
          <div className="flex flex-wrap gap-2">
            <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />Transfer</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Transfer Materials</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5">
                    <Label>Source Item</Label>
                    <Select value={transferData.sourceItemId} onValueChange={val => setTransferData({ ...transferData, sourceItemId: val })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {allItems.map((i: any) => (
                          <SelectItem key={i.itemId} value={i.itemId}>
                            {i.item} ({i.itemId}) - {i.qty} {i.unit} available
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target Project</Label>
                    <Input placeholder="Site A" value={transferData.targetProject} onChange={e => setTransferData({...transferData, targetProject: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Quantity to Transfer</Label>
                    <Input type="number" placeholder="0" value={transferData.qty} onChange={e => setTransferData({...transferData, qty: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={isTransferring} onClick={handleTransfer}>{isTransferring ? "Transferring..." : "Initiate Transfer"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setEditingId(null);
                setFormData({ item: "", category: "", project: "", qty: "", unit: "nos", value: "", minStock: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />New Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingId ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-1.5"><Label>Item Name</Label><Input value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Category</Label><Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label>Project / Location</Label><Input value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Unit</Label><Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Total Value (₹)</Label><Input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>Min Stock Alert</Label><Input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} /></div>
                  </div>
                </div>
                <DialogFooter><Button disabled={submitting} onClick={handleSave}>Save Item</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Items Tracked" value={String(allItems.length)} hint="No data yet" icon={Boxes} accent="blue" />
        <KpiCard label="Inventory Value" value={inr(totalValue)} hint="No data yet" icon={Boxes} accent="gold" />
        <KpiCard label="Low Stock Alerts" value={String(criticalItems)} hint="No data yet" icon={AlertTriangle} accent="warning" />
        <KpiCard label="Consumption (week)" value="₹0" hint="No data yet" icon={TrendingDown} accent="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Stock by item</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allItems.map((i: any) => {
                const stock = i.stock ?? i.qty;
                const minStock = i.minStock ?? 0;
                const pct = Math.min(100, Math.round((stock / (minStock * 2 || 10)) * 100));
                const low = stock < minStock;
                return (
                  <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{i.name || i.item}</span>
                        {low && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">LOW</span>}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{i.category} · {i.location || i.project}</div>
                      <div className="h-1.5 w-full bg-secondary mt-2 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{width: `${pct}%`}} /></div>
                    </div>
                    <div className="text-right flex items-center justify-end gap-2">
                      <div className="text-sm font-bold tabular-nums">{stock} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span></div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(i)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(i.id)} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Low stock alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {allItems.filter((i: any) => (i.stock ?? i.qty) < (i.minStock ?? 0)).map((i: any) => (
              <div key={i.id} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <div className="text-sm font-semibold">{i.name || i.item}</div>
                <div className="text-xs text-muted-foreground">{i.location || i.project}</div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-warning font-bold tabular-nums">{i.stock ?? i.qty} {i.unit}</span>
                  <span className="text-muted-foreground tabular-nums">min {i.minStock}</span>
                </div>
              </div>
            ))}
            {allItems.filter((i: any) => (i.stock ?? i.qty) < (i.minStock ?? 0)).length === 0 && <div className="text-sm text-muted-foreground">All items above threshold.</div>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}