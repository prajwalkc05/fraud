import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  transactionId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
  userId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  transactionId: Schema.Types.ObjectId,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Alert = mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);
