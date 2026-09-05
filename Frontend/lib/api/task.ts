import { api } from "./client";
import { Task, CreateTaskInput, UpdateTaskInput, MoveTaskInput } from "@/types";

export const taskApi = {
  create: (columnId: string, data: CreateTaskInput): Promise<Task> =>
    api.post(`/columns/${columnId}/tasks`, data),
  
  update: (taskId: string, data: UpdateTaskInput): Promise<Task> =>
    api.patch(`/tasks/${taskId}`, data),
  
  delete: (taskId: string): Promise<void> => api.delete(`/tasks/${taskId}`),
  
  move: (taskId: string, data: MoveTaskInput): Promise<Task> =>
    api.post(`/tasks/${taskId}/move`, data),
  
  getById: (taskId: string): Promise<Task> => api.get(`/tasks/${taskId}`),
};