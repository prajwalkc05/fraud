import { Router, type IRouter } from "express";
import { Transaction, Card, Alert, FraudLog, User, FraudCase } from "@workspace/db";
import {
  ListTransactionsQueryParams,
  CreateTransactionBody,
  GetTransactionParams,
  ReviewTransactionParams,
  ReviewTransactionBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { analyzeFraud } from "../lib/fraud-engine";
import { sendFraudAlert } from "../lib/email";
import { auditLog } from "../lib/audit";
import { createNotification } from "../lib/notifications";
import { broadcast } from "../lib/websocket";

const router: IRouter = Router();

function txToJson(tx: any) {
  return {
    id: Number(tx._id),
    amount: tx.amount,
    merchant: tx.merchant,
    merchantCategory: tx.merchantCategory,
    cardId: String(tx.cardId),
    cardLast4: tx.cardLast4 ?? null,
    userId: Number(tx.userId),
    status: tx.status,
    riskScore: tx.riskScore,
    riskLevel: tx.riskLevel,
    fraudProbability: tx.fraudProbability,
    location: tx.location ?? null,
    ipAddress: tx.ipAddress ?? null,
    deviceId: tx.deviceId ?? null,
    reviewNote: tx.reviewNote ?? null,
    reviewedBy: tx.reviewedBy ? Number(tx.reviewedBy) : null,
    createdAt: tx.createdAt.toISOString(),
  };
}

router.get("/transactions", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page, limit, status, riskLevel, cardId, search } = parsed.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const filter: any = {};
  if (req.auth!.role !== "admin") {
    filter.userId = req.auth!.userId;
  }
  if (status) filter.status = status;
  if (riskLevel) filter.riskLevel = riskLevel;
  if (cardId) filter.cardId = cardId;
  if (search) {
    filter.$or = [
      { merchant: { $regex: search, $options: "i" } },
      { merchantCategory: { $regex: search, $options: "i" } }
    ];
  }

  const [rows, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).limit(limit ?? 20).skip(offset),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    transactions: rows.map(txToJson),
    total,
    page: page ?? 1,
    limit: limit ?? 20,
  });
});

router.post("/transactions", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const card = await Card.findById(data.cardId);
  if (!card || card.userId.toString() !== req.auth!.userId.toString()) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  if (card.isBlocked) {
    res.status(400).json({ error: "Card is blocked" });
    return;
  }

  const analysis = analyzeFraud({
    amount: data.amount,
    merchant: data.merchant,
    merchantCategory: data.merchantCategory,
    location: data.location,
    ipAddress: data.ipAddress,
    deviceId: data.deviceId,
  });

  let status: string;
  if (analysis.riskScore >= 81) {
    status = "declined";
  } else if (analysis.riskScore >= 61) {
    status = "flagged";
  } else {
    status = "approved";
  }

  const tx = await Transaction.create({
    amount: data.amount,
    merchant: data.merchant,
    merchantCategory: data.merchantCategory,
    cardId: data.cardId,
    cardLast4: card.last4,
    userId: req.auth!.userId,
    status,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    fraudProbability: analysis.fraudProbability,
    location: data.location,
    ipAddress: data.ipAddress,
    deviceId: data.deviceId,
  });

  await FraudLog.create({
    transactionId: tx._id,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    fraudProbability: analysis.fraudProbability,
    signals: analysis.signals,
  });

  broadcast(
    {
      type: "transaction",
      payload: { ...txToJson(tx), signals: analysis.signals },
      timestamp: new Date().toISOString(),
    },
    req.auth!.userId
  );

  if (analysis.riskScore >= 61) {
    const alertType = analysis.riskScore >= 81 ? "fraud_detected" : "high_risk";
    await Alert.create({
      userId: req.auth!.userId,
      type: alertType,
      message: `${status === "declined" ? "FRAUD DETECTED" : "High-risk transaction"}: $${data.amount.toFixed(2)} at ${data.merchant}`,
      transactionId: tx._id,
      isRead: false,
    });

    if (analysis.riskScore >= 81) {
      const caseNumber = `FG-${Date.now().toString(36).toUpperCase()}`;
      await FraudCase.create({
        caseNumber,
        userId: req.auth!.userId,
        transactionId: tx._id,
        status: "open",
        priority: "high",
        title: `Fraud Detected: $${data.amount.toFixed(2)} at ${data.merchant}`,
        description: `Automated fraud case. Risk score: ${analysis.riskScore}. Signals: ${analysis.signals.join("; ")}`,
        riskScore: analysis.riskScore,
        amountInvolved: data.amount,
      });

      await Card.findByIdAndUpdate(data.cardId, {
        isBlocked: true,
        blockReason: `Auto-blocked: Fraud detected on transaction #${tx._id}`
      });
    }

    void createNotification({
      userId: req.auth!.userId,
      type: alertType,
      title: status === "declined" ? "Fraud Detected — Card Blocked" : "High-Risk Transaction Flagged",
      message: `$${data.amount.toFixed(2)} at ${data.merchant} — Risk Score: ${analysis.riskScore}/100`,
      metadata: { transactionId: Number(tx._id), riskScore: analysis.riskScore },
    });

    const user = await User.findById(req.auth!.userId);
    if (user) {
      void sendFraudAlert({
        userName: user.name,
        userEmail: user.email,
        amount: data.amount,
        merchant: data.merchant,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        signals: analysis.signals,
        transactionId: Number(tx._id),
        cardLast4: card.last4,
      });
    }
  }

  await auditLog({ req, action: "transaction_created", resource: "transaction", resourceId: Number(tx._id) });

  res.status(201).json(txToJson(tx));
});

router.get("/transactions/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTransactionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const filter: any = { _id: params.data.id };
  if (req.auth!.role !== "admin") filter.userId = req.auth!.userId;

  const tx = await Transaction.findOne(filter);
  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

  const log = await FraudLog.findOne({ transactionId: tx._id });

  res.json({ ...txToJson(tx), signals: log?.signals ?? [] });
});

router.patch("/transactions/:id/review", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ReviewTransactionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = ReviewTransactionBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const tx = await Transaction.findById(params.data.id);
  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

  const updated = await Transaction.findByIdAndUpdate(
    params.data.id,
    { status: body.data.decision, reviewNote: body.data.note ?? null, reviewedBy: req.auth!.userId },
    { new: true }
  );

  await auditLog({ req, action: "transaction_reviewed", resource: "transaction", resourceId: Number(tx._id), details: body.data.decision });
  res.json(txToJson(updated));
});

export default router;
