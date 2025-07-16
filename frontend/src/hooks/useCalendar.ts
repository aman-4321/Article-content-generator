import { useState } from "react";
import { useApi } from "./useApi";
import { Calendar, Article } from "@/types";

interface CalendarData extends Calendar {
  articlesByDay: Record<string, Article>;
  articles?: Article[];
}

export function useCalendar() {
  const { get, post, del, isLoading, error } = useApi();
  const [currentCalendar, setCurrentCalendar] = useState<CalendarData | null>(
    null
  );
  const [calendars, setCalendars] = useState<Calendar[]>([]);

  const generateCalendar = async (data: {
    topicId: number;
    month: number;
    year: number;
  }) => {
    try {
      const response = await post("/calendar/generate", data);
      if (response?.calendar) {
        setCurrentCalendar(response.calendar);
        return response.calendar;
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchCalendar = async (
    topicId: number,
    month: number,
    year: number
  ) => {
    try {
      const response = await get(`/calendar/${topicId}/${month}/${year}`);
      if (response?.calendar) {
        setCurrentCalendar(response.calendar);
        return response.calendar;
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchAllCalendars = async () => {
    try {
      const response = await get("/calendar");
      if (response?.calendars) {
        setCalendars(response.calendars);
        return response.calendars;
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteCalendar = async (
    topicId: number,
    month: number,
    year: number
  ) => {
    try {
      await del(`/calendar/${topicId}/${month}/${year}`);
      setCalendars((prev) =>
        prev.filter(
          (cal) =>
            !(
              cal.topic.id === topicId &&
              cal.month === month &&
              cal.year === year
            )
        )
      );
      if (
        currentCalendar?.topic.id === topicId &&
        currentCalendar?.month === month &&
        currentCalendar?.year === year
      ) {
        setCurrentCalendar(null);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    currentCalendar,
    calendars,
    isLoading,
    error,
    generateCalendar,
    fetchCalendar,
    fetchAllCalendars,
    deleteCalendar,
    setCurrentCalendar,
  };
}
