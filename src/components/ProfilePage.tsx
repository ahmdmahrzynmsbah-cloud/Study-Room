/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { User, AppSettings, TransactionRequest } from "../types";
import {
  Award,
  UserCheck,
  User as UserIcon,
  CalendarDays,
  Flame,
  ShieldAlert,
  Sparkles,
  BrainCircuit,
  Edit2,
  Check,
  X,
  Trash2,
  Wallet,
  Banknote,
  ArrowRightLeft,
  Copy,
  Crown,
  Monitor,
  Moon,
  Sun,
  ShieldCheck,
  BookOpen,
  Timer,
} from "lucide-react";
import CustomModal from "./CustomModal";
import { uuid } from "../db";

interface ProfilePageProps {
  currentUser: User;
  settings: AppSettings;
  transactions: TransactionRequest[];
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onUpdateTransactions: (transactions: TransactionRequest[]) => void;
  onDeleteAccount: () => void;
}

const seedAvatars = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jude&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Avery&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Harper&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Evelyn&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Aria&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/micah/svg?seed=Sophia&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/micah/svg?seed=Mia&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Princess&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Liam&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Amelia&backgroundColor=e2e8f0",
];

const silverAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=SilverElite1&backgroundColor=94a3b8",
  "https://api.dicebear.com/7.x/bottts/svg?seed=SilverHero2&backgroundColor=cbd5e1",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=SilverPrincess3&backgroundColor=475569",
  "https://api.dicebear.com/7.x/notionists/svg?seed=SilverLeader4&backgroundColor=e2e8f0",
  "https://api.dicebear.com/7.x/micah/svg?seed=SilverStar5&backgroundColor=38bdf8",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=SilverChamp6&backgroundColor=0284c7",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=SilverGent7&backgroundColor=0f172a",
  "https://api.dicebear.com/7.x/bottts/svg?seed=SilverRanger8&backgroundColor=64748b",
];

const goldAvatars = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=GoldKing&backgroundColor=f59e0b",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=RoyalGold&backgroundColor=fbbf24",
  "https://api.dicebear.com/7.x/bottts/svg?seed=VIPGlow&backgroundColor=1e1b4b",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=GoldenAngel&backgroundColor=f59e0b",
  "https://api.dicebear.com/7.x/notionists/svg?seed=VIPScholar&backgroundColor=b5a566",
  "https://api.dicebear.com/7.x/micah/svg?seed=Emperor&backgroundColor=78350f",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Champion&backgroundColor=ef4444",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=QueenGold&backgroundColor=d97706",
  "https://api.dicebear.com/7.x/bottts/svg?seed=GoldMecha&backgroundColor=ca8a04",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=GoldenGoddess&backgroundColor=854d0e",
  "https://api.dicebear.com/7.x/notionists/svg?seed=GoldBillionaire&backgroundColor=eab308",
  "https://api.dicebear.com/7.x/micah/svg?seed=VIPGoldTouch&backgroundColor=4c1d95",
];

const premiumAvatars = [...silverAvatars, ...goldAvatars];

const governoratesList = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الشرقية",
  "جنوب سيناء",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "قنا",
  "شمال سيناء",
  "سوهاج",
];

export default function ProfilePage({
  currentUser,
  settings,
  transactions,
  onUpdateUser,
  onUpdateTransactions,
  onDeleteAccount,
}: ProfilePageProps) {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const handleThemeChange = () =>
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    window.addEventListener("theme_changed", handleThemeChange);
    return () => window.removeEventListener("theme_changed", handleThemeChange);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [editParentPhone, setEditParentPhone] = useState(
    currentUser.parentPhone || "",
  );
  const [editGovernorate, setEditGovernorate] = useState(
    currentUser.governorate || "",
  );
  const [editStage, setEditStage] = useState(
    currentUser.educationalStage || "middle",
  );
  const [editLevel, setEditLevel] = useState(
    currentUser.educationalLevel || "1st",
  );
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editPassword, setEditPassword] = useState(currentUser.password || "");
  const [editError, setEditError] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [membershipErrorTitle, setMembershipErrorTitle] = useState("");
  const [isMembershipErrorOpen, setIsMembershipErrorOpen] = useState(false);

  // Wallet logic
  const [walletAction, setWalletAction] = useState<
    | "none"
    | "convert_points_to_money"
    | "withdraw"
    | "convert_money_to_points"
    | "deposit"
  >("none");
  const [walletAmount, setWalletAmount] = useState<number>("" as any);
  const [walletMessage, setWalletMessage] = useState({ type: "", text: "" });
  const [paymentDetails, setPaymentDetails] = useState("");
  const [walletProvider, setWalletProvider] = useState("vodafone");
  const [screenshot, setScreenshot] = useState<string>("");

  const resetWalletForm = () => {
    setWalletMessage({ type: "", text: "" });
    setWalletAmount("" as any);
    setPaymentDetails("");
    setWalletProvider("vodafone");
    setScreenshot("");
  };

  const joinDate = new Date(currentUser.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSave = () => {
    setEditError("");

    if (!editName.trim()) {
      setEditError("يرجى إدخال الاسم.");
      return;
    }

    const phonePattern = /^01[0125][0-9]{8}$/;
    if (currentUser.role !== "admin") {
      if (editPhone && !phonePattern.test(editPhone.trim())) {
        setEditError("رقم الهاتف غير صحيح.");
        return;
      }

      if (editParentPhone && !phonePattern.test(editParentPhone.trim())) {
        setEditError("رقم هاتف ولي الأمر غير صحيح.");
        return;
      }

      if (
        editPhone &&
        editParentPhone &&
        editPhone.trim() === editParentPhone.trim()
      ) {
        setEditError("لا يمكن أن يتطابق رقمك مع رقم ولي الأمر.");
        return;
      }
    }

    const updates: Partial<User> = {
      name: editName,
      avatar: editAvatar,
    };

    if (currentUser.role === "admin") {
      updates.password = editPassword;
    } else {
      updates.phone = editPhone;
      updates.parentPhone = editParentPhone;
      updates.governorate = editGovernorate;
      updates.educationalStage = editStage;
      updates.educationalLevel = editLevel;
    }

    onUpdateUser(updates);

    setIsEditing(false);
  };

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAmount || walletAmount <= 0) {
      setWalletMessage({ type: "error", text: "يرجى إدخال مقدار صحيح." });
      return;
    }

    setWalletMessage({ type: "", text: "" });

    if (walletAction === "convert_points_to_money") {
      if (currentUser.points < walletAmount) {
        setWalletMessage({ type: "error", text: "رصيد النقاط غير كافٍ." });
        return;
      }

      const rate = settings.pointsToEgpRate || 25;
      const egpEarned = walletAmount / rate;

      onUpdateUser({
        points: currentUser.points - walletAmount,
        walletBalance: (currentUser.walletBalance || 0) + egpEarned,
      });
      setWalletMessage({
        type: "success",
        text: `تم تحويل ${walletAmount} نقطة إلى ${egpEarned.toFixed(2)} ج.م بنجاح!`,
      });
      setWalletAmount("" as any);
      setTimeout(() => setWalletAction("none"), 2500);
    } else if (walletAction === "convert_money_to_points") {
      if ((currentUser.walletBalance || 0) < walletAmount) {
        setWalletMessage({ type: "error", text: "رصيد المحفظة غير كافٍ." });
        return;
      }

      const rate = settings.egpToPointsRate || 25;
      const pointsEarned = walletAmount * rate;

      onUpdateUser({
        points: currentUser.points + pointsEarned,
        walletBalance: (currentUser.walletBalance || 0) - walletAmount,
      });
      setWalletMessage({
        type: "success",
        text: `تم تحويل ${walletAmount} ج.م إلى ${pointsEarned} نقطة بنجاح!`,
      });
      setWalletAmount("" as any);
      setTimeout(() => setWalletAction("none"), 2500);
    } else if (walletAction === "withdraw") {
      if (walletAmount < 30) {
        setWalletMessage({
          type: "error",
          text: "الحد الأدنى للسحب هو 30 ج.م.",
        });
        return;
      }
      if ((currentUser.walletBalance || 0) < walletAmount) {
        setWalletMessage({
          type: "error",
          text: "رصيد المحفظة غير كافٍ للسحب.",
        });
        return;
      }
      if (!paymentDetails.trim()) {
        setWalletMessage({
          type: "error",
          text: "يرجى إدخال رقم الهاتف / طريقة التحويل.",
        });
        return;
      }

      // Record a transaction request
      const providerMapping: Record<string, string> = {
        vodafone: "فودافون كاش",
        orange: "اورنج كاش",
        etisalat: "اتصالات كاش",
        we: "وي باي",
      };
      const fullPaymentDetails = `${providerMapping[walletProvider] || walletProvider} - ${paymentDetails}`;

      const newReq: TransactionRequest = {
        id: uuid(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: "withdraw",
        amountMoney: walletAmount,
        paymentDetails: fullPaymentDetails,
        status: "pending",
        timestamp: Date.now(),
      };

      onUpdateTransactions([newReq, ...transactions]);

      // We deduct locally to hold funds
      onUpdateUser({
        walletBalance: (currentUser.walletBalance || 0) - walletAmount,
      });

      setWalletMessage({
        type: "success",
        text: "تم إرسال طلب السحب بنجاح. سيتم مراجعته من الإدارة.",
      });
      setWalletAmount("" as any);
      setPaymentDetails("");
      setTimeout(() => setWalletAction("none"), 3000);
    } else if (walletAction === "deposit") {
      if (!paymentDetails.trim()) {
        setWalletMessage({
          type: "error",
          text: "يرجى إدخال رقم هاتفك المحول منه أو طريقة الدفع.",
        });
        return;
      }
      const providerMapping: Record<string, string> = {
        vodafone: "فودافون كاش",
        orange: "اورنج كاش",
        etisalat: "اتصالات كاش",
        we: "وي باي",
      };
      const fullPaymentDetails = `${providerMapping[walletProvider] || walletProvider} - ${paymentDetails}`;

      // Record a transaction request
      const newReq: TransactionRequest = {
        id: uuid(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: "deposit",
        amountMoney: walletAmount,
        paymentDetails: fullPaymentDetails,
        screenshot: screenshot,
        status: "pending",
        timestamp: Date.now(),
      };

      onUpdateTransactions([newReq, ...transactions]);

      setWalletMessage({
        type: "success",
        text: "تم إرسال طلب الشحن للإدارة بنجاح. يرجى الانتظار حتى يتم التأكيد.",
      });
      resetWalletForm();
      setTimeout(() => setWalletAction("none"), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 font-sans flex items-center gap-2">
          <BrainCircuit className="text-rose-500" size={26} />
          الملف الشخصي والإحصائيات
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-center flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-blue-600 to-secondary"></div>

          {isEditing ? (
            <div className="w-full mt-4 space-y-4 text-right">
              {editError && (
                <div className="bg-red-50 text-red-500 p-2 text-xs rounded-lg border border-red-200 text-center">
                  {editError}
                </div>
              )}

              <div className="flex flex-col items-center mb-4 space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {seedAvatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`relative aspect-square w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden cursor-pointer ${
                        editAvatar === av
                          ? "ring-4 ring-blue-500 scale-110 shadow-lg z-10"
                          : "hover:scale-105 border border-slate-200"
                      }`}
                    >
                      {av?.match(/^(http|data:)/) ? (
                        <img
                          src={av}
                          alt="avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        av
                      )}
                    </button>
                  ))}
                </div>

                {currentUser.membershipTier === "gold" && (
                  <div className="w-full bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-2 border-amber-400 rounded-2xl p-4 shadow-lg shadow-amber-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-br-lg uppercase tracking-wider">
                      👑 Gold VIP Exclusive
                    </div>
                    <p className="text-right text-xs font-black text-amber-700 mb-1 mt-1 flex items-center gap-1">
                      <Crown
                        size={14}
                        className="text-amber-500 animate-[bounce_1.5s_infinite]"
                      />{" "}
                      باقة الأفتارات الذهبية ثلاثية الأبعاد الفاخرة
                    </p>
                    <p className="text-right text-[10px] text-amber-600/80 font-sans mb-3">
                      تصاميم أسطورية ثلاثية الأبعاد وتأثير الهالة الذهبية
                      المتوهجة VIP حول حسابك.
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {goldAvatars.map((av, index) => {
                        const isSelected = editAvatar === av;
                        return (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setEditAvatar(av)}
                            className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all overflow-hidden cursor-pointer ${
                              isSelected
                                ? "ring-4 ring-amber-500 scale-110 shadow-lg z-10 border-2 border-white"
                                : "hover:scale-105 border border-amber-300 bg-white"
                            }`}
                            title={`افتار ملكي #${index + 1}`}
                          >
                            <img
                              src={av}
                              alt="gold premium avatar"
                              className="w-full h-full object-cover rounded-2xl"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                                <span className="bg-amber-500 text-white rounded-full p-1 text-[10px] shadow-md font-bold">
                                  ✓
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentUser.membershipTier === "silver" && (
                  <div className="w-full bg-slate-50 border border-blue-200 rounded-2xl p-4 shadow-inner">
                    <p className="text-right text-xs font-black text-blue-700 mb-1 flex items-center gap-1">
                      🥈 باقة الأفتارات الفضية المتميزة
                    </p>
                    <p className="text-right text-[10px] text-slate-500 font-sans mb-3">
                      افتارات متميزة لتظهر أناقة حضورك في رتب المنصة ومجموعات
                      الدراسة.
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {silverAvatars.map((av, index) => {
                        const isSelected = editAvatar === av;
                        return (
                          <button
                            key={av}
                            type="button"
                            onClick={() => setEditAvatar(av)}
                            className={`relative aspect-square rounded-xl flex items-center justify-center transition-all overflow-hidden cursor-pointer ${
                              isSelected
                                ? "ring-4 ring-blue-500 scale-110 shadow-lg z-10 border-2 border-white"
                                : "hover:scale-105 border border-slate-200 bg-white"
                            }`}
                            title={`افتار فضي #${index + 1}`}
                          >
                            <img
                              src={av}
                              alt="silver premium avatar"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100/30 border border-amber-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2">
                      <span className="text-[10px] text-amber-800 font-bold text-center sm:text-right">
                        أطلق العنان للهالة الذهبية المتوهجة والتاج الذهبي
                        والافتارات الثلاثية الأبعاد الفاخرة!
                      </span>
                      <span className="text-[9px] bg-amber-500 text-white px-2 py-1 rounded-full font-bold shadow-md cursor-pointer shrink-0">
                        الترقية للباقة الذهبية 👑
                      </span>
                    </div>
                  </div>
                )}

                {currentUser.membershipTier === "gold" && (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-right text-[10px] font-bold text-slate-500 mb-2">
                      🥈 باقة الأفتارات الفضية (مفتوحة كهدية إضافية):
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {silverAvatars.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setEditAvatar(av)}
                          className={`relative aspect-square w-10 h-10 rounded-lg flex items-center justify-center transition-all overflow-hidden cursor-pointer ${
                            editAvatar === av
                              ? "ring-2 ring-blue-500 scale-110"
                              : "hover:scale-105 border border-slate-200"
                          }`}
                        >
                          <img
                            src={av}
                            alt="silver avatar"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>

              {currentUser.role === "admin" ? (
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    كلمة المرور (اختياري)
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 rounded-xl font-mono"
                    placeholder="اتركه كما هو إذا لم ترغب بتغييره"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        رقم الهاتف
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded-xl text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        رقم ولي الأمر
                      </label>
                      <input
                        type="text"
                        value={editParentPhone}
                        onChange={(e) => setEditParentPhone(e.target.value)}
                        className="w-full p-2 text-sm border border-slate-200 rounded-xl text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        المرحلة الدراسية
                      </label>
                      <select
                        value={editStage}
                        onChange={(e) =>
                          setEditStage(e.target.value as "middle" | "high")
                        }
                        className="w-full p-2 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="middle">إعدادي</option>
                        <option value="high">ثانوي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        الصف
                      </label>
                      <select
                        value={editLevel}
                        onChange={(e) =>
                          setEditLevel(e.target.value as "1st" | "2nd" | "3rd")
                        }
                        className="w-full p-2 text-sm border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="1st">الأول</option>
                        <option value="2nd">الثاني</option>
                        <option value="3rd">الثالث</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      المحافظة
                    </label>
                    <select
                      value={editGovernorate}
                      onChange={(e) => setEditGovernorate(e.target.value)}
                      className="w-full p-2 text-sm border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">-- اختر محافظة --</option>
                      {governoratesList.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1 transition-all"
                >
                  <Check size={16} />
                  حفظ
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1 transition-all"
                >
                  <X size={16} />
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                title="تعديل الحساب"
              >
                <Edit2 size={16} />
              </button>

              <div className="relative shrink-0 mt-4 group">
                {currentUser.membershipTier === "gold" && (
                  <>
                    {/* Glowing outer aura for Gold member */}
                    <span className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-600 animate-pulse blur-sm opacity-85"></span>
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 animate-[spin_6s_linear_infinite] opacity-100"></span>
                  </>
                )}
                {currentUser.membershipTier === "silver" && (
                  <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 animate-pulse opacity-70"></span>
                )}
                <span className="w-20 h-20 bg-slate-50 border-2 border-white rounded-full flex items-center justify-center overflow-hidden shadow-md select-none relative z-10 transition-transform group-hover:scale-110">
                  {currentUser.avatar?.match(/^(http|data:)/) ? (
                    <img
                      src={currentUser.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <UserIcon className="text-slate-400 w-10 h-10" />
                  )}
                </span>
                {currentUser.membershipTier === "gold" && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full border-2 border-white shadow-lg z-20 animate-[bounce_2.5s_infinite]">
                    <Crown size={14} className="text-white fill-white" />
                  </div>
                )}
                {currentUser.membershipTier !== "gold" &&
                  currentUser.role !== "admin" && (
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center rounded-full text-sm font-bold border-2 border-white shadow-md z-20">
                      ⚡
                    </div>
                  )}
              </div>

              <h3 className="text-xl font-black text-slate-800 font-sans mt-4 flex flex-wrap items-center gap-2 justify-center font-bold">
                {currentUser.name}
                {currentUser.lazyExpiry && currentUser.lazyExpiry > Date.now() && (
                  <span
                    className="text-[10px] bg-gradient-to-r from-red-500 to-rose-600 text-white border border-rose-400 shadow-sm px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse shrink-0"
                    title={`العقاب نشط! ينتهي في: ${new Date(currentUser.lazyExpiry).toLocaleTimeString("ar-EG")}`}
                  >
                    🐌 شارة الكسول ({Math.ceil((currentUser.lazyExpiry - Date.now()) / (3600 * 1000))} ساعة متبقية)
                  </span>
                )}
                {currentUser.membershipTier === "gold" && (
                  <span
                    className="text-[10px] bg-gradient-to-r from-amber-500 to-yellow-400 text-white border border-amber-300 shadow-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer shrink-0"
                    title="عضوية ذهبية موثقة"
                  >
                    <Check size={10} /> موثق ذهبي
                  </span>
                )}
                {currentUser.membershipTier === "silver" && (
                  <span
                    className="text-[10px] bg-gradient-to-r from-slate-400 to-slate-300 text-white border border-slate-300 shadow-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 vip-shimmer shrink-0"
                    title="عضوية فضية"
                  >
                    <Check size={10} /> موثق فضي
                  </span>
                )}
                {currentUser.role === "admin" && (
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-md font-bold shrink-0">
                    مشرف عام
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-1">
                {currentUser.email}
              </p>

              {currentUser.role !== "admin" && (
                <div className="grid grid-cols-2 gap-3 mt-5 w-full">
                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100/50 border border-amber-200 text-amber-700 py-3 rounded-xl shadow-sm">
                    <span className="text-[10px] font-bold mb-0.5 opacity-80 uppercase tracking-wider">
                      نقاط الرصيد
                    </span>
                    <span className="text-xl font-black font-mono tracking-tight">
                      {currentUser.points}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-100/50 border border-emerald-200 text-emerald-700 py-3 rounded-xl shadow-sm">
                    <span className="text-[10px] font-bold mb-0.5 opacity-80 uppercase tracking-wider">
                      المحفظة (ج.م)
                    </span>
                    <span className="text-xl font-black font-mono tracking-tight">
                      {(currentUser.walletBalance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Theme Settings Toggle */}
              <div className="w-full mt-6 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right">
                  <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase flex items-center justify-end gap-1">
                    المظهر الأساسي <Sun size={12} className="ml-1" />
                  </h4>
                  <div className="grid grid-cols-2 gap-3 w-full bg-slate-200/50 p-1 rounded-xl relative isolate">
                    <button
                      onClick={() => {
                        const toggleTheme = () => {
                          document.documentElement.classList.remove("dark");
                          localStorage.setItem(
                            `theme_${currentUser.id}`,
                            "light",
                          );
                          window.dispatchEvent(new Event("theme_changed"));
                        };

                        if (!document.startViewTransition) {
                          toggleTheme();
                        } else {
                          document.startViewTransition(toggleTheme);
                        }
                      }}
                      className="group relative flex flex-col items-center justify-center py-4 rounded-lg outline-none transition-all duration-300"
                    >
                      <div
                        className="absolute inset-0 bg-white shadow-sm rounded-lg border border-slate-200/60 transition-opacity z-[-1]"
                        style={{ opacity: !isDarkMode ? 1 : 0 }}
                      ></div>
                      <Monitor
                        className={`mb-2 font-bold transition-all duration-300 ${!isDarkMode ? "text-blue-600 scale-110 drop-shadow-sm" : "text-slate-500 scale-100 group-hover:text-slate-700"}`}
                        size={24}
                      />
                      <span
                        className={`text-xs font-bold transition-colors ${!isDarkMode ? "text-slate-800" : "text-slate-500"}`}
                      >
                        وضع النظام
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const toggleTheme = () => {
                          document.documentElement.classList.add("dark");
                          localStorage.setItem(
                            `theme_${currentUser.id}`,
                            "dark",
                          );
                          window.dispatchEvent(new Event("theme_changed"));
                        };

                        if (!document.startViewTransition) {
                          toggleTheme();
                        } else {
                          document.startViewTransition(toggleTheme);
                        }
                      }}
                      className="group relative flex flex-col items-center justify-center py-4 rounded-lg outline-none transition-all duration-300"
                    >
                      <div
                        className="absolute inset-0 bg-slate-800 shadow-sm rounded-lg border border-slate-700 transition-opacity z-[-1]"
                        style={{ opacity: isDarkMode ? 1 : 0 }}
                      ></div>
                      <Moon
                        className={`mb-2 font-bold transition-all duration-300 ${isDarkMode ? "text-white scale-110 drop-shadow-sm" : "text-slate-500 scale-100 group-hover:text-slate-700"}`}
                        size={24}
                      />
                      <span
                        className={`text-xs font-bold transition-colors ${isDarkMode ? "text-white" : "text-slate-500"}`}
                      >
                        الوضع الليلي
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full mt-6 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right">
                  <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase flex items-center gap-1">
                    <UserCheck size={12} /> المعلومات الأساسية
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(currentUser.educationalStage ||
                      currentUser.educationalLevel) && (
                      <div className="col-span-2 bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-500 mb-0.5">
                          المرحلة الدراسية
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {currentUser.educationalStage === "middle"
                            ? "إعدادي"
                            : "ثانوي"}
                          {currentUser.educationalLevel === "1st" &&
                            " - الصف الأول"}
                          {currentUser.educationalLevel === "2nd" &&
                            " - الصف الثاني"}
                          {currentUser.educationalLevel === "3rd" &&
                            " - الصف الثالث"}
                        </span>
                      </div>
                    )}
                    {currentUser.governorate && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-500 mb-0.5">
                          المحافظة
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {currentUser.governorate || "-"}
                        </span>
                      </div>
                    )}
                    {currentUser.phone && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-500 mb-0.5">
                          رقم الهاتف
                        </span>
                        <span
                          className="text-xs font-bold text-slate-800"
                          dir="ltr"
                        >
                          {currentUser.phone || "-"}
                        </span>
                      </div>
                    )}
                    {currentUser.parentPhone && (
                      <div className="col-span-2 bg-white p-2.5 rounded-lg border border-slate-100">
                        <span className="block text-[10px] text-slate-500 mb-0.5">
                          هاتف ولي الأمر
                        </span>
                        <span
                          className="text-xs font-bold text-slate-800"
                          dir="ltr"
                        >
                          {currentUser.parentPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right">
                  <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase flex items-center gap-1">
                    <Flame size={12} /> حالة الحساب
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                      <span className="block text-[10px] text-slate-500 mb-0.5 flex items-center gap-1">
                        <CalendarDays size={10} /> الانضمام
                      </span>
                      <span className="text-[11px] font-bold text-slate-800">
                        {joinDate}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-center">
                      <span className="block text-[10px] text-slate-500 mb-0.5">
                        الاستمرار
                      </span>
                      <span className="text-[11px] font-bold text-warning flex items-center justify-center gap-0.5">
                        <Sparkles size={10} /> ذهبي مميز
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full text-red-500 hover:text-white bg-red-50 hover:bg-red-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all border border-red-200 hover:border-red-600"
                >
                  <Trash2 size={16} />
                  حذف الحساب نهائياً
                </button>
              </div>
            </>
          )}
        </div>

        {/* Detailed Achievements & Dashboard stats */}
        {currentUser.role !== "admin" && (
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
                <span className="p-3.5 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} />
                </span>
                <div>
                  <span className="block text-xs text-slate-500 font-sans">
                    عدد مرات التحدي المشترك بها
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-800 font-mono mt-1 block">
                    {currentUser.challengesJoined} تحديات
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
                <span className="p-3.5 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Award size={24} />
                </span>
                <div>
                  <span className="block text-xs text-slate-500 font-sans">
                    تحديات بنجاح ودون غرامات
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-800 font-mono mt-1 block">
                    {currentUser.challengesCompleted} تحدي
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
                <span className="p-3.5 bg-amber-600/10 text-amber-600 rounded-xl flex items-center justify-center">
                  <Timer size={24} />
                </span>
                <div>
                  <span className="block text-xs text-slate-500 font-sans">
                    دقائق التركيز الصافي
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-800 font-mono mt-1 block">
                    {currentUser.totalStudyMinutes} دقيقة
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4">
                <span className="p-3.5 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center font-sans">
                  <Flame size={24} className="animate-pulse text-indigo-600" />
                </span>
                <div>
                  <span className="block text-xs text-slate-500 font-sans">
                    مستوى التقدم والالتزام
                  </span>
                  <span className="text-xl md:text-2xl font-black text-slate-800 font-sans mt-1 block">
                    {currentUser.points > 400 ? "عبقري ومكافح" : "مبتدئ ملتزم"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Award className="text-warning" size={18} />
                رؤية العضوية والتفوق
              </h4>
              <div className="space-y-3 font-sans text-xs text-slate-500 leading-relaxed">
                <p>
                  • نظام نقاط <strong>StudyRoom</strong> يحاسب الأعضاء بدقة
                  بناءً على الموثوقية والأمانة: تضاف مكافآت Points صالحة لكافة
                  التحديات المقررة عند إكمال الحضور وتقديم الدليل المطلوب،
                  وتُخصم Points فورية كعقوبة في سياق عدم الإيفاء أو التجاهل.
                </p>
                <p>
                  • إن الحضور المتكرر وبدء الدراسة يرفع من رتبتكم داخل النطاق
                  والمجموعة ويؤهلكم للاستفادة القصوى مع الأصدقاء.
                </p>
              </div>
            </div>

            {/* Wallet Panel */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-amber-600"></div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Crown className="text-amber-500" size={18} />
                عضويتك في المنصة
              </h4>

              {(() => {
                const isPremium =
                  currentUser.membershipTier === "gold" ||
                  currentUser.membershipTier === "silver";
                const isGold = currentUser.membershipTier === "gold";
                const totalDays = isGold
                  ? 90
                  : currentUser.membershipTier === "silver"
                    ? 30
                    : 0;
                const daysLeft = currentUser.membershipExpiry
                  ? Math.max(
                      0,
                      Math.ceil(
                        (currentUser.membershipExpiry - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : 0;
                const progressPercent =
                  totalDays > 0 ? (daysLeft / totalDays) * 100 : 0;

                if (!isPremium) {
                  return (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                          <Crown className="text-slate-500" size={20} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-sans mb-1 block">
                            العضوية الحالية
                          </span>
                          <strong className="font-bold text-sm text-slate-700">
                            عضوية مجانية
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className={`border rounded-xl p-5 relative overflow-hidden ${isGold ? "bg-gradient-to-l from-amber-50 to-amber-100/50 border-amber-200/50 hover:border-amber-300" : "bg-gradient-to-l from-slate-50 to-blue-50 border-blue-200/50 hover:border-blue-300"}`}
                  >
                    {isGold && (
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    )}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isGold ? "bg-gradient-to-br from-amber-300 to-yellow-500 border-amber-200 text-white" : "bg-gradient-to-br from-slate-300 to-slate-400 border-slate-200 text-white"}`}
                          >
                            <Crown size={24} />
                          </div>
                          <div>
                            <span
                              className="text-[10px] uppercase tracking-wider font-bold mb-1 block opacity-70"
                              dir="ltr"
                            >
                              {isGold ? "Gold Member" : "Silver Member"}
                            </span>
                            <strong
                              className={`font-black text-lg ${isGold ? "text-amber-700" : "text-slate-700"}`}
                            >
                              {settings.subscriptionPlans?.find(
                                (p) => p.id === currentUser.membershipTier,
                              )?.name || "عضوية مميزة"}
                            </strong>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${isGold ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-slate-100 border-slate-300 text-slate-700"} overflow-hidden relative`}
                        >
                          <div className="vip-shimmer absolute inset-0"></div>
                          <span className="relative z-10">نشط</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-end mb-2 text-xs font-bold">
                          <span
                            className={
                              isGold ? "text-amber-800" : "text-slate-800"
                            }
                          >
                            صلاحية العضوية
                          </span>
                          <span
                            className={
                              isGold ? "text-amber-600" : "text-slate-600"
                            }
                          >
                            متبقي {daysLeft} يوم
                          </span>
                        </div>
                        <div
                          className={`h-2.5 w-full rounded-full overflow-hidden ${isGold ? "bg-amber-200/50" : "bg-slate-200"}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isGold ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "bg-gradient-to-r from-slate-400 to-blue-400"}`}
                            style={{
                              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {settings.subscriptionPlans
                  ?.filter((p) => {
                    if (p.id === "free") return false;
                    if (currentUser.membershipTier === "gold")
                      return p.id === "silver";
                    if (currentUser.membershipTier === "silver")
                      return p.id === "gold";
                    return p.id === "gold" || p.id === "silver";
                  })
                  .map((plan) => {
                    const isDisabled =
                      currentUser.membershipTier === "gold" &&
                      plan.id === "silver";
                    const isUpgrade =
                      currentUser.membershipTier === "silver" &&
                      plan.id === "gold";

                    return (
                      <div
                        key={plan.id}
                        className={`border rounded-xl p-4 relative flex flex-col transition-colors ${isDisabled ? "border-slate-100 opacity-70 bg-slate-50" : "border-slate-200 hover:border-amber-300 cursor-pointer group"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5
                            className={`font-bold text-sm ${plan.color === "amber" ? "text-amber-600" : plan.color === "blue" ? "text-blue-600" : "text-slate-800"}`}
                          >
                            {plan.name}
                          </h5>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {plan.priceEgp} ج.م
                          </span>
                        </div>
                        <ul className="text-[10px] text-slate-500 font-sans space-y-1.5 mb-4 flex-grow">
                          {plan.features.map((f, i) => {
                            let IconComponent = Sparkles;
                            let iconColor = "text-slate-400";
                            if (plan.color === "amber") {
                              IconComponent = Crown;
                              iconColor =
                                "text-amber-500 animate-[pulse_1.5s_infinite]";
                            } else if (plan.color === "blue") {
                              IconComponent = ShieldCheck;
                              iconColor = "text-blue-500";
                            }
                            return (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 leading-relaxed text-right"
                              >
                                <span
                                  className={`${iconColor} shrink-0 mt-0.5`}
                                >
                                  <IconComponent size={12} />
                                </span>
                                <span className="text-slate-600 font-medium">
                                  {f}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        <button
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            if (
                              (currentUser.walletBalance || 0) < plan.priceEgp
                            ) {
                              setMembershipErrorTitle(
                                `رصيد المحفظة لا يكفي للاشتراك في ${plan.name}`,
                              );
                              setIsMembershipErrorOpen(true);
                            } else {
                              const bonusPoints = plan.bonusPoints || 0;
                              const expiryAdd =
                                (plan.durationDays || 0) * 24 * 60 * 60 * 1000;

                              const currentExpiry =
                                currentUser.membershipExpiry &&
                                currentUser.membershipExpiry > Date.now()
                                  ? currentUser.membershipExpiry
                                  : Date.now();

                              onUpdateUser({
                                walletBalance:
                                  (currentUser.walletBalance || 0) -
                                  plan.priceEgp,
                                membershipTier: plan.id as "gold" | "silver",
                                membershipExpiry: currentExpiry + expiryAdd,
                                points: currentUser.points + bonusPoints,
                              });
                              setWalletMessage({
                                type: "success",
                                text: `تم ${isUpgrade ? "ترقية" : "تفعيل"} العضوية إلى ${plan.name} بنجاح! ${bonusPoints > 0 ? `وحصلت على مكافأة ${bonusPoints} نقطة` : ""}`,
                              });
                            }
                          }}
                          className={`w-full text-xs font-bold py-2 rounded-lg transition-colors ${isDisabled ? "bg-slate-200 text-slate-500 cursor-not-allowed" : plan.color === "amber" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : plan.color === "blue" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                        >
                          {isDisabled
                            ? "غير متاح للذهبي"
                            : isUpgrade
                              ? "ترقية للذهبية"
                              : "شراء واشتراك"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {currentUser.role !== "admin" && (
        <div className="mt-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-green-600"></div>
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Wallet className="text-emerald-500" size={18} />
            المحفظة المالية والتحويلات
          </h4>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setWalletAction("convert_points_to_money");
                resetWalletForm();
              }}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg border flex items-center gap-1.5 transition-colors ${walletAction === "convert_points_to_money" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              <ArrowRightLeft size={14} /> تحويل نقاط لفلوس
            </button>
            <button
              onClick={() => {
                setWalletAction("convert_money_to_points");
                resetWalletForm();
              }}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg border flex items-center gap-1.5 transition-colors ${walletAction === "convert_money_to_points" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              <ArrowRightLeft size={14} /> شحن نقاط بالفلوس
            </button>
            <button
              onClick={() => {
                setWalletAction("withdraw");
                resetWalletForm();
              }}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg border flex items-center gap-1.5 transition-colors ${walletAction === "withdraw" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              <Banknote size={14} /> طلب سحب أموال
            </button>
            <button
              onClick={() => {
                setWalletAction("deposit");
                resetWalletForm();
              }}
              className={`px-4 py-2 text-[10px] font-bold rounded-lg border flex items-center gap-1.5 transition-colors ${walletAction === "deposit" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              <Wallet size={14} /> شحن أموال للمحفظة
            </button>
          </div>

          {walletAction !== "none" && (
            <form
              onSubmit={handleWalletSubmit}
              className="space-y-4 bg-slate-50 p-4 border border-slate-100 rounded-xl"
            >
              {walletMessage.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2 ${walletMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                  {walletMessage.type === "success" ? (
                    <Check size={16} />
                  ) : (
                    <X size={16} />
                  )}
                  {walletMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-600 font-sans mb-1.5">
                  {walletAction === "convert_points_to_money"
                    ? "المقدار (نقاط)"
                    : "المقدار (ج.م)"}
                </label>
                <input
                  type="number"
                  min="1"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(Number(e.target.value))}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  placeholder="أدخل المقدار"
                  required
                />
              </div>

              {walletAction === "convert_points_to_money" && (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] p-2 rounded-lg font-sans">
                  سعر الصرف الحالي:{" "}
                  <strong>{settings.pointsToEgpRate || 25} نقطة</strong> = 1 ج.م
                  <br />
                  {walletAmount > 0 && (
                    <span>
                      الاستحقاق المتوقع:{" "}
                      <strong className="font-mono">
                        {(
                          (walletAmount || 0) / (settings.pointsToEgpRate || 25)
                        ).toFixed(2)}{" "}
                        ج.م
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {walletAction === "convert_money_to_points" && (
                <div className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] p-2 rounded-lg font-sans">
                  سعر الصرف الحالي: 1 ج.م ={" "}
                  <strong>{settings.egpToPointsRate || 25} نقطة</strong>
                  <br />
                  {walletAmount > 0 && (
                    <span>
                      الاستحقاق المتوقع:{" "}
                      <strong className="font-mono">
                        {(
                          (walletAmount || 0) * (settings.egpToPointsRate || 25)
                        ).toFixed(0)}{" "}
                        نقطة
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {walletAction === "deposit" && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl mb-4 text-center">
                  <p className="text-[11px] text-orange-800 font-bold mb-2">
                    قم بتحويل المبلغ على الرقم التالي:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-black text-lg text-orange-900 tracking-wider">
                      01022293420
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("01022293420");
                        setWalletMessage({
                          type: "success",
                          text: "تم نسخ الرقم بنجاح",
                        });
                        setTimeout(
                          () => setWalletMessage({ type: "", text: "" }),
                          2000,
                        );
                      }}
                      className="bg-orange-200 hover:bg-orange-300 text-orange-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="نسخ الرقم"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              )}

              {(walletAction === "withdraw" || walletAction === "deposit") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-600 font-sans mb-1.5">
                      اختر المحفظة الإلكترونية
                    </label>
                    <select
                      value={walletProvider}
                      onChange={(e) => setWalletProvider(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    >
                      <option value="vodafone">
                        فودافون كاش (Vodafone Cash)
                      </option>
                      <option value="orange">اورنج كاش (Orange Cash)</option>
                      <option value="etisalat">
                        اتصالات كاش (Etisalat Cash)
                      </option>
                      <option value="we">وي باي (We Pay)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 font-sans mb-1.5">
                      {walletAction === "withdraw"
                        ? "رقم الهاتف لاستلام المبلغ"
                        : "رقم الهاتف الذي قمت بالتحويل منه"}
                    </label>
                    <input
                      type="text"
                      value={paymentDetails}
                      onChange={(e) => setPaymentDetails(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                      placeholder="أدخل رقمك"
                      required
                      dir="ltr"
                    />
                    {walletAction === "withdraw" && (
                      <p className="mt-1.5 text-[10px] text-rose-500 font-bold leading-relaxed bg-rose-50 p-2 rounded-lg border border-rose-100">
                        يجب أن يكون الرقم مرتبطاً بالمحفظة الإلكترونية المحددة
                        لاستقبال الأموال بشكل صحيح.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {walletAction === "deposit" && (
                <div>
                  <label className="block text-xs text-slate-600 font-sans mb-1.5">
                    إيصال التحويل (صورة)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setScreenshot(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                  {screenshot && (
                    <div className="mt-2">
                      <img
                        src={screenshot}
                        alt="Receipt"
                        className="h-20 w-20 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  تأكيد العملية
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWalletAction("none");
                    resetWalletForm();
                  }}
                  className="px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Transactions History for the user */}
          {transactions.filter((t) => t.userId === currentUser.id).length >
            0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 mb-3 flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-500" />
                سجل طلبات المحفظة
              </h4>
              <div className="space-y-2">
                {transactions
                  .filter((t) => t.userId === currentUser.id)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">
                          {tx.type === "withdraw" && "سحب أموال"}
                          {tx.type === "deposit" && "إيداع أموال"}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">
                          {new Date(tx.timestamp).toLocaleString("ar-EG")}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-[12px] font-black font-mono tracking-tight text-slate-800 mb-0.5">
                          {tx.amountMoney?.toFixed(2)} ج.م
                        </p>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-lg font-bold ${
                            tx.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : tx.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {tx.status === "approved"
                            ? "مقبول"
                            : tx.status === "rejected"
                              ? "مرفوض"
                              : "قيد المراجعة"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Custom Punishment Options for the Wheel */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600 animate-pulse" />
              تخصيص عقابات عجلة الحظ ⚙️🎈
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              هنا يمكنك إضافة عقابات مخصصة جديدة لعجلة الحظ الدوارة لتحديات مجموعتك الدراسية! سيتم دمجها تلقائياً مع العقابات الرئيسية عند الدوران في المحكمة.
            </p>

            {/* List with existing custom punishments */}
            <div className="space-y-2 mb-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                <span className="text-[10px] bg-slate-250 text-slate-700 px-1.5 py-0.5 rounded-md font-mono font-bold absolute top-1.5 left-2">أساسي التطبيق</span>
                <p className="text-xs text-slate-700 font-sans pr-1">1. تذاكر المرة الجاية والكاميرا مفتوحة. 🎥</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                <span className="text-[10px] bg-slate-250 text-slate-700 px-1.5 py-0.5 rounded-md font-mono font-bold absolute top-1.5 left-2">أساسي التطبيق</span>
                <p className="text-xs text-slate-700 font-sans pr-1">2. أنت اللي هتعمل ملخص الفصل الجاي وتنزله لصحابك. 📝</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden">
                <span className="text-[10px] bg-slate-250 text-slate-700 px-1.5 py-0.5 rounded-md font-mono font-bold absolute top-1.5 left-2">أساسي التطبيق</span>
                <p className="text-xs text-slate-700 font-sans pr-1">3. بروفايلك يفضل عليه شارة "الكسول" لمدة 24 ساعة. 🐌</p>
              </div>

              {/* Saved custom list items */}
              {(currentUser.customPunishments || []).map((pun, index) => (
                <div key={index} className="p-3 bg-indigo-50/50 border border-indigo-100/55 rounded-xl flex items-center justify-between gap-2.5 animate-fade-in animate-duration-300">
                  <p className="text-xs text-indigo-950 font-semibold font-sans">{pun}</p>
                  <button
                    onClick={() => {
                      const updated = (currentUser.customPunishments || []).filter((_, i) => i !== index);
                      onUpdateUser({ customPunishments: updated });
                    }}
                    className="p-1 px-2.5 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all border border-rose-250 cursor-pointer"
                  >
                    حذف العقاب
                  </button>
                </div>
              ))}
            </div>

            {/* Form to insert new punishment */}
            <div className="flex gap-2.5">
              <input
                id="new-pun-input"
                type="text"
                placeholder="أدخل عقاباً جديداً (مثلاً: يشتري عصير للكل المرة الجاية)"
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.currentTarget;
                    const val = target.value.trim();
                    if (val) {
                      const currentPuns = currentUser.customPunishments || [];
                      onUpdateUser({ customPunishments: [...currentPuns, val] });
                      target.value = "";
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('new-pun-input') as HTMLInputElement | null;
                  if (input && input.value.trim()) {
                    const val = input.value.trim();
                    const currentPuns = currentUser.customPunishments || [];
                    onUpdateUser({ customPunishments: [...currentPuns, val] });
                    input.value = "";
                  }
                }}
                className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all select-none cursor-pointer"
              >
                + إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="حذف الحساب نهائياً"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 font-sans leading-relaxed text-right">
            هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ سيتم مسح جميع نقاطك،
            إنجازاتك والمجموعات التي تشارك بها. لا يمكن التراجع عن هذه الخطوة!
          </p>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
            >
              تراجع
            </button>
            <button
              onClick={onDeleteAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              حذف الحساب
            </button>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isMembershipErrorOpen}
        onClose={() => setIsMembershipErrorOpen(false)}
        title="تنبيه رصيد المحفظة"
      >
        <div className="space-y-4 text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Wallet size={32} />
          </div>
          <h3 className="font-bold text-lg text-slate-800 font-sans">
            {membershipErrorTitle}
          </h3>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            يرجى أولاً شحن المحفظة بالمبلغ المطلوب من خلال نموذج المحفظة
            المالية، لتتمكن من ترقية عضويتك والتمتع بالمميزات الحصرية.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 mt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setIsMembershipErrorOpen(false);
                setTimeout(() => {
                  setWalletAction("deposit");
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }, 100);
              }}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-colors shadow-md flex justify-center items-center gap-2"
            >
              <Banknote size={18} /> شحن المحفظة الآن
            </button>
            <button
              onClick={() => setIsMembershipErrorOpen(false)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors flex justify-center items-center"
            >
              إلغاء الأمر
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
