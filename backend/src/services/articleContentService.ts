import { prisma } from "../db";
import { ContentGenerator, ContentGenerationOptions } from "./contentGenerator";

export class ArticleContentService {
  public static async generateContentForArticle(
    articleId: number
  ): Promise<boolean> {
    try {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          topic: true,
        },
      });

      if (!article) {
        console.error(`Article with ID ${articleId} not found`);
        return false;
      }

      if (article.status !== "SCHEDULED") {
        console.log(
          `Article ${articleId} is not in SCHEDULED status, skipping`
        );
        return false;
      }

      await prisma.article.update({
        where: { id: articleId },
        data: { status: "GENERATING" },
      });

      const options: ContentGenerationOptions = {
        title: article.title,
        topic: article.topic.title,
        targetWordCount: 800,
        tone: "professional",
        includeHeadings: true,
        includeBulletPoints: true,
      };

      const generatedContent = await ContentGenerator.generateContent(options);

      await prisma.article.update({
        where: { id: articleId },
        data: {
          content: generatedContent.content,
          status: "COMPLETED",
          generatedAt: new Date(),
        },
      });

      console.log(
        `Successfully generated content for article ${articleId}: "${article.title}"`
      );
      return true;
    } catch (error) {
      console.error(
        `Error generating content for article ${articleId}:`,
        error
      );

      try {
        await prisma.article.update({
          where: { id: articleId },
          data: { status: "FAILED" },
        });
      } catch (updateError) {
        console.error(`Error updating article status to FAILED:`, updateError);
      }

      return false;
    }
  }

  public static async getArticlesForToday(): Promise<number[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const articles = await prisma.article.findMany({
        where: {
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          },
          status: "SCHEDULED",
        },
        select: {
          id: true,
        },
      });

      return articles.map((article) => article.id);
    } catch (error) {
      console.error("Error fetching today's articles:", error);
      return [];
    }
  }

  public static async processArticlesForToday(): Promise<void> {
    console.log("Starting daily article generation process...");

    const articleIds = await this.getArticlesForToday();

    if (articleIds.length === 0) {
      console.log("No articles scheduled for today");
      return;
    }

    console.log(`Found ${articleIds.length} articles to process`);

    let successCount = 0;
    let failureCount = 0;

    for (const articleId of articleIds) {
      const success = await this.generateContentForArticle(articleId);

      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `Article generation complete. Success: ${successCount}, Failed: ${failureCount}`
    );
  }

  public static async triggerManualGeneration(
    articleId: number,
    userId: number
  ): Promise<boolean> {
    try {
      const article = await prisma.article.findFirst({
        where: {
          id: articleId,
          userId: userId,
        },
      });

      if (!article) {
        console.error(
          `Article ${articleId} not found or doesn't belong to user ${userId}`
        );
        return false;
      }

      if (article.status === "GENERATING") {
        console.log(`Article ${articleId} is already being generated`);
        return false;
      }

      return await this.generateContentForArticle(articleId);
    } catch (error) {
      console.error(
        `Error in manual generation for article ${articleId}:`,
        error
      );
      return false;
    }
  }

  public static async getGenerationStats(userId?: number): Promise<any> {
    try {
      const whereClause = userId ? { userId } : {};

      const stats = await prisma.article.groupBy({
        by: ["status"],
        where: whereClause,
        _count: {
          status: true,
        },
      });

      const totalArticles = await prisma.article.count({
        where: whereClause,
      });

      const completedToday = await prisma.article.count({
        where: {
          ...whereClause,
          status: "COMPLETED",
          generatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      return {
        total: totalArticles,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>),
        completedToday,
      };
    } catch (error) {
      console.error("Error fetching generation stats:", error);
      return null;
    }
  }
}
