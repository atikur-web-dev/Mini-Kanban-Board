// Backend/src/validators/task.validator.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    assigneeId: z.string().uuid().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required").optional(),
    description: z.string().optional(),
    assigneeId: z.string().uuid().optional().nullable(),
  }),
});

export const moveTaskSchema = z.object({
  body: z.object({
    targetColumnId: z.string().uuid("Invalid column ID"),
    targetPosition: z
      .number()
      .int()
      .min(0, "Position must be 0 or greater"),
  }),
});