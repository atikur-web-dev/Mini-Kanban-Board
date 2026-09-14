// Backend/src/services/google-auth.service.ts
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

export class GoogleAuthService {
  async getAuthorizationUrl(): Promise<string> {
    const state = crypto.randomBytes(32).toString("hex");

    await prisma.oAuthState.create({
      data: {
        state,
        provider: "google",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      state,
    });
  }

  async verifyState(state: string): Promise<void> {
    const oauthState = await prisma.oAuthState.findUnique({
      where: {
        state,
      },
    });

    if (!oauthState) {
      throw new Error("Invalid Google OAuth state");
    }

    if (oauthState.provider !== "google") {
      throw new Error("Invalid OAuth provider");
    }

    if (oauthState.expiresAt < new Date()) {
      await prisma.oAuthState.delete({
        where: {
          id: oauthState.id,
        },
      });

      throw new Error("Google OAuth state has expired");
    }

    await prisma.oAuthState.delete({
      where: {
        id: oauthState.id,
      },
    });
  }

  async verifyCode(code: string) {
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      throw new Error("Google did not return an ID token");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new Error("Invalid Google account information");
    }

    return {
      providerAccountId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email.split("@")[0]!,
    };
  }

  async findOrCreateUser(googleUser: {
    providerAccountId: string;
    email: string;
    name: string;
  }) {
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUser.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      return existingAccount.user;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (existingUser) {
      return prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          oauthAccounts: {
            create: {
              provider: "google",
              providerAccountId: googleUser.providerAccountId,
            },
          },
        },
      });
    }

    return prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        oauthAccounts: {
          create: {
            provider: "google",
            providerAccountId: googleUser.providerAccountId,
          },
        },
      },
    });
  }
}
