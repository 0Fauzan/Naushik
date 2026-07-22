import { useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  useOnlineStatus, useQueueStats, processQueue, retryAction, deleteAction, clearSynced,
} from "@/lib/offline/queue";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const TYPE_LABEL: Record<string, string> = {
  "dpr.submit": "Daily report",
  "attendance.save": "Attendance",
  "material.request": "Material request",
};

export function SyncIndicator() {
  const online = useOnlineStatus();
  const { pending, syncing, failed, actions } = useQueueStats();
  const [open, setOpen] = useState(false);
  const queued = pending + syncing + failed;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1.5 px-2.5",
            !online && "border-warning/50 bg-warning/10 text-warning hover:bg-warning/15 hover:text-warning",
            online && queued === 0 && "border-success/40 bg-success/5 text-success hover:bg-success/10 hover:text-success",
            online && queued > 0 && "border-gold/50 bg-gold/10 text-gold-foreground hover:bg-gold/15",
          )}
          aria-label="Sync status"
        >
          {!online ? <WifiOff className="h-4 w-4" /> : syncing > 0 ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
          <span className="hidden text-xs font-semibold sm:inline">
            {!online ? "Offline" : syncing > 0 ? "Syncing" : queued > 0 ? `${queued} queued` : "Online"}
          </span>
          {queued > 0 && (
            <span className="ml-0.5 rounded-full bg-foreground/10 px-1.5 text-[10px] font-bold tabular-nums">{queued}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="text-sm font-bold">Sync queue</div>
            <div className="text-[11px] text-muted-foreground">
              {online ? "Connected" : "Offline — changes saved locally"}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5"
            disabled={!online || syncing > 0}
            onClick={() => void processQueue()}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", syncing > 0 && "animate-spin")} />
            Sync now
          </Button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</div>
            <div className="text-sm font-bold tabular-nums">{pending + syncing}</div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Failed</div>
            <div className={cn("text-sm font-bold tabular-nums", failed > 0 && "text-destructive")}>{failed}</div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Synced</div>
            <div className="text-sm font-bold tabular-nums text-success">{actions.filter(a => a.status === "synced").length}</div>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {actions.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No actions queued. Submissions made offline will appear here.
            </div>
          ) : (
            actions.map((a) => (
              <div key={a.id} className="flex items-start gap-2 border-b border-border/60 px-3 py-2.5 last:border-b-0">
                <div className="mt-0.5">
                  {a.status === "synced" && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {a.status === "syncing" && <RefreshCw className="h-4 w-4 animate-spin text-primary" />}
                  {a.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                  {a.status === "failed" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {TYPE_LABEL[a.type] ?? a.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">· {timeAgo(a.createdAt)}</span>
                  </div>
                  <div className="truncate text-xs font-medium">{a.label}</div>
                  {a.status === "failed" && a.lastError && (
                    <div className="mt-0.5 truncate text-[11px] text-destructive">{a.lastError} (attempt {a.attempts})</div>
                  )}
                </div>
                {a.status === "failed" && a.id != null && (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => void retryAction(a.id!)}>Retry</Button>
                )}
                {a.status === "synced" && a.id != null && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Remove" onClick={() => void deleteAction(a.id!)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {actions.some(a => a.status === "synced") && (
          <div className="border-t border-border px-3 py-2">
            <Button size="sm" variant="ghost" className="h-7 w-full text-[11px]" onClick={() => void clearSynced()}>
              Clear synced
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}