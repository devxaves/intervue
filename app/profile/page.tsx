"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Badge {
  badgeId: string;
  name: string;
  imageUrl: string;
  description: string;
  awardedAt: string;
}

const fetchTokens = async (userId: string) => {
  const res = await fetch(`/api/gamification/tokens?userId=${userId}`);
  return res.json();
};
const fetchStreak = async (userId: string) => {
  const res = await fetch(`/api/gamification/streaks?userId=${userId}`);
  return res.json();
};
const fetchBadges = async (userId: string) => {
  const res = await fetch(`/api/gamification/badges?userId=${userId}`);
  return res.json();
};

export default function ProfilePage() {
  const [userId, setUserId] = useState<string>("");
  const [tokens, setTokens] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserId() {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
      } else {
        setLoading(false);
      }
    }
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetchTokens(userId),
      fetchStreak(userId),
      fetchBadges(userId),
    ]).then(([tokenData, streakData, badgeData]) => {
      setTokens(tokenData.amount ?? 0);
      setStreak(streakData.count ?? 0);
      setBadges(badgeData ?? []);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-primary-100 drop-shadow-lg">Your Profile</h1>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="mb-10 flex justify-center gap-8">
            <div className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-blue-300 shadow-lg rounded-xl px-8 py-6 min-w-[140px]">
              <Image src="/star.svg" alt="Tokens" width={32} height={32} className="mb-2" />
              <div className="text-lg font-semibold text-white">Tokens</div>
              <div className="text-3xl font-extrabold text-white drop-shadow">{tokens}</div>
            </div>
            <div className="flex flex-col items-center bg-gradient-to-br from-yellow-400 to-yellow-200 shadow-lg rounded-xl px-8 py-6 min-w-[140px]">
              <Image src="/calendar.svg" alt="Streak" width={32} height={32} className="mb-2" />
              <div className="text-lg font-semibold text-gray-900">Streak</div>
              <div className="text-3xl font-extrabold text-gray-900 drop-shadow">{streak} <span className="text-base font-bold">days</span></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center text-primary-100">Badges & Achievements</h2>
          <div className="grid grid-cols-2 gap-6 justify-center">
            {badges.length === 0 ? (
              <div className="col-span-2 text-center text-lg text-gray-300 py-8">No badges yet</div>
            ) : (
              badges.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="flex items-center gap-4 bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl shadow-lg border border-gray-600"
                >
                  <Image
                    src={badge.imageUrl}
                    alt={badge.name}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-primary-100"
                  />
                  <div>
                    <div className="font-bold text-white text-lg">{badge.name}</div>
                    <div className="text-xs text-gray-300 mb-1">{badge.description}</div>
                    <div className="text-xs text-gray-400">Awarded: {new Date(badge.awardedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
