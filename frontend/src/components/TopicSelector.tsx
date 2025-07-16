"use client";

import { useState } from "react";
import { useTopics } from "@/hooks/useTopics";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Loader2 } from "lucide-react";
import { Topic } from "@/types";

interface TopicSelectorProps {
  onTopicSelect: (topic: Topic) => void;
  selectedTopic?: Topic | null;
}

export function TopicSelector({
  onTopicSelect,
  selectedTopic,
}: TopicSelectorProps) {
  const { topics, isLoading, error, createTopic } = useTopics();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const newTopic = await createTopic({
        title: newTopicTitle,
        description: newTopicDescription || undefined,
      });

      if (newTopic) {
        onTopicSelect(newTopic);
        setShowCreateForm(false);
        setNewTopicTitle("");
        setNewTopicDescription("");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setCreateError(
          error.response?.data?.message || "Failed to create topic"
        );
      } else {
        setCreateError("Failed to create topic");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    const topic = topics.find((t) => t.id === parseInt(topicId));
    if (topic) {
      onTopicSelect(topic);
    }
  };

  if (isLoading && topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading topics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select or Create Topic</CardTitle>
        <CardDescription>
          Choose an existing topic or create a new one to generate your content
          calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {topics.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="topic-select">Select Existing Topic</Label>
            <Select
              onValueChange={handleTopicSelect}
              value={selectedTopic?.id.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic..." />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id.toString()}>
                    <div>
                      <div className="font-medium">{topic.title}</div>
                      {topic.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {topic.description}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 border-t"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t"></div>
        </div>

        {!showCreateForm ? (
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Topic
          </Button>
        ) : (
          <form onSubmit={handleCreateTopic} className="space-y-4">
            {createError && (
              <Alert variant="destructive">
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Topic Title *</Label>
              <Input
                id="title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="e.g., Pet Training"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                placeholder="Brief description of your topic..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isCreating || !newTopicTitle.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Topic"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError("");
                  setNewTopicTitle("");
                  setNewTopicDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
