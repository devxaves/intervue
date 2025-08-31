import PeerInterviewMeeting from "./PeerInterviewMeeting";

interface PeerInterviewSessionProps {
  userId: string;
  sessionId: string;
}

const PeerInterviewSession = ({
  userId,
  sessionId,
}: PeerInterviewSessionProps) => {
  // For demo, just show PeerInterviewMeeting with mock data
  return (
    <PeerInterviewMeeting
      session={{
        id: sessionId,
        status: "pending",
        userA: { name: "Demo User" },
      }}
      onEndSession={() => {}}
    />
  );
};

export default PeerInterviewSession;
