import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../lib/db";
import User from "../models/User";
import auth from "../middleware/auth.middleware";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return res.status(500).json({ message: "Database connection failed" });
  }

  // Log for debugging
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request body:", req.body);
  console.log("JWT_SECRET present:", !!process.env.JWT_SECRET);

  /* ===== SIGN UP ===== */
  if (req.method === "POST" && req.url.includes("signup")) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({ name, email, password: hashedPassword });

      return res.status(201).json({ message: "Signup successful" });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /* ===== LOGIN ===== */
  if (req.method === "POST" && req.url.includes("login")) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET missing");
        return res.status(500).json({ message: "Server misconfiguration" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /* ===== UPDATE ACCOUNT ===== */
  if (req.method === "PUT") {
    return auth(req, res, async () => {
      try {
        const { name, email, oldPassword, newPassword } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (newPassword) {
          if (!oldPassword) {
            return res.status(400).json({ message: "Old password required" });
          }

          const isMatch = await bcrypt.compare(oldPassword, user.password);
          if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

          user.password = await bcrypt.hash(newPassword, 10);
        }

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();

        return res.json({
          message: "Account updated successfully",
          user: { name: user.name, email: user.email },
        });
      } catch (err) {
        console.error("Update account error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
