import type { Request, Response, NextFunction } from "express";

import { GitHubAuthService } from "../services/github-auth.service.js";
import { AuthService } from "../services/auth.service.js";
import { OAuthCodeService } from "../services/oauth-code.service.js";
import { env } from "../config/env.js";

const githubAuthService = new GitHubAuthService();
const authService = new AuthService();
const oauthCodeService = new OAuthCodeService();

export class GitHubAuthController {
  async startGitHubAuth(_req: Request, res: Response, next: NextFunction) {
    try {
      const authorizationUrl = await githubAuthService.getAuthorizationUrl();

      res.redirect(authorizationUrl);
    } catch (error) {
      next(error);
    }
  }

  async handleGitHubCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;

      if (typeof code !== "string" || !code) {
        throw new Error("GitHub authorization code is missing");
      }

      const { state } = req.query;

      if (typeof state !== "string" || !state) {
        throw new Error("GitHub OAuth state is missing");
      }

      await githubAuthService.verifyState(state);

      const githubUser = await githubAuthService.verifyCode(code);

      const user = await githubAuthService.findOrCreateUser(githubUser);

      const oauthCode = await oauthCodeService.createCode(user.id);

      res.redirect(
        `${env.CORS_ORIGIN}/callback?code=${encodeURIComponent(
          oauthCode,
        )}&provider=github`,
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
