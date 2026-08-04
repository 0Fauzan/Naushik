import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Camera, Send, MessageCircle, Plus, MoreVertical, Edit, Trash } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";

import { enqueueAction } from "@/lib/offline/queue";
import { getDprs, createDpr, updateDpr, deleteDpr } from "@/server/dpr";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/site/dpr")({
  head: () => ({ meta: [{ title: "Daily Progress Reports · Naushik Site" }] }),
  loader: () => getDprs(),
  component: SiteDpr,
});

function SiteDpr() {
  const router = useRouter();
  const dbDprs = Route.useLoaderData();
  const allDprs = Array.isArray(dbDprs) ? dbDprs : [];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [progress, setProgress] = useState([42]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [workers, setWorkers] = useState(86);
  const [work, setWork] = useState("");
  const [delays, setDelays] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, url]);
      toast.success("Photo added to report");
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("dpr_draft", JSON.stringify({ work, progress: progress[0], delays, remarks }));
    toast.success("Draft saved to local storage");
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDpr({ data: { id: editingId, date, workers, workCompleted: work, delays, remarks, progress: progress[0], project: "Marina Bay Tower" } });
        toast.success("DPR updated successfully");
      } else {
        await createDpr({ data: { date, workers, workCompleted: work, delays, remarks, progress: progress[0], project: "Marina Bay Tower" } });
        toast.success("DPR submitted successfully");
      }
      setWork(""); setDelays(""); setRemarks("");
      setOpen(false);
      setEditingId(null);
      router.invalidate();
    } catch (e) {
      toast.error("Failed to save DPR");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDpr({ data: id });
      toast.success("DPR deleted");
      router.invalidate();
    } catch (e) {
      toast.error("Failed to delete DPR");
    }
  };

  const openEdit = (dpr: any) => {
    setEditingId(dpr.id);
    setDate(dpr.date);
    setWorkers(dpr.workers || 0);
    setWork(dpr.workCompleted || "");
    setDelays(dpr.delays || "");
    setRemarks(dpr.remarks || "");
    setProgress([dpr.progress || 0]);
    setOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split("T")[0]);
    setWorkers(86);
    setWork("");
    setDelays("");
    setRemarks("");
    setProgress([42]);
    setOpen(true);
  };

  return (
    <AppShell title="Daily Progress Report">
      <PageHeader
        title="DPR — Wednesday, 25 Jun 2026"
        description="Capture today's work, photos and any delays. Submit before 7:00 PM."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success" asChild>
            <a href="https://wa.me/919999999999?text=Daily%20Progress%20Report" target="_blank" rel="noreferrer" className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> Share summary</a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>New report</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workers">Workers on site</Label>
                <Input id="workers" type="number" value={workers} onChange={(e) => setWorkers(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="work">Work completed today</Label>
              <Textarea id="work" rows={4} value={work} onChange={(e) => setWork(e.target.value)} placeholder="e.g. L8 slab shuttering 70%, rebar tying east wing, MEP rough-in coordination on L6…" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Overall project progress</Label>
                <span className="text-sm font-bold tabular-nums">{progress[0]}%</span>
              </div>
              <Slider value={progress} onValueChange={setProgress} max={100} step={1} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="delays">Delays / blockers</Label>
                <Textarea id="delays" rows={3} value={delays} onChange={(e) => setDelays(e.target.value)} placeholder="None / describe…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Inspection notes, safety observations…" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Site photos</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-md border border-border bg-muted/40 relative overflow-hidden">
                    <img src={url} alt={`Site photo ${i + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
                {photos.length < 4 && (
                  <label className="cursor-pointer grid aspect-square place-items-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-5 w-5" /><span className="text-[11px] font-semibold">Add photo</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSaveDraft} variant="outline">Save draft</Button>
              <Button className="flex-1 sm:flex-none" disabled={submitting} onClick={submit}>
                <Send className="mr-1.5 h-4 w-4" />Submit DPR
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent DPRs</CardTitle>
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setEditingId(null);
                setWork(""); setDelays(""); setRemarks("");
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={openNew} variant="ghost" size="icon" className="h-8 w-8" aria-label="New"><Plus className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingId ? "Edit DPR" : "Submit New DPR"}</DialogTitle></DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Workers on site</Label><Input type="number" value={workers} onChange={(e) => setWorkers(Number(e.target.value))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Work completed today</Label><Textarea rows={4} value={work} onChange={(e) => setWork(e.target.value)} /></div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><Label>Overall project progress</Label><span className="text-sm font-bold">{progress[0]}%</span></div>
                    <Slider value={progress} onValueChange={setProgress} max={100} step={1} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5"><Label>Delays / blockers</Label><Textarea rows={3} value={delays} onChange={(e) => setDelays(e.target.value)} /></div>
                    <div className="space-y-1.5"><Label>Remarks</Label><Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={submitting} onClick={submit}>{editingId ? "Save Changes" : "Submit DPR"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {allDprs.map((d: any) => (
              <div key={d.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{d.dprId || d.id}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={d.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(d)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(d.id)} className="text-destructive focus:bg-destructive/10"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">{d.date}</div>
                <div className="mt-1.5 text-xs line-clamp-2">{d.workCompleted}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}