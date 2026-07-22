import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  active: "bg-success/10 text-success ring-success/20",
  delayed: "bg-destructive/10 text-destructive ring-destructive/20",
  "on-hold": "bg-muted text-muted-foreground ring-border",
  completed: "bg-primary/10 text-primary ring-primary/20",
  pending: "bg-warning/15 text-warning ring-warning/30",
  approved: "bg-success/10 text-success ring-success/20",
  rejected: "bg-destructive/10 text-destructive ring-destructive/20",
  delivered: "bg-primary/10 text-primary ring-primary/20",
  "in-progress": "bg-info/10 text-info ring-info/20",
  open: "bg-warning/15 text-warning ring-warning/30",
  resolved: "bg-success/10 text-success ring-success/20",
  operational: "bg-success/10 text-success ring-success/20",
  maintenance: "bg-warning/15 text-warning ring-warning/30",
  breakdown: "bg-destructive/10 text-destructive ring-destructive/20",
  idle: "bg-muted text-muted-foreground ring-border",
  present: "bg-success/10 text-success ring-success/20",
  absent: "bg-destructive/10 text-destructive ring-destructive/20",
  leave: "bg-warning/15 text-warning ring-warning/30",
  "on-site": "bg-success/10 text-success ring-success/20",
  "off-duty": "bg-muted text-muted-foreground ring-border",
  draft: "bg-muted text-muted-foreground ring-border",
  submitted: "bg-info/10 text-info ring-info/20",
  reviewed: "bg-success/10 text-success ring-success/20",
  low: "bg-muted text-muted-foreground ring-border",
  medium: "bg-info/10 text-info ring-info/20",
  high: "bg-warning/15 text-warning ring-warning/30",
  critical: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const key = value.toLowerCase();
  const cls = MAP[key] ?? "bg-muted text-muted-foreground ring-border";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset", cls, className)}>
      {value.replace("-", " ")}
    </span>
  );
}