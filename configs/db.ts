import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const DatabaseConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
