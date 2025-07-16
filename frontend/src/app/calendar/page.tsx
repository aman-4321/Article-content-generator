"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TopicSelector } from "@/components/TopicSelector";
import { CalendarView } from "@/components/CalendarView";
import { useCalendar } from "@/hooks/useCalendar";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  Loader2,
  FileText,
  Link,
} from "lucide-react";
import { Topic } from "@/types";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

export default function CalendarPage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [showCalendar, setShowCalendar] = useState(false);

  const { currentCalendar, isLoading, error, generateCalendar, fetchCalendar } =
    useCalendar();

  const handleGenerateCalendar = async () => {
    if (!selectedTopic) return;

    try {
      await fetchCalendar(selectedTopic.id, selectedMonth, selectedYear);
      setShowCalendar(true);
    } catch {
      try {
        await generateCalendar({
          topicId: selectedTopic.id,
          month: selectedMonth,
          year: selectedYear,
        });
        setShowCalendar(true);
      } catch (generateError) {
        console.error("Failed to generate calendar:", generateError);
      }
    }
  };

  const handleBackToSetup = () => {
    setShowCalendar(false);
  };

  const isSetupComplete = selectedTopic && selectedMonth && selectedYear;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-8 w-8" />
                Content Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                Generate and manage your monthly content calendar
              </p>
            </div>

            <div className="flex gap-2">
              {showCalendar && (
                <Button onClick={handleBackToSetup} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Setup
                </Button>
              )}
              <Link href="/articles">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Articles
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showCalendar ? (
            <div className="space-y-6">
              {/* Topic Selection */}
              <TopicSelector
                onTopicSelect={setSelectedTopic}
                selectedTopic={selectedTopic}
              />

              {selectedTopic && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Month and Year</CardTitle>
                    <CardDescription>
                      Choose the month and year for your content calendar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Month</label>
                        <Select
                          value={selectedMonth.toString()}
                          onValueChange={(value) =>
                            setSelectedMonth(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem
                                key={month.value}
                                value={month.value.toString()}
                              >
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <Select
                          value={selectedYear.toString()}
                          onValueChange={(value) =>
                            setSelectedYear(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isSetupComplete && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Ready to Generate Calendar
                        </h3>
                        <p className="text-gray-600">
                          Topic:{" "}
                          <span className="font-medium">
                            {selectedTopic.title}
                          </span>{" "}
                          | Period:{" "}
                          <span className="font-medium">
                            {
                              months.find((m) => m.value === selectedMonth)
                                ?.label
                            }{" "}
                            {selectedYear}
                          </span>
                        </p>
                      </div>

                      <Button
                        onClick={handleGenerateCalendar}
                        disabled={isLoading}
                        size="lg"
                        className="px-8"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Calendar...
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Generate Calendar
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500">
                        This will create article titles for every day of the
                        month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Calendar View */
            currentCalendar && (
              <CalendarView calendar={currentCalendar} isLoading={isLoading} />
            )
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
