import { Router, type IRouter } from "express";
import { LoginHistory } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function loginToJson(l: any) {
  return {
    id: Number(l._id),
    userId: Number(l.userId),
    ipAddress: l.ipAddress ?? null,
    userAgent: l.userAgent ?? null,
    deviceFingerprint: l.deviceFingerprint ?? null,
    deviceName: l.deviceName ?? null,
    location: l.location ?? null,
    isTrusted: l.isTrusted,
    loginAt: l.loginAt.toISOString(),
  };
}

router.get("/security/login-history", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const history = await LoginHistory.find({ userId: req.auth!.userId }).sort({ loginAt: -1 }).limit(limit);
  res.json(history.map(loginToJson));
});

router.get("/security/devices", requireAuth, async (req, res): Promise<void> => {
  const history = await LoginHistory.find({ userId: req.auth!.userId }).sort({ loginAt: -1 }).limit(50);

  const seen = new Set<string>();
  const devices = history.filter((h) => {
    const key = h.deviceFingerprint ?? h.userAgent ?? h._id.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  res.json(devices.map(loginToJson));
});

router.delete("/security/devices/:id/remove", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await LoginHistory.findByIdAndDelete(id);
  res.json({ message: "Device removed" });
});

export default router;
