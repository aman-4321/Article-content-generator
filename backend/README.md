# Article Generation on Autopilot - API Documentation

A powerful **MarkTech platform** that automates SEO-rich article generation using AI. Built for developers, solo founders, and marketing teams to solve Go-To-Market (GTM) problems.

## 🚀 Features

- **🤖 AI-Powered Content**: Google Gemini AI integration for high-quality article generation
- **📅 Calendar Generation**: Auto-generate monthly content calendars with AI-powered article titles
- **⏰ Background Jobs**: Automated content generation at 12:00 PM IST daily
- **📊 Content Management**: Complete article lifecycle management with status tracking
- **🔐 User Authentication**: Secure JWT-based authentication system
- **🚀 RESTful API**: Clean, well-documented API endpoints

## 🏗️ Database Schema

```
User (1) -----> (Many) Topic (1) -----> (Many) Calendar (1) -----> (Many) Article
     \                                                                      /
      \__________________________________________________________________/
                              User also owns Articles directly
```

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL database
- pnpm package manager

## ⚡ Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env file

# Set up database
npx prisma migrate dev --name init_article_platform

# Start development server
npm run dev

# Test Gemini AI integration
curl -X GET http://localhost:8080/api/v1/articles/test-gemini \
  -H "Cookie: token=your-jwt-token"
```

### 🔑 Getting Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and add it to your `.env` file as `GEMINI_API_KEY`

## 🔐 Authentication

All protected routes require a JWT token stored in HTTP-only cookies. Authenticate first using the signup/signin endpoints.

---

## 📖 API Endpoints

### Base URL: `/api/v1`

---

## 👤 User Authentication

### POST `/user/signup` - Create Account

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "User Created Successfully",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### POST `/user/signin` - Login

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Logged in successfully",
  "userId": 1,
  "email": "john@example.com"
}
```

### POST `/user/logout` - Logout

**Request:** No body required

**Response:**

```json
{
  "message": "Logged out Successfully"
}
```

---

## 📝 Topics Management

### POST `/topics` - Create Topic

**Request:**

```json
{
  "title": "Pet Training",
  "description": "Comprehensive guide on training dogs and cats"
}
```

**Response:**

```json
{
  "message": "Topic created successfully",
  "topic": {
    "id": 1,
    "title": "Pet Training",
    "description": "Comprehensive guide on training dogs and cats",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET `/topics` - Get All User Topics

**Response:**

```json
{
  "message": "Topics retrieved successfully",
  "topics": [
    {
      "id": 1,
      "title": "Pet Training",
      "description": "Comprehensive guide on training dogs and cats",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "_count": {
        "articles": 31,
        "calendars": 1
      }
    }
  ]
}
```

### GET `/topics/:id` - Get Topic by ID

**Response:**

```json
{
  "message": "Topic retrieved successfully",
  "topic": {
    "id": 1,
    "title": "Pet Training",
    "description": "Comprehensive guide on training dogs and cats",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "_count": {
      "articles": 31,
      "calendars": 1
    }
  }
}
```

### PUT `/topics/:id` - Update Topic

**Request:**

```json
{
  "title": "Advanced Pet Training",
  "description": "Advanced techniques for training pets"
}
```

**Response:**

```json
{
  "message": "Topic updated successfully",
  "topic": {
    "id": 1,
    "title": "Advanced Pet Training",
    "description": "Advanced techniques for training pets",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### DELETE `/topics/:id` - Delete Topic

**Response:**

```json
{
  "message": "Topic deleted successfully"
}
```

---

## 📅 Calendar Management

### POST `/calendar/generate` - Generate Monthly Calendar

**Request:**

```json
{
  "topicId": 1,
  "month": 1,
  "year": 2024
}
```

**Response:**

```json
{
  "message": "Calendar generated successfully",
  "calendar": {
    "id": 1,
    "month": 1,
    "year": 2024,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "topic": {
      "id": 1,
      "title": "Pet Training",
      "description": "Comprehensive guide on training dogs and cats"
    },
    "articles": [
      {
        "id": 1,
        "title": "The Ultimate Guide to dog",
        "scheduledDate": "2024-01-01T17:00:00.000Z",
        "status": "SCHEDULED",
        "generatedAt": null
      },
      {
        "id": 2,
        "title": "10 Essential Tips for cat",
        "scheduledDate": "2024-01-02T17:00:00.000Z",
        "status": "SCHEDULED",
        "generatedAt": null
      }
      // ... 29 more articles for each day of January
    ]
  }
}
```

### GET `/calendar/:topicId/:month/:year` - Get Calendar

**Response:**

```json
{
  "message": "Calendar retrieved successfully",
  "calendar": {
    "id": 1,
    "month": 1,
    "year": 2024,
    "topic": {
      "id": 1,
      "title": "Pet Training",
      "description": "Comprehensive guide on training dogs and cats"
    },
    "articlesByDay": {
      "1": {
        "id": 1,
        "title": "The Ultimate Guide to dog",
        "status": "COMPLETED",
        "generatedAt": "2024-01-01T17:05:00.000Z",
        "hasContent": true,
        "scheduledTime": "2024-01-01T17:00:00.000Z"
      },
      "2": {
        "id": 2,
        "title": "10 Essential Tips for cat",
        "status": "SCHEDULED",
        "generatedAt": null,
        "hasContent": false,
        "scheduledTime": "2024-01-02T17:00:00.000Z"
      }
      // ... articles for all days of the month
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET `/calendar` - Get All User Calendars

**Response:**

```json
{
  "message": "Calendars retrieved successfully",
  "calendars": [
    {
      "id": 1,
      "month": 1,
      "year": 2024,
      "topic": {
        "id": 1,
        "title": "Pet Training",
        "description": "Comprehensive guide on training dogs and cats"
      },
      "articleCount": 31,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### DELETE `/calendar/:topicId/:month/:year` - Delete Calendar

**Response:**

```json
{
  "message": "Calendar deleted successfully"
}
```

---

## 📰 Articles Management

### GET `/articles` - Get Articles with Filters

**Query Parameters:**

- `status` (optional): `SCHEDULED` | `GENERATING` | `COMPLETED` | `FAILED`
- `topicId` (optional): Filter by topic ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:** `GET /articles?status=COMPLETED&topicId=1&page=1&limit=5`

**Response:**

```json
{
  "message": "Articles retrieved successfully",
  "articles": [
    {
      "id": 1,
      "title": "The Ultimate Guide to dog",
      "status": "COMPLETED",
      "scheduledDate": "2024-01-01T17:00:00.000Z",
      "generatedAt": "2024-01-01T17:05:00.000Z",
      "hasContent": true,
      "contentPreview": "The Ultimate Guide to dog is an essential aspect of Pet Training that many people overlook. In this comprehensive guide, we'll explore the key concepts, best practices, and actionable strategies...",
      "topic": {
        "id": 1,
        "title": "Pet Training",
        "description": "Comprehensive guide on training dogs and cats"
      },
      "createdAt": "2024-01-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 7,
    "totalCount": 31,
    "limit": 5
  }
}
```

### GET `/articles/:id` - Get Article by ID

**Response:**

```json
{
  "message": "Article retrieved successfully",
  "article": {
    "id": 1,
    "title": "The Ultimate Guide to dog",
    "content": "# The Ultimate Guide to dog\n\nThe Ultimate Guide to dog is an essential aspect of Pet Training that many people overlook...",
    "status": "COMPLETED",
    "scheduledDate": "2024-01-01T17:00:00.000Z",
    "generatedAt": "2024-01-01T17:05:00.000Z",
    "topic": {
      "id": 1,
      "title": "Pet Training",
      "description": "Comprehensive guide on training dogs and cats"
    },
    "calendar": {
      "id": 1,
      "month": 1,
      "year": 2024
    },
    "createdAt": "2024-01-01T10:30:00.000Z",
    "updatedAt": "2024-01-01T17:05:00.000Z"
  }
}
```

### PUT `/articles/:id` - Update Article

**Request:**

```json
{
  "title": "Updated: The Ultimate Guide to Dog Training",
  "content": "# Updated: The Ultimate Guide to Dog Training\n\nThis is the updated content..."
}
```

**Response:**

```json
{
  "message": "Article updated successfully",
  "article": {
    "id": 1,
    "title": "Updated: The Ultimate Guide to Dog Training",
    "content": "# Updated: The Ultimate Guide to Dog Training\n\nThis is the updated content...",
    "status": "COMPLETED",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### POST `/articles/:id/generate` - Manually Generate Content

**Request:** No body required

**Response:**

```json
{
  "message": "Content generation started successfully",
  "articleId": 1
}
```

### GET `/articles/history` - Get Content History

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `topicId` (optional): Filter by topic ID

**Response:**

```json
{
  "message": "Content history retrieved successfully",
  "articles": [
    {
      "id": 1,
      "title": "The Ultimate Guide to dog",
      "scheduledDate": "2024-01-01T17:00:00.000Z",
      "generatedAt": "2024-01-01T17:05:00.000Z",
      "wordCount": 847,
      "contentPreview": "The Ultimate Guide to dog is an essential aspect of Pet Training that many people overlook. In this comprehensive guide...",
      "topic": {
        "id": 1,
        "title": "Pet Training"
      },
      "createdAt": "2024-01-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 15,
    "limit": 20
  },
  "statistics": {
    "totalGenerated": 15,
    "scheduled": 10,
    "generating": 2,
    "failed": 1
  }
}
```

### GET `/articles/upcoming` - Get Upcoming Articles

**Response:**

```json
{
  "message": "Upcoming articles retrieved successfully",
  "upcoming": [
    {
      "id": 2,
      "title": "10 Essential Tips for cat",
      "scheduledDate": "2024-01-02T17:00:00.000Z",
      "status": "SCHEDULED",
      "topic": {
        "id": 1,
        "title": "Pet Training"
      },
      "daysFromNow": 1
    }
  ],
  "today": [
    {
      "id": 1,
      "title": "The Ultimate Guide to dog",
      "scheduledDate": "2024-01-01T17:00:00.000Z",
      "status": "GENERATING",
      "topic": {
        "id": 1,
        "title": "Pet Training"
      }
    }
  ]
}
```

### GET `/articles/stats` - Get Generation Statistics

**Response:**

```json
{
  "message": "Generation statistics retrieved successfully",
  "stats": {
    "total": 31,
    "byStatus": {
      "COMPLETED": 15,
      "SCHEDULED": 10,
      "GENERATING": 2,
      "FAILED": 4
    },
    "completedToday": 3
  }
}
```

### GET `/articles/test-gemini` - Test Gemini AI Integration

**Response (Success):**

```json
{
  "message": "Gemini content generation test successful",
  "article": {
    "title": "The Ultimate Guide to Content Marketing",
    "wordCount": 642,
    "estimatedReadTime": 4,
    "seoKeywords": ["content", "marketing", "digital"],
    "contentPreview": "# The Ultimate Guide to Content Marketing\n\nContent marketing has become one of the most powerful strategies for businesses looking to connect with their audience..."
  },
  "success": true
}
```

**Response (Error):**

```json
{
  "message": "Gemini generation test failed",
  "error": "Gemini API key is invalid or not configured. Please check your GEMINI_API_KEY environment variable.",
  "success": false
}
```

---

## 🏥 Health Check

### GET `/health` - Server Health Check

**Response:**

```json
{
  "status": "ok"
}
```

---

## 🤖 Background Jobs

The system automatically runs background jobs:

### Daily Article Generation (12:00 PM IST)

- Automatically generates content for all articles scheduled for today
- Updates article status from `SCHEDULED` → `GENERATING` → `COMPLETED`/`FAILED`
- Processes articles sequentially to avoid overwhelming AI services

### Weekly Cleanup (Sunday 2:00 AM UTC)

- Performs maintenance and cleanup operations
- Can be extended with archiving, reporting, etc.

---

## 📊 Article Status Flow

```
SCHEDULED → GENERATING → COMPLETED
                    ↘
                     FAILED
```

- **SCHEDULED**: Article is created and waiting for generation
- **GENERATING**: Content generation is in progress
- **COMPLETED**: Article content has been successfully generated
- **FAILED**: Content generation failed (can be retried)

---

## 🚦 Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (user exists, wrong password)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pivelabs"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=8080
NODE_ENV="development"

# Frontend (for CORS)
FRONTEND_URL="http://localhost:3000"
COOKIE_DOMAIN="localhost"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"

# Alternative AI (optional)
OPENAI_API_KEY="your-openai-api-key"
```

---

## 🤖 AI Content Generation

The platform uses **Google Gemini AI** to generate high-quality, SEO-optimized articles:

### **Content Generation Process**

1. **Title Analysis**: AI analyzes the article title and topic context
2. **SEO Optimization**: Generates content with proper heading structure (H1, H2, H3)
3. **Quality Content**: Creates 800+ word articles with actionable insights
4. **Markdown Formatting**: Outputs properly formatted content with lists and emphasis
5. **Fallback System**: If Gemini fails, uses template-based content generation

### **AI Features**

- **Smart Prompting**: Comprehensive prompts for professional content
- **Error Handling**: Graceful fallback when API limits are reached
- **Content Validation**: Ensures generated content meets quality standards
- **Metadata Extraction**: Automatically calculates word count, read time, and SEO keywords

### **Testing AI Integration**

```bash
# Test the AI connection
curl -X GET http://localhost:8080/api/v1/articles/test-gemini \
  -H "Cookie: token=your-jwt-token"

# This will generate a test article and verify the Gemini API works
```

---

## 🎯 Next Steps for Production

1. **Enhanced AI**: Fine-tune prompts for specific niches and industries
2. **Email Notifications**: Notify users when articles are generated
3. **Social Media**: Auto-post generated articles to social platforms
4. **Analytics**: Track article performance and engagement
5. **Team Features**: Multi-user workspaces and collaboration

---

**Built with ❤️ for Pivelabs MarkTech Platform**
