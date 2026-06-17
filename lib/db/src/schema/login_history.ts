import mongoose, { Schema, Document } from "mongoose";

export interface ILoginHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  deviceName?: string;
  location?: string;
  isTrusted: boolean;
  loginAt: Date;
}

const LoginHistorySchema = new Schema<ILoginHistory>({
  userId: { type: Schema.Types.ObjectId, required: true },
  ipAddress: String,
  userAgent: String,
  deviceFingerprint: String,
  deviceName: String,
  location: String,
  isTrusted: { type: Boolean, default: false },
  loginAt: { type: Date, default: Date.now },
});

export const LoginHistory = mongoose.models.LoginHistory || mongoose.model<ILoginHistory>("LoginHistory", LoginHistorySchema);
