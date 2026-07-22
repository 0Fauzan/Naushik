import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { materialRequests, inr } from "@/lib/mock-data";
import { enqueueAction } from "@/lib/offline/queue";

export const Route = createFileRoute("/site/materials")({
  head: () => ({ meta: [{ title: "Materials · Naushik Site" }] }),
  component: SiteMaterials,
});

function SiteMaterials() {
  const mine = materialRequests.filter(m => m.project === "Marina Bay Tower");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("bags");
  const [priority, setPriority] = useState("medium");
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!item.trim() || !qty) {
      toast.error("Material and quantity are required");
      return;
    }
    setSubmitting(true);
    await enqueueAction("material.request", `${item} · ${qty} ${unit}`, {
      item, qty: Number(qty), unit, priority, justification,
    });
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    toast.success(online ? "Request submitted — syncing" : "Saved offline — will sync when online");
    setItem(""); setQty(""); setJustification("");
    setSubmitting(false);
  };
  return (
    <AppShell title="Materials">
      <PageHeader title="Material requests" description="Request materials, track approvals and deliveries." />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>My requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mine.map((m) => (
              <div key={m.id} className="rounded-md border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{m.item}</span>
                      <StatusBadge value={m.priority} />
                    </div>
                    <div className="text-xs text-muted-foreground">{m.id} · {m.qty} {m.unit} · {m.date}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge value={m.status} />
                    <div className="mt-1 text-xs font-bold tabular-nums">{inr(m.amount)}</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">View</Button>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 border-success/40 px-2 text-xs text-success hover:bg-success/10 hover:text-success" asChild>
                    <a href="https://wa.me/919847012345" target="_blank" rel="noreferrer"><MessageCircle className="h-3 w-3" /> Update admin</a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>New request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Material</Label>
              <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. OPC 53 Grade Cement" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="cum">CuM</SelectItem>
                    <SelectItem value="nos">Nos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Justification</Label>
              <Textarea rows={3} value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Where it will be used, why required by date…" />
            </div>
            <Button className="w-full" disabled={submitting} onClick={submit}><Plus className="mr-1 h-4 w-4" />Submit request</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}