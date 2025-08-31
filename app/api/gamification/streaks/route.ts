import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get current user's streak
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const streak = await prisma.streak.findUnique({ where: { userId } });
  return NextResponse.json({
    count: streak?.count ?? 0,
    lastDate: streak?.lastDate ?? null,
  });
}

// POST: Update streak (increment or reset)
export async function POST(req: NextRequest) {
  const { userId, increment, lastDate } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const streak = await prisma.streak.upsert({
    where: { userId },
    update: { count: increment ? { increment: 1 } : 0, lastDate },
    create: { userId, count: increment ? 1 : 0, lastDate },
  });
  return NextResponse.json({ count: streak.count, lastDate: streak.lastDate });
}
