import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get all badges for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });
  return NextResponse.json(
    userBadges.map((ub: any) => ({
      badgeId: ub.badgeId,
      name: ub.badge.name,
      imageUrl: ub.badge.imageUrl,
      description: ub.badge.description,
      awardedAt: ub.awardedAt,
    }))
  );
}

// POST: Award badge to user
export async function POST(req: NextRequest) {
  const { userId, badgeId } = await req.json();
  if (!userId || !badgeId)
    return NextResponse.json(
      { error: "Missing userId or badgeId" },
      { status: 400 }
    );
  const userBadge = await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    update: {},
    create: { userId, badgeId },
  });
  return NextResponse.json({
    badgeId: userBadge.badgeId,
    awardedAt: userBadge.awardedAt,
  });
}
