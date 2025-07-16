"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UpcomingArticles } from "@/components/UpcomingArticles";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/calendar">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Content Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Generate monthly content calendars with AI-powered article
                    titles for your topics.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/articles">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    View your content history and manage generated articles.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Configure your account and generation preferences. Coming
                  soon!
                </p>
              </CardContent>
            </Card>
          </div>

          <UpcomingArticles />

          <Card>
            <CardHeader>
              <CardTitle>
                Welcome to Pivelabs Article Generation Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Get started by creating a content calendar for your topic. Our
                  AI will generate engaging article titles for every day of the
                  month.
                </p>
                <div className="flex gap-4">
                  <Link href="/calendar">
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Calendar
                    </Button>
                  </Link>
                  <Link href="/articles">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Articles
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
