import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


export interface AuthRequest extends Request {
  user?: JwtPayload & { id: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tokenFromHeader =
      req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    const token = req.cookies?.token || tokenFromHeader;

    if (!token) return res.status(401).json({ message: "No token provided!" });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET not set in .env");

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload & { id: string };
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ message: "Invalid or expired token!" });
  }
};
