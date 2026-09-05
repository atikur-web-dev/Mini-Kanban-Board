import { Router } from "express";
import { ColumnController } from "../controllers/column.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createColumnSchema,
  updateColumnSchema,
} from "../validators/column.validator.js";

const router = Router();
const columnController = new ColumnController();

router.use(authenticate);

router.post(
  "/",
  validate(createColumnSchema),
  columnController.createColumn.bind(columnController),
);

router.patch(
  "/:columnId",
  validate(updateColumnSchema),
  columnController.updateColumn.bind(columnController),
);

router.delete(
  "/:columnId",
  columnController.deleteColumn.bind(columnController),
);

export default router;