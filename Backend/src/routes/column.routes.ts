// Backend/src/routes/column.routes.ts
import { Router } from "express";
import { ColumnController } from "../controllers/column.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { checkBoardAccess } from "../middleware/boardAuth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { z } from "zod";

const router = Router({ mergeParams: true });
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

// All routes require authentication
router.use(authenticate);

router.post(
  "/",
  validate(createColumnSchema),
  checkBoardAccess,
  columnController.createColumn.bind(columnController)
);

router.patch(
  "/:columnId",
  validate(updateColumnSchema),
  checkBoardAccess,
  columnController.updateColumn.bind(columnController)
);

router.delete(
  "/:columnId",
  checkBoardAccess,
  columnController.deleteColumn.bind(columnController)
);

export default router;