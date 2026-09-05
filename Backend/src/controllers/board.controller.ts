import type { Request, Response, NextFunction } from "express";
import { BoardService } from "../services/board.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";

const boardService = new BoardService();

export class BoardController {
  async createBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name } = req.body;

      const board = await boardService.createBoard(userId, name);
      res.status(201).json(board);
    } catch (error) {
      next(error);
    }
  }

  async getBoards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const boards = await boardService.getUserBoards(userId);
      res.status(200).json(boards);
    } catch (error) {
      next(error);
    }
  }

  async getBoardById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      
      const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
      
      if (!boardIdStr || typeof boardIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const board = await prisma.board.findFirst({
        where: {
          id: boardIdStr,
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          columns: {
            orderBy: { position: "asc" },
            include: {
              tasks: {
                orderBy: { position: "asc" },
                include: {
                  assignee: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!board) {
        return res.status(404).json({ error: "Board not found or you don't have access" });
      }

      res.status(200).json(board);
    } catch (error) {
      console.error("Error fetching board:", error);
      next(error);
    }
  }

  async updateBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const { name } = req.body;

      const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
      
      if (!boardIdStr || typeof boardIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const board = await boardService.updateBoard(boardIdStr, name);
      res.status(200).json(board);
    } catch (error) {
      next(error);
    }
  }

  async deleteBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;

      const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
      
      if (!boardIdStr || typeof boardIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      await boardService.deleteBoard(boardIdStr);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ✅ Share Board - Make sure this exists
  async shareBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const { email } = req.body;

      console.log("Share board called:", { boardId, email }); // Debug log

      const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
      
      if (!boardIdStr || typeof boardIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const member = await boardService.shareBoard(boardIdStr, email);
      res.status(201).json(member);
    } catch (error: any) {
      console.error("Share board error:", error);
      next(error);
    }
  }

  // ✅ Get Board Members
  async getBoardMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      
      const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
      
      if (!boardIdStr || typeof boardIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const members = await boardService.getBoardMembers(boardIdStr);
      res.status(200).json(members);
    } catch (error) {
      console.error("Get members error:", error);
      next(error);
    }
  }

  // ✅ Remove Member
  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId, userId } = req.params;

      const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      
      if (!boardIdStr || typeof boardIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      if (!userIdStr || typeof userIdStr !== 'string') {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      await boardService.removeMember(boardIdStr, userIdStr);
      res.status(204).send();
    } catch (error) {
      console.error("Remove member error:", error);
      next(error);
    }
  }
}