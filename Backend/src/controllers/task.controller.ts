// Backend/src/controllers/task.controller.ts
import type { Response, NextFunction } from "express";
import { TaskService } from "../services/task.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const taskService = new TaskService();

export class TaskController {
  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;
      const { title, description, assigneeId } = req.body;

      if (!columnId || typeof columnId !== 'string') {
        return res.status(400).json({ error: "Invalid column ID" });
      }

      const task = await taskService.createTask(columnId, title, description, assigneeId);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { title, description, assigneeId } = req.body;

      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const task = await taskService.updateTask(taskId, title, description, assigneeId);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    await taskService.deleteTask(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
}

  async moveTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { targetColumnId, targetPosition } = req.body;

      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      if (!targetColumnId || typeof targetColumnId !== 'string') {
        return res.status(400).json({ error: "Target column ID is required" });
      }

      if (targetPosition === undefined || typeof targetPosition !== 'number') {
        return res.status(400).json({ error: "Target position is required and must be a number" });
      }

      const task = await taskService.moveTask(taskId, targetColumnId, targetPosition);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const task = await taskService.getTaskById(taskId);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
}