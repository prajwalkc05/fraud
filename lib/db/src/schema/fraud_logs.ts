import mongoose, { Schema, Document } from "mongoose";

export interface IFraudLog extends Document {
  _id: mongoose.Types.ObjectId;
  transactionId: mongoose.Types.ObjectId;
  riskScore: number;
  riskLevel: string;
  fraudProbability: number;
  signals: string[];
  createdAt: Date;
}

const FraudLogSchema = new Schema<IFraudLog>({
  transactionId: { type: Schema.Types.ObjectId, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, required: true },
  fraudProbability: { type: Number, required: true },
  signals: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const FraudLog = mongoose.models.FraudLog || mongoose.model<IFraudLog>("FraudLog", FraudLogSchema);
