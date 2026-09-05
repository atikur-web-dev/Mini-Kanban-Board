import { Router } from "express";
import { ColumnController } from "../controllers/column.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { z } from "zod";

const router = Router();
const columnController = new ColumnController();

const createColumnSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Column name is required"),
  }),
});

const updateColumnSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Column name is required"),
  }),
});

router.use(authenticate);

// Create column
router.post(
  "/",
  validate(createColumnSchema),
  columnController.createColumn.bind(columnController)
);

// Update column
router.patch(
  "/:columnId",
  validate(updateColumnSchema),
  columnController.updateColumn.bind(columnController)
);

// Delete column
router.delete(
  "/:columnId",
  columnController.deleteColumn.bind(columnController)
);

export default router;