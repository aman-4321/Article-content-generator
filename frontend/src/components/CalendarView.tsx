"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Loader2 } from "lucide-react";
import { Article, ArticleStatus } from "@/types";

interface CalendarData {
  id: number;
  month: number;
  year: number;
  topic: {
    id: number;
    title: string;
    description?: string;
  };
  articlesByDay?: Record<string, Article>;
  articles?: Article[];
  createdAt: string;
}

interface CalendarViewProps {
  calendar: CalendarData;
  isLoading?: boolean;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getStatusBadgeVariant = (status: ArticleStatus) => {
  switch (status) {
    case ArticleStatus.COMPLETED:
      return "default";
    case ArticleStatus.GENERATING:
      return "secondary";
    case ArticleStatus.SCHEDULED:
      return "outline";
    case ArticleStatus.FAILED:
      return "destructive";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: ArticleStatus) => {
  switch (status) {
    case ArticleStatus.COMPLETED:
      return <FileText className="h-3 w-3" />;
    case ArticleStatus.GENERATING:
      return <Loader2 className="h-3 w-3 animate-spin" />;
    case ArticleStatus.SCHEDULED:
      return <Clock className="h-3 w-3" />;
    case ArticleStatus.FAILED:
      return <span className="text-red-500">!</span>;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

export function CalendarView({ calendar, isLoading }: CalendarViewProps) {
  const { month, year, topic, articlesByDay = {}, articles = [] } = calendar;

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const calendarDays = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getArticleForDay = (day: number): Article | undefined => {
    if (articlesByDay[day.toString()]) {
      return articlesByDay[day.toString()];
    }

    return articles.find((article) => {
      const articleDate = new Date(article.scheduledDate);
      return (
        articleDate.getDate() === day &&
        articleDate.getMonth() === month - 1 &&
        articleDate.getFullYear() === year
      );
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading calendar...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {monthNames[month - 1]} {year} - {topic.title}
          </CardTitle>
          {topic.description && (
            <p className="text-sm text-gray-600">{topic.description}</p>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day ? (
                  <DayCard day={day} article={getArticleForDay(day)} />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DayCardProps {
  day: number;
  article?: Article;
}

function DayCard({ day, article }: DayCardProps) {
  return (
    <Card className="w-full h-full min-h-[120px] hover:shadow-md transition-shadow">
      <CardContent className="p-2 h-full flex flex-col">
        <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
        {article ? (
          <div className="flex-1 space-y-2">
            <Badge
              variant={getStatusBadgeVariant(article.status)}
              className="text-xs px-1 py-0 h-5 flex items-center gap-1"
            >
              {getStatusIcon(article.status)}
              {article.status}
            </Badge>

            <p
              className="text-xs text-gray-700 leading-tight overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {article.title}
            </p>
            {article.status === ArticleStatus.COMPLETED && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Ready
              </div>
            )}

            {article.status === ArticleStatus.GENERATING && (
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
            No article
          </div>
        )}
      </CardContent>
    </Card>
  );
}
