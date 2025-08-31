import { getCurrentUser } from "@/lib/actions/auth.action";
import PeerInterviewForm from "@/components/PeerInterviewForm";

const PeerInterviewPage = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Peer-to-Peer Interview</h1>
        <p className="text-gray-600 mt-2">
          Start or join a peer interview session and practice with real people!
        </p>
      </div>
      <PeerInterviewForm userId={user?.id!} />
    </div>
  );
};

export default PeerInterviewPage;
