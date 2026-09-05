// Frontend/types/column.ts
import { Task } from "../types/task";

export interface Column {
  id: string;
  name: string;
  boardId: string;
  position: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnInput {
  name: string;
}

export interface UpdateColumnInput {
  name: string;
}