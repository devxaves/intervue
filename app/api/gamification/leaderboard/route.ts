import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Top 10 users by tokens (weekly/monthly)
export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") || "week";
  const since = new Date();
  if (period === "week") since.setDate(since.getDate() - 7);
  else since.setMonth(since.getMonth() - 1);
  // Get users with most tokens updated in period
  const top = await prisma.token.findMany({
    where: { updatedAt: { gte: since } },
    orderBy: { amount: "desc" },
    take: 10,
    include: { user: true },
  });
  return NextResponse.json(
    top.map((t: any) => ({
      userId: t.userId,
      name: t.user.name,
      amount: t.amount,
      updatedAt: t.updatedAt,
    }))
  );
}
