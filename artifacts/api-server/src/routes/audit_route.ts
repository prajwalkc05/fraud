import { Router, type IRouter } from "express";
import { AuditLog } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/audit-logs", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const offset = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).limit(limit).skip(offset),
    AuditLog.countDocuments(),
  ]);

  res.json({
    logs: logs.map((l) => ({
      id: Number(l._id),
      userId: l.userId ? Number(l.userId) : null,
      action: l.action,
      resource: l.resource,
      resourceId: l.resourceId,
      details: l.details,
      ipAddress: l.ipAddress,
      userAgent: l.userAgent,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
  });
});

export default router;
