import { Request, Response } from "express";
import { prisma } from "../db";
import {
  calendarParamsSchema,
  generateCalendarSchema,
} from "../zod/calendarSchema";
import { GeminiContentGenerator } from "../services/geminiContentGenerator";

export const generateCalendar = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { success, error, data } = generateCalendarSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Invalid inputs",
        error: error.flatten(),
      });
      return;
    }

    const { topicId, month, year } = data;

    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        userId: parseInt(req.userId),
      },
    });

    if (!topic) {
      res.status(404).json({
        message: "Topic not found",
      });
      return;
    }

    const existingCalendar = await prisma.calendar.findFirst({
      where: {
        topicId,
        month,
        year,
      },
      include: {
        articles: {
          orderBy: {
            scheduledDate: "asc",
          },
        },
      },
    });

    if (existingCalendar) {
      res.status(200).json({
        message: "Calendar already exists",
        calendar: existingCalendar,
      });
      return;
    }

    const calendar = await prisma.calendar.create({
      data: {
        topicId,
        month,
        year,
      },
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    console.log(
      `Generating ${daysInMonth} article titles for topic: ${topic.title}`
    );

    let generatedTitles: string[];
    try {
      generatedTitles = await GeminiContentGenerator.generateArticleTitles(
        topic.title,
        daysInMonth
      );
    } catch (error) {
      console.error("Failed to generate titles with Gemini:", error);
      res.status(500).json({
        message: "Failed to generate article titles using AI",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }

    if (generatedTitles.length < daysInMonth) {
      console.warn(
        `Only got ${generatedTitles.length} titles, generating additional ones...`
      );

      for (let i = generatedTitles.length; i < daysInMonth; i++) {
        try {
          const additionalTitle =
            await GeminiContentGenerator.generateSingleTitle(
              topic.title,
              i + 1,
              `Part of a ${daysInMonth}-day content series`
            );
          generatedTitles.push(additionalTitle);
        } catch (error) {
          generatedTitles.push(`${topic.title}: Day ${i + 1} Guide`);
        }
      }
    }

    const articlesData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const title =
        generatedTitles[day - 1] || `${topic.title}: Day ${day} Guide`;
      const scheduledDate = new Date(year, month - 1, day, 12, 0, 0);

      articlesData.push({
        title,
        scheduledDate,
        status: "SCHEDULED" as const,
        userId: parseInt(req.userId),
        topicId,
        calendarId: calendar.id,
      });
    }

    await prisma.article.createMany({
      data: articlesData,
    });

    const completeCalendar = await prisma.calendar.findUnique({
      where: { id: calendar.id },
      include: {
        articles: {
          orderBy: {
            scheduledDate: "asc",
          },
          select: {
            id: true,
            title: true,
            scheduledDate: true,
            status: true,
            generatedAt: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Calendar generated successfully",
      calendar: completeCalendar,
    });
  } catch (err) {
    console.error("Error generating calendar:", err);
    res.status(500).json({
      message: "Error generating calendar",
      error: err,
    });
  }
};

export const getCalendar = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { success, error, data } = calendarParamsSchema.safeParse(req.params);

    if (!success) {
      res.status(400).json({
        message: "Invalid parameters",
        error: error.flatten(),
      });
      return;
    }

    const { topicId, month, year } = data;

    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        userId: parseInt(req.userId),
      },
    });

    if (!topic) {
      res.status(404).json({
        message: "Topic not found",
      });
      return;
    }

    const calendar = await prisma.calendar.findFirst({
      where: {
        topicId,
        month,
        year,
      },
      include: {
        articles: {
          orderBy: {
            scheduledDate: "asc",
          },
          select: {
            id: true,
            title: true,
            scheduledDate: true,
            status: true,
            generatedAt: true,
            content: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!calendar) {
      res.status(404).json({
        message: "Calendar not found for this month. Generate one first.",
      });
      return;
    }

    const articlesByDay: Record<number, any> = {};
    calendar.articles.forEach((article) => {
      const day = article.scheduledDate.getDate();
      articlesByDay[day] = {
        id: article.id,
        title: article.title,
        status: article.status,
        generatedAt: article.generatedAt,
        hasContent: !!article.content,
        scheduledTime: article.scheduledDate,
      };
    });

    res.status(200).json({
      message: "Calendar retrieved successfully",
      calendar: {
        id: calendar.id,
        month: calendar.month,
        year: calendar.year,
        topic: calendar.topic,
        articlesByDay,
        createdAt: calendar.createdAt,
      },
    });
  } catch (err) {
    console.error("Error fetching calendar:", err);
    res.status(500).json({
      message: "Error fetching calendar",
      error: err,
    });
  }
};

export const getUserCalendars = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const calendars = await prisma.calendar.findMany({
      where: {
        topic: {
          userId: parseInt(req.userId),
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    res.status(200).json({
      message: "Calendars retrieved successfully",
      calendars: calendars.map((calendar) => ({
        id: calendar.id,
        month: calendar.month,
        year: calendar.year,
        topic: calendar.topic,
        articleCount: calendar._count.articles,
        createdAt: calendar.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error fetching calendars:", err);
    res.status(500).json({
      message: "Error fetching calendars",
      error: err,
    });
  }
};

export const deleteCalendar = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { success, error, data } = calendarParamsSchema.safeParse(req.params);

    if (!success) {
      res.status(400).json({
        message: "Invalid parameters",
        error: error.flatten(),
      });
      return;
    }

    const { topicId, month, year } = data;

    const topic = await prisma.topic.findFirst({
      where: {
        id: topicId,
        userId: parseInt(req.userId),
      },
    });

    if (!topic) {
      res.status(404).json({
        message: "Topic not found",
      });
      return;
    }

    const calendar = await prisma.calendar.findFirst({
      where: {
        topicId,
        month,
        year,
      },
    });

    if (!calendar) {
      res.status(404).json({
        message: "Calendar not found",
      });
      return;
    }

    await prisma.calendar.delete({
      where: { id: calendar.id },
    });

    res.status(200).json({
      message: "Calendar deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting calendar:", err);
    res.status(500).json({
      message: "Error deleting calendar",
      error: err,
    });
  }
};
