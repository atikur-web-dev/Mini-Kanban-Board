// Backend/src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { GoogleAuthController } from "../controllers/google-auth.controller.js";

const router = Router();
const authController = new AuthController();
const googleAuthController = new GoogleAuthController();

router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

router.get(
  "/google",
  googleAuthController.startGoogleAuth.bind(googleAuthController)
);

router.get(
  "/google/callback",
  googleAuthController.handleGoogleCallback.bind(googleAuthController)
);

export default router;