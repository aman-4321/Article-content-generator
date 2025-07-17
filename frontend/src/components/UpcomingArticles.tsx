"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useArticles } from "@/hooks/useArticles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  FileText,
  Loader2,
  ArrowRight,
  Zap,
  Eye,
} from "lucide-react";
import Link from "next/link";

export function UpcomingArticles() {
  const router = useRouter();
  const {
    upcomingArticles,
    isLoading,
    fetchUpcomingArticles,
    generateArticleContent,
  } = useArticles();
  const [generatingArticles, setGeneratingArticles] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchUpcomingArticles();
  }, [fetchUpcomingArticles]);

  const handleGenerateNow = async (articleId: number) => {
    try {
      setGeneratingArticles((prev) => new Set(prev).add(articleId));

      const response = await generateArticleContent(articleId);

      if (response) {
        await fetchUpcomingArticles();
      }
    } catch (error) {
      console.error("Failed to generate article:", error);
    } finally {
      setGeneratingArticles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  const handleViewArticle = (articleId: number) => {
    router.push(`/articles?viewArticle=${articleId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
      hour12: true,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "GENERATING":
        return "secondary";
      case "SCHEDULED":
        return "outline";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <FileText className="h-3 w-3" />;
      case "GENERATING":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "SCHEDULED":
        return <Clock className="h-3 w-3" />;
      case "FAILED":
        return <span className="text-red-500">!</span>;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading upcoming articles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasUpcoming =
    upcomingArticles &&
    (upcomingArticles.upcoming.length > 0 || upcomingArticles.today.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Articles
          </CardTitle>
          <Link href="/articles">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!hasUpcoming ? (
          <div className="text-center p-6">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming articles
            </h3>
            <p className="text-gray-600 mb-4">
              Create a content calendar to start generating articles.
            </p>
            <Link href="/calendar">
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Create Calendar
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingArticles.today.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Today&apos;s Articles ({upcomingArticles.today.length})
                </h4>
                <div className="space-y-2">
                  {upcomingArticles.today.slice(0, 3).map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {article.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {article.topic.title} •{" "}
                          {formatDate(article.scheduledDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {article.status === "SCHEDULED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateNow(article.id)}
                            disabled={generatingArticles.has(article.id)}
                            className="text-xs h-7"
                          >
                            {generatingArticles.has(article.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3" />
                            )}
                            <span className="ml-1">
                              {generatingArticles.has(article.id)
                                ? "Generating..."
                                : "Generate Now"}
                            </span>
                          </Button>
                        )}
                        {article.status === "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleViewArticle(article.id)}
                            className="text-xs h-7"
                          >
                            <Eye className="h-3 w-3" />
                            <span className="ml-1">View Article</span>
                          </Button>
                        )}
                        <Badge
                          variant={getStatusBadgeVariant(article.status)}
                          className="text-xs flex items-center gap-1"
                        >
                          {getStatusIcon(article.status)}
                          {article.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingArticles.upcoming.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Next 7 Days ({upcomingArticles.upcoming.length})
                </h4>
                <div className="space-y-2">
                  {upcomingArticles.upcoming.slice(0, 5).map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {article.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {article.topic.title} • in {article.daysFromNow} day
                          {article.daysFromNow !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {article.status === "SCHEDULED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateNow(article.id)}
                            disabled={generatingArticles.has(article.id)}
                            className="text-xs h-7"
                          >
                            {generatingArticles.has(article.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3" />
                            )}
                            <span className="ml-1">
                              {generatingArticles.has(article.id)
                                ? "Generating..."
                                : "Generate Now"}
                            </span>
                          </Button>
                        )}
                        {article.status === "COMPLETED" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleViewArticle(article.id)}
                            className="text-xs h-7"
                          >
                            <Eye className="h-3 w-3" />
                            <span className="ml-1">View Article</span>
                          </Button>
                        )}
                        <Badge
                          variant={getStatusBadgeVariant(article.status)}
                          className="text-xs flex items-center gap-1"
                        >
                          {getStatusIcon(article.status)}
                          {article.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
