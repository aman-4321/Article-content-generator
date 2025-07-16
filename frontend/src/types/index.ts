export interface User {
  id: number;
  email: string;
  name: string;
}

export interface UserProfile extends User {
  createdAt: string;
}

export interface Topic {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
    calendars: number;
  };
}

export interface Article {
  id: number;
  title: string;
  content?: string;
  status: ArticleStatus;
  scheduledDate: string;
  generatedAt?: string;
  hasContent: boolean;
  contentPreview?: string;
  topic: {
    id: number;
    title: string;
    description?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export enum ArticleStatus {
  SCHEDULED = "SCHEDULED",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface Calendar {
  id: number;
  month: number;
  year: number;
  topic: {
    id: number;
    title: string;
    description?: string;
  };
  articleCount?: number;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export interface SigninFormData {
  email: string;
  password: string;
}
