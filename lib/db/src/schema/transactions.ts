import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  amount: number;
  merchant: string;
  merchantCategory: string;
  cardId: mongoose.Types.ObjectId;
  cardLast4?: string;
  userId: mongoose.Types.ObjectId;
  status: string;
  riskScore: number;
  riskLevel: string;
  fraudProbability: number;
  location?: string;
  ipAddress?: string;
  deviceId?: string;
  reviewNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  amount: { type: Number, required: true },
  merchant: { type: String, required: true },
  merchantCategory: { type: String, required: true },
  cardId: { type: Schema.Types.ObjectId, required: true },
  cardLast4: String,
  userId: { type: Schema.Types.ObjectId, required: true },
  status: { type: String, default: "pending" },
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, default: "low" },
  fraudProbability: { type: Number, default: 0 },
  location: String,
  ipAddress: String,
  deviceId: String,
  reviewNote: String,
  reviewedBy: Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
