// Backend/src/routes/task.routes.ts
import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { checkBoardAccess } from "../middleware/boardAuth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { z } from "zod";

const router = Router({ mergeParams: true });
const taskController = new TaskController();

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    assigneeId: z.string().uuid().optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title is required").optional(),
    description: z.string().optional(),
    assigneeId: z.string().uuid().optional().nullable(),
  }),
});

const moveTaskSchema = z.object({
  body: z.object({
    targetColumnId: z.string().uuid("Invalid column ID"),
    targetPosition: z.number().int().min(0, "Position must be 0 or greater"),
  }),
});

// All routes require authentication
router.use(authenticate);

// Tasks under a column
router.post(
  "/",
  validate(createTaskSchema),
  checkBoardAccess,
  taskController.createTask.bind(taskController)
);

// Individual task operations
router.get(
  "/:taskId",
  checkBoardAccess,
  taskController.getTaskById.bind(taskController)
);

router.patch(
  "/:taskId",
  validate(updateTaskSchema),
  checkBoardAccess,
  taskController.updateTask.bind(taskController)
);

router.delete(
  "/:taskId",
  checkBoardAccess,
  taskController.deleteTask.bind(taskController)
);

// Task movement
router.post(
  "/:taskId/move",
  validate(moveTaskSchema),
  checkBoardAccess,
  taskController.moveTask.bind(taskController)
);

export default router;