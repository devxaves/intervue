import { NextRequest, NextResponse } from "next/server";
import {
  addPeerInterviewFeedback,
  getPeerInterviewFeedbacks,
} from "@/lib/actions/peerInterview.action";

export async function POST(req: NextRequest) {
  const data = await req.json();
  // data: { sessionId, reviewerId, revieweeId, score, comments }
  const feedback = await addPeerInterviewFeedback(data);
  return NextResponse.json({ success: true, feedback });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing sessionId" },
      { status: 400 }
    );
  }
  const feedbacks = await getPeerInterviewFeedbacks(sessionId);
  return NextResponse.json({ success: true, feedbacks });
}
