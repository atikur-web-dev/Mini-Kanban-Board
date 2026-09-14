// Backend/src/services/github-auth.service.ts
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export class GitHubAuthService {
  async getAuthorizationUrl(): Promise<string> {
    const state = crypto.randomBytes(32).toString("hex");

    await prisma.oAuthState.create({
      data: {
        state,
        provider: "github",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_CALLBACK_URL,
      scope: "read:user user:email",
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async verifyState(state: string): Promise<void> {
    const oauthState = await prisma.oAuthState.findUnique({
      where: {
        state,
      },
    });

    if (!oauthState) {
      throw new Error("Invalid GitHub OAuth state");
    }

    if (oauthState.provider !== "github") {
      throw new Error("Invalid OAuth provider");
    }

    if (oauthState.expiresAt < new Date()) {
      await prisma.oAuthState.delete({
        where: {
          id: oauthState.id,
        },
      });

      throw new Error("GitHub OAuth state has expired");
    }

    await prisma.oAuthState.delete({
      where: {
        id: oauthState.id,
      },
    });
  }

  async verifyCode(code: string) {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_CALLBACK_URL,
        }),
      },
    );

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description ?? "Failed to get GitHub access token",
      );
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get GitHub user information");
    }

    const githubUser = (await userResponse.json()) as {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
    };

    let email = githubUser.email;

    if (!email) {
      const emailResponse = await fetch(
        "https://api.github.com/user/emails",
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      if (!emailResponse.ok) {
        throw new Error("Failed to get GitHub email information");
      }

      const emails = (await emailResponse.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;

      const primaryEmail = emails.find(
        (item) => item.primary && item.verified,
      );

      if (!primaryEmail) {
        throw new Error("No verified GitHub email found");
      }

      email = primaryEmail.email;
    }

    return {
      providerAccountId: String(githubUser.id),
      email,
      name: githubUser.name ?? githubUser.login,
    };
  }

    async findOrCreateUser(githubUser: {
    providerAccountId: string;
    email: string;
    name: string;
  }) {
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "github",
          providerAccountId: githubUser.providerAccountId,
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
        email: githubUser.email,
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
              provider: "github",
              providerAccountId: githubUser.providerAccountId,
            },
          },
        },
      });
    }

    return prisma.user.create({
      data: {
        name: githubUser.name,
        email: githubUser.email,
        oauthAccounts: {
          create: {
            provider: "github",
            providerAccountId: githubUser.providerAccountId,
          },
        },
      },
    });
  }
}
