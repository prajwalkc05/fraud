import mongoose, { Schema, Document } from "mongoose";

export interface ICard extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: Date;
}

const CardSchema = new Schema<ICard>({
  userId: { type: Schema.Types.ObjectId, required: true },
  last4: { type: String, required: true },
  brand: { type: String, required: true },
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  isBlocked: { type: Boolean, default: false },
  blockReason: String,
  createdAt: { type: Date, default: Date.now },
});

export const Card = mongoose.models.Card || mongoose.model<ICard>("Card", CardSchema);
