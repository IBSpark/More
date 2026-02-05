import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../lib/db";
import User from "../models/User";
import auth from "../middleware/auth.middleware";

export default async function handler(req, res) {
  await connectDB();

  /* ===== SIGN UP ===== */
  if (req.method === "POST" && req.url.includes("signup")) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Signup successful" });
  }

  /* ===== LOGIN ===== */
  if (req.method === "POST" && req.url.includes("login")) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: { name: user.name, email: user.email },
    });
  }

  /* ===== UPDATE ACCOUNT ===== */
  if (req.method === "PUT") {
    return auth(req, res, async () => {
      const { name, email, oldPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (newPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password incorrect" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
      }

      if (name) user.name = name;
      if (email) user.email = email;

      await user.save();

      return res.json({
        message: "Account updated successfully",
        user: { name: user.name, email: user.email },
      });
    });
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
