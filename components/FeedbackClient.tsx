"use client";
import AwardTokensOnFeedback from "@/components/AwardTokensOnFeedback";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface FeedbackClientProps {
  userId: string;
  interviewId: string;
  interviewRole: string;
  feedback: any;
}

export default function FeedbackClient({ userId, interviewId, interviewRole, feedback }: FeedbackClientProps) {
  return (
    <>
      <AwardTokensOnFeedback userId={userId} interviewId={interviewId} />
      <section className="section-feedback">
        <div className="flex flex-row justify-center">
          <h1 className="text-4xl font-semibold">
            Feedback on the Interview -{" "}
            <span className="capitalize">{interviewRole}</span> Interview
          </h1>
        </div>
        <div className="flex flex-row text-black justify-center ">
          <div className="flex text-black flex-row gap-5">
            {/* Overall Impression */}
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p className="text-black">
                Overall Impression: <span className="text-primary-200 font-bold">{feedback?.totalScore}</span>/100
              </p>
            </div>
            {/* Date */}
            <div className="flex flex-row gap-2 text-black">
              <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
              <p className="text-black">{feedback?.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A") : "N/A"}</p>
            </div>
          </div>
        </div>
        <hr />
        <p className="text-black">{feedback?.finalAssessment}</p>
        {/* Interview Breakdown */}
        <div className="flex flex-col text-black gap-4">
          <h2 className="text-black">Breakdown of the Interview:</h2>
          {feedback?.categoryScores?.map((category: any, index: number) => (
            <div key={index} className="text-black">
              <p className="font-bold text-black">
                {index + 1}. {category.name} ({category.score}/100)
              </p>
              <p className="text-black">{category.comment}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-black">Strengths</h3>
          <ul>
            {feedback?.strengths?.map((strength: string, index: number) => (
              <li key={index} className="text-black" >{strength}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-black">Areas for Improvement</h3>
          <ul>
            {feedback?.areasForImprovement?.map((area: string, index: number) => (
              <li key={index} className="text-black">{area}</li>
            ))}
          </ul>
        </div>
        <div className="buttons">
          <Button className="btn-secondary flex-1">
            <Link href="/" className="flex w-full justify-center">
              <p className="text-sm font-semibold text-primary-200 text-center">Back to dashboard</p>
            </Link>
          </Button>
          <Button className="btn-primary flex-1">
            <Link href={`/interview/${interviewId}`} className="flex w-full justify-center">
              <p className="text-sm font-semibold text-black text-center">Retake Interview</p>
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
