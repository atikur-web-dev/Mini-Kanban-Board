// Frontend/types/board.ts
import { User } from "./auth";
import { Column } from "../types/column";

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  columns: Column[];
  _count?: {
    columns: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardInput {
  name: string;
}

export interface UpdateBoardInput {
  name: string;
}

export interface ShareBoardInput {
  email: string;
}