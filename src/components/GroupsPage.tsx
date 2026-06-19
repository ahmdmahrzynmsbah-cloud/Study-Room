/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Group, Challenge } from '../types';
import { Users, Plus, ArrowLeft, ArrowRight, Shield, Target } from 'lucide-react';

interface GroupsPageProps {
  currentUser: User;
  groups: Group[];
  challenges: Challenge[];
  onSelectGroup: (groupId: string) => void;
  onNavigate: (page: string) => void;
  onOpenCreateGroupModal: () => void;
}

export default function GroupsPage({
  currentUser,
  groups,
  challenges,
  onSelectGroup,
  onNavigate,
  onOpenCreateGroupModal,
}: GroupsPageProps) {
  const userGroups = groups.filter((g) => g.isActive && g.members.includes(currentUser.id));
  
  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 font-sans flex items-center gap-2 tracking-tight">
            <Users className="text-blue-600" size={32} />
            المجموعات الدراسية للأصدقاء
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            انضم وتنافس مع زملائك، أنشئ تحديات جديدة وحفّز الآخرين لبذل أقصى ما لديهم.
          </p>
        </div>

        <button
          onClick={onOpenCreateGroupModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-blue-600 to-blue-700 text-white text-xs md:text-sm font-semibold rounded-full hover:shadow-[0_0_12px_rgba(108,99,255,0.3)] shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          إنشاء مجموعة جديدة
        </button>
      </div>

      {userGroups.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-md">
          <span className="text-5xl block select-none filter animate-pulse">👥</span>
          <h3 className="text-lg font-bold text-slate-800">لم تنضم لأي مجموعة بعد!</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            البداية الحقيقية للتفوق والمذاكرة تبدأ عند الانضمام للأصدقاء. أنشئ مجموعتك الخاصة الآن ثم أرسل دعوة لأصدقائك أو اطلب منهم إضافتك بمعرف البريد الإلكتروني.
          </p>
          <button
            onClick={onOpenCreateGroupModal}
            className="px-6 py-2.5 bg-slate-50 border-slate-200 border border-primary/30 text-blue-600 rounded-full hover:bg-primary/10 text-xs font-bold transition-all cursor-pointer"
          >
            + أنشئ أول مجموعة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {userGroups.map((group) => {
            const groupChallenges = challenges.filter((c) => c.groupId === group.id);
            const activeCount = groupChallenges.filter((c) => c.status === 'active').length;
            const completedCount = groupChallenges.filter((c) => c.status === 'completed').length;
            const isCreator = group.createdBy === currentUser.id;

            return (
              <div
                key={group.id}
                onClick={() => {
                  onSelectGroup(group.id);
                  onNavigate('group-detail');
                }}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg cursor-pointer flex flex-col justify-between relative overflow-hidden card-hover"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-600 to-[#FF6584]"></div>
                
                <div className="space-y-4 pr-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-md font-bold text-slate-800 font-sans group-hover:text-blue-600 transition-colors">
                      {group.name}
                    </h3>
                    {isCreator && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-600/10 rounded-full select-none">
                        👑 مالك
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-sans line-clamp-2 leading-relaxed min-h-[36px]">
                    {group.description || 'لا يوجد وصف مضاف لمحتوى هذه المجموعة.'}
                  </p>

                  <div className="flex gap-4 border-t border-slate-200 pt-4 text-xs font-sans">
                    <div>
                      <span className="text-slate-500 block text-[10px]">الأعضاء</span>
                      <span className="font-bold text-slate-800">{group.members.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">تحديات حية</span>
                      <span className="font-bold text-success">{activeCount} نشط</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">مكتملة</span>
                      <span className="font-bold text-rose-500">{completedCount} تم</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-blue-600 font-sans pr-3">
                  <span>دخول صفحة المجموعة</span>
                  <ArrowRight size={16} className="rotate-180 transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
