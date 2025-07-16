import { Request, Response } from "express";
import { prisma } from "../db";
import {
  articleQuerySchema,
  articleIdSchema,
  updateArticleSchema,
} from "../zod/articleSchema";
import { ArticleContentService } from "../services/articleContentService";

export const getArticles = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { success, error, data } = articleQuerySchema.safeParse(req.query);

    if (!success) {
      res.status(400).json({
        message: "Invalid query parameters",
        error: error.flatten(),
      });
      return;
    }

    const { status, topicId, page, limit } = data;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: parseInt(req.userId),
    };

    if (status) {
      whereClause.status = status;
    }

    if (topicId) {
      whereClause.topicId = topicId;
    }

    const totalCount = await prisma.article.count({
      where: whereClause,
    });

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      message: "Articles retrieved successfully",
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        status: article.status,
        scheduledDate: article.scheduledDate,
        generatedAt: article.generatedAt,
        hasContent: !!article.content,
        contentPreview: article.content
          ? article.content.substring(0, 200) + "..."
          : null,
        topic: article.topic,
        createdAt: article.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({
      message: "Error fetching articles",
      error: err,
    });
  }
};

export const getArticleById = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { success, error, data } = articleIdSchema.safeParse(req.params);

    if (!success) {
      res.status(400).json({
        message: "Invalid article ID",
        error: error.flatten(),
      });
      return;
    }

    const article = await prisma.article.findFirst({
      where: {
        id: data.id,
        userId: parseInt(req.userId),
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        calendar: {
          select: {
            id: true,
            month: true,
            year: true,
          },
        },
      },
    });

    if (!article) {
      res.status(404).json({
        message: "Article not found",
      });
      return;
    }

    res.status(200).json({
      message: "Article retrieved successfully",
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        status: article.status,
        scheduledDate: article.scheduledDate,
        generatedAt: article.generatedAt,
        topic: article.topic,
        calendar: article.calendar,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error fetching article:", err);
    res.status(500).json({
      message: "Error fetching article",
      error: err,
    });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const {
      success: paramsSuccess,
      error: paramsError,
      data: paramsData,
    } = articleIdSchema.safeParse(req.params);

    if (!paramsSuccess) {
      res.status(400).json({
        message: "Invalid article ID",
        error: paramsError.flatten(),
      });
      return;
    }

    const { success, error, data } = updateArticleSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Invalid inputs",
        error: error.flatten(),
      });
      return;
    }

    const existingArticle = await prisma.article.findFirst({
      where: {
        id: paramsData.id,
        userId: parseInt(req.userId),
      },
    });

    if (!existingArticle) {
      res.status(404).json({
        message: "Article not found",
      });
      return;
    }

    const updatedArticle = await prisma.article.update({
      where: {
        id: paramsData.id,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
      },
    });

    res.status(200).json({
      message: "Article updated successfully",
      article: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        content: updatedArticle.content,
        status: updatedArticle.status,
        updatedAt: updatedArticle.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({
      message: "Error updating article",
      error: err,
    });
  }
};

export const getContentHistory = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { page = "1", limit = "20", topicId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      userId: parseInt(req.userId),
      status: "COMPLETED",
      content: {
        not: null,
      },
    };

    if (topicId) {
      whereClause.topicId = parseInt(topicId as string);
    }

    const totalCount = await prisma.article.count({
      where: whereClause,
    });

    const articles = await prisma.article.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        generatedAt: true,
        content: true,
        createdAt: true,
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        generatedAt: "desc",
      },
      skip,
      take: limitNum,
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    const stats = await prisma.article.groupBy({
      by: ["status"],
      where: {
        userId: parseInt(req.userId),
      },
      _count: {
        status: true,
      },
    });

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      message: "Content history retrieved successfully",
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        scheduledDate: article.scheduledDate,
        generatedAt: article.generatedAt,
        wordCount: article.content ? article.content.split(" ").length : 0,
        contentPreview: article.content
          ? article.content.substring(0, 150) + "..."
          : null,
        topic: article.topic,
        createdAt: article.createdAt,
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
      },
      statistics: {
        totalGenerated: statusStats.COMPLETED || 0,
        scheduled: statusStats.SCHEDULED || 0,
        generating: statusStats.GENERATING || 0,
        failed: statusStats.FAILED || 0,
      },
    });
  } catch (err) {
    console.error("Error fetching content history:", err);
    res.status(500).json({
      message: "Error fetching content history",
      error: err,
    });
  }
};

export const getUpcomingArticles = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingArticles = await prisma.article.findMany({
      where: {
        userId: parseInt(req.userId),
        scheduledDate: {
          gte: today,
        },
        status: {
          in: ["SCHEDULED", "GENERATING"],
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
      take: 10,
    });

    const todayArticles = await prisma.article.findMany({
      where: {
        userId: parseInt(req.userId),
        scheduledDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    res.status(200).json({
      message: "Upcoming articles retrieved successfully",
      upcoming: upcomingArticles.map((article) => ({
        id: article.id,
        title: article.title,
        scheduledDate: article.scheduledDate,
        status: article.status,
        topic: article.topic,
        daysFromNow: Math.ceil(
          (article.scheduledDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      })),
      today: todayArticles.map((article) => ({
        id: article.id,
        title: article.title,
        scheduledDate: article.scheduledDate,
        status: article.status,
        topic: article.topic,
      })),
    });
  } catch (err) {
    console.error("Error fetching upcoming articles:", err);
    res.status(500).json({
      message: "Error fetching upcoming articles",
      error: err,
    });
  }
};

export const generateArticleContent = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const { success, error, data } = articleIdSchema.safeParse(req.params);

    if (!success) {
      res.status(400).json({
        message: "Invalid article ID",
        error: error.flatten(),
      });
      return;
    }

    const success_result = await ArticleContentService.triggerManualGeneration(
      data.id,
      parseInt(req.userId)
    );

    if (!success_result) {
      res.status(400).json({
        message:
          "Failed to generate content. Article may not exist, already be generated, or be in progress.",
      });
      return;
    }

    res.status(200).json({
      message: "Content generation started successfully",
      articleId: data.id,
    });
  } catch (err) {
    console.error("Error triggering content generation:", err);
    res.status(500).json({
      message: "Error triggering content generation",
      error: err,
    });
  }
};

export const getGenerationStats = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const stats = await ArticleContentService.getGenerationStats(
      parseInt(req.userId)
    );

    if (!stats) {
      res.status(500).json({
        message: "Error fetching generation statistics",
      });
      return;
    }

    res.status(200).json({
      message: "Generation statistics retrieved successfully",
      stats,
    });
  } catch (err) {
    console.error("Error fetching generation stats:", err);
    res.status(500).json({
      message: "Error fetching generation statistics",
      error: err,
    });
  }
};

export const testGeminiGeneration = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    console.log("Testing Gemini content generation...");

    const { GeminiContentGenerator } = await import(
      "../services/geminiContentGenerator"
    );

    const connectionTest = await GeminiContentGenerator.testConnection();

    if (!connectionTest) {
      res.status(500).json({
        message: "Gemini API connection test failed",
        error:
          "Unable to connect to Gemini API. Check your API key and network connection.",
      });
      return;
    }

    const testArticle = await GeminiContentGenerator.generateTestArticle();

    res.status(200).json({
      message: "Gemini content generation test successful",
      article: {
        title: testArticle.title,
        wordCount: testArticle.wordCount,
        estimatedReadTime: testArticle.estimatedReadTime,
        seoKeywords: testArticle.seoKeywords,
        contentPreview: testArticle.content.substring(0, 300) + "...",
      },
      success: true,
    });
  } catch (err) {
    console.error("Error testing Gemini generation:", err);
    res.status(500).json({
      message: "Gemini generation test failed",
      error: err instanceof Error ? err.message : "Unknown error",
      success: false,
    });
  }
};
