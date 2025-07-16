import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { prisma } from "../db";
import { signinSchema, signupSchema } from "../zod/userSchema";

export const userSignup = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = signupSchema.safeParse(req.body);
    if (!success) {
      res.status(411).json({
        message: "Invalid inputs",
        error: error.flatten,
      });
      return;
    }

    const userExists = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (userExists) {
      res.status(403).json({
        message: "User with this email already exists",
      });
      return;
    }

    const { email, password, name } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const userId = user.id;
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    res.status(200).json({
      message: "User Created Successfully",
      name,
      email,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while Signing up ",
      error: err,
    });
  }
};

export const userSignin = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = signinSchema.safeParse(req.body);

    if (!success) {
      res.status(411).json({
        message: "Invalid Inputs",
        error: error.flatten,
      });
      return;
    }

    const { email, password } = data;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid password",
      });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    res.status(200).json({
      message: "Logged in successfully",
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error during Signing in",
      error: err,
    });
  }
};

export const userLogout = async (req: Request, res: Response) => {
  try {
    if (!req.cookies.token) {
      res.status(400).json({
        message: "Already logged out or no active session",
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });
    res.status(200).json({ message: "Logged out Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error during Logout",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      message: "Error fetching user",
      error: err,
    });
  }
};
