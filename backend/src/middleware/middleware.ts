import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { prisma } from "../db";

import dotenv from "dotenv";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: number;
        name: string;
        email: string;
        password: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      message: "No Token Provided",
    });
    return;
  }

  const secret = JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "No JWT_SECRET found in env file",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.userId) {
      res.clearCookie("token");
      res.status(401).json({
        message: "Invalid token payload",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) },
    });

    if (!user) {
      res.clearCookie("token");
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err: any) {
    res.clearCookie("token");
    const message =
      err instanceof TokenExpiredError ? "Token Expired" : "Invalid Token";
    res.status(401).json({ message });
    console.error("Authentication error", err);
    return;
  }
};
