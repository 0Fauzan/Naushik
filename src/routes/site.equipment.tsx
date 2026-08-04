import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Activity, AlertOctagon, Plus, MoreVertical, Edit, Trash } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

import { getEquipment, updateEquipmentStatus, updateEquipment, deleteEquipment } from "@/server/equipment";

export const Route = createFileRoute("/site/equipment")({
  head: () => ({ meta: [{ title: "Equipment · Naushik Site" }] }),
  loader: () => getEquipment(),
  component: SiteEquipment,
});

function SiteEquipment() {
  const router = useRouter();
  const dbEquipment = Route.useLoaderData();
  const allEquipment = Array.isArray(dbEquipment) ? dbEquipment : [];
  const breakdown = allEquipment.filter((e: any) => e.status === "breakdown").length;

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eqId, setEqId] = useState("");
  const [issue, setIssue] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ equipmentId: "", name: "", project: "", utilisation: "0", status: "operational", nextService: "" });

  const handleSaveEquipment = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateEquipment({ data: { id: editingId, ...formData, utilisation: Number(formData.utilisation) || 0 } });
        toast.success("Equipment updated successfully");
      }
      setEditOpen(false);
      setEditingId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to save equipment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEquipment = async (id: number) => {
    try {
      await deleteEquipment({ data: id });
      toast.success("Equipment deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete equipment");
    }
  };

  const openEdit = (e: any) => {
    setEditingId(e.id);
    setFormData({
      equipmentId: e.equipmentId || "",
      name: e.name || "",
      project: e.project || "",
      utilisation: String(e.utilisation || 0),
      status: e.status || "operational",
      nextService: e.nextService || ""
    });
    setEditOpen(true);
  };

  const submitMaintenance = async () => {
    if (!eqId) return;
    setSubmitting(true);
    try {
      // If it's a real DB item (numeric ID), we can update it
      const eqItem = allEquipment.find((e: any) => e.id === Number(eqId));
      if (eqItem && typeof eqItem.id === 'number') {
        await updateEquipmentStatus({ data: { id: eqItem.id, status: "breakdown" } });
      }
      toast.success("Maintenance request submitted");
      setOpen(false);
      setEqId(""); setIssue("");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Equipment">
      <PageHeader
        title="Equipment & plant"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" />Maintenance request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Maintenance</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label>Equipment</Label>
                  <Select value={eqId} onValueChange={setEqId}>
                    <SelectTrigger><SelectValue placeholder="Select equipment..." /></SelectTrigger>
                    <SelectContent>
                      {allEquipment.filter((e: any) => e.status === "operational").map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Issue Details</Label><Textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe the problem..." /></div>
              </div>
              <DialogFooter><Button disabled={submitting} onClick={submitMaintenance}>Submit</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        <KpiCard label="Total Units" value={String(allEquipment.length)} hint="No data yet" icon={Wrench} accent="blue" />
        <KpiCard label="Operational" value={String(allEquipment.filter((e: any) => e.status === "operational").length)} hint="No data yet" icon={Activity} accent="success" />
        <KpiCard label="Breakdown" value={String(breakdown)} hint="No data yet" icon={AlertOctagon} accent="destructive" />
        <KpiCard label="Avg. Utilisation" value="0%" hint="No data yet" icon={Activity} accent="gold" />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Equipment list</CardTitle>
          <Dialog open={editOpen} onOpenChange={(val) => {
            setEditOpen(val);
            if (!val) setEditingId(null);
          }}>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Equipment</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5"><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Project</Label><Input value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Utilisation (%)</Label><Input type="number" value={formData.utilisation} onChange={e => setFormData({...formData, utilisation: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>Next Service</Label><Input type="date" value={formData.nextService} onChange={e => setFormData({...formData, nextService: e.target.value})} /></div>
              </div>
              <DialogFooter><Button disabled={submitting} onClick={handleSaveEquipment}>Save Changes</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {allEquipment.map((e: any) => (
            <div key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-md border border-border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{e.name}</span>
                  <StatusBadge value={e.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto -mt-1"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(e)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteEquipment(e.id)} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-xs text-muted-foreground">{e.equipmentId || e.id} · {e.project} · next service {e.nextService}</div>
                <Progress value={e.utilisation} className="mt-2 h-1.5" />
              </div>
              <div className="text-right text-sm font-bold tabular-nums">{e.utilisation}%</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}