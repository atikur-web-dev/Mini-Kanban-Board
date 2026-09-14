import { api } from "./client";

import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/types";

export const authApi = {
  register: (
    data: RegisterCredentials,
  ): Promise<AuthResponse> =>
    api.post("/auth/register", data),

  login: (
    data: LoginCredentials,
  ): Promise<AuthResponse> =>
    api.post("/auth/login", data),

  exchangeGoogleCode: (
    code: string,
  ): Promise<AuthResponse> =>
    api.post("/auth/google/exchange", { code }),

  exchangeGitHubCode: (
    code: string,
  ): Promise<AuthResponse> =>
    api.post("/auth/github/exchange", { code }),
};