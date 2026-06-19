/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Group, Challenge } from '../types';
import { Play, UserPlus, Trophy, Calendar, Sparkles, FolderLock, Plus, Hourglass, CheckCircle, Ban } from 'lucide-react';

interface GroupDetailPageProps {
  currentUser: User;
  group: Group;
  users: User[];
  challenges: Challenge[];
  onNavigate: (page: string) => void;
  onStartChallenge: (challengeId: string) => void;
  onJoinChallenge: (challengeId: string) => void;
  onOpenCreateChallengeModal: () => void;
  onAddMember: (email: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export default function GroupDetailPage({
  currentUser,
  group,
  users,
  challenges,
  onNavigate,
  onStartChallenge,
  onJoinChallenge,
  onOpenCreateChallengeModal,
  onAddMember,
  onDeleteGroup,
}: GroupDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'challenges' | 'members'>('challenges');
  const [memberEmail, setMemberEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const groupMembers = users.filter((u) => u.isActive && u.role !== 'admin' && group.members.includes(u.id));
  const groupChallenges = challenges.filter((c) => c.groupId === group.id);
  const isCreatorOfGroup = group.createdBy === currentUser.id;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    
    if (!memberEmail.trim()) {
      setInviteError('يرجى تحديد بريد إلكتروني صالح.');
      return;
    }

    const targetUser = users.find((u) => u.email.toLowerCase() === memberEmail.toLowerCase().trim());
    if (!targetUser) {
      setInviteError('المستخدم غير موجود بالنظام! تحقق من البريد.');
      return;
    }

    if (!targetUser.isActive) {
      setInviteError('هذا الحساب معطل حالياً من قبل الإدارة.');
      return;
    }

    if (group.members.includes(targetUser.id)) {
      setInviteError('هذا المستخدم عضو بالفعل في هذه المجموعة.');
      return;
    }

    onAddMember(targetUser.email);
    setInviteSuccess(`تمت إضافة الزميل ${targetUser.name} بنجاح!`);
    setMemberEmail('');
  };

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Group Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-3xl">🧩</span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 font-sans tracking-tight">{group.name}</h1>
            <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-2xl">
              {group.description || 'لا يوجد وصف مخصص لهذه المجموعة حالياً.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[150px]">
            {isCreatorOfGroup && (
              <button
                onClick={() => onDeleteGroup(group.id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-sans border border-red-500/20 rounded-full text-xs transition-colors cursor-pointer"
              >
                حذف المجموعة نهائياً
              </button>
            )}
            <span className="text-xs text-slate-500 font-sans text-center">
              المنشئ: {users.find((u) => u.id === group.createdBy)?.name || 'أحد الأعضاء'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right Tab columns: Challenges and Member view toggle */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white p-1 border border-slate-200 rounded-full shadow-inner w-full sm:w-80">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === 'challenges'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              التحديات الدراسية ({groupChallenges.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              الأعضاء والتقييم ({groupMembers.length})
            </button>
          </div>

          {activeTab === 'challenges' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-md text-slate-800 font-sans">سجل تحديات المجموعة</h3>
                <button
                  onClick={onOpenCreateChallengeModal}
                  className="px-4 py-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-200 text-blue-600 text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  + تحدي جديد
                </button>
              </div>

              {groupChallenges.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-md">
                  <span className="text-4xl block">📦</span>
                  <h4 className="text-sm font-bold text-slate-800">لا يوجد تحديات في هذه المجموعة بعد</h4>
                  <p className="text-xs text-slate-500">أنشئ تحدياً دراسياً لتبدأ جلسات المذاكرة الجماعية!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupChallenges.map((challenge) => {
                    const isChallengeCreator = challenge.createdBy === currentUser.id;
                    const isParticipant = challenge.participants.includes(currentUser.id);
                    const isCompleted = challenge.status === 'completed';
                    const isActive = challenge.status === 'active';
                    const isPending = challenge.status === 'pending';

                    let badgeColor = 'text-slate-500 bg-slate-50 border-slate-200';
                    let badgeLabel = 'غير معروف';
                    if (isPending) {
                      badgeColor = 'bg-warning/10 text-warning';
                      badgeLabel = 'معلق بانتظار البدء';
                    } else if (isActive) {
                      badgeColor = 'bg-emerald-100 text-emerald-600 font-bold animate-pulse';
                      badgeLabel = 'نشط ومباشر الآن';
                    } else if (isCompleted) {
                      badgeColor = 'bg-[#FF6584]/15 text-rose-500';
                      badgeLabel = 'مكتمل بنجاح';
                    } else if (challenge.status === 'cancelled') {
                      badgeColor = 'bg-red-500/10 text-red-400';
                      badgeLabel = 'ملغي';
                    }

                    return (
                      <div
                        key={challenge.id}
                        className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isActive ? 'border-[#6C63FF]/40 ring-1 ring-[#6C63FF]/10 shadow-[#6C63FF]/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                              {badgeLabel}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              مكافأة: +{challenge.pointsReward}ن | عقوبة: -{challenge.pointsPenalty}ن
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm md:text-md text-slate-800 font-sans">
                            {challenge.title}
                          </h4>
                          
                          <p className="text-xs text-slate-500 font-sans flex flex-wrap gap-4">
                            <span>المادة: {challenge.subject}</span>
                            <span>•</span>
                            <span>المدة: {challenge.durationMinutes} دقيقة</span>
                            <span>•</span>
                            <span>عدد الصفحات: {challenge.pageCount} صفحة</span>
                            <span>•</span>
                            <span>المشاركون: {challenge.participants.length} زملاء</span>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {isPending && isChallengeCreator && (
                            <button
                              id={`start-${challenge.id}`}
                              onClick={() => onStartChallenge(challenge.id)}
                              className="px-5 py-2 bg-emerald-500 text-white hover:bg-emerald-600 font-sans text-xs font-bold rounded-full transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Play size={14} />
                              ابدأ التحدي للجميع
                            </button>
                          )}

                          {isPending && !isParticipant && (
                            <button
                              onClick={() => onJoinChallenge(challenge.id)}
                              className="px-4 py-2 bg-slate-50 border-slate-200 text-blue-600 hover:bg-slate-200 border border-blue-200 font-sans text-xs font-bold rounded-full transition-all cursor-pointer"
                            >
                              المشاركة بالتحدي
                            </button>
                          )}

                          {isActive && (
                            <button
                              onClick={() => onJoinChallenge(challenge.id)}
                              className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 font-sans text-xs font-bold rounded-full transition-all flex items-center gap-1 hover:shadow-[0_0_12px_rgba(108,99,255,0.4)] animate-pulse cursor-pointer"
                            >
                              <Play size={14} />
                              دخول الغرفة الحية
                            </button>
                          )}

                          {isCompleted && (
                            <button
                              onClick={() => {
                                onJoinChallenge(challenge.id);
                              }}
                              className="px-4 py-2 bg-slate-50 border-slate-200 text-blue-600 hover:bg-secondary/10 border border-secondary/20 font-sans text-xs font-bold rounded-full transition-all cursor-pointer"
                            >
                              عرض الإثباتات والنتائج
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Members Tab Table */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 bg-slate-50 border-slate-200/30 border-b border-slate-200 font-bold text-sm text-slate-800 font-sans">
                قائمة الزملاء داخل المجموعة
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right" dir="rtl">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 border-slate-200/10 text-xs text-slate-500 font-sans">
                      <th className="px-5 py-3 font-bold">الاسم</th>
                      <th className="px-5 py-3 font-bold text-center">تحديات مجتازة</th>
                      <th className="px-5 py-3 font-bold text-center">دقائق النشاط</th>
                      <th className="px-5 py-3 font-bold">النقاط الكلية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {groupMembers.map((member) => (
                      <tr key={member.id} className="text-xs transition-colors hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <span className="text-xl w-8 h-8 bg-slate-50 border-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                              {member.avatar?.match(/^(http|data:)/) ? <img src={member.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" /> : (member.avatar)}
                            </span>
                            <div>
                              <h5 className="font-sans font-bold text-sm text-slate-800 flex flex-wrap items-center gap-1.5">
                                {member.name}
                                {member.lazyExpiry && member.lazyExpiry > Date.now() && (
                                  <span className="text-[9px] bg-red-100 border border-red-200 text-red-600 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 animate-pulse" title="شارة عقوبة الكسول نشطة 24 ساعة">
                                    🐌 الكسول
                                  </span>
                                )}
                                {member.membershipTier === 'gold' && (
                                  <span className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق ذهبي">
                                    موثق ذهبي
                                  </span>
                                )}
                                {member.membershipTier === 'silver' && (
                                   <span className="text-[9px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer" title="موثق فضي">
                                     موثق فضي
                                   </span>
                                )}
                                {member.id === group.createdBy && (
                                  <span className="text-[9px] bg-blue-600/20 text-blue-600 px-1.5 py-0.2 rounded font-normal">
                                    المشرف
                                  </span>
                                )}
                              </h5>
                              <span className="text-[10px] text-slate-500 block">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-mono text-slate-800">
                          {member.challengesCompleted}
                        </td>
                        <td className="px-5 py-4 text-center font-mono text-slate-800">
                          {member.totalStudyMinutes} د
                        </td>
                        <td className="px-5 py-4 text-warning font-sans font-bold font-mono">
                          {member.points} ن
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Left Add Member Sidebar panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-black text-slate-800 text-sm md:text-md font-sans flex items-center gap-2">
              <UserPlus className="text-blue-600" size={18} />
              دعوة وإضافة زميل دراسة
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              قم بدعوة صديق للانضمام إلى هذه المجموعة فوراً بمجرد كتابة بريده الإلكتروني المسجل في النظام.
            </p>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-sans mb-1.5">البريد الإلكتروني للزميل</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="name@test.com"
                  className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6C63FF] focus:ring-1 focus:ring-[#6C63FF]/30 transition-all font-mono"
                />
              </div>

              {inviteError && (
                <p className="text-xs text-rose-600 font-sans font-medium bg-red-500/10 p-2 rounded-lg">
                  ⚠️ {inviteError}
                </p>
              )}

              {inviteSuccess && (
                <p className="text-xs text-emerald-600 font-sans font-medium bg-emerald-50 p-2 rounded-lg">
                  ✅ {inviteSuccess}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all select-none cursor-pointer"
              >
                إنهاء الدعوة والإضافة
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="font-bold text-xs text-slate-500 font-sans">توجيهات المذاكرة</h4>
            <div className="space-y-2 text-xs text-slate-500 font-sans leading-relaxed">
              <p>1. يحق لمالك ومنشئ التحدي فقط البدء الفوري لمؤقت الغرفة الحية الباقي عليها.</p>
              <p>2. لا تجتاز الجلسات إلا بتقديم خلاصة أو صورة برهان حقيقية لمواجهة التقييمات العادلة.</p>
              <p>3. تجري الحسابات مباشرة لصالح الرصيد عند تأدية الواجب أو معاقبة من يتأخر.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
