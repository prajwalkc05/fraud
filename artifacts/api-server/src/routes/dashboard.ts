import { Router, type IRouter } from "express";
import { Transaction, Card, Alert } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.auth!.role === "admin" ? undefined : req.auth!.userId;

  const txFilter: any = userId ? { userId } : {};
  const cardFilter: any = userId ? { userId } : {};
  const alertFilter: any = userId ? { userId, isRead: false } : { isRead: false };

  const [
    total,
    flagged,
    declined,
    totalAmountDocs,
    avgRiskDocs,
    blockedCards,
    activeAlerts,
  ] = await Promise.all([
    Transaction.countDocuments(txFilter),
    Transaction.countDocuments({ ...txFilter, status: "flagged" }),
    Transaction.countDocuments({ ...txFilter, status: "declined" }),
    Transaction.aggregate([{ $match: txFilter }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Transaction.aggregate([{ $match: txFilter }, { $group: { _id: null, avg: { $avg: "$riskScore" } } }]),
    Card.countDocuments({ ...cardFilter, isBlocked: true }),
    Alert.countDocuments(alertFilter),
  ]);

  const totalAmount = totalAmountDocs[0]?.total ?? 0;
  const avgRisk = avgRiskDocs[0]?.avg ?? 0;

  res.json({
    totalTransactions: total,
    totalFlagged: flagged,
    totalDeclined: declined,
    fraudRate: total > 0 ? Math.round(((flagged + declined) / total) * 10000) / 100 : 0,
    totalAmount: Number(totalAmount),
    blockedCards,
    activeAlerts,
    avgRiskScore: Math.round(Number(avgRisk) * 10) / 10,
  });
});

router.get("/dashboard/fraud-trend", requireAuth, async (req, res): Promise<void> => {
  const userId = req.auth!.role === "admin" ? undefined : req.auth!.userId;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filter: any = { createdAt: { $gte: thirtyDaysAgo } };
  if (userId) filter.userId = userId;

  const rows = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        flagged: {
          $sum: { $cond: [{ $in: ["$status", ["flagged", "declined"]] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
        },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(
    rows.map((r) => ({
      date: r._id,
      total: r.total,
      flagged: r.flagged,
      approved: r.approved,
    }))
  );
});

router.get("/dashboard/risk-breakdown", requireAuth, async (req, res): Promise<void> => {
  const userId = req.auth!.role === "admin" ? undefined : req.auth!.userId;
  const filter: any = userId ? { userId } : {};

  const rows = await Transaction.aggregate([
    { $match: filter },
    { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
  ]);

  const total = rows.reduce((s, r) => s + r.count, 0);

  const levels = ["low", "medium", "high", "critical"];
  const result = levels.map((level) => {
    const row = rows.find((r) => r._id === level);
    const cnt = row ? row.count : 0;
    return {
      level,
      count: cnt,
      percentage: total > 0 ? Math.round((cnt / total) * 1000) / 10 : 0,
    };
  });

  res.json(result);
});

router.get("/dashboard/recent-fraud", requireAuth, async (req, res): Promise<void> => {
  const userId = req.auth!.role === "admin" ? undefined : req.auth!.userId;

  const filter: any = { riskLevel: { $in: ["high", "critical"] } };
  if (userId) filter.userId = userId;

  const rows = await Transaction.find(filter).sort({ createdAt: -1 }).limit(10);

  res.json(
    rows.map((tx) => ({
      id: Number(tx._id),
      amount: tx.amount,
      merchant: tx.merchant,
      merchantCategory: tx.merchantCategory,
      cardId: Number(tx.cardId),
      cardLast4: tx.cardLast4 ?? undefined,
      userId: Number(tx.userId),
      status: tx.status,
      riskScore: tx.riskScore,
      riskLevel: tx.riskLevel,
      fraudProbability: tx.fraudProbability,
      location: tx.location ?? undefined,
      ipAddress: tx.ipAddress ?? undefined,
      deviceId: tx.deviceId ?? undefined,
      reviewNote: tx.reviewNote ?? null,
      reviewedBy: tx.reviewedBy ? Number(tx.reviewedBy) : null,
      createdAt: tx.createdAt.toISOString(),
    }))
  );
});

export default router;
