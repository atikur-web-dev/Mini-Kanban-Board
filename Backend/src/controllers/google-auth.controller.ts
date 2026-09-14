// Backend/src/controllers/google-auth.controller.ts
import type { Request, Response, NextFunction } from "express";
import { GoogleAuthService } from "../services/google-auth.service.js";
import { AuthService } from "../services/auth.service.js";

const googleAuthService = new GoogleAuthService();
const authService = new AuthService();

export class GoogleAuthController {
  startGoogleAuth(_req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationUrl = googleAuthService.getAuthorizationUrl();

      res.redirect(authorizationUrl);
    } catch (error) {
      next(error);
    }
  }
  async handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;

      if (typeof code !== "string" || !code) {
        throw new Error("Google authorization code is missing");
      }

      const googleUser = await googleAuthService.verifyCode(code);
      const user = await googleAuthService.findOrCreateUser(googleUser);
      const token = authService.generateToken(user.id);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}
