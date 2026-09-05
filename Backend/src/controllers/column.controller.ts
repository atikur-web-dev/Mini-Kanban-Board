import type { Response, NextFunction } from "express";
import { ColumnService } from "../services/column.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

const columnService = new ColumnService();

export class ColumnController {
  async createColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const { name } = req.body;

      if (!boardId || typeof boardId !== "string") {
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

      if (!columnId || typeof columnId !== "string") {
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

      if (!columnId || typeof columnId !== "string") {
        return res.status(400).json({ error: "Invalid column ID" });
      }

      // Check if column exists
      const column = await prisma.column.findUnique({
        where: { id: columnId },
        include: {
          board: {
            include: {
              members: true,
            },
          },
          tasks: true,
        },
      });

      if (!column) {
        return res.status(404).json({ error: "Column not found" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const isOwner = column.board.ownerId === userId;
      const isMember = column.board.members.some(
        (m: { userId: string }) => m.userId === userId,
      );

      if (!isOwner && !isMember) {
        return res
          .status(403)
          .json({ error: "You don't have access to this column" });
      }

      // Check if column has tasks
      if (column.tasks && column.tasks.length > 0) {
        return res.status(400).json({
          error: "Cannot delete column with tasks. Delete all tasks first.",
        });
      }

      // Delete column
      await prisma.column.delete({
        where: { id: columnId },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Delete column error:", error);
      next(error);
    }
  }
}
