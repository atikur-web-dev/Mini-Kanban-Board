import { z } from "zod";

export const createColumnSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Column name is required"),
  }),
});

export const updateColumnSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Column name is required"),
  }),
});