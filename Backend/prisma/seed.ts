import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Test User",
      email: "test@example.com",
      passwordHash,
    },
    {
      name: "Alinur",
      email: "alinur@gmail.com",
      passwordHash,
    },
    {
      name: "Atikur Rahman",
      email: "atikurrahman@gmail.com",
      passwordHash,
    },
    {
      name: "Rahim Khan",
      email: "rahim@gmail.com",
      passwordHash,
    },
    {
      name: "Karim Mia",
      email: "karim@gmail.com",
      passwordHash,
    },
    {
      name: "Sonia Akter",
      email: "sonia@gmail.com",
      passwordHash,
    },
    {
      name: "Rafiq Islam",
      email: "rafiq@gmail.com",
      passwordHash,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
  }

  console.log("Seeding complete!");
  console.log(`Created or updated ${users.length} users`);
  console.log("All passwords: password123");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });