import { Router, type IRouter } from "express";
import { Transaction, Card, Alert } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/live-feed", requireAuth, async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  const since = req.query.since ? new Date(String(req.query.since)) : null;

  const userId = req.auth!.role === "admin" ? undefined : req.auth!.userId;

  const filter: any = {};
  if (userId) filter.userId = userId;
  if (since) filter.createdAt = { $gte: since };

  const events = await Transaction.find(filter).sort({ createdAt: -1 }).limit(limit);

  res.json({
    events: events.map((tx) => ({
      id: Number(tx._id),
      type: tx.status === "declined" ? "fraud_detected" : tx.status === "flagged" ? "high_risk" : "transaction",
      amount: tx.amount,
      merchant: tx.merchant,
      merchantCategory: tx.merchantCategory,
      riskLevel: tx.riskLevel,
      riskScore: tx.riskScore,
      fraudProbability: tx.fraudProbability,
      status: tx.status,
      cardLast4: tx.cardLast4 ?? null,
      location: tx.location ?? null,
      createdAt: tx.createdAt.toISOString(),
    })),
    serverTime: new Date().toISOString(),
  });
});

router.get("/command-center/stats", requireAuth, async (req, res): Promise<void> => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    fraudLast24h,
    totalToday,
    blockedCards,
    activeAlerts,
    autoBlocked,
  ] = await Promise.all([
    Transaction.countDocuments({
      status: { $in: ["declined", "flagged"] },
      createdAt: { $gte: last24h }
    }),
    Transaction.countDocuments({ createdAt: { $gte: today } }),
    Card.countDocuments({ isBlocked: true }),
    Alert.countDocuments({ isRead: false }),
    Transaction.countDocuments({
      status: "declined",
      createdAt: { $gte: last24h }
    }),
  ]);

  let threatLevel = "LOW";
  if (fraudLast24h > 10) threatLevel = "CRITICAL";
  else if (fraudLast24h > 5) threatLevel = "HIGH";
  else if (fraudLast24h > 2) threatLevel = "MEDIUM";

  res.json({
    fraudLast24h,
    blockedCards,
    activeAlerts,
    totalToday,
    threatLevel,
    autoBlocked,
  });
});

export default router;
