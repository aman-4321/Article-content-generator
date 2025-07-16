"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useArticles } from "@/hooks/useArticles";
import { useTopics } from "@/hooks/useTopics";
import { Article } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ArticlesPage() {
  const {
    contentHistory,
    isLoading,
    error,
    fetchContentHistory,
    fetchArticleById,
  } = useArticles();

  const { topics } = useTopics();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isViewingArticle, setIsViewingArticle] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchContentHistory(currentPage, itemsPerPage, selectedTopicId);
  }, [currentPage, selectedTopicId, fetchContentHistory]);

  const handleTopicFilter = (topicId: string) => {
    const id = topicId === "all" ? undefined : parseInt(topicId);
    setSelectedTopicId(id);
    setCurrentPage(1);
  };

  const handleViewArticle = async (articleId: number) => {
    try {
      const article = await fetchArticleById(articleId);
      if (article) {
        setSelectedArticle(article);
        setIsViewingArticle(true);
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isViewingArticle && selectedArticle) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsViewingArticle(false)}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedArticle.title}
                </h1>
                <p className="text-gray-600">
                  {selectedArticle.topic.title} • Generated on{" "}
                  {selectedArticle.generatedAt
                    ? formatDate(selectedArticle.generatedAt)
                    : "Unknown date"}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: (selectedArticle.content || "").replace(
                      /\n/g,
                      "<br>",
                    ),
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Content History
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your generated articles
              </p>
            </div>
            <Link href="/calendar">
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Statistics */}
          {contentHistory?.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {contentHistory.statistics.totalGenerated}
                  </div>
                  <div className="text-sm text-gray-600">Total Generated</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {contentHistory.statistics.scheduled}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contentHistory.statistics.generating}
                  </div>
                  <div className="text-sm text-gray-600">Generating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {contentHistory.statistics.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Topic</label>
                  <Select onValueChange={handleTopicFilter} defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Articles</CardTitle>
              <CardDescription>
                {contentHistory?.pagination.totalCount || 0} articles found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading articles...</span>
                </div>
              ) : contentHistory?.articles.length === 0 ? (
                <div className="text-center p-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You haven&apos;t generated any articles yet.
                  </p>
                  <Link href="/calendar">
                    <Button>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Create Calendar
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Word Count</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentHistory?.articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{article.title}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {article.contentPreview}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {article.topic.title}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <CalendarIcon className="h-3 w-3" />
                              {formatDate(article.scheduledDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {formatDate(article.generatedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {article.wordCount} words
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewArticle(article.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {contentHistory &&
                    contentHistory.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            currentPage * itemsPerPage,
                            contentHistory.pagination.totalCount,
                          )}{" "}
                          of {contentHistory.pagination.totalCount} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(
                                  contentHistory.pagination.totalPages,
                                  prev + 1,
                                ),
                              )
                            }
                            disabled={
                              currentPage ===
                              contentHistory.pagination.totalPages
                            }
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
