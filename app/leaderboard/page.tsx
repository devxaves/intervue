"use client";
import React, { useEffect, useState } from "react";

interface LeaderboardEntry {
  userId: string;
  name: string;
  amount: number;
  updatedAt: string;
}

const fetchLeaderboard = async (period: "week" | "month") => {
  const res = await fetch(`/api/gamification/leaderboard?period=${period}`);
  return res.json();
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(period).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [period]);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-primary-100 drop-shadow-lg">Leaderboard</h1>
      <div className="flex justify-center mb-8 gap-4">
        <button
          className={`px-6 py-2 rounded-xl font-bold shadow transition-all duration-150 ${
            period === "week"
              ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setPeriod("week")}
        >
          This Week
        </button>
        <button
          className={`px-6 py-2 rounded-xl font-bold shadow transition-all duration-150 ${
            period === "month"
              ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white scale-105"
              : "bg-gray-200 text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setPeriod("month")}
        >
          This Month
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        {loading ? (
          <div className="text-center text-lg text-gray-400 py-8">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-lg text-gray-400 py-8">No leaderboard data</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300">
                <th className="py-4 px-4 text-xl font-extrabold text-white text-left drop-shadow-lg tracking-wide rounded-tl-2xl" style={{background: 'linear-gradient(90deg, #f8fafc 0%, #dbeafe 100%)', color: '#222', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>Rank</th>
                <th className="py-4 px-4 text-xl font-extrabold text-white text-left drop-shadow-lg tracking-wide" style={{background: 'linear-gradient(90deg, #f8fafc 0%, #dbeafe 100%)', color: '#222', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>Name</th>
                <th className="py-4 px-4 text-xl font-extrabold text-white text-left drop-shadow-lg tracking-wide rounded-tr-2xl" style={{background: 'linear-gradient(90deg, #f8fafc 0%, #dbeafe 100%)', color: '#222', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>Tokens</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.userId}
                  className={
                    idx === 0
                      ? "bg-gradient-to-r from-yellow-300 to-yellow-100 text-gray-900 shadow-lg"
                      : idx === 1
                      ? "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800"
                      : idx === 2
                      ? "bg-gradient-to-r from-orange-200 to-orange-100 text-gray-800"
                      : "hover:bg-blue-50"
                  }
                >
                  <td className="py-3 px-4 font-extrabold flex items-center gap-2">
                    {idx === 0 && <img src="/star.svg" alt="1st" width={24} height={24} />}
                    {idx === 1 && <img src="/medal.svg" alt="2nd" width={24} height={24} />}
                    {idx === 2 && <img src="/medal.svg" alt="3rd" width={24} height={24} style={{filter:'brightness(0.8)'}} />}
                    <span>{idx + 1}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-lg">{entry.name}</td>
                  <td className="py-3 px-4 font-bold text-xl">{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
