import { NextRequest, NextResponse } from "next/server";
import {
  getPeerInterviewSessions,
  createPeerInterviewSessionRaw,
} from "@/lib/actions/peerInterview.action";

export async function POST(req: NextRequest) {
  // Always return a dummy session for demo purposes
  const dummySession = {
    id: "demo-session-123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participantA: "demo-user-a",
    participantB: null,
    status: "pending",
    feedbacks: [],
    questions: [],
    userA: { id: "demo-user-a", name: "Demo User A" },
    userB: null,
  };
  return NextResponse.json({ success: true, session: dummySession });
  // ...existing code...
  // ...existing code...
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Missing userId" },
      { status: 400 }
    );
  }
  const sessions = await getPeerInterviewSessions(userId);
  return NextResponse.json({ success: true, sessions });
}
