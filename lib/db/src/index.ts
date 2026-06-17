import mongoose from "mongoose";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const connectDB = () => mongoose.connect(process.env.DATABASE_URL!);

export * from "./schema";
