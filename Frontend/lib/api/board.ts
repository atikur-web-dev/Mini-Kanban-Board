import { api } from "./client";
import {
  Board,
  BoardMember,
  CreateBoardInput,
  ShareBoardInput,
  UpdateBoardInput,
} from "@/types";

export const boardApi = {
  getAll: (): Promise<Board[]> =>
    api.get("/boards"),

  getById: (id: string): Promise<Board> =>
    api.get(`/boards/${id}`),

  create: (data: CreateBoardInput): Promise<Board> =>
    api.post("/boards", data),

  update: (
    id: string,
    data: UpdateBoardInput,
  ): Promise<Board> =>
    api.patch(`/boards/${id}`, data),

  delete: (id: string): Promise<void> =>
    api.delete(`/boards/${id}`),

  share: (
    boardId: string,
    data: ShareBoardInput,
  ): Promise<BoardMember> =>
    api.post(`/boards/${boardId}/share`, data),

  removeMember: (
    boardId: string,
    userId: string,
  ): Promise<void> =>
    api.delete(`/boards/${boardId}/members/${userId}`),

  getMembers: (boardId: string): Promise<BoardMember[]> =>
    api.get(`/boards/${boardId}/members`),
};

export type { BoardMember } from "@/types";