import type { Request, Response, NextFunction } from "express";
import { BoardService } from "../services/board.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

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
      
      // Type check
      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }
      
      const board = await boardService.getBoardById(boardId);
      res.status(200).json(board);
    } catch (error) {
      next(error);
    }
  }

  async updateBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const { name } = req.body;

      // Type check
      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const board = await boardService.updateBoard(boardId, name);
      res.status(200).json(board);
    } catch (error) {
      next(error);
    }
  }

  async deleteBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;

      // Type check
      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      await boardService.deleteBoard(boardId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async shareBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId } = req.params;
      const { email } = req.body;

      // Type check
      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      const member = await boardService.shareBoard(boardId, email);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boardId, userId } = req.params;

      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: "Invalid board ID" });
      }

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      await boardService.removeMember(boardId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}