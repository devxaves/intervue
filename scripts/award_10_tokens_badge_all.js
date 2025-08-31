const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: { userId: user.id, badgeId: "badge_10_tokens" },
      },
      update: {},
      create: { userId: user.id, badgeId: "badge_10_tokens" },
    });
    console.log(`Awarded 10 Tokens badge to user ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
