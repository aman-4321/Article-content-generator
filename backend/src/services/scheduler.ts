import cron from "node-cron";
import { ArticleContentService } from "./articleContentService";

export class ArticleScheduler {
  private static isRunning = false;
  private static tasks: any[] = [];

  public static start(): void {
    if (this.isRunning) {
      console.log("Article scheduler is already running");
      return;
    }

    console.log("Starting article generation scheduler...");

    const dailyTask = cron.schedule(
      "0 17 * * *",
      async () => {
        console.log("Daily article generation job triggered at 5:00 PM IST");

        try {
          await ArticleContentService.processArticlesForToday();
        } catch (error) {
          console.error("Error in daily article generation job:", error);
        }
      },
      {
        timezone: "Asia/Kolkata",
      }
    );

    const weeklyTask = cron.schedule(
      "0 2 * * 0",
      async () => {
        console.log("Weekly cleanup job triggered");

        try {
          await this.performWeeklyCleanup();
        } catch (error) {
          console.error("Error in weekly cleanup job:", error);
        }
      },
      {
        timezone: "UTC",
      }
    );

    this.tasks.push(dailyTask, weeklyTask);
    this.isRunning = true;
    console.log("Article scheduler started successfully");
    console.log("Daily article generation will run at 5:00 PM UTC");
  }

  public static stop(): void {
    this.tasks.forEach((task) => task.destroy());
    this.tasks = [];
    this.isRunning = false;
    console.log("Article scheduler stopped");
  }

  public static isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  public static async triggerDailyJob(): Promise<void> {
    console.log("Manually triggering daily article generation job");

    try {
      await ArticleContentService.processArticlesForToday();
    } catch (error) {
      console.error("Error in manual daily job trigger:", error);
    }
  }

  private static async performWeeklyCleanup(): Promise<void> {
    console.log("Performing weekly cleanup operations...");

    console.log("Weekly cleanup completed");
  }

  public static async getJobStatus(): Promise<any> {
    try {
      const stats = await ArticleContentService.getGenerationStats();

      return {
        schedulerRunning: this.isRunning,
        nextRun: "Daily at 5:00 PM UTC",
        timezone: "UTC",
        statistics: stats,
        lastRun: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting job status:", error);
      return {
        schedulerRunning: this.isRunning,
        error: "Failed to fetch statistics",
      };
    }
  }
}

export class DevelopmentScheduler {
  public static startDevelopmentMode(): void {
    console.log("Starting development scheduler (runs every 5 minutes)");

    cron.schedule(
      "*/5 * * * *",
      async () => {
        console.log(
          "Development: Article generation job triggered (every 5 minutes)"
        );

        try {
          await ArticleContentService.processArticlesForToday();
        } catch (error) {
          console.error("Error in development article generation job:", error);
        }
      },
      {
        timezone: "UTC",
      }
    );
  }
}

export const SchedulerConfig = {
  DAILY_GENERATION: "0 17 * * *",

  TEST_MODE: "* * * * *",

  DEVELOPMENT_MODE: "*/5 * * * *",

  WEEKLY_CLEANUP: "0 2 * * 0",
};
