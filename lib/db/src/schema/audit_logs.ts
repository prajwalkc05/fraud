import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  status: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: Schema.Types.ObjectId,
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: String,
  details: String,
  ipAddress: String,
  userAgent: String,
  status: { type: String, default: "success" },
  createdAt: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
