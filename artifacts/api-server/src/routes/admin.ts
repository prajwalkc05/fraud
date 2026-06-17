import { Router, type IRouter } from "express";
import { User, Card, Transaction, FraudLog } from "@workspace/db";
import {
  AdminListUsersQueryParams,
  AdminUpdateUserParams,
  AdminUpdateUserBody,
  ListFraudLogsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page, limit, search } = parsed.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const filter: any = search ? { email: { $regex: search, $options: "i" } } : {};

  const [rows, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).limit(limit ?? 20).skip(offset),
    User.countDocuments(filter),
  ]);

  res.json({
    users: rows.map((u) => ({
      id: Number(u._id),
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
    })),
    total,
    page: page ?? 1,
    limit: limit ?? 20,
  });
});

router.patch("/admin/users/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AdminUpdateUserParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AdminUpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const user = await User.findById(params.data.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const updates: any = {};
  if (body.data.role) updates.role = body.data.role;
  if (body.data.status) updates.status = body.data.status;

  const updated = await User.findByIdAndUpdate(params.data.id, updates, { new: true });

  res.json({
    id: Number(updated!._id),
    email: updated!.email,
    name: updated!.name,
    role: updated!.role,
    status: updated!.status,
    createdAt: updated!.createdAt.toISOString(),
  });
});

router.get("/admin/stats", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [
    totalUsers,
    totalCards,
    totalTransactions,
    fraudToday,
  ] = await Promise.all([
    User.countDocuments(),
    Card.countDocuments(),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: "declined" }),
  ]);

  res.json({
    totalUsers,
    totalCards,
    totalTransactions,
    fraudDetectedToday: fraudToday,
    systemUptime: "99.97%",
    mlModelAccuracy: 94.3,
  });
});

router.get("/admin/fraud-logs", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListFraudLogsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page, limit } = parsed.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const [rows, total] = await Promise.all([
    FraudLog.find().sort({ createdAt: -1 }).limit(limit ?? 20).skip(offset),
    FraudLog.countDocuments(),
  ]);

  res.json({
    logs: rows.map((l) => ({
      id: Number(l._id),
      transactionId: Number(l.transactionId),
      riskScore: l.riskScore,
      riskLevel: l.riskLevel,
      fraudProbability: l.fraudProbability,
      signals: l.signals,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page: page ?? 1,
    limit: limit ?? 20,
  });
});

export default router;
