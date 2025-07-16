export interface GeneratedContent {
  title: string;
  content: string;
  wordCount: number;
  estimatedReadTime: number;
  seoKeywords: string[];
}

export interface ContentGenerationOptions {
  title: string;
  topic: string;
  targetWordCount?: number;
  tone?: "professional" | "casual" | "educational" | "persuasive";
  includeHeadings?: boolean;
  includeBulletPoints?: boolean;
}

export class ContentGenerator {
  private static generatePlaceholderContent(
    options: ContentGenerationOptions,
  ): string {
    const { title, topic, targetWordCount = 800 } = options;

    const introduction = `${title} is an essential aspect of ${topic} that many people overlook. In this comprehensive guide, we'll explore the key concepts, best practices, and actionable strategies you can implement immediately.`;

    const sections = [
      {
        heading: "Understanding the Basics",
        content: `Before diving into advanced techniques, it's important to understand the fundamental principles of ${topic}. These foundations will serve as the building blocks for everything else we'll discuss in this article.`,
      },
      {
        heading: "Key Benefits and Advantages",
        content: `There are numerous benefits to mastering ${topic}. From improved efficiency to better results, the advantages are clear and measurable. Let's explore the most significant benefits you can expect.`,
      },
      {
        heading: "Common Mistakes to Avoid",
        content: `Even experienced practitioners make mistakes when it comes to ${topic}. By understanding these common pitfalls, you can avoid them and accelerate your progress significantly.`,
      },
      {
        heading: "Step-by-Step Implementation",
        content: `Now that we've covered the theory, let's get practical. Here's a detailed step-by-step process you can follow to implement these concepts in your own situation.`,
      },
      {
        heading: "Advanced Tips and Strategies",
        content: `Once you've mastered the basics, these advanced strategies will help you take your ${topic} skills to the next level. These techniques are used by professionals and experts in the field.`,
      },
      {
        heading: "Measuring Success and Results",
        content: `To ensure you're making progress, it's important to track and measure your results. Here are the key metrics and indicators you should monitor to gauge your success with ${topic}.`,
      },
    ];

    let content = `# ${title}\n\n${introduction}\n\n`;

    const wordsPerSection = Math.floor(
      (targetWordCount - 100) / sections.length,
    );

    sections.forEach((section) => {
      content += `## ${section.heading}\n\n`;
      content += section.content;

      const additionalContent = this.generateAdditionalContent(
        topic,
        wordsPerSection - 50,
      );
      content += ` ${additionalContent}\n\n`;
    });

    content += `## Conclusion\n\n`;
    content += `Mastering ${topic} is a journey that requires dedication, practice, and the right strategies. By following the principles and techniques outlined in this guide, you'll be well on your way to achieving your goals. Remember to stay consistent, measure your progress, and don't be afraid to adjust your approach as you learn and grow.\n\n`;
    content += `Start implementing these strategies today, and you'll begin to see improvements in your ${topic} efforts. The key is to take action and remain committed to continuous improvement.`;

    return content;
  }

  private static generateAdditionalContent(
    topic: string,
    targetWords: number,
  ): string {
    const sentences = [
      `This approach to ${topic} has been proven effective across various industries and use cases.`,
      `Many professionals have found success by implementing these specific techniques and methodologies.`,
      `The key is to remain consistent and patient as you develop your ${topic} skills over time.`,
      `Research shows that regular practice and application of these principles leads to significant improvements.`,
      `It's important to adapt these strategies to your specific situation and requirements.`,
      `Consider seeking feedback from experienced practitioners to accelerate your learning process.`,
      `Documentation and tracking of your progress will help you identify areas for improvement.`,
      `Don't hesitate to experiment with different approaches to find what works best for you.`,
      `Building a strong foundation in ${topic} will pay dividends in the long run.`,
      `Stay updated with the latest trends and developments in the field of ${topic}.`,
    ];

    let content = "";
    let wordCount = 0;
    let sentenceIndex = 0;

    while (wordCount < targetWords && sentenceIndex < sentences.length) {
      const sentence = sentences[sentenceIndex];
      content += sentence + " ";
      wordCount += sentence.split(" ").length;
      sentenceIndex++;

      if (sentenceIndex >= sentences.length) {
        sentenceIndex = 0; // Reset to reuse sentences if needed
      }
    }

    return content.trim();
  }

  private static calculateReadTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(" ").length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private static extractKeywords(title: string, topic: string): string[] {
    const titleWords = title
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 3);
    const topicWords = topic
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 3);
    return [...new Set([...titleWords, ...topicWords])].slice(0, 5);
  }

  public static async generateContent(
    options: ContentGenerationOptions,
  ): Promise<GeneratedContent> {
    try {
      const { GeminiContentGenerator } = await import(
        "./geminiContentGenerator"
      );

      console.log("Attempting to generate content with Gemini AI...");
      return await GeminiContentGenerator.generateContent(options);
    } catch (geminiError) {
      console.warn(
        "Gemini AI generation failed, falling back to placeholder content:",
        geminiError,
      );

      try {
        const content = this.generatePlaceholderContent(options);
        const wordCount = content.split(" ").length;
        const estimatedReadTime = this.calculateReadTime(content);
        const seoKeywords = this.extractKeywords(options.title, options.topic);

        console.log("Using placeholder content generation as fallback");

        return {
          title: options.title,
          content:
            content +
            "\n\n*Note: This content was generated using fallback mode. Configure GEMINI_API_KEY for AI-powered generation.*",
          wordCount,
          estimatedReadTime,
          seoKeywords,
        };
      } catch (fallbackError) {
        console.error(
          "Both Gemini and fallback content generation failed:",
          fallbackError,
        );
        throw new Error(
          "Failed to generate content with both AI and fallback methods",
        );
      }
    }
  }
}
