import jwt from "jsonwebtoken";
import "dotenv/config";


export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); 
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};


export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1];
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {

  }

  next();
};

// Only staff/admin allowed (must be used AFTER authMiddleware)
export const staffOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Staff access only" });
  }

  next();
};