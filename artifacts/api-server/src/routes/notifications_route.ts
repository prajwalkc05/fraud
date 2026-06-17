import { Router, type IRouter } from "express";
import { Notification } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function notifToJson(n: any) {
  return {
    id: Number(n._id),
    userId: Number(n.userId),
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    emailSent: n.emailSent,
    metadata: n.metadata ? JSON.parse(n.metadata) : null,
    createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const unreadOnly = req.query.unread === "true";
  const filter: any = { userId: req.auth!.userId };
  if (unreadOnly) filter.isRead = false;

  const [notifs, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ userId: req.auth!.userId }),
    Notification.countDocuments({ userId: req.auth!.userId, isRead: false }),
  ]);

  res.json({ notifications: notifs.map(notifToJson), total, unread });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const notif = await Notification.findOne({ _id: id, userId: req.auth!.userId });
  if (!notif) { res.status(404).json({ error: "Not found" }); return; }
  await Notification.findByIdAndUpdate(id, { isRead: true });
  res.json({ message: "Marked as read" });
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  await Notification.updateMany({ userId: req.auth!.userId }, { isRead: true });
  res.json({ message: "All notifications marked as read" });
});

export default router;
