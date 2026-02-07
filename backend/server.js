import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import signup from "./api/signup.js";
import login from "./api/login.js";
import update from "./api/update.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectToMongoDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongoDB();

app.use("/api/signup", signup);
app.use("/api/login", login);
app.use("/api/update", update);

app.get("/", (req, res) => {
  res.json({ activeStatus: true, error: false });
});

export default app;
