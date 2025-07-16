import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config";
import { ContentGenerationOptions, GeneratedContent } from "./contentGenerator";

export class GeminiContentGenerator {
  private static genAI: GoogleGenerativeAI | null = null;

  private static initializeGemini(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!GEMINI_API_KEY) {
        throw new Error(
          "GEMINI_API_KEY is not configured in environment variables"
        );
      }
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return this.genAI;
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

  private static buildPrompt(options: ContentGenerationOptions): string {
    const {
      title,
      topic,
      targetWordCount = 800,
      tone = "professional",
    } = options;

    return `
You are an expert content writer and SEO specialist. Write a comprehensive, engaging, and SEO-optimized blog article with the following specifications:

**Article Title:** ${title}
**Topic/Niche:** ${topic}
**Target Word Count:** ${targetWordCount} words
**Tone:** ${tone}

**Requirements:**
1. Write a complete, well-structured article that would rank well on Google
2. Include a compelling introduction that hooks the reader
3. Use proper heading structure (H1, H2, H3) with SEO-friendly headings
4. Include actionable tips, practical advice, and valuable insights
5. Add bullet points or numbered lists where appropriate
6. Write in an engaging, easy-to-read style
7. Include a strong conclusion with a call-to-action
8. Focus on providing real value to readers interested in ${topic}
9. Use markdown formatting for headings, lists, and emphasis
10. Ensure the content is original, informative, and comprehensive

**Structure Guidelines:**
- Start with an engaging introduction (100-150 words)
- Include 4-6 main sections with descriptive H2 headings
- Use H3 subheadings within sections when needed
- Add practical examples and actionable advice
- End with a compelling conclusion (100-150 words)

**SEO Guidelines:**
- Naturally incorporate the main topic keyword throughout
- Use related keywords and synonyms
- Write descriptive, keyword-rich headings
- Create content that answers common questions about ${topic}
- Ensure the content is comprehensive and authoritative

Please write the complete article now:
    `.trim();
  }

  public static async generateContent(
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    try {
      console.log(`Starting Gemini content generation for: "${options.title}"`);

      const genAI = this.initializeGemini();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = this.buildPrompt(options);

      console.log("Sending request to Gemini API...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content || content.trim().length === 0) {
        throw new Error("Gemini returned empty content");
      }

      // Calculate additional metadata
      const wordCount = content.split(" ").length;
      const estimatedReadTime = this.calculateReadTime(content);
      const seoKeywords = this.extractKeywords(options.title, options.topic);

      console.log(`Gemini content generated successfully: ${wordCount} words`);

      return {
        title: options.title,
        content: content.trim(),
        wordCount,
        estimatedReadTime,
        seoKeywords,
      };
    } catch (error) {
      console.error("Error generating content with Gemini:", error);

      // If Gemini fails, provide a helpful error message
      if (error instanceof Error) {
        if (error.message.includes("API_KEY")) {
          throw new Error(
            "Gemini API key is invalid or not configured. Please check your GEMINI_API_KEY environment variable."
          );
        }
        if (error.message.includes("quota")) {
          throw new Error(
            "Gemini API quota exceeded. Please check your API usage limits."
          );
        }
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          throw new Error(
            "Network error while connecting to Gemini API. Please try again later."
          );
        }
      }

      throw new Error(
        `Failed to generate content with Gemini: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Test the Gemini API connection
   */
  public static async testConnection(): Promise<boolean> {
    try {
      const testOptions: ContentGenerationOptions = {
        title: "Test Article",
        topic: "Technology",
        targetWordCount: 100,
      };

      await this.generateContent(testOptions);
      console.log("Gemini API connection test successful");
      return true;
    } catch (error) {
      console.error("Gemini API connection test failed:", error);
      return false;
    }
  }

  /**
   * Generate a quick test article for validation
   */
  public static async generateTestArticle(): Promise<GeneratedContent> {
    const testOptions: ContentGenerationOptions = {
      title: "The Ultimate Guide to Content Marketing",
      topic: "Digital Marketing",
      targetWordCount: 600,
      tone: "professional",
    };

    return await this.generateContent(testOptions);
  }
}
