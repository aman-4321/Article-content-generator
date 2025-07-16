import express, { Router } from "express";
import {
  userLogout,
  userSignin,
  userSignup,
  getMe,
} from "../controller/user.controller";
import { authMiddleware } from "../middleware/middleware";

export const userRouter = Router();

userRouter.post("/signup", userSignup);

userRouter.post("/signin", userSignin);

userRouter.post("/logout", userLogout);

userRouter.get("/me", authMiddleware, getMe);
