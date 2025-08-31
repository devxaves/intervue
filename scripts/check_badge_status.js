const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Check if 10 Tokens badge exists
  const badge = await prisma.badge.findUnique({
    where: { id: "badge_10_tokens" },
  });
  if (!badge) {
    console.log("10 Tokens badge does NOT exist in badges table.");
  } else {
    console.log("10 Tokens badge exists:", badge);
  }

  // Check if demo user has the badge
  const user = await prisma.user.findUnique({
    where: { email: "student@example.com" },
  });
  if (!user) {
    console.log("Demo user does NOT exist.");
    return;
  }
  const userBadge = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId: user.id, badgeId: "badge_10_tokens" } },
  });
  if (!userBadge) {
    console.log("Demo user does NOT have the 10 Tokens badge.");
  } else {
    console.log("Demo user HAS the 10 Tokens badge:", userBadge);
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
