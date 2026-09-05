// Backend/src/services/column.service.ts
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export class ColumnService {
  async createColumn(boardId: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError(400, "Column name is required");
    }

    // Get current max position
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastColumn ? lastColumn.position + 1 : 0;

    const column = await prisma.column.create({
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

    return column;
  }

  async updateColumn(columnId: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError(400, "Column name is required");
    }

    const column = await prisma.column.update({
      where: { id: columnId },
      data: { name: name.trim() },
      include: {
        tasks: {
          orderBy: { position: "asc" },
        },
      },
    });

    return column;
  }

  async deleteColumn(columnId: string) {
    // Get column info before deleting
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true, position: true },
    });

    if (!column) {
      throw new AppError(404, "Column not found");
    }

    // Delete column and reorder remaining columns
    await prisma.$transaction(async (tx) => {
      // Delete the column (tasks will be cascade deleted)
      await tx.column.delete({
        where: { id: columnId },
      });

      // Reorder remaining columns
      const remainingColumns = await tx.column.findMany({
        where: { boardId: column.boardId },
        orderBy: { position: "asc" },
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