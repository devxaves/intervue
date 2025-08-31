import PeerInterviewSession from "@/components/PeerInterviewSession";
import { getCurrentUser } from "@/lib/actions/auth.action";

const SessionPage = async ({ params }: { params: { id: string } }) => {
  const user = await getCurrentUser();
  const sessionId = params.id;

  return <PeerInterviewSession userId={user?.id!} sessionId={sessionId} />;
};

export default SessionPage;
