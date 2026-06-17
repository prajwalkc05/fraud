import mongoose from "mongoose";

export const connectDB = () => {
  const connectionString = process.env.MONGO_URI || process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("MONGO_URI or DATABASE_URL must be set. Did you forget to provision a database?");
  }
  
  return mongoose.connect(connectionString);
};

export * from "./schema";
