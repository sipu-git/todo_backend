import type { Request, Response } from "express";
import TaskModel from "../models/task.model";
import jwt from "jsonwebtoken";
import type{JwtPayload} from 'jsonwebtoken'

const extractUserIdFromCookie = (req: Request): string | null => {
  const token = req.cookies?.token;
  if (!token) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded.id as string;
  } catch {
    return null;
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated!" });
    }

    const { title, description, status, dueDate, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required!" });
    }

    const newTask = new TaskModel({
      title,
      description,
      status,
      dueDate,
      priority,
      user: userId,
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      message: "Task created successfully!",
      task: savedTask,
    });
  } catch (error: any) {
    console.error("Error creating task:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const viewTasks = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated!" });
    }

    const findTasks = await TaskModel.find({ user: userId });

    if (!findTasks || findTasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user!" });
    }

    return res.status(200).json({
      message: "Tasks retrieved successfully!",
      tasks: findTasks,
    });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const viewTaskById = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated!" });
    }

    const { id } = req.params;
    const task = await TaskModel.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    return res.status(200).json({
      message: "Task retrieved successfully!",
      task,
    });
  } catch (error: any) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const editTask = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated!" });
    }

    const { id } = req.params;
    const { title, description, status, dueDate, priority } = req.body;

    const task = await TaskModel.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;

    const updatedTask = await task.save();

    return res.status(200).json({
      message: "Task updated successfully!",
      task: updatedTask,
    });
  } catch (error: any) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated!" });
    }

    const { id } = req.params;

    const deletedTask = await TaskModel.findOneAndDelete({ _id: id, user: userId });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found or already deleted!" });
    }

    return res.status(200).json({
      message: "Task deleted successfully!",
      deletedTask,
    });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
