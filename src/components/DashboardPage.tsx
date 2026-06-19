/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Group, Challenge } from "../types";
import {
  Trophy,
  Clock,
  Target,
  Plus,
  ShieldCheck,
  Flame,
  Play,
  Users as GroupIcon,
  Wallet,
  User as UserIcon,
  Crown,
} from "lucide-react";

interface DashboardPageProps {
  currentUser: User;
  users: User[];
  groups: Group[];
  challenges: Challenge[];
  onNavigate: (page: string) => void;
  onSelectGroup: (groupId: string) => void;
  onJoinChallenge: (challengeId: string) => void;
  onOpenCreateGroupModal: () => void;
  onOpenCreateChallengeModal: () => void;
}

export default function DashboardPage({
  currentUser,
  users,
  groups,
  challenges,
  onNavigate,
  onSelectGroup,
  onJoinChallenge,
  onOpenCreateGroupModal,
  onOpenCreateChallengeModal,
}: DashboardPageProps) {
  // Calculate rankings
  const sortedUsers = [...users]
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.points - a.points);
  const userRankIndex = sortedUsers.findIndex((u) => u.id === currentUser.id);
  const currentRank = userRankIndex !== -1 ? userRankIndex + 1 : "-";

  // Compute stats for current user
  const userGroups = groups.filter(
    (g) => g.isActive && g.members.includes(currentUser.id),
  );

  // Active challenges in users groups
  const userGroupIds = userGroups.map((g) => g.id);

  const activeChallenges = challenges.filter(
    (c) => c.status === "active" && userGroupIds.includes(c.groupId),
  );

  const pendingChallenges = challenges.filter(
    (c) => c.status === "pending" && userGroupIds.includes(c.groupId),
  );

  // Top 5 leaderboard snapshot
  const top5Users = sortedUsers.slice(0, 5);

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      {/* Header Profile / Welcome */}
      <div className="relative p-6 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 group">
              {currentUser.membershipTier === "gold" && (
                <>
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-600 animate-pulse blur-[2px] opacity-80"></span>
                  <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 animate-[spin_8s_linear_infinite] opacity-100"></span>
                </>
              )}
              {currentUser.membershipTier === "silver" && (
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 animate-pulse opacity-70"></span>
              )}
              <span className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-slate-50 border-2 border-white rounded-full shadow-md relative z-10 transition-transform group-hover:scale-105">
                {currentUser.avatar?.match(/^(http|data:)/) ? (
                  <img
                    src={currentUser.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <UserIcon className="text-slate-400 w-8 h-8 md:w-10 md:h-10" />
                )}
              </span>
              {currentUser.membershipTier === "gold" && (
                <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full border-2 border-white shadow-md z-20 animate-[bounce_2.5s_infinite]">
                  <Crown className="text-white fill-white w-3 h-3 md:w-4 md:h-4" />
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 font-sans">
                  مرحباً، {currentUser.name}
                </h1>
                {currentUser.membershipTier === "gold" && (
                  <span
                    className="text-[11px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer"
                    title="موثق ذهبي"
                  >
                    موثق ذهبي
                  </span>
                )}
                {currentUser.membershipTier === "silver" && (
                  <span
                    className="text-[11px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer"
                    title="موثق فضي"
                  >
                    موثق فضي
                  </span>
                )}
                {currentUser.role === "admin" && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-blue-600/20 text-blue-600 border border-blue-200 rounded-full">
                    <ShieldCheck size={12} />
                    مشرف النظام
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 font-sans">
                جاهز لتحدي مذاكرة جديد اليوم؟ المنافسة مشتعلة! 🔥
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:self-center">
            <button
              id="dash-create-group"
              onClick={onOpenCreateGroupModal}
              className="px-5 py-2.5 bg-gradient-to-l from-slate-700 to-slate-800 text-white font-semibold font-sans rounded-full text-xs md:text-sm hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              إنشاء مجموعة
            </button>
            <button
              id="dash-create-challenge"
              onClick={onOpenCreateChallengeModal}
              className="px-5 py-2.5 bg-gradient-to-l from-blue-600 to-blue-700 text-white font-semibold font-sans text-xs md:text-sm rounded-full hover:shadow-[0_0_15px_rgba(108,99,255,0.4)] shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              تحدي جديد
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex items-center gap-4 card-hover">
          <div className="p-3 bg-success/15 text-emerald-600 rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-sans font-medium">
              النقاط الإجمالية
            </span>
            <span className="text-2xl md:text-3xl font-black text-emerald-600 font-sans block mt-1 tracking-tight">
              {currentUser.points}
            </span>
          </div>
        </div>

        {/* Stat Wallet */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex items-center gap-4 card-hover">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <Wallet size={24} />
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-sans font-medium">
              رصيد المحفظة
            </span>
            <span className="text-2xl md:text-3xl font-black text-emerald-700 font-sans block mt-1 tracking-tight">
              {(currentUser.walletBalance || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex items-center gap-4 card-hover">
          <div className="p-3 bg-secondary/15 text-rose-500 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-sans font-medium">
              تحديات منجزة
            </span>
            <span className="text-2xl md:text-3xl font-black text-rose-500 font-sans block mt-1 tracking-tight">
              {currentUser.challengesCompleted}
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex items-center gap-4 card-hover">
          <div className="p-3 bg-primary/15 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-sans font-medium">
              دقائق الدراسة
            </span>
            <span className="text-2xl md:text-3xl font-black text-blue-600 font-sans block mt-1 tracking-tight">
              {currentUser.totalStudyMinutes}
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex items-center gap-4 card-hover">
          <div className="p-3 bg-warning/15 text-[#FFB830] rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-sans font-medium">
              الترتيب العالمي
            </span>
            <span className="text-2xl md:text-3xl font-black text-[#FFB830] font-sans block mt-1 tracking-tight">
              #{currentRank}{" "}
              <span className="text-xs text-slate-500 font-normal">
                من {users.length}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Challenge rooms */}
      <div className="flex flex-col gap-6">
        {/* Challenge Rooms */}
        <div className="space-y-6">
          <div className="header font-bold text-lg text-slate-800 flex items-center gap-2">
            <Play className="text-blue-600" size={20} />
            <h2>
              التحديات النشطة والغرف المتوفرة (
              {activeChallenges.length + pendingChallenges.length})
            </h2>
          </div>

          {activeChallenges.length === 0 && pendingChallenges.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-md">
              <span className="text-5xl inline-block filter animate-bounce">
                ☕
              </span>
              <h3 className="text-slate-800 font-bold">
                لا يوجد غرف تحدي نشطة حالياً لمجموعاتك
              </h3>
              <p className="text-slate-500 max-w-sm mx-auto text-xs">
                ابدأ بإنشاء مجموعة صديق جديدة ثم صمم تحدياً مثيراً لمادة دراسية
                لفتح جلسات غرف المذاكرة الحية!
              </p>
              <button
                id="dash-create-challenge-empty"
                onClick={onOpenCreateChallengeModal}
                className="px-6 py-2 bg-slate-50 border-slate-200 text-blue-600 hover:bg-slate-200 font-sans text-xs font-bold rounded-full transition-all border border-blue-200 select-none cursor-pointer"
              >
                + صمم تحدي دراسة الآن
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active */}
              {activeChallenges.map((challenge) => {
                const group = groups.find((g) => g.id === challenge.groupId);
                const hasJoined = challenge.participants.includes(
                  currentUser.id,
                );
                return (
                  <div
                    key={challenge.id}
                    className="bg-white border border-blue-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-bold text-rose-600 bg-rose-100 rounded-full select-none">
                          ● نشط الآن
                        </span>
                        <span className="text-xs text-slate-500 font-sans">
                          {group?.name || "مجموعة"}
                        </span>
                      </div>
                      <h3 className="text-slate-800 text-lg font-bold font-sans">
                        {challenge.title} • {challenge.subject}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans flex items-center gap-3">
                        <span>المدة: {challenge.durationMinutes} دقيقة</span>
                        <span>•</span>
                        <span>عدد الصفحات: {challenge.pageCount} صفحة</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onJoinChallenge(challenge.id)}
                      className="whitespace-nowrap px-6 py-2.5 bg-gradient-to-l from-[#43D787] to-[#2ecc71] text-white text-xs md:text-sm font-semibold rounded-full hover:shadow-[0_0_12px_rgba(67,215,135,0.3)] select-none transition-all active:scale-95 cursor-pointer"
                    >
                      {hasJoined ? "دخول الغرفة الحية" : "انضمام وبدء المذاكرة"}
                    </button>
                  </div>
                );
              })}

              {/* Pending */}
              {pendingChallenges.map((challenge) => {
                const group = groups.find((g) => g.id === challenge.groupId);
                const creator = users.find((u) => u.id === challenge.createdBy);
                return (
                  <div
                    key={challenge.id}
                    className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-bold text-warning bg-warning/10 rounded-full select-none">
                          مجدول - بانتظار البدء
                        </span>
                        <span className="text-xs text-slate-500 font-sans">
                          {group?.name || "مجموعة"}
                        </span>
                      </div>
                      <h3 className="text-slate-800 text-md font-bold font-sans">
                        {challenge.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans flex flex-wrap gap-2">
                        <span>المادة: {challenge.subject}</span>
                        <span>•</span>
                        <span>{challenge.durationMinutes} دقيقة</span>
                        <span>•</span>
                        <span>{challenge.pageCount} صفحة</span>
                      </p>
                      <p className="text-[10px] text-blue-600/80">
                        المنشئ: {creator?.name || "مجهول"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (group) {
                          onSelectGroup(group.id);
                          onNavigate("group-detail");
                        }
                      }}
                      className="whitespace-nowrap px-5 py-2 bg-slate-50 border-slate-200 text-blue-600 text-xs font-semibold rounded-full border border-primary/20 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick groups */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <GroupIcon className="text-blue-600" size={20} />
              <span>مجموعاتي الدراسية ({userGroups.length})</span>
            </h2>
            {userGroups.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white p-4 border border-slate-200 rounded-2xl text-center">
                لم تنضم لأي مجموعة بعد. قم بإنشاء مجموعة أو اطلب من صديق إضافتك!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userGroups.map((group) => {
                  return (
                    <div
                      key={group.id}
                      onClick={() => {
                        onSelectGroup(group.id);
                        onNavigate("group-detail");
                      }}
                      className="bg-white border border-slate-200 p-4 rounded-xl shadow-md cursor-pointer hover:border-blue-200 hover:translate-y-[-2px] transition-all flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-sans font-bold text-sm text-slate-800">
                          {group.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {group.description}
                        </p>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-600/10 px-2.5 py-1 rounded-full font-bold">
                        {group.members.length} أعضاء
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
