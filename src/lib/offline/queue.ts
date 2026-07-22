import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type ActionType, type QueuedAction } from "./db";

const MAX_ATTEMPTS = 5;

// Pluggable network call. With no backend wired yet, we simulate a POST.
// Replace this with a real fetch / server-fn call once the API exists.
async function performSync(action: QueuedAction): Promise<void> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
  // 10% simulated failure so the retry UX is visible in demos.
  if (Math.random() < 0.1) throw new Error("Network glitch — will retry");
}

let syncing = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function enqueueAction(
  type: ActionType,
  label: string,
  payload: Record<string, unknown>,
): Promise<number | null> {
  const db = getDB();
  if (!db) return null;
  const now = Date.now();
  const id = await db.actions.add({
    type,
    label,
    payload,
    status: "pending",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  });
  notify();
  // Fire-and-forget; will no-op gracefully if offline.
  void processQueue();
  return id as number;
}

export async function processQueue(): Promise<void> {
  const db = getDB();
  if (!db) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  if (syncing) return;
  syncing = true;
  try {
    while (true) {
      const next = await db.actions
        .where("status")
        .anyOf("pending", "failed")
        .first();
      if (!next || next.id == null) break;
      if (next.attempts >= MAX_ATTEMPTS) {
        // Stop retrying; leave as failed for manual action.
        await db.actions.update(next.id, { status: "failed", updatedAt: Date.now() });
        break;
      }
      await db.actions.update(next.id, { status: "syncing", updatedAt: Date.now() });
      notify();
      try {
        await performSync(next);
        await db.actions.update(next.id, {
          status: "synced",
          updatedAt: Date.now(),
          syncedAt: Date.now(),
          lastError: undefined,
        });
      } catch (err) {
        await db.actions.update(next.id, {
          status: "failed",
          attempts: next.attempts + 1,
          lastError: err instanceof Error ? err.message : String(err),
          updatedAt: Date.now(),
        });
      }
      notify();
    }
  } finally {
    syncing = false;
    notify();
  }
}

export async function retryAction(id: number) {
  const db = getDB();
  if (!db) return;
  await db.actions.update(id, { status: "pending", attempts: 0, lastError: undefined, updatedAt: Date.now() });
  notify();
  void processQueue();
}

export async function deleteAction(id: number) {
  const db = getDB();
  if (!db) return;
  await db.actions.delete(id);
  notify();
}

export async function clearSynced() {
  const db = getDB();
  if (!db) return;
  await db.actions.where("status").equals("synced").delete();
  notify();
}

export function useOnlineStatus(): boolean {
  // Always start as `true` so SSR and the client's first render match.
  // The effect below updates to the real value after hydration.
  const [online, setOnline] = useState(true);
  useEffect(() => {
    if (typeof navigator !== "undefined") setOnline(navigator.onLine);
    const up = () => {
      setOnline(true);
      void processQueue();
    };
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

export function useQueuedActions(): QueuedAction[] {
  const rows = useLiveQuery(async () => {
    const db = getDB();
    if (!db) return [];
    return db.actions.orderBy("createdAt").reverse().toArray();
  }, [], [] as QueuedAction[]);
  return rows ?? [];
}

export function useQueueStats() {
  const actions = useQueuedActions();
  return {
    total: actions.length,
    pending: actions.filter((a) => a.status === "pending").length,
    syncing: actions.filter((a) => a.status === "syncing").length,
    synced: actions.filter((a) => a.status === "synced").length,
    failed: actions.filter((a) => a.status === "failed").length,
    actions,
  };
}

// Kick off a sync when the app loads (covers actions left over from a previous session).
if (typeof window !== "undefined") {
  setTimeout(() => { void processQueue(); }, 500);
}