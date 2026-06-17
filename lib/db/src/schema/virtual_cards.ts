import mongoose, { Schema, Document } from "mongoose";

export interface IVirtualCard extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  cardNumber: string;
  last4: string;
  brand: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  isActive: boolean;
  usageLimit: number;
  timesUsed: number;
  note?: string;
  createdAt: Date;
  expiresAt?: Date;
}

const VirtualCardSchema = new Schema<IVirtualCard>({
  userId: { type: Schema.Types.ObjectId, required: true },
  cardNumber: { type: String, required: true },
  last4: { type: String, required: true },
  brand: { type: String, default: "visa" },
  cvv: { type: String, required: true },
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 1 },
  timesUsed: { type: Number, default: 0 },
  note: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

export const VirtualCard = mongoose.models.VirtualCard || mongoose.model<IVirtualCard>("VirtualCard", VirtualCardSchema);
