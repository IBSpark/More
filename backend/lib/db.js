import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  // Return early if already connected
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing in environment variables");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      // optional but recommended for serverless
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}
