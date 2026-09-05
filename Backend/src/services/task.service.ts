// Backend/src/services/task.service.ts
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export class TaskService {
  async createTask(columnId: string, title: string, description?: string, assigneeId?: string) {
    if (!title || title.trim().length === 0) {
      throw new AppError(400, "Task title is required");
    }

    // Get current max position in column
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.task.create({
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

    return task;
  }

  async updateTask(taskId: string, title?: string, description?: string, assigneeId?: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title?.trim() || task.title,
        description: description !== undefined ? description?.trim() : task.description,
        assigneeId: assigneeId !== undefined ? assigneeId || null : task.assigneeId,
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

    return updatedTask;
  }

  async deleteTask(taskId: string) {
    // Get task info before deleting
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { columnId: true, position: true },
    });

    if (!task) {
      throw new AppError(404, "Task not found");
    }

    // Delete task and reorder remaining tasks
    await prisma.$transaction(async (tx) => {
      // Delete the task
      await tx.task.delete({
        where: { id: taskId },
      });

      // Reorder remaining tasks in the same column
      const remainingTasks = await tx.task.findMany({
        where: { columnId: task.columnId },
        orderBy: { position: "asc" },
      });

      for (let i = 0; i < remainingTasks.length; i++) {
        await tx.task.update({
          where: { id: remainingTasks[i]!.id },
          data: { position: i },
        });
      }
    });
  }

  async moveTask(taskId: string, targetColumnId: string, targetPosition: number) {
    // Get task with column info
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

    // Validate target column exists
    const targetColumn = await prisma.column.findUnique({
      where: { id: targetColumnId },
      select: { id: true, boardId: true },
    });

    if (!targetColumn) {
      throw new AppError(404, "Target column not found");
    }

    // Validate same board
    if (task.column.boardId !== targetColumn.boardId) {
      throw new AppError(400, "Cannot move task to a column in a different board");
    }

    // Validate position
    const tasksInTargetColumn = await prisma.task.findMany({
      where: { columnId: targetColumnId },
      orderBy: { position: "asc" },
      select: { id: true, position: true },
    });

    if (targetPosition < 0 || targetPosition > tasksInTargetColumn.length) {
      throw new AppError(400, "Invalid position");
    }

    // If moving to same column and same position, do nothing
    if (task.columnId === targetColumnId && task.position === targetPosition) {
      return task;
    }

    // Perform move with transaction
    const result = await prisma.$transaction(async (tx) => {
      // If moving within same column
      if (task.columnId === targetColumnId) {
        const oldPosition = task.position;
        const newPosition = targetPosition;

        if (oldPosition < newPosition) {
          // Moving down: shift tasks between old+1 and new up
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
          // Moving up: shift tasks between new and old-1 down
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

        // Update task position
        return await tx.task.update({
          where: { id: taskId },
          data: { position: targetPosition },
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
      } else {
        // Moving to different column
        // Step 1: Remove from old column - shift remaining tasks up
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

        // Step 2: Insert into new column - shift existing tasks down
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

        // Step 3: Update the task
        return await tx.task.update({
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
      }
    });

    return result;
  }

  async getTaskById(taskId: string) {
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

    return task;
  }
}