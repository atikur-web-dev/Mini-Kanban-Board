import type { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "./auth.middleware.js";

export const checkBoardAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const boardId = req.params.boardId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!boardId || typeof boardId !== "string") {
      return res.status(400).json({
        error: "Invalid board ID",
      });
    }

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
          orderBy: {
            position: "asc",
          },
          include: {
            tasks: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    if (!board) {
      return res.status(403).json({
        error: "You don't have access to this board",
      });
    }

    req.board = board;

    next();
  } catch (error) {
    next(error);
  }
};

export const checkBoardOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const boardId = req.params.boardId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!boardId || typeof boardId !== "string") {
      return res.status(400).json({
        error: "Invalid board ID",
      });
    }

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        ownerId: userId,
      },
    });

    if (!board) {
      return res.status(403).json({
        error: "Only board owner can perform this action",
      });
    }

    req.board = board;

    next();
  } catch (error) {
    next(error);
  }
};