import { z } from "zod";

export const articleQuerySchema = z.object({
  status: z.enum(["SCHEDULED", "GENERATING", "COMPLETED", "FAILED"]).optional(),
  topicId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default(10),
});

export const articleIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const updateArticleSchema = z.object({
  title: z
    .string()
    .min(10, "Article title must be at least 10 characters")
    .max(200, "Article title must be less than 200 characters")
    .optional(),
  content: z
    .string()
    .min(100, "Article content must be at least 100 characters")
    .optional(),
});

export const generateArticleSchema = z.object({
  articleId: z.number().int().positive("Article ID must be a positive integer"),
});
