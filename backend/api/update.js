import bcrypt from "bcryptjs";
import connectDB from "../lib/db";
import User from "../models/User";
import auth from "../middleware/auth.middleware";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const userId = auth(req); // ✅ no next()

    const { name, email, oldPassword, newPassword } = req.body || {};
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password required" });
      }

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
  } catch (err) {
    console.error("Update error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
