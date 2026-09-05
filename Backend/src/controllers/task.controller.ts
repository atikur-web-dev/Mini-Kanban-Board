import type { NextFunction, Response } from "express";
import { TaskService } from "../services/task.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const taskService = new TaskService();

export class TaskController {
  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;
      const { title, description, assigneeId } = req.body;

      if (!columnId || typeof columnId !== "string") {
        return res.status(400).json({ error: "Invalid column ID" });
      }

      const userId = req.user!.id;

      const task = await taskService.createTask(
        columnId,
        userId,
        title,
        description,
        assigneeId,
      );

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { title, description, assigneeId } = req.body;

      if (!taskId || typeof taskId !== "string") {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const userId = req.user!.id;

      const task = await taskService.updateTask(
        taskId,
        userId,
        title,
        description,
        assigneeId,
      );

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      if (!taskId || typeof taskId !== "string") {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const userId = req.user!.id;

      await taskService.deleteTask(taskId, userId);

      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async moveTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const { targetColumnId, targetPosition } = req.body;

      if (!taskId || typeof taskId !== "string") {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const userId = req.user!.id;

      const task = await taskService.moveTask(
        taskId,
        userId,
        targetColumnId,
        targetPosition,
      );

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      if (!taskId || typeof taskId !== "string") {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const userId = req.user!.id;

      const task = await taskService.getTaskById(taskId, userId);

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }
}