import { Router, type IRouter } from "express";
import { FraudCase } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { auditLog } from "../lib/audit";

const router: IRouter = Router();

function caseToJson(c: any) {
  return {
    id: String(c._id),
    caseNumber: c.caseNumber,
    userId: Number(c.userId),
    transactionId: c.transactionId ? String(c.transactionId) : null,
    assignedTo: c.assignedTo ? String(c.assignedTo) : null,
    status: c.status,
    priority: c.priority,
    title: c.title,
    description: c.description ?? null,
    resolution: c.resolution ?? null,
    riskScore: c.riskScore ?? null,
    amountInvolved: c.amountInvolved ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    closedAt: c.closedAt?.toISOString() ?? null,
  };
}

router.get("/fraud-cases", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;

  const filter: any = {};
  if (req.auth!.role !== "admin") filter.userId = req.auth!.userId;
  if (status) filter.status = status;

  const [cases, total] = await Promise.all([
    FraudCase.find(filter).sort({ createdAt: -1 }).limit(limit).skip(offset),
    FraudCase.countDocuments(filter),
  ]);

  res.json({ cases: cases.map(caseToJson), total, page, limit });
});

router.get("/fraud-cases/:id", requireAuth, async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const filter: any = { _id: id };
  if (req.auth!.role !== "admin") filter.userId = req.auth!.userId;

  const fc = await FraudCase.findOne(filter);
  if (!fc) { res.status(404).json({ error: "Case not found" }); return; }
  res.json(caseToJson(fc));
});

router.patch("/fraud-cases/:id", requireAuth, async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const { status, priority, resolution, assignedTo } = req.body ?? {};

  const filter: any = { _id: id };
  if (req.auth!.role !== "admin") filter.userId = req.auth!.userId;

  const fc = await FraudCase.findOne(filter);
  if (!fc) { res.status(404).json({ error: "Case not found" }); return; }

  const updates: any = { updatedAt: new Date() };
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (resolution !== undefined) updates.resolution = resolution;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo;
  if (status === "closed" || status === "resolved") updates.closedAt = new Date();

  const updated = await FraudCase.findByIdAndUpdate(id, updates, { new: true });
  await auditLog({ req, action: "fraud_case_updated", resource: "fraud_case", resourceId: id, details: `status=${status}` });
  res.json(caseToJson(updated));
});

export default router;
