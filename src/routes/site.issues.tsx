import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, MessageCircle, AlertTriangle, MoreVertical, Edit, Trash } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";

import { getIssues, createIssue, updateIssue, deleteIssue } from "@/server/issues";

export const Route = createFileRoute("/site/issues")({
  head: () => ({ meta: [{ title: "Issues · Naushik Site" }] }),
  loader: () => getIssues(),
  component: SiteIssues,
});

function SiteIssues() {
  const router = useRouter();
  const dbIssues = Route.useLoaderData();
  const allIssues = Array.isArray(dbIssues) ? dbIssues : [];
  
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", type: "Safety", priority: "medium" });
  const [desc, setDesc] = useState("");

  const submit = async () => {
    if (!formData.title) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateIssue({ data: { id: editingId, ...formData } });
        toast.success("Issue updated successfully");
      } else {
        await createIssue({ data: { ...formData, raisedBy: "Site Engineer", status: "open" } });
        toast.success("Issue reported successfully");
      }
      setOpen(false);
      setFormData({ title: "", type: "Safety", priority: "medium" });
      setDesc("");
      setEditingId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to report issue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteIssue({ data: id });
      toast.success("Issue deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete issue");
    }
  };

  const openEdit = (issue: any) => {
    setEditingId(issue.id);
    setFormData({
      title: issue.title,
      type: issue.type || "Safety",
      priority: issue.priority || "medium"
    });
    setDesc("");
    setOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ title: "", type: "Safety", priority: "medium" });
    setDesc("");
    setOpen(true);
  };

  const openCount = allIssues.filter(i => i.status !== "resolved").length;
  
  return (
    <AppShell title="Issues & Safety">
      <PageHeader
        title="Site issues, safety & risk"
        description="Report incidents, track resolution and escalate when needed."
        actions={
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditingId(null);
              setFormData({ title: "", type: "Safety", priority: "medium" });
              setDesc("");
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openNew}><AlertTriangle className="mr-1.5 h-4 w-4" />Report issue</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Edit Issue" : "Report New Issue"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1.5"><Label>Issue Title</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Brief description" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Safety">Safety</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                        <SelectItem value="Delay">Delay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Details</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Provide more context..." /></div>
              </div>
              <DialogFooter><Button disabled={submitting} onClick={submit}>Submit</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        <KpiCard label="Open" value={String(openCount)} hint="No data yet" icon={AlertTriangle} accent="warning" />
        <KpiCard label="Critical" value={String(allIssues.filter(i => i.priority === "critical").length)} hint="No data yet" icon={AlertTriangle} accent="destructive" />
        <KpiCard label="Resolved (week)" value="0" hint="No data yet" icon={AlertTriangle} accent="success" />
        <KpiCard label="MTTR (days)" value="0" hint="No data yet" icon={AlertTriangle} accent="blue" />
      </div>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader><CardTitle>Issue log</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {allIssues.map((i: any) => (
              <div key={i.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2">
                  <div className="text-xs text-muted-foreground">{i.issueId || i.id} · Raised by {i.raisedBy} · {i.date ? new Date(i.date).toLocaleDateString() : ""}</div>
                  <StatusBadge value={i.priority} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(i)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(i.id)} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="font-medium text-sm">{i.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}