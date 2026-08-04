import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";
import { sql } from "drizzle-orm";

export const getMetrics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { projects, materialRequests, workers, dprs } = await import("../db/schema");
    
    // Simple dynamic metrics generation
    const projectsList = await db.select().from(projects);
    const requests = await db.select().from(materialRequests);
    
    // 1. KPI Trend (Dummy generated based on month)
    const kpiTrend = [
      { month: "Jan", planned: 0, actual: 0 },
      { month: "Feb", planned: 0, actual: 0 },
      { month: "Mar", planned: 0, actual: 0 },
      { month: "Apr", planned: 0, actual: 0 },
      { month: "May", planned: 0, actual: 0 },
      { month: "Jun", planned: 0, actual: 0 },
    ];

    // 2. Expense Breakdown (Based on material requests + dummy labor/equipment)
    const materialValue = requests.reduce((sum, req) => sum + (req.amount || 0), 0);
    const expenseBreakdown = [
      { category: "Materials", amount: materialValue },
      { category: "Labor", amount: 0 },
      { category: "Equipment", amount: 0 },
      { category: "Subcontractors", amount: 0 },
      { category: "Misc", amount: 0 },
    ];

    // 3. Workforce Trend (Dummy generated)
    const workforceTrend = [
      { week: "W1", workers: 0 },
      { week: "W2", workers: 0 },
      { week: "W3", workers: 0 },
      { week: "W4", workers: 0 },
      { week: "W5", workers: 0 },
      { week: "W6", workers: 0 },
      { week: "W7", workers: 0 },
      { week: "W8", workers: 0 },
    ];

    return {
      kpiTrend,
      expenseBreakdown,
      workforceTrend
    };
  });
