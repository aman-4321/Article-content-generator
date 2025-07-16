import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  createTopic,
  getUserTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} from "../controller/topic.controller";

export const topicRouter = Router();

topicRouter.post("/", authMiddleware, createTopic);

topicRouter.get("/", authMiddleware, getUserTopics);

topicRouter.get("/:id", authMiddleware, getTopicById);

topicRouter.put("/:id", authMiddleware, updateTopic);

topicRouter.delete("/:id", authMiddleware, deleteTopic);
