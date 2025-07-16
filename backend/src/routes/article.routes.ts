import { Router } from "express";
import { authMiddleware } from "../middleware/middleware";
import {
  getArticles,
  getArticleById,
  updateArticle,
  getContentHistory,
  getUpcomingArticles,
  generateArticleContent,
  getGenerationStats,
  testGeminiGeneration,
} from "../controller/article.controller";

export const articleRouter = Router();

articleRouter.get("/", authMiddleware, getArticles);

articleRouter.get("/history", authMiddleware, getContentHistory);

articleRouter.get("/upcoming", authMiddleware, getUpcomingArticles);

articleRouter.get("/stats", authMiddleware, getGenerationStats);

articleRouter.get("/test-gemini", authMiddleware, testGeminiGeneration);

articleRouter.get("/:id", authMiddleware, getArticleById);

articleRouter.put("/:id", authMiddleware, updateArticle);

articleRouter.post("/:id/generate", authMiddleware, generateArticleContent);
