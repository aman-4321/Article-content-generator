import { z } from "zod";

export const generateCalendarSchema = z.object({
  topicId: z.number().int().positive("Topic ID must be a positive integer"),
  month: z.number().int().min(1).max(12, "Month must be between 1 and 12"),
  year: z
    .number()
    .int()
    .min(2020)
    .max(2030, "Year must be between 2020 and 2030"),
});

export const calendarQuerySchema = z.object({
  topicId: z.string().transform((val) => parseInt(val, 10)),
  month: z.string().transform((val) => parseInt(val, 10)),
  year: z.string().transform((val) => parseInt(val, 10)),
});

export const calendarParamsSchema = z
  .object({
    topicId: z.string().transform((val) => parseInt(val, 10)),
    month: z.string().transform((val) => parseInt(val, 10)),
    year: z.string().transform((val) => parseInt(val, 10)),
  })
  .refine(
    (data) => {
      return data.month >= 1 && data.month <= 12;
    },
    {
      message: "Month must be between 1 and 12",
      path: ["month"],
    }
  )
  .refine(
    (data) => {
      return data.year >= 2020 && data.year <= 2030;
    },
    {
      message: "Year must be between 2020 and 2030",
      path: ["year"],
    }
  );
