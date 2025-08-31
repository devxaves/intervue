import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function award10TokensBadge() {
  const users = await prisma.token.findMany({
    where: { amount: { gte: 10 } },
    select: { userId: true },
  });
  for (const user of users) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: user.userId, badgeId: "badge_10_tokens" } },
      update: {},
      create: { userId: user.userId, badgeId: "badge_10_tokens" },
    });
    console.log(`Awarded 10 Tokens badge to user ${user.userId}`);
  }
  await prisma.$disconnect();
}

award10TokensBadge();