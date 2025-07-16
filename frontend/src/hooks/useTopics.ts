import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import { Topic } from "@/types";

export function useTopics() {
  const { get, post, put, del, isLoading, error } = useApi();
  const [topics, setTopics] = useState<Topic[]>([]);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await get("/topics");
      if (response?.topics) {
        setTopics(response.topics);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  }, [get]);

  const createTopic = async (data: { title: string; description?: string }) => {
    try {
      const response = await post("/topics", data);
      if (response?.topic) {
        setTopics((prev) => [...prev, response.topic]);
        return response.topic;
      }
    } catch (error) {
      throw error;
    }
  };

  const updateTopic = async (
    id: number,
    data: { title?: string; description?: string }
  ) => {
    try {
      const response = await put(`/topics/${id}`, data);
      if (response?.topic) {
        setTopics((prev) =>
          prev.map((topic) => (topic.id === id ? response.topic : topic))
        );
        return response.topic;
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteTopic = async (id: number) => {
    try {
      await del(`/topics/${id}`);
      setTopics((prev) => prev.filter((topic) => topic.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    isLoading,
    error,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}
