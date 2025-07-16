import { Request, Response } from "express";
import { prisma } from "../db";
import {
  createTopicSchema,
  updateTopicSchema,
  topicIdSchema,
} from "../zod/topicSchema";

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = createTopicSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Invalid inputs",
        error: error.flatten(),
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const topic = await prisma.topic.create({
      data: {
        title: data.title,
        description: data.description,
        userId: parseInt(req.userId),
      },
    });

    res.status(201).json({
      message: "Topic created successfully",
      topic: {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        createdAt: topic.createdAt,
      },
    });
  } catch (err) {
    console.error("Error creating topic:", err);
    res.status(500).json({
      message: "Error creating topic",
      error: err,
    });
  }
};

export const getUserTopics = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const topics = await prisma.topic.findMany({
      where: {
        userId: parseInt(req.userId),
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            calendars: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Topics retrieved successfully",
      topics,
    });
  } catch (err) {
    console.error("Error fetching topics:", err);
    res.status(500).json({
      message: "Error fetching topics",
      error: err,
    });
  }
};

export const getTopicById = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = topicIdSchema.safeParse(req.params);

    if (!success) {
      res.status(400).json({
        message: "Invalid topic ID",
        error: error.flatten(),
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const topic = await prisma.topic.findFirst({
      where: {
        id: data.id,
        userId: parseInt(req.userId),
      },
      include: {
        _count: {
          select: {
            articles: true,
            calendars: true,
          },
        },
      },
    });

    if (!topic) {
      res.status(404).json({
        message: "Topic not found",
      });
      return;
    }

    res.status(200).json({
      message: "Topic retrieved successfully",
      topic,
    });
  } catch (err) {
    console.error("Error fetching topic:", err);
    res.status(500).json({
      message: "Error fetching topic",
      error: err,
    });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const {
      success: paramsSuccess,
      error: paramsError,
      data: paramsData,
    } = topicIdSchema.safeParse(req.params);

    if (!paramsSuccess) {
      res.status(400).json({
        message: "Invalid topic ID",
        error: paramsError.flatten(),
      });
      return;
    }

    const { success, error, data } = updateTopicSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Invalid inputs",
        error: error.flatten(),
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const existingTopic = await prisma.topic.findFirst({
      where: {
        id: paramsData.id,
        userId: parseInt(req.userId),
      },
    });

    if (!existingTopic) {
      res.status(404).json({
        message: "Topic not found",
      });
      return;
    }

    const updatedTopic = await prisma.topic.update({
      where: {
        id: paramsData.id,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
      },
    });

    res.status(200).json({
      message: "Topic updated successfully",
      topic: {
        id: updatedTopic.id,
        title: updatedTopic.title,
        description: updatedTopic.description,
        updatedAt: updatedTopic.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error updating topic:", err);
    res.status(500).json({
      message: "Error updating topic",
      error: err,
    });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { success, error, data } = topicIdSchema.safeParse(req.params);

    if (!success) {
      res.status(400).json({
        message: "Invalid topic ID",
        error: error.flatten(),
      });
      return;
    }

    if (!req.userId) {
      res.status(401).json({
        message: "User not authenticated",
      });
      return;
    }

    const existingTopic = await prisma.topic.findFirst({
      where: {
        id: data.id,
        userId: parseInt(req.userId),
      },
    });

    if (!existingTopic) {
      res.status(404).json({
        message: "Topic not found",
      });
      return;
    }

    await prisma.topic.delete({
      where: {
        id: data.id,
      },
    });

    res.status(200).json({
      message: "Topic deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting topic:", err);
    res.status(500).json({
      message: "Error deleting topic",
      error: err,
    });
  }
};
