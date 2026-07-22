import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  accent?: "blue" | "gold" | "success" | "warning" | "destructive";
}

const ACCENTS: Record<NonNullable<Props["accent"]>, string> = {
  blue: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function KpiCard({ label, value, delta, hint, icon: Icon, accent = "blue" }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="flex h-full flex-col p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-muted-foreground md:text-[11px] md:tracking-[0.12em]">{label}</div>
          <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md md:h-10 md:w-10", ACCENTS[accent])}>
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight md:text-[28px]">{value}</div>
        {hint && <div className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</div>}
        {typeof delta === "number" && (
          <div className={cn("mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold", positive ? "text-success" : "text-destructive")}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {positive ? "+" : ""}{delta}% vs last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}