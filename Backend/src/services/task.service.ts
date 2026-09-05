import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export class TaskService {
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

  async createTask(
    columnId: string,
    userId: string,
    title: string,
    description?: string,
    assigneeId?: string,
  ) {
    if (!title || title.trim().length === 0) {
      throw new AppError(400, "Task title is required");
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

    if (assigneeId) {
      const assignee = await prisma.boardMember.findFirst({
        where: {
          boardId: column.boardId,
          userId: assigneeId,
        },
      });

      const board = await prisma.board.findFirst({
        where: {
          id: column.boardId,
          ownerId: assigneeId,
        },
        select: { id: true },
      });

      if (!assignee && !board) {
        throw new AppError(400, "Assignee does not have access to this board");
      }
    }

    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    return prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? null,
        position: newPosition,
        columnId,
        ...(assigneeId ? { assigneeId } : {}),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: {
          include: {
            board: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateTask(
    taskId: string,
    userId: string,
    title?: string,
    description?: string,
    assigneeId?: string | null,
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    await this.checkBoardAccess(task.column.boardId, userId);

    if (assigneeId) {
      const assignee = await prisma.boardMember.findFirst({
        where: {
          boardId: task.column.boardId,
          userId: assigneeId,
        },
      });

      const board = await prisma.board.findFirst({
        where: {
          id: task.column.boardId,
          ownerId: assigneeId,
        },
        select: { id: true },
      });

      if (!assignee && !board) {
        throw new AppError(400, "Assignee does not have access to this board");
      }
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        title: title?.trim() || task.title,
        description:
          description !== undefined
            ? description?.trim() ?? null
            : task.description,
        assigneeId:
          assigneeId !== undefined
            ? assigneeId || null
            : task.assigneeId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: {
          include: {
            board: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        columnId: true,
        position: true,
        column: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    await this.checkBoardAccess(task.column.boardId, userId);

    await prisma.$transaction(async (tx) => {
      await tx.task.delete({
        where: { id: taskId },
      });

      const remainingTasks = await tx.task.findMany({
        where: { columnId: task.columnId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      for (let i = 0; i < remainingTasks.length; i++) {
        await tx.task.update({
          where: { id: remainingTasks[i]!.id },
          data: { position: i },
        });
      }
    });
  }

  async moveTask(
    taskId: string,
    userId: string,
    targetColumnId: string,
    targetPosition: number,
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            id: true,
            boardId: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    await this.checkBoardAccess(task.column.boardId, userId);

    const targetColumn = await prisma.column.findUnique({
      where: { id: targetColumnId },
      select: {
        id: true,
        boardId: true,
      },
    });

    if (!targetColumn) {
      throw new AppError(404, "Target column not found");
    }

    if (task.column.boardId !== targetColumn.boardId) {
      throw new AppError(
        400,
        "Cannot move task to a column in a different board",
      );
    }

    const tasksInTargetColumn = await prisma.task.findMany({
      where: { columnId: targetColumnId },
      orderBy: { position: "asc" },
      select: {
        id: true,
        position: true,
      },
    });

    if (
      targetPosition < 0 ||
      targetPosition > tasksInTargetColumn.length
    ) {
      throw new AppError(400, "Invalid position");
    }

    if (
      task.columnId === targetColumnId &&
      task.position === targetPosition
    ) {
      return task;
    }

    return prisma.$transaction(async (tx) => {
      if (task.columnId === targetColumnId) {
        const oldPosition = task.position;
        const newPosition = targetPosition;

        if (oldPosition < newPosition) {
          await tx.task.updateMany({
            where: {
              columnId: targetColumnId,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        } else if (oldPosition > newPosition) {
          await tx.task.updateMany({
            where: {
              columnId: targetColumnId,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        }

        return tx.task.update({
          where: { id: taskId },
          data: {
            position: targetPosition,
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            column: {
              include: {
                board: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
      }

      await tx.task.updateMany({
        where: {
          columnId: task.columnId,
          position: {
            gt: task.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      await tx.task.updateMany({
        where: {
          columnId: targetColumnId,
          position: {
            gte: targetPosition,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });

      return tx.task.update({
        where: { id: taskId },
        data: {
          columnId: targetColumnId,
          position: targetPosition,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          column: {
            include: {
              board: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: {
          include: {
            board: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    await this.checkBoardAccess(task.column.board.id, userId);

    return task;
  }
}