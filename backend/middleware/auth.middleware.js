import jwt from "jsonwebtoken";

export default function auth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new Error("NO_TOKEN"); // will be caught in your API handler
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET_MISSING");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id; // returns userId
  } catch (err) {
    throw new Error("INVALID_TOKEN");
  }
}
