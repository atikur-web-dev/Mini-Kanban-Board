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
  // 👇 এই middleware টা skip করুন অথবা modify করুন
  // checkBoardAccess,  // Comment this out temporarily
  taskController.createTask.bind(taskController)
);

// Individual task operations
router.get(
  "/:taskId",
  // checkBoardAccess,  // Comment this out
  taskController.getTaskById.bind(taskController)
);

router.patch(
  "/:taskId",
  validate(updateTaskSchema),
  // checkBoardAccess,  // Comment this out
  taskController.updateTask.bind(taskController)
);

router.delete(
  "/:taskId",
  // checkBoardAccess,  // Comment this out
  taskController.deleteTask.bind(taskController)
);

// Task movement
router.post(
  "/:taskId/move",
  validate(moveTaskSchema),
  // checkBoardAccess,  // Comment this out
  taskController.moveTask.bind(taskController)
);

export default router;