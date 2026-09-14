import type { Request, Response, NextFunction } from "express";

import { GoogleAuthService } from "../services/google-auth.service.js";
import { AuthService } from "../services/auth.service.js";
import { OAuthCodeService } from "../services/oauth-code.service.js";
import { env } from "../config/env.js";

const googleAuthService = new GoogleAuthService();
const authService = new AuthService();
const oauthCodeService = new OAuthCodeService();

export class GoogleAuthController {
  async startGoogleAuth(_req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationUrl = await googleAuthService.getAuthorizationUrl();

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

      const { state } = req.query;

      if (typeof state !== "string" || !state) {
        throw new Error("Google OAuth state is missing");
      }

      await googleAuthService.verifyState(state);

      const googleUser = await googleAuthService.verifyCode(code);

      const user = await googleAuthService.findOrCreateUser(googleUser);

      const oauthCode = await oauthCodeService.createCode(user.id);

      res.redirect(
        `${env.CORS_ORIGIN}/callback?code=${encodeURIComponent(
          oauthCode,
        )}&provider=google`,
      );
    } catch (error) {
      next(error);
    }
  }

  async exchangeOAuthCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;

      if (typeof code !== "string" || !code) {
        throw new Error("OAuth code is required");
      }

      const user = await oauthCodeService.consumeCode(code);

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
