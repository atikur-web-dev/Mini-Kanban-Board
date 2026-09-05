import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/appError.js";

export class BoardService {
  async createBoard(userId: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError(400, "Board name is required");
    }

    return prisma.board.create({
      data: {
        name: name.trim(),
        ownerId: userId,
        columns: {
          create: [
            { name: "To Do", position: 0 },
            { name: "In Progress", position: 1 },
            { name: "Done", position: 2 },
          ],
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
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
  }

  async getUserBoards(userId: string) {
    return prisma.board.findMany({
      where: {
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
        _count: {
          select: {
            columns: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getBoardById(boardId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
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
      throw new AppError(404, "Board not found");
    }

    return board;
  }

  async updateBoard(boardId: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new AppError(400, "Board name is required");
    }

    return prisma.board.update({
      where: { id: boardId },
      data: {
        name: name.trim(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteBoard(boardId: string) {
    await prisma.board.delete({
      where: { id: boardId },
    });
  }

  async shareBoard(boardId: string, userEmail: string) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new AppError(404, "User not found with this email");
    }

    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new AppError(400, "Board already shared with this user");
    }

    return prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getBoardMembers(boardId: string) {
    return prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async removeMember(boardId: string, userId: string) {
    const member = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (!member) {
      throw new AppError(404, "Member not found");
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });
  }
}