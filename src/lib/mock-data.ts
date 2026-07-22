export type ProjectStatus = "active" | "delayed" | "on-hold" | "completed";
export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  status: ProjectStatus;
}

export const projects: Project[] = [];

export const kpiTrend = [];

export const expenseBreakdown = [];

export const workforceTrend = [];

export interface SiteManager { id: string; name: string; project: string; phone: string; experience: number; rating: number; status: "on-site" | "off-duty" | "leave"; }
export const siteManagers: SiteManager[] = [];

export interface MaterialRequest {
  id: string; project: string; item: string; qty: number; unit: string;
  requestedBy: string; date: string; priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "delivered";
  amount: number;
}
export const materialRequests: MaterialRequest[] = [];

export interface InventoryItem {
  id: string; name: string; category: string; location: string;
  stock: number; unit: string; minStock: number; rate: number;
}
export const inventory: InventoryItem[] = [];

export interface Dpr {
  id: string; date: string; project: string; workCompleted: string;
  progress: number; workers: number; issues: number; status: "draft" | "submitted" | "reviewed";
}
export const dprs: Dpr[] = [];

export interface Worker { id: string; name: string; trade: string; status: "present" | "absent" | "leave"; hours: number; }
export const workers: Worker[] = [];

export interface Equipment { id: string; name: string; project: string; status: "operational" | "maintenance" | "breakdown" | "idle"; utilisation: number; nextService: string; }
export const equipment: Equipment[] = [];

export interface Issue { id: string; project: string; type: "safety" | "quality" | "delay" | "risk"; title: string; priority: "low" | "medium" | "high" | "critical"; status: "open" | "in-progress" | "resolved"; raisedBy: string; date: string; }
export const issues: Issue[] = [];

export interface AuditLog { id: string; user: string; action: string; entity: string; date: string; from?: string; to?: string; }
export const auditLogs: AuditLog[] = [];

export interface SiteDocument { id: string; name: string; type: "Drawing" | "BOQ" | "Contract" | "Inspection" | "Approval"; project: string; size: string; uploaded: string; }
export const documents: SiteDocument[] = [];

export const inr = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${n.toLocaleString("en-IN")}`;