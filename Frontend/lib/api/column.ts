import { api } from "./client";
import {
  Column,
  CreateColumnInput,
  UpdateColumnInput,
} from "@/types";

export const columnApi = {
  create: (
    boardId: string,
    data: CreateColumnInput,
  ): Promise<Column> =>
    api.post(`/boards/${boardId}/columns`, data),

  update: (
    columnId: string,
    data: UpdateColumnInput,
  ): Promise<Column> =>
    api.patch(`/columns/${columnId}`, data),

  delete: (columnId: string): Promise<void> =>
    api.delete(`/columns/${columnId}`),
};