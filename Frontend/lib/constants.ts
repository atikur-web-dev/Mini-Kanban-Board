// Frontend/lib/constants.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const APP_NAME = "Mini Kanban Board";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  BOARD: (id: string) => `/board/${id}`,
} as const;

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;

export const TASK_STATUS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
} as const;