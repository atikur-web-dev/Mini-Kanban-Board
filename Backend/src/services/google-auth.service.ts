// Backend/src/services/google-auth.service.ts
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import crypto from "node:crypto";

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

export class GoogleAuthService {
  getAuthorizationUrl(): string {
    const state = crypto.randomBytes(32).toString("hex");
    return googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      state,
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
