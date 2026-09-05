// Backend/src/middleware/boardAuth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";
import type { AuthRequest } from "./auth.middleware.js";

export const checkBoardAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const boardId = req.params.boardId;

    console.log("Checking access for board:", boardId, "User:", userId);

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!boardId) {
      return res.status(400).json({ error: "Board ID is required" });
    }

    // ✅ Fix: Ensure boardId is string
    const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
    
    if (!boardIdStr) {
      return res.status(400).json({ error: "Invalid board ID" });
    }

    // Check if user has access (owner or member)
    const board = await prisma.board.findFirst({
      where: {
        id: boardIdStr,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
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
            },
          },
        },
      },
    });

    console.log("Board found:", board ? "Yes" : "No");

    if (!board) {
      return res.status(403).json({ error: "You don't have access to this board" });
    }

    // Fix: Check if req.body exists, if not create it
    if (!req.body) {
      req.body = {};
    }
    req.body._board = board;
    next();
  } catch (error) {
    console.error("Board access error:", error);
    next(error);
  }
};

export const checkBoardOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const boardId = req.params.boardId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!boardId) {
      return res.status(400).json({ error: "Board ID is required" });
    }

    // ✅ Fix: Ensure boardId is string
    const boardIdStr = Array.isArray(boardId) ? boardId[0] : boardId;
    
    if (!boardIdStr) {
      return res.status(400).json({ error: "Invalid board ID" });
    }

    const board = await prisma.board.findFirst({
      where: {
        id: boardIdStr,
        ownerId: userId,
      },
    });

    if (!board) {
      return res.status(403).json({ error: "Only board owner can perform this action" });
    }

    // Fix: Check if req.body exists, if not create it
    if (!req.body) {
      req.body = {};
    }
    req.body._board = board;
    next();
  } catch (error) {
    console.error("Board ownership error:", error);
    next(error);
  }
};