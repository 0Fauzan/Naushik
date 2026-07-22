import Dexie, { type Table } from "dexie";

export type ActionType = "dpr.submit" | "attendance.save" | "material.request";
export type ActionStatus = "pending" | "syncing" | "synced" | "failed";

export interface QueuedAction {
  id?: number;
  type: ActionType;
  payload: Record<string, unknown>;
  status: ActionStatus;
  attempts: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
  syncedAt?: number;
  label: string;
}

class OfflineDB extends Dexie {
  actions!: Table<QueuedAction, number>;
  constructor() {
    super("naushik-offline");
    this.version(1).stores({
      actions: "++id, type, status, createdAt",
    });
  }
}

let _db: OfflineDB | null = null;

export function getDB(): OfflineDB | null {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return null;
  if (!_db) _db = new OfflineDB();
  return _db;
}