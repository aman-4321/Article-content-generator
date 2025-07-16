import { z } from "zod";

export const createTopicSchema = z.object({
  title: z
    .string()
    .min(3, "Topic title must be at least 3 characters")
    .max(100, "Topic title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const updateTopicSchema = z.object({
  title: z
    .string()
    .min(3, "Topic title must be at least 3 characters")
    .max(100, "Topic title must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const topicIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});
