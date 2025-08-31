import { NextRequest, NextResponse } from "next/server";
import {
  addPeerInterviewQuestion,
  getPeerInterviewQuestions,
} from "@/lib/actions/peerInterview.action";

export async function POST(req: NextRequest) {
  const data = await req.json();
  // data: { sessionId, question, askedBy }
  const question = await addPeerInterviewQuestion(data);
  return NextResponse.json({ success: true, question });
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
  const questions = await getPeerInterviewQuestions(sessionId);
  return NextResponse.json({ success: true, questions });
}
