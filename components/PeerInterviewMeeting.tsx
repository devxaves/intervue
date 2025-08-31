"use client";

import React, { useState, useRef, useEffect } from "react";

type Session = {
  id: string;
  status: string;
  userA: { name: string };
};

interface PeerInterviewMeetingProps {
  session: Session;
  onEndSession?: () => void;
}

export default function PeerInterviewMeeting({
  session,
  onEndSession,
}: PeerInterviewMeetingProps) {
  // Voice chat demo state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Idle");
  const localStreamRef = useRef<MediaStream | null>(null);

  // Start/Stop voice (demo, local only)
  const handleStartVoice = async () => {
    setVoiceStatus("Connecting...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setVoiceActive(true);
      setVoiceStatus("Voice Connected (Demo)");
    } catch (err) {
      setVoiceStatus("Microphone access denied");
    }
  };
  const handleStopVoice = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setVoiceActive(false);
    setVoiceStatus("Idle");
  };
  const [peerJoined, setPeerJoined] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<number[]>([]);
  const [messages, setMessages] = useState([
    { sender: "You", text: "Hi! Ready for the interview?" },
    { sender: "Peer", text: "Yes, let's start!" },
  ]);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const demoQuestions = [
    "Tell me about yourself.",
    "What is your greatest strength?",
    "Describe a challenging project you worked on.",
    "How do you handle feedback?",
    "Why do you want this role?",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (peerJoined) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [peerJoined]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: "You", text: input }]);
      setInput("");
    }
  };

  const handleAsk = (idx: number) => {
    setAskedQuestions([...askedQuestions, idx]);
    setMessages([...messages, { sender: "You", text: demoQuestions[idx] }]);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl shadow-2xl bg-dark-800 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/user-avatar.png"
            alt="You"
            className="w-10 h-10 rounded-full border-2 border-blue-500"
          />
          <span className="font-bold">{session.userA.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="/user-avatar.png"
            alt="Peer"
            className="w-10 h-10 rounded-full border-2 border-green-500"
          />
          <span className="font-bold">
            {peerJoined ? "Demo User B" : "Waiting..."}
          </span>
        </div>
        <div className="px-3 py-1 rounded bg-dark-700 text-xs font-mono">
          {formatTime(timer)}
        </div>
      </div>
      <div className="mb-2">
        <strong>Session ID:</strong>{" "}
        <span className="font-mono">{session.id}</span>
      </div>
      <div className="mb-2">
        <strong>Status:</strong>{" "}
        <span className="capitalize">{session.status}</span>
      </div>
      {!peerJoined ? (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setPeerJoined(true)}
        >
          Simulate Peer Join
        </button>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 mt-6 w-full items-stretch justify-center min-h-[60vh]">
          <div className="bg-dark-700 rounded-3xl p-8 shadow-2xl flex flex-col w-full md:w-1/2 max-w-2xl min-h-[60vh] justify-between">
            <h3 className="text-2xl font-bold mb-6">Questions to Ask</h3>
            <ul className="flex-1 flex flex-col gap-4">
              {demoQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-dark-800 rounded-xl px-5 py-4 text-lg font-medium shadow border border-dark-900"
                >
                  <span
                    className={
                      askedQuestions.includes(idx)
                        ? "line-through text-gray-400"
                        : "text-white"
                    }
                  >
                    {q}
                  </span>
                  {!askedQuestions.includes(idx) && (
                    <button
                      className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-base font-semibold hover:bg-blue-700 transition"
                      onClick={() => handleAsk(idx)}
                    >
                      Ask
                    </button>
                  )}
                  {askedQuestions.includes(idx) && (
                    <span className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg text-base font-semibold">
                      Asked
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-dark-700 rounded-3xl p-8 shadow-2xl flex flex-col w-full md:w-1/2 max-w-2xl min-h-[60vh]">
            <h3 className="text-2xl font-bold mb-4">Chat</h3>
            <div className="flex-1 overflow-y-auto mb-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${
                    msg.sender === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-xl max-w-lg text-lg ${
                      msg.sender === "You"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    <span className="text-xs font-semibold">{msg.sender}:</span>{" "}
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-6 py-5 rounded-xl bg-dark-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-xl"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="px-6 py-5 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700 transition"
                onClick={handleSend}
              >
                Send
              </button>
              <button
                className="px-6 py-5 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-700 transition"
                onClick={() => setVoiceModalOpen(true)}
                title="Start Voice Chat"
              >
                <span className="material-icons align-middle mr-2">mic</span>{" "}
                Voice
              </button>
              {/* Voice Chat Modal */}
              {voiceModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                  <div className="bg-dark-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center w-full max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="material-icons">mic</span> Voice Chat
                      (Demo)
                    </h2>
                    <p className="text-lg text-blue-200 mb-6">{voiceStatus}</p>
                    {!voiceActive ? (
                      <button
                        className="px-6 py-4 bg-green-600 text-white rounded-xl text-xl font-bold hover:bg-green-700 transition mb-4"
                        onClick={handleStartVoice}
                      >
                        Start Voice
                      </button>
                    ) : (
                      <button
                        className="px-6 py-4 bg-red-600 text-white rounded-xl text-xl font-bold hover:bg-red-700 transition mb-4"
                        onClick={handleStopVoice}
                      >
                        Stop Voice
                      </button>
                    )}
                    <button
                      className="mt-2 px-4 py-2 bg-gray-700 text-white rounded"
                      onClick={() => {
                        handleStopVoice();
                        setVoiceModalOpen(false);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <button
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded w-full"
        onClick={() => {
          if (onEndSession) {
            onEndSession();
          } else {
            alert("Session ended!");
          }
        }}
      >
        End Session
      </button>
    </div>
  );
}
