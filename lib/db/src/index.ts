import mongoose from "mongoose";

if (!process.env.MONGO_URI && !process.env.DATABASE_URL) {
  throw new Error("MONGO_URI or DATABASE_URL must be set. Did you forget to provision a database?");
}

const connectionString = process.env.MONGO_URI || process.env.DATABASE_URL!;

export const connectDB = () => mongoose.connect(connectionString);

export * from "./schema";
