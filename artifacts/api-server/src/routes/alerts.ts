import { Router, type IRouter } from "express";
import { Alert } from "@workspace/db";
import { ListAlertsQueryParams, MarkAlertReadParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function alertToJson(a: any) {
  return {
    id: Number(a._id),
    userId: Number(a.userId),
    type: a.type,
    message: a.message,
    transactionId: a.transactionId ? Number(a.transactionId) : null,
    isRead: a.isRead,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/alerts", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListAlertsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { unreadOnly, limit } = parsed.data;

  const filter: any = { userId: req.auth!.userId };
  if (unreadOnly) filter.isRead = false;

  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(limit ?? 20);

  res.json(alerts.map(alertToJson));
});

router.patch("/alerts/:id/read", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = MarkAlertReadParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const alert = await Alert.findOne({ _id: params.data.id, userId: req.auth!.userId });
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }

  const updated = await Alert.findByIdAndUpdate(params.data.id, { isRead: true }, { new: true });

  res.json(alertToJson(updated));
});

export default router;
