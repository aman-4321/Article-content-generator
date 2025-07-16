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
    const wordsPerMinute = 200;
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
You are an expert content writer, SEO specialist, and marketing strategist. Write a comprehensive, highly engaging, and SEO-optimized blog article that will rank on Google's first page and drive significant organic traffic.

**Article Details:**
- **Title:** ${title}
- **Topic/Niche:** ${topic}
- **Target Word Count:** ${targetWordCount} words
- **Tone:** ${tone}

**Marketing & SEO Objectives:**
1. Create content that solves real problems and provides actionable value
2. Optimize for featured snippets and "People Also Ask" sections
3. Include natural keyword placement throughout the content
4. Write with search intent in mind (informational/commercial)
5. Create content that encourages engagement, shares, and backlinks
6. Structure for easy scanning and mobile readability

**Content Requirements:**
1. Write a compelling, click-worthy introduction that hooks readers immediately
2. Use proper heading hierarchy (H1, H2, H3) with keyword-rich headings
3. Include actionable tips, practical examples, and step-by-step guidance
4. Add bullet points, numbered lists, and other scannable elements
5. Include relevant statistics, data, or case studies when possible
6. Write in an engaging, conversational tone that builds trust
7. Create a strong conclusion with clear next steps or call-to-action
8. Focus on E-A-T (Expertise, Authoritativeness, Trustworthiness)
9. Use markdown formatting for better structure

**SEO Strategy:**
- Naturally incorporate primary and secondary keywords
- Use semantic keywords and related terms
- Create headings that answer common questions
- Include internal linking opportunities (mention related topics)
- Write meta-description worthy introductions
- Optimize for voice search with natural language

**Structure Guidelines:**
- **Introduction (150-200 words):** Hook + problem + solution preview + what they'll learn
- **Main Content (${Math.floor(
      targetWordCount * 0.7
    )} words):** 4-6 main sections with H2 headings
- **Practical Examples:** Include real-world applications and case studies
- **Actionable Tips:** Provide specific, implementable advice
- **Conclusion (100-150 words):** Summarize key points + clear call-to-action

**Content Goals:**
- Establish authority and expertise in ${topic}
- Provide immediate value that readers can implement
- Create shareable, link-worthy content
- Drive conversions through strategic CTAs
- Build brand trust and credibility

Write the complete article using markdown formatting. Focus on creating content that not only ranks well but genuinely helps readers achieve their goals with ${topic}.
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

  public static async generateTestArticle(): Promise<GeneratedContent> {
    const testOptions: ContentGenerationOptions = {
      title: "The Ultimate Guide to Content Marketing",
      topic: "Digital Marketing",
      targetWordCount: 600,
      tone: "professional",
    };

    return await this.generateContent(testOptions);
  }

  public static async generateArticleTitles(
    topic: string,
    numberOfDays: number
  ): Promise<string[]> {
    try {
      console.log(
        `Generating ${numberOfDays} article titles for topic: "${topic}"`
      );

      const genAI = this.initializeGemini();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
You are an expert content strategist and SEO specialist working for a marketing platform. Create a content calendar with ${numberOfDays} unique, highly engaging, and SEO-optimized article titles for the topic: "${topic}".

**Marketing & SEO Focus:**
- Each title should be designed to rank on Google's first page
- Titles should attract clicks and drive organic traffic
- Focus on solving real problems your audience faces
- Include emotional triggers and power words
- Consider search intent (informational, commercial, navigational)

**Content Strategy:**
1. Create titles that cover the complete customer journey
2. Mix of content types:
   - How-to guides (for beginners and experts)
   - Ultimate guides and comprehensive resources
   - Quick tips and actionable advice
   - Common mistakes and what to avoid
   - Tools, resources, and recommendations
   - Case studies and success stories
   - Trends and future predictions
   - Comparison guides
   - Problem-solving articles
   - Best practices and strategies

**SEO Requirements:**
- Include relevant keywords naturally
- Use numbers when appropriate (e.g., "7 Ways", "Top 10")
- Keep titles between 50-60 characters when possible
- Use power words: Ultimate, Complete, Essential, Proven, Secret, Advanced, etc.
- Make each title unique and specific
- Ensure titles promise clear value

**Examples of good patterns:**
- "The Complete Guide to [Topic] for [Audience]"
- "7 Proven [Topic] Strategies That Actually Work"
- "[Number] [Topic] Mistakes That Are Killing Your Results"
- "How to [Achieve Result] with [Topic] in [Timeframe]"
- "Ultimate [Topic] Checklist for [Year]"

**Topic:** ${topic}

Generate exactly ${numberOfDays} SEO-optimized, marketing-focused article titles that will drive traffic and engagement. Format as a numbered list:
1. [Title]
2. [Title]
...and so on.

Only return the numbered list of titles, nothing else.
      `.trim();

      console.log("Sending title generation request to Gemini API...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content || content.trim().length === 0) {
        throw new Error("Gemini returned empty content for titles");
      }

      const lines = content.trim().split("\n");
      const titles: string[] = [];

      for (const line of lines) {
        const match = line.match(/^\d+\.\s*(.+)$/);
        if (match && match[1]) {
          titles.push(match[1].trim());
        }
      }

      if (titles.length !== numberOfDays) {
        console.warn(
          `Expected ${numberOfDays} titles but got ${titles.length}. Using what we have.`
        );
      }

      console.log(`Generated ${titles.length} article titles successfully`);
      return titles;
    } catch (error) {
      console.error("Error generating titles with Gemini:", error);

      if (error instanceof Error) {
        if (error.message.includes("API_KEY")) {
          throw new Error(
            "Gemini API key is invalid or not configured. Please check your GEMINI_API_KEY environment variable."
          );
        }
      }

      throw new Error(
        `Failed to generate titles with Gemini: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  public static async generateSingleTitle(
    topic: string,
    dayNumber: number,
    context?: string
  ): Promise<string> {
    try {
      console.log(
        `Generating single title for day ${dayNumber} of topic: "${topic}"`
      );

      const genAI = this.initializeGemini();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const contextInfo = context ? `\n**Context:** ${context}` : "";

      const prompt = `
You are an expert content strategist and SEO specialist working for a marketing platform. Create a single, highly engaging and SEO-optimized article title for day ${dayNumber} of a content series about "${topic}".

**Marketing & SEO Focus:**
- Design this title to rank on Google's first page for relevant searches
- Make it click-worthy and shareable
- Include emotional triggers that drive engagement
- Consider commercial and informational search intent
- Use proven patterns that perform well in organic search

**Title Requirements:**
1. SEO-optimized with relevant keywords
2. 50-60 characters when possible for optimal SERP display
3. Include power words (Ultimate, Complete, Proven, Secret, Essential, etc.)
4. Promise clear, specific value to readers
5. Use numbers or specificity when appropriate
6. Make it actionable and results-focused

**Content Strategy Context:**
- This is part of a ${dayNumber}-day content series
- Should complement other titles in the series
- Focus on solving real problems your audience faces
- Consider where this fits in the customer journey${contextInfo}

**Topic:** ${topic}
**Day:** ${dayNumber}

Examples of high-performing patterns:
- "How to [Achieve Result] with [Topic] (Step-by-Step Guide)"
- "The Ultimate [Topic] Strategy That [Benefit]"
- "[Number] Proven [Topic] Tips That Actually Work"
- "[Topic] Mistakes That Are Costing You [Negative Outcome]"

Generate one SEO-optimized, marketing-focused article title that will drive traffic and engagement. Return only the title, no quotes, no numbering.
      `.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim();

      if (!title || title.length === 0) {
        throw new Error("Gemini returned empty title");
      }

      const cleanTitle = title.replace(/^["']|["']$/g, "");

      console.log(`Generated title for day ${dayNumber}: "${cleanTitle}"`);
      return cleanTitle;
    } catch (error) {
      console.error("Error generating single title with Gemini:", error);
      throw new Error(
        `Failed to generate title with Gemini: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
