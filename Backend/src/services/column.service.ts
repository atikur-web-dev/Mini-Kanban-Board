import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export class ColumnService {
  private async checkBoardAccess(boardId: string, userId: string) {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!board) {
      throw new AppError(403, "You don't have access to this board");
    }
  }

  async createColumn(
    boardId: string,
    userId: string,
    name: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new AppError(400, "Column name is required");
    }

    await this.checkBoardAccess(boardId, userId);

    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastColumn ? lastColumn.position + 1 : 0;

    return prisma.column.create({
      data: {
        name: name.trim(),
        position: newPosition,
        boardId,
      },
      include: {
        tasks: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  async updateColumn(
    columnId: string,
    userId: string,
    name: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new AppError(400, "Column name is required");
    }

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: {
        id: true,
        boardId: true,
      },
    });

    if (!column) {
      throw new AppError(404, "Column not found");
    }

    await this.checkBoardAccess(column.boardId, userId);

    return prisma.column.update({
      where: { id: columnId },
      data: {
        name: name.trim(),
      },
      include: {
        tasks: {
          orderBy: { position: "asc" },
        },
      },
    });
  }

  async deleteColumn(
    columnId: string,
    userId: string,
  ) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: {
        id: true,
        boardId: true,
        position: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!column) {
      throw new AppError(404, "Column not found");
    }

    await this.checkBoardAccess(column.boardId, userId);

    if (column._count.tasks > 0) {
      throw new AppError(
        400,
        "Cannot delete column with tasks. Delete all tasks first.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.column.delete({
        where: { id: columnId },
      });

      const remainingColumns = await tx.column.findMany({
        where: { boardId: column.boardId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      for (let i = 0; i < remainingColumns.length; i++) {
        await tx.column.update({
          where: { id: remainingColumns[i]!.id },
          data: { position: i },
        });
      }
    });
  }
}