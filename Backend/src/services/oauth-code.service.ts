import crypto from "node:crypto";

import { prisma } from "../lib/prisma.js";

export class OAuthCodeService {
  async createCode(userId: string): Promise<string> {
    const code = crypto.randomBytes(32).toString("hex");

    const codeHash = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    await prisma.oAuthCode.create({
      data: {
        codeHash,
        userId,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    });

    return code;
  }

  async consumeCode(code: string) {
    const codeHash = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const oauthCode = await prisma.oAuthCode.findUnique({
      where: {
        codeHash,
      },
    });

    if (!oauthCode) {
      throw new Error("Invalid OAuth code");
    }

    if (oauthCode.expiresAt < new Date()) {
      await prisma.oAuthCode.delete({
        where: {
          id: oauthCode.id,
        },
      });

      throw new Error("OAuth code has expired");
    }

    if (oauthCode.usedAt) {
      throw new Error("OAuth code has already been used");
    }

    const consumed = await prisma.oAuthCode.updateMany({
      where: {
        id: oauthCode.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      throw new Error("OAuth code has already been used");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: oauthCode.userId,
      },
    });

    if (!user) {
      throw new Error("OAuth user not found");
    }

    return user;
  }
}