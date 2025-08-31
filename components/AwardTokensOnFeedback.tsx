"use client";
import { useEffect } from "react";

interface AwardTokensProps {
  userId: string;
  interviewId: string;
}

export default function AwardTokensOnFeedback({
  userId,
  interviewId,
}: AwardTokensProps) {
  useEffect(() => {
    // Only award tokens and update streak once per interview
    const key = `tokens_awarded_${interviewId}`;
    if (typeof window !== "undefined" && !localStorage.getItem(key)) {
      // Award tokens
      fetch("/api/gamification/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: 10 }),
      });
      // Update streak
      fetch("/api/gamification/streaks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, increment: true, lastDate: new Date().toISOString() }),
      });
      localStorage.setItem(key, "true");
    }
  }, [userId, interviewId]);
  return null;
}
