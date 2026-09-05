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

// 👇 IMPORTANT: Specific routes MUST come before dynamic routes
// Get board members
router.get(
  "/:boardId/members",
  checkBoardAccess,
  boardController.getBoardMembers.bind(boardController)
);

// Share board
router.post(
  "/:boardId/share",
  validate(shareBoardSchema),
  checkBoardOwnership,
  boardController.shareBoard.bind(boardController)
);

// Remove member
router.delete(
  "/:boardId/members/:userId",
  checkBoardOwnership,
  boardController.removeMember.bind(boardController)
);

// Board CRUD with ID (dynamic routes - MUST come last)
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

export default router;