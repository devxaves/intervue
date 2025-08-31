import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get current user's token count
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const token = await prisma.token.findUnique({ where: { userId } });
  return NextResponse.json({ amount: token?.amount ?? 0 });
}

// POST: Add tokens to user
export async function POST(req: NextRequest) {
  const { userId, amount } = await req.json();
  if (!userId || typeof amount !== "number")
    return NextResponse.json(
      { error: "Missing userId or amount" },
      { status: 400 }
    );
  const token = await prisma.token.upsert({
    where: { userId },
    update: { amount: { increment: amount } },
    create: { userId, amount },
  });

  // BADGE LOGIC: Award badges for 10 and 50 tokens
  if (token.amount >= 10) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: 'badge_10_tokens' } },
      update: {},
      create: { userId, badgeId: 'badge_10_tokens' },
    });
  }
  if (token.amount >= 50) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: 'badge_50_tokens' } },
      update: {},
      create: { userId, badgeId: 'badge_50_tokens' },
    });
  }

  return NextResponse.json({ amount: token.amount });
}
