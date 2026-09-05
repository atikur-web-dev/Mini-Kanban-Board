// Backend/src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import type { RegisterBody, LoginBody } from "../validators/auth.validator.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request<{}, {}, LoginBody>, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}