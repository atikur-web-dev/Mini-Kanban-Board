// Backend/src/routes/board.routes.ts
import { Router } from "express";
import { BoardController } from "../controllers/board.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { checkBoardAccess, checkBoardOwnership } from "../middleware/boardAuth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { z } from "zod";

const router = Router();
const boardController = new BoardController();

// Validation schemas
const createBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Board name is required"),
  }),
});

const updateBoardSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Board name is required"),
  }),
});

const shareBoardSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

// All routes require authentication
router.use(authenticate);

// Board CRUD
router.get("/", boardController.getBoards.bind(boardController));
router.post(
  "/",
  validate(createBoardSchema),
  boardController.createBoard.bind(boardController)
);

router.get(
  "/:boardId",
  checkBoardAccess,
  boardController.getBoardById.bind(boardController)
);

router.patch(
  "/:boardId",
  validate(updateBoardSchema),
  checkBoardOwnership,
  boardController.updateBoard.bind(boardController)
);

router.delete(
  "/:boardId",
  checkBoardOwnership,
  boardController.deleteBoard.bind(boardController)
);

// Board sharing
router.post(
  "/:boardId/share",
  validate(shareBoardSchema),
  checkBoardOwnership,
  boardController.shareBoard.bind(boardController)
);

router.delete(
  "/:boardId/members/:userId",
  checkBoardOwnership,
  boardController.removeMember.bind(boardController)
);

export default router;