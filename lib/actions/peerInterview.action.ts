import { prisma } from "@/lib/prisma";

// Create a new peer interview session
export async function createPeerInterviewSession({
  participantA,
  participantB,
}: {
  participantA: string;
  participantB?: string;
}) {
  return await prisma.peerInterviewSession.create({
    data: {
      participantA,
      ...(participantB ? { participantB } : {}),
      status: "pending",
      userA: { connect: { id: participantA } },
      ...(participantB ? { userB: { connect: { id: participantB } } } : {}),
    },
  });
}

// Create a new peer interview session using raw SQL (workaround for Prisma client validation error)
export async function createPeerInterviewSessionRaw({
  participantA,
  participantB,
}: {
  participantA: string;
  participantB?: string;
}) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const result = await prisma.$queryRaw`\
    INSERT INTO peer_interview_sessions ("id", "createdAt", "updatedAt", "participantA", "participantB", "status")\
    VALUES (\
      ${id},\
      NOW(),\
      NOW(),\
      ${participantA},\
      ${participantB ?? null},\
      'pending'\
    )\
    RETURNING *;\
  `;
  return result;
}

// Get all peer interview sessions for a user
export async function getPeerInterviewSessions(userId?: string) {
  if (!userId) return [];
  return await prisma.peerInterviewSession.findMany({
    where: {
      OR: [{ participantA: userId }, { participantB: userId }],
    },
    orderBy: { createdAt: "desc" },
  });
}

// Add a question to a peer interview session
export async function addPeerInterviewQuestion({
  sessionId,
  question,
  askedBy,
}: {
  sessionId: string;
  question: string;
  askedBy: string;
}) {
  return await prisma.peerInterviewQuestion.create({
    data: {
      sessionId,
      question,
      askedBy,
    },
  });
}

// Get all questions for a peer interview session
export async function getPeerInterviewQuestions(sessionId: string) {
  return await prisma.peerInterviewQuestion.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

// Add feedback to a peer interview session
export async function addPeerInterviewFeedback({
  sessionId,
  reviewerId,
  revieweeId,
  score,
  comments,
}: {
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  score: number;
  comments: string;
}) {
  return await prisma.peerInterviewFeedback.create({
    data: {
      sessionId,
      reviewerId,
      revieweeId,
      score,
      comments,
    },
  });
}

// Get all feedbacks for a peer interview session
export async function getPeerInterviewFeedbacks(sessionId: string) {
  return await prisma.peerInterviewFeedback.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}
