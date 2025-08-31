"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PeerInterviewMeeting from "./PeerInterviewMeeting";

interface PeerInterviewSession {
  id: string;
  participantA: string;
  participantB: string;
  status: string;
}

interface PeerInterviewFormProps {
  userId: string;
}

const PeerInterviewForm = ({ userId }: PeerInterviewFormProps) => {
  const [peerId, setPeerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<PeerInterviewSession[]>([]);
  // Show demo meeting UI by default for hackathon/demo
  const [joining, setJoining] = useState<string | null>("demo-session");
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch(
        `/api/peer-interview/session?userId=${userId}`
      );
      const result = await response.json();
      if (result.success) {
        setSessions(result.sessions || []);
      }
    };
    fetchSessions();
  }, [userId, loading]);

  const handleStartSession = async () => {
    if (!peerId.trim()) {
      toast.error("Please enter a valid Peer User ID.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/peer-interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantA: userId, participantB: peerId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Session created!");
        setPeerId("");
        setSessions((prev) => [result.session, ...prev]);
        setCreatedSessionId(result.session.id);
      } else {
        toast.error(result.error || "Failed to create session");
        console.error("Session creation failed:", result);
      }
    } catch (error) {
      toast.error("Error creating session");
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOpenSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/peer-interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantA: userId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Open session created!");
        setCreatedSessionId(result.session.id);
        setSessions((prev) => [result.session, ...prev]);
      } else {
        toast.error(result.error || "Failed to create open session");
        console.error("Open session creation failed:", result);
      }
    } catch (error) {
      toast.error("Error creating open session");
      console.error("Error creating open session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    // Always show the meeting UI, even if sessionId is not valid
    setJoining(sessionId || "demo-session");
    toast.success(`Joined session ${sessionId || "demo-session"}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-dark-900 overflow-hidden">
      <div className="w-full bg-dark-900 flex flex-col items-center justify-center py-10 px-8 border-b-2 border-dark-700 shadow-lg">
        <h1 className="text-7xl font-extrabold text-white mb-6">
          Peer-to-Peer Interview
        </h1>
        <p className="text-3xl text-blue-200">
          Start or join a peer interview session and practice with real people!
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        {joining ? (
          <PeerInterviewMeeting
            session={{
              id: joining,
              status: "pending",
              userA: { name: "Demo User A" },
            }}
            onEndSession={() => setJoining(null)}
          />
        ) : (
          <div className="bg-dark-800 bg-opacity-95 rounded-3xl shadow-2xl p-12 w-full max-w-2xl flex flex-col items-center">
            <h2 className="text-4xl font-extrabold mb-10 text-center text-white tracking-wide">
              Start a Peer Interview Session
            </h2>
            <input
              type="text"
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              className="input input-bordered w-full mb-6 text-lg px-6 py-4 rounded-xl bg-dark-700 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              placeholder="Enter peer's user ID (optional)"
            />
            <button
              className="btn btn-primary w-full mb-8 py-4 text-xl rounded-xl font-semibold"
              onClick={handleStartOpenSession}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Open Session"}
            </button>
            {createdSessionId && (
              <div className="mb-10 flex flex-col items-center gap-3">
                <span className="text-lg text-white">
                  Session ID:{" "}
                  <span className="font-mono bg-dark-700 px-3 py-2 rounded-lg text-xl">
                    {createdSessionId}
                  </span>
                </span>
                <button
                  className="btn btn-secondary px-4 py-2 text-base rounded-lg font-medium"
                  onClick={() => {
                    navigator.clipboard.writeText(createdSessionId);
                    toast.success("Session ID copied!");
                  }}
                >
                  Copy Session ID
                </button>
                <span className="text-base text-gray-400">
                  Share this ID with your peer to join the session.
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-6 text-white">
              Your Sessions
            </h2>
            <ul className="mb-2 w-full">
              {sessions && sessions.length === 0 && (
                <li
                  key="no-sessions"
                  className="text-gray-400 text-lg text-center"
                >
                  No sessions yet.
                </li>
              )}
              {sessions &&
                sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex justify-between items-center py-4 px-4 mb-4 rounded-xl bg-dark-700 text-white border border-gray-700 text-lg"
                  >
                    <span>
                      <span className="font-semibold">With:</span>{" "}
                      {session.participantA === userId
                        ? session.participantB
                        : session.participantA}{" "}
                      <span className="ml-2 text-base px-3 py-1 rounded bg-blue-900 text-blue-200">
                        {session.status}
                      </span>
                    </span>
                    <button
                      className="btn btn-secondary px-6 py-2 rounded-xl text-lg font-semibold"
                      onClick={() => handleJoinSession(session.id)}
                      disabled={joining === session.id}
                    >
                      {joining === session.id ? "Joined" : "Join"}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <style>{`
      @keyframes gradient-move {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      .animate-gradient-move {
        animation: gradient-move 8s ease-in-out infinite alternate;
      }
    `}</style>
    </div>
  );
};

export default PeerInterviewForm;
