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

  console.log("Cleaning existing users...");
  await prisma.user.deleteMany({});

  console.log("Creating users...");
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log("Seeding complete!");
  console.log("Created " + users.length + " users");
  console.log("\nUsers created:");
  users.forEach((u) => console.log("   - " + u.name + " (" + u.email + ")"));
  console.log("\nAll passwords: password123");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });