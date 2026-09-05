import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from "../validators/task.validator.js";

const router = Router({ mergeParams: true });
const taskController = new TaskController();

router.use(authenticate);

router.post(
  "/",
  validate(createTaskSchema),
  taskController.createTask.bind(taskController),
);

router.get(
  "/:taskId",
  taskController.getTaskById.bind(taskController),
);

router.patch(
  "/:taskId",
  validate(updateTaskSchema),
  taskController.updateTask.bind(taskController),
);

router.delete(
  "/:taskId",
  taskController.deleteTask.bind(taskController),
);

router.post(
  "/:taskId/move",
  validate(moveTaskSchema),
  taskController.moveTask.bind(taskController),
);

export default router;