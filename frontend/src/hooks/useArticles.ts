import { useState, useCallback } from "react";
import { useApi } from "./useApi";

interface ContentHistoryResponse {
  articles: Array<{
    id: number;
    title: string;
    scheduledDate: string;
    generatedAt: string;
    wordCount: number;
    contentPreview: string;
    topic: {
      id: number;
      title: string;
    };
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  statistics: {
    totalGenerated: number;
    scheduled: number;
    generating: number;
    failed: number;
  };
}

interface UpcomingArticlesResponse {
  upcoming: Array<{
    id: number;
    title: string;
    scheduledDate: string;
    status: string;
    topic: {
      id: number;
      title: string;
    };
    daysFromNow: number;
  }>;
  today: Array<{
    id: number;
    title: string;
    scheduledDate: string;
    status: string;
    topic: {
      id: number;
      title: string;
    };
  }>;
}

export function useArticles() {
  const { get, post, isLoading, error } = useApi();
  const [contentHistory, setContentHistory] =
    useState<ContentHistoryResponse | null>(null);
  const [upcomingArticles, setUpcomingArticles] =
    useState<UpcomingArticlesResponse | null>(null);

  const fetchContentHistory = useCallback(
    async (page = 1, limit = 20, topicId?: number) => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (topicId) {
          params.append("topicId", topicId.toString());
        }

        const response = await get(`/articles/history?${params}`);
        if (response) {
          setContentHistory(response);
          return response;
        }
      } catch (error) {
        console.error("Failed to fetch content history:", error);
        throw error;
      }
    },
    [get]
  );

  const fetchUpcomingArticles = useCallback(async () => {
    try {
      const response = await get("/articles/upcoming");
      if (response) {
        setUpcomingArticles(response);
        return response;
      }
    } catch (error) {
      console.error("Failed to fetch upcoming articles:", error);
      throw error;
    }
  }, [get]);

  const generateArticleContent = async (articleId: number) => {
    try {
      const response = await post(`/articles/${articleId}/generate`);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fetchArticleById = async (articleId: number) => {
    try {
      const response = await get(`/articles/${articleId}`);
      return response?.article;
    } catch (error) {
      throw error;
    }
  };

  return {
    contentHistory,
    upcomingArticles,
    isLoading,
    error,
    fetchContentHistory,
    fetchUpcomingArticles,
    generateArticleContent,
    fetchArticleById,
  };
}
