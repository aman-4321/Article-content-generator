import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  generateCalendar,
  getCalendar,
  getUserCalendars,
  deleteCalendar,
} from "../controller/calendar.controller";

export const calendarRouter = Router();

calendarRouter.post("/generate", authMiddleware, generateCalendar);

calendarRouter.get("/", authMiddleware, getUserCalendars);

calendarRouter.get("/:topicId/:month/:year", authMiddleware, getCalendar);

calendarRouter.delete("/:topicId/:month/:year", authMiddleware, deleteCalendar);
