import { Router, type IRouter } from "express";
import { VirtualCard } from "@workspace/db";
import { GenerateVirtualCardBody, DeactivateVirtualCardParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function vcToJson(vc: any) {
  return {
    id: String(vc._id),
    userId: Number(vc.userId),
    cardNumber: vc.cardNumber,
    last4: vc.last4,
    brand: vc.brand,
    cvv: vc.cvv,
    expiryMonth: vc.expiryMonth,
    expiryYear: vc.expiryYear,
    isActive: vc.isActive,
    usageLimit: vc.usageLimit,
    timesUsed: vc.timesUsed,
    note: vc.note ?? null,
    createdAt: vc.createdAt.toISOString(),
    expiresAt: vc.expiresAt ? vc.expiresAt.toISOString() : null,
  };
}

function generateCardNumber(): string {
  const prefix = "4";
  const digits = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
  return prefix + digits;
}

function generateCvv(): string {
  return String(Math.floor(Math.random() * 900) + 100);
}

router.get("/virtual-cards", requireAuth, async (req, res): Promise<void> => {
  const cards = await VirtualCard.find({ userId: req.auth!.userId });
  res.json(cards.map(vcToJson));
});

router.post("/virtual-cards/generate", requireAuth, async (req, res): Promise<void> => {
  const parsed = GenerateVirtualCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { usageLimit = 1, note, validHours = 24 } = parsed.data;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + (validHours ?? 24) * 60 * 60 * 1000);

  const cardNumber = generateCardNumber();
  const last4 = cardNumber.slice(-4);
  const cvv = generateCvv();
  const expiryMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
  const expiryYear = expiryMonth === 1 ? now.getFullYear() + 1 : now.getFullYear();

  const vc = await VirtualCard.create({
    userId: req.auth!.userId,
    cardNumber,
    last4,
    brand: "visa",
    cvv,
    expiryMonth,
    expiryYear,
    isActive: true,
    usageLimit: usageLimit ?? 1,
    timesUsed: 0,
    note: note ?? null,
    expiresAt,
  });

  res.status(201).json(vcToJson(vc));
});

router.patch("/virtual-cards/:id/deactivate", requireAuth, async (req, res): Promise<void> => {
  const vcId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const vc = await VirtualCard.findOne({ _id: vcId, userId: req.auth!.userId });

  if (!vc) {
    res.status(404).json({ error: "Virtual card not found" });
    return;
  }

  const updated = await VirtualCard.findByIdAndUpdate(vcId, { isActive: false }, { new: true });

  res.json(vcToJson(updated));
});

export default router;
