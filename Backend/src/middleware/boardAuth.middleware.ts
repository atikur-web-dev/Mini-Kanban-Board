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
    const rawBoardId = req.params.boardId || req.body.boardId;
    const boardId = Array.isArray(rawBoardId) ? rawBoardId[0] : rawBoardId;

    if (!userId) {
      throw new AppError(401, "Authentication required");
    }

    if (!boardId) {
      throw new AppError(400, "Board ID is required");
    }

    // Check if user has access (owner or member)
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
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

    if (!board) {
      throw new AppError(403, "You don't have access to this board");
    }

    req.body._board = board;
    next();
  } catch (error) {
    next(error);
  }
};

// For checking if user is board owner (for admin operations)
export const checkBoardOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const rawBoardId = req.params.boardId;
    const boardId = Array.isArray(rawBoardId) ? rawBoardId[0] : rawBoardId;

    if (!userId) {
      throw new AppError(401, "Authentication required");
    }

    if (!boardId) {
      throw new AppError(400, "Board ID is required");
    }

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId,
      },
    });

    if (!board) {
      throw new AppError(403, "Only board owner can perform this action");
    }

    req.body._board = board;
    next();
  } catch (error) {
    next(error);
  }
};