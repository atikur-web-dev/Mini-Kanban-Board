// Backend/src/controllers/column.controller.ts
import type { Response, NextFunction } from "express";
import { ColumnService } from "../services/column.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

const columnService = new ColumnService();

export class ColumnController {
  async createColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const { name } = req.body;

      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const column = await columnService.createColumn(boardId, name);
      res.status(201).json(column);
    } catch (error) {
      next(error);
    }
  }

  async updateColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;
      const { name } = req.body;

      if (!columnId || typeof columnId !== 'string') {
        return res.status(400).json({ error: "Invalid column ID" });
      }

      const column = await columnService.updateColumn(columnId, name);
      res.status(200).json(column);
    } catch (error) {
      next(error);
    }
  }

  async deleteColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { columnId } = req.params;

      if (!columnId || typeof columnId !== 'string') {
        return res.status(400).json({ error: "Invalid column ID" });
      }

      await columnService.deleteColumn(columnId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}