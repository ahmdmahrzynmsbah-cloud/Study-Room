/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { User, Challenge } from "../types";
import {
  Trophy,
  CalendarRange,
  Medal,
  Sparkles,
  User as UserIcon,
  Crown,
} from "lucide-react";
import Confetti from "react-confetti";
import { useMeasure } from "react-use";

interface LeaderboardPageProps {
  currentUser: User;
  users: User[];
  challenges: Challenge[];
}

type TimelineFilter = "all-time" | "this-week" | "this-month";

export default function LeaderboardPage({
  currentUser,
  users,
  challenges,
}: LeaderboardPageProps) {
  const [filter, setFilter] = useState<TimelineFilter>("all-time");
  const [podiumRef, { width: podiumWidth, height: podiumHeight }] =
    useMeasure<HTMLDivElement>();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Only show confetti if we actually have some width and it hasn't been shown too long
    if (podiumWidth > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [podiumWidth]);

  // Compute points according to timing
  const getFilteredPoints = (user: User) => {
    if (filter === "all-time") {
      return user.points;
    }

    const now = Date.now();
    const rangeMs =
      filter === "this-week"
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
    const threshold = now - rangeMs;

    // Retrieve completed challenges within duration
    const completedChallenges = challenges.filter(
      (c) => c.status === "completed" && c.endTime && c.endTime >= threshold,
    );

    let calculatedPoints = 0;
    completedChallenges.forEach((challenge) => {
      const isParticipant = challenge.participants.includes(user.id);
      if (isParticipant) {
        const hasSubmitted = challenge.submissions.some(
          (s) => s.userId === user.id,
        );
        if (hasSubmitted) {
          calculatedPoints += challenge.pointsReward;
        } else {
          calculatedPoints -= challenge.pointsPenalty;
        }
      }
    });

    // To avoid confusing negative visual numbers for standard filters, let's offset it with a baseline or show exact delta
    return calculatedPoints;
  };

  const calculatedLeaderboard = users
    .filter((user) => user.role !== "admin")
    .map((user) => ({
      ...user,
      pointsDisplay: getFilteredPoints(user),
    }))
    .sort((a, b) => b.pointsDisplay - a.pointsDisplay);

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 font-sans flex items-center gap-2 tracking-tight">
            <Trophy className="text-[#FFB830]" size={32} />
            لوحة الصدارة الكلية والترتيب
          </h1>
        </div>

        {/* Timing Filters */}
        <div className="flex bg-white p-1 border border-slate-200 rounded-full shadow-inner self-stretch sm:self-auto justify-between">
          <button
            onClick={() => setFilter("all-time")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "all-time"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            كل الأوقات
          </button>
          <button
            onClick={() => setFilter("this-month")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "this-month"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            هذا الشهر
          </button>
          <button
            onClick={() => setFilter("this-week")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "this-week"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            هذا الأسبوع
          </button>
        </div>
      </div>

      {/* Top 3 podium visualization */}
      {calculatedLeaderboard.length >= 3 && (
        <div
          ref={podiumRef}
          className="relative grid grid-cols-3 gap-3 md:gap-6 pt-6 pb-2 max-w-2xl mx-auto items-end justify-items-center"
        >
          {showConfetti && podiumWidth > 0 && (
            <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none rounded-2xl overflow-visible z-50">
              <Confetti
                width={podiumWidth}
                height={podiumHeight + 40}
                recycle={false}
                numberOfPieces={500}
                gravity={0.3}
                initialVelocityY={25}
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            </div>
          )}
          {/* Rank 2 (Silver) - placed left (rendered second on screen but placed on left via order or visual positioning) */}
          <div
            className="flex flex-col items-center order-1 mt-8 w-full max-w-[150px] animate-fade-in group"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative transform transition-transform group-hover:-translate-y-2 group-hover:scale-110">
              <span
                className="text-4xl drop-shadow-sm inline-block animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                🥈
              </span>
            </div>
            <div className="relative bg-white/80 border border-slate-200 w-full text-center rounded-2xl p-4 mt-3 shadow-lg min-h-[120px] flex flex-col justify-end items-center card-hover hover:shadow-xl transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 text-2xl w-12 h-12 mb-2 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm shrink-0 overflow-hidden group-hover:ring-4 ring-slate-200 transition-all">
                {calculatedLeaderboard[1].avatar?.match(/^(http|data:)/) ? (
                  <img
                    src={calculatedLeaderboard[1].avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : calculatedLeaderboard[1].avatar ? (
                  <span className="text-xl select-none leading-none">{calculatedLeaderboard[1].avatar}</span>
                ) : (
                  <UserIcon size={22} className="text-slate-400" />
                )}
              </span>
              <h4 className="relative z-10 text-xs md:text-sm font-bold text-slate-800 font-sans truncate w-full">
                {calculatedLeaderboard[1].name}
              </h4>
              <span className="relative z-10 text-[10px] text-slate-500 block mt-0.5 font-mono mb-2">
                {calculatedLeaderboard[1].challengesCompleted} تحديات
              </span>
              <div className="relative z-10 flex items-center justify-center bg-slate-100/80 text-blue-600 px-2 py-1 rounded-md w-fit transition-transform group-hover:scale-105">
                <span className="text-xs font-bold font-mono tracking-tight">
                  {calculatedLeaderboard[1].pointsDisplay}
                </span>
                <span className="text-[9px] ml-1">نقطة</span>
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold) - placed center */}
          <div className="flex flex-col items-center order-2 w-full max-w-[180px] animate-fade-in group">
            <div className="relative scale-110 transform transition-transform group-hover:-translate-y-3 group-hover:scale-125 z-10">
              <span className="inline-block animate-bounce z-10 relative drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                <Crown
                  size={48}
                  className="text-yellow-400 fill-yellow-400 drop-shadow-md"
                />
              </span>
              <div className="absolute inset-0 bg-warning/30 blur-2xl rounded-full scale-150 animate-pulse -z-10"></div>
            </div>
            <div className="relative bg-gradient-to-b from-[#22223B] to-[#1A1A2E] border-2 border-warning/50 w-full text-center rounded-2xl p-4 mt-3 shadow-[0_0_30px_rgba(245,158,11,0.2)] min-h-[150px] flex flex-col justify-end items-center card-hover hover:scale-105 transition-all overflow-hidden group-hover:border-warning/80">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-warning/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 text-3xl w-14 h-14 mb-3 rounded-full bg-slate-800 flex items-center justify-center border-2 border-warning shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0 overflow-hidden transform transition-transform group-hover:scale-110 group-hover:rotate-6">
                {calculatedLeaderboard[0].avatar?.match(/^(http|data:)/) ? (
                  <img
                    src={calculatedLeaderboard[0].avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : calculatedLeaderboard[0].avatar ? (
                  <span className="text-2xl select-none leading-none">{calculatedLeaderboard[0].avatar}</span>
                ) : (
                  <UserIcon size={26} className="text-warning" />
                )}
              </span>
              <h4 className="relative z-10 text-sm md:text-base font-black text-warning font-sans truncate w-full group-hover:text-yellow-300 transition-colors">
                {calculatedLeaderboard[0].name}
              </h4>
              <span className="relative z-10 text-[10px] text-slate-400 block mt-0.5 font-mono mb-3">
                {calculatedLeaderboard[0].challengesCompleted} تحديات
              </span>
              <div className="relative z-10 flex items-center justify-center bg-warning/20 text-warning border border-warning/30 px-3 py-1.5 rounded-lg w-fit shadow-inner shadow-warning/10 transition-transform group-hover:scale-110 group-hover:bg-warning/30">
                <span className="text-sm font-black font-mono tracking-tight">
                  {calculatedLeaderboard[0].pointsDisplay}
                </span>
                <span className="text-[10px] ml-1">نقطة</span>
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) - placed right */}
          <div
            className="flex flex-col items-center order-3 mt-12 w-full max-w-[150px] animate-fade-in group"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative transform transition-transform group-hover:-translate-y-2 group-hover:scale-110">
              <span
                className="text-4xl drop-shadow-sm inline-block animate-bounce"
                style={{ animationDelay: "1s" }}
              >
                🥉
              </span>
            </div>
            <div className="relative bg-white/80 border border-slate-200 w-full text-center rounded-2xl p-4 mt-3 shadow-lg min-h-[100px] flex flex-col justify-end items-center card-hover hover:shadow-xl transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 text-2xl w-10 h-10 mb-2 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm shrink-0 overflow-hidden group-hover:ring-4 ring-orange-200 transition-all">
                {calculatedLeaderboard[2].avatar?.match(/^(http|data:)/) ? (
                  <img
                    src={calculatedLeaderboard[2].avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : calculatedLeaderboard[2].avatar ? (
                  <span className="text-lg select-none leading-none">{calculatedLeaderboard[2].avatar}</span>
                ) : (
                  <UserIcon size={18} className="text-amber-700" />
                )}
              </span>
              <h4 className="relative z-10 text-xs md:text-sm font-bold text-slate-800 font-sans truncate w-full">
                {calculatedLeaderboard[2].name}
              </h4>
              <span className="relative z-10 text-[10px] text-slate-500 block mt-0.5 font-mono mb-2">
                {calculatedLeaderboard[2].challengesCompleted} تحديات
              </span>
              <div className="relative z-10 flex items-center justify-center bg-orange-50 text-orange-600 px-2 py-1 rounded-md w-fit border border-orange-100 transition-transform group-hover:scale-105">
                <span className="text-xs font-bold font-mono tracking-tight">
                  {calculatedLeaderboard[2].pointsDisplay}
                </span>
                <span className="text-[9px] ml-1">نقطة</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 border-slate-200/30 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 font-sans">
            توزيع الترتيب العالمي الحالي
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            تحديث فوري تلقائي
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 border-slate-200/10 text-xs text-slate-500 font-sans">
                <th className="px-6 py-3.5 font-bold">المركز</th>
                <th className="px-6 py-3.5 font-bold">المنافس</th>
                <th className="px-6 py-3.5 font-bold text-center">
                  التحديات المنتهية
                </th>
                <th className="px-6 py-3.5 font-bold text-center">
                  دقائق المذاكرة
                </th>
                <th className="px-6 py-3.5 font-bold">إجمالي النقاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {calculatedLeaderboard.slice(0, 10).map((user, idx) => {
                const isCurrentUser = user.id === currentUser.id;

                let medalBadge = null;
                if (idx === 0) medalBadge = "🥇";
                else if (idx === 1) medalBadge = "🥈";
                else if (idx === 2) medalBadge = "🥉";

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors hover:bg-slate-50 ${
                      isCurrentUser
                        ? "bg-blue-600/5 !bg-opacity-10 border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {medalBadge && (
                          <span className="text-lg">{medalBadge}</span>
                        )}
                        <span>#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0 group">
                          {user.membershipTier === "gold" && (
                            <>
                              <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-600 animate-pulse blur-[1px] opacity-80"></span>
                              <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 animate-[spin_8s_linear_infinite] opacity-100"></span>
                            </>
                          )}
                          {user.membershipTier === "silver" && (
                            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 animate-pulse opacity-70"></span>
                          )}
                          <span className="w-10 h-10 bg-slate-50 border-2 border-white rounded-full flex items-center justify-center overflow-hidden shadow-sm select-none z-10 relative transition-transform group-hover:scale-110">
                            {user.avatar?.match(/^(http|data:)/) ? (
                              <img
                                src={user.avatar}
                                alt="avatar"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : user.avatar ? (
                              <span className="text-sm font-bold text-slate-700 select-none leading-none">{user.avatar}</span>
                            ) : (
                              <UserIcon className="text-slate-400 w-5 h-5" />
                            )}
                          </span>
                          {user.membershipTier === "gold" && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full border-2 border-white shadow-md z-20 animate-[bounce_2s_infinite]">
                              <Crown
                                size={8}
                                className="text-white fill-white"
                              />
                            </div>
                          )}
                          {user.membershipTier !== "gold" &&
                            user.role !== "admin" && (
                              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full text-[8px] font-bold border-2 border-white shadow-sm z-20">
                                ⚡
                              </div>
                            )}
                        </div>
                        <div>
                          <div className="font-sans font-black text-sm text-slate-800 flex flex-wrap items-center gap-1.5">
                            {user.name}
                            {user.membershipTier === "gold" && (
                              <span
                                className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer"
                                title="موثق ذهبي"
                              >
                                موثق ذهبي
                              </span>
                            )}
                            {user.membershipTier === "silver" && (
                              <span
                                className="text-[9px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer"
                                title="موثق فضي"
                              >
                                موثق فضي
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">
                                أنت
                              </span>
                            )}
                            {user.role === "admin" && (
                              <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-md">
                                مشرف
                              </span>
                            )}
                            {!user.isActive && (
                              <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-md font-normal">
                                معطل
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-800">
                      {user.challengesCompleted}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-800">
                      {user.totalStudyMinutes} د
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-700 rounded-lg shadow-sm shrink-0">
                          <span className="text-[12px] font-black font-mono tracking-tight">
                            {user.pointsDisplay}
                          </span>
                          <span className="text-[10px] font-bold ml-1 mr-0.5">
                            نقطة
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
