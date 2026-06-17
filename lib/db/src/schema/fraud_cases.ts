import mongoose, { Schema, Document } from "mongoose";

export interface IFraudCase extends Document {
  _id: mongoose.Types.ObjectId;
  caseNumber: string;
  userId: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: string;
  priority: string;
  title: string;
  description?: string;
  resolution?: string;
  riskScore?: number;
  amountInvolved?: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

const FraudCaseSchema = new Schema<IFraudCase>({
  caseNumber: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  transactionId: Schema.Types.ObjectId,
  assignedTo: Schema.Types.ObjectId,
  status: { type: String, default: "open" },
  priority: { type: String, default: "medium" },
  title: { type: String, required: true },
  description: String,
  resolution: String,
  riskScore: Number,
  amountInvolved: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  closedAt: Date,
});

export const FraudCase = mongoose.models.FraudCase || mongoose.model<IFraudCase>("FraudCase", FraudCaseSchema);
