import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Camera, Send, MessageCircle, Plus } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { dprs } from "@/lib/mock-data";
import { enqueueAction } from "@/lib/offline/queue";

export const Route = createFileRoute("/site/dpr")({
  head: () => ({ meta: [{ title: "Daily Progress Reports · Naushik Site" }] }),
  component: SiteDpr,
});

function SiteDpr() {
  const [progress, setProgress] = useState([42]);
  const [date, setDate] = useState("2026-06-25");
  const [workers, setWorkers] = useState(86);
  const [work, setWork] = useState("");
  const [delays, setDelays] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    await enqueueAction("dpr.submit", `DPR for ${date} · ${progress[0]}%`, {
      date, workers, work, delays, remarks, progress: progress[0],
    });
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    toast.success(online ? "DPR submitted — syncing" : "Saved offline — will sync when online", {
      description: `Report for ${date} queued.`,
    });
    setWork(""); setDelays(""); setRemarks("");
    setSubmitting(false);
  };

  return (
    <AppShell title="Daily Progress Report">
      <PageHeader
        title="DPR — Wednesday, 25 Jun 2026"
        description="Capture today's work, photos and any delays. Submit before 7:00 PM."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 border-success/40 text-success hover:bg-success/10 hover:text-success" asChild>
            <a href="https://wa.me/919847012345" target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /> Share summary</a>
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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-md border border-border bg-muted/40" />
                ))}
                <button className="grid aspect-square place-items-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary">
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="h-5 w-5" /><span className="text-[11px] font-semibold">Add photo</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline">Save draft</Button>
              <Button className="flex-1 sm:flex-none" disabled={submitting} onClick={submit}>
                <Send className="mr-1.5 h-4 w-4" />Submit DPR
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent DPRs</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="New"><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {dprs.map((d) => (
              <div key={d.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{d.id}</span>
                  <StatusBadge value={d.status} />
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