/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, AppSettings } from "../types";
import {
  LayoutDashboard,
  Trophy,
  Users,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  BookOpen,
  Clock,
  X,
  Wallet,
  Crown,
  Sparkles,
  Bell,
} from "lucide-react";

interface SidebarProps {
  currentUser: User | null;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  settings: AppSettings;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  currentUser,
  activePage,
  onNavigate,
  onLogout,
  settings,
  isOpen,
  onClose,
}: SidebarProps) {
  if (!currentUser) return null;

  const menuItems =
    currentUser.role === "admin"
      ? [
          {
            name: "admin-dashboard",
            label: "نظرة عامة وإحصائيات",
            icon: <LayoutDashboard size={18} />,
          },
          {
            name: "admin-users",
            label: "إدارة حسابات الطلاب",
            icon: <Users size={18} />,
          },
          {
            name: "admin-groups",
            label: "إدارة المجموعات",
            icon: <Users size={18} />,
          },
          {
            name: "admin-challenges",
            label: "إدارة وتتبع التحديات",
            icon: <BookOpen size={18} />,
          },
          {
            name: "admin-points",
            label: "الأرصدة والنقاط",
            icon: <Trophy size={18} />,
          },
          {
            name: "admin-wallet",
            label: "المحفظة والطلبات",
            icon: <Wallet size={18} />,
          },
          {
            name: "admin-plans",
            label: "إدارة العضويات",
            icon: <Crown size={18} />,
          },
          {
            name: "admin-notifications",
            label: "الإشعارات والتبليغات",
            icon: <Bell size={18} />,
          },
          {
            name: "admin-settings",
            label: "إعدادات المنصة",
            icon: <ShieldAlert size={18} />,
          },
          {
            name: "admin-logs",
            label: "سجل النظام",
            icon: <Clock size={18} />,
          },
          {
            name: "profile",
            label: "الملف الشخصي",
            icon: <UserIcon size={18} />,
          },
        ]
      : [
          {
            name: "dashboard",
            label: "الرئيسية",
            icon: <LayoutDashboard size={18} />,
          },
          { name: "groups", label: "المجموعات", icon: <Users size={18} /> },
          {
            name: "leaderboard",
            label: "لوحة الصدارة",
            icon: <Trophy size={18} />,
          },
          {
            name: "copilot",
            label: "مساعد الذكاء الاصطناعي",
            icon: <Sparkles size={18} />,
          },
          {
            name: "profile",
            label: "الملف الشخصي",
            icon: <UserIcon size={18} />,
          },
        ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 right-0 z-50 h-[100dvh] w-72 md:w-64 bg-white md:border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out overflow-hidden md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
        dir="rtl"
      >
        {/* HEADER */}
        <div className="h-[73px] px-6 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] flex items-center justify-center shadow-lg border border-slate-200 shrink-0 overflow-hidden text-white">
              {settings?.platformLogo ? (
                <img
                  src={settings.platformLogo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={20} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 font-sans tracking-tight">
                {settings?.appName || (
                  <>
                    STUDY<span className="text-blue-600">ROOM</span>
                  </>
                )}
              </h2>
              <span className="text-[10px] text-slate-500 font-sans block">
                {settings?.loginWelcomeSubtitle || "تحديات المذاكرة للأصدقاء"}
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* PROFILE PREVIEW */}
        <div className="px-6 py-6 flex items-center gap-3 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 shrink-0">
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
            <span className="w-12 h-12 bg-slate-50 border-2 border-white rounded-full flex items-center justify-center overflow-hidden shadow-sm select-none z-10 relative transition-transform group-hover:scale-105">
              {currentUser.avatar?.match(/^(http|data:)/) ? (
                <img
                  src={currentUser.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <UserIcon size={22} className="text-slate-400" />
              )}
            </span>
            {currentUser.membershipTier === "gold" && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full border-2 border-white shadow-md z-20 animate-[bounce_3s_infinite]">
                <Crown size={10} className="text-white fill-white" />
              </div>
            )}
            {currentUser.membershipTier !== "gold" &&
              currentUser.role !== "admin" && (
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-white shadow-sm z-20">
                  ⚡
                </div>
              )}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-black text-slate-800 truncate font-sans flex items-center gap-1">
                {currentUser.lazyExpiry && currentUser.lazyExpiry > Date.now() && <span title="عقاب نشط 🐌" className="animate-pulse">🐌</span>}
                {currentUser.name}
              </h4>
              {currentUser.membershipTier === "gold" && (
                <span
                  className="text-[9px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer"
                  title="موثق ذهبي"
                >
                  موثق ذهبي
                </span>
              )}
              {currentUser.membershipTier === "silver" && (
                <span
                  className="text-[9px] bg-gradient-to-r from-slate-400 to-slate-400 text-white shadow-sm px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer"
                  title="موثق فضي"
                >
                  موثق فضي
                </span>
              )}
              {currentUser.role === "admin" && (
                <ShieldAlert size={14} className="text-blue-600 shrink-0" />
              )}
            </div>
            {currentUser.role !== "admin" && (
              <div className="flex gap-2 mt-2">
                <div className="flex flex-1 items-center justify-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-md shadow-sm">
                  <Trophy size={12} className="text-amber-500" />
                  <span className="text-xs font-black font-mono tracking-tight">
                    {currentUser.points}
                  </span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md shadow-sm">
                  <Wallet size={12} className="text-emerald-500" />
                  <span className="text-xs font-black font-mono tracking-tight text-emerald-800">
                    {(currentUser.walletBalance || 0).toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            )}
            {currentUser.role === "admin" && (
              <span className="text-[11px] font-bold text-blue-600 tracking-tight mt-0.5 block">
                المدير العام
              </span>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.map((item) => {
            const isActive =
              activePage === item.name ||
              (item.name === "groups" && activePage === "group-detail");
            return (
              <button
                key={item.name}
                onClick={() => {
                  onNavigate(item.name);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-semibold transition-all select-none cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`${isActive ? "text-blue-600" : "text-slate-400"}`}
                >
                  {item.icon}
                </span>
                <span className="font-sans">{item.label}</span>
              </button>
            );
          })}

          {/* Special Room nav if in a challenge */}
          {activePage === "room" && (
            <button
              onClick={() => {
                onNavigate("room");
                onClose?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-sm font-bold transition-all text-emerald-600 bg-emerald-50 border border-emerald-100 animate-pulse select-none cursor-pointer"
            >
              <Clock size={18} />
              <span className="font-sans">غرفة المذاكرة الحية</span>
            </button>
          )}
        </nav>

        {/* FOOTER */}
        <div className="p-4 mt-auto shrink-0 border-t border-slate-100 bg-white/50 backdrop-blur-sm relative z-10 w-full pt-6">
          <button
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl text-sm font-sans font-bold transition-all select-none cursor-pointer duration-200 hover:shadow-lg hover:shadow-red-500/10"
          >
            <LogOut size={18} />
            <span className="font-sans">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
