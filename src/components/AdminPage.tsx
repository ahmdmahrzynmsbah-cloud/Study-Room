/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  User,
  Group,
  Challenge,
  AppSettings,
  LogEntry,
  TransactionRequest,
  UserNotification,
} from "../types";
import {
  Users,
  Users as GroupIcon,
  ShieldAlert,
  Settings,
  ClipboardList,
  TrendingUp,
  Trash2,
  Edit,
  RefreshCw,
  KeyRound,
  Check,
  X,
  Shield,
  Plus,
  RotateCcw,
  AlertCircle,
  Eye,
  Wallet,
  Image,
  Upload,
  Crown,
  Clock,
  Timer,
  User as UserIcon,
} from "lucide-react";

interface AdminPageProps {
  currentUser: User;
  users: User[];
  groups: Group[];
  challenges: Challenge[];
  settings: AppSettings;
  logs: LogEntry[];
  transactions: TransactionRequest[];
  notifications: UserNotification[];
  onUpdateUsers: (updatedUsers: User[]) => void;
  onUpdateGroups: (updatedGroups: Group[]) => void;
  onUpdateChallenges: (updatedChallenges: Challenge[]) => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onUpdateTransactions: (transactions: TransactionRequest[]) => void;
  onUpdateNotifications: (newNotifications: UserNotification[]) => void;
  onAddLog: (action: string, details: string) => void;
  onNavigate: (page: string) => void;
  onSelectGroup: (groupId: string) => void;
  activeAdminTab?:
    | "dashboard"
    | "users"
    | "groups"
    | "challenges"
    | "points"
    | "settings"
    | "logs"
    | "wallet"
    | "plans"
    | "notifications";
}

export default function AdminPage({
  currentUser,
  users,
  groups,
  challenges,
  settings,
  logs,
  transactions,
  notifications,
  onUpdateUsers,
  onUpdateGroups,
  onUpdateChallenges,
  onUpdateSettings,
  onUpdateTransactions,
  onUpdateNotifications,
  onAddLog,
  onNavigate,
  onSelectGroup,
  activeAdminTab = "dashboard",
}: AdminPageProps) {
  const activeTab = activeAdminTab;

  // Search, edit filters
  const [userSearch, setUserSearch] = useState("");
  const [filterStage, setFilterStage] = useState<"all" | "middle" | "high">(
    "all",
  );
  const [filterLevel, setFilterLevel] = useState<"all" | "1st" | "2nd" | "3rd">(
    "all",
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Custom Modals inside Admin
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingSubscriptionUser, setViewingSubscriptionUser] =
    useState<User | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(
    null,
  );
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(
    null,
  );
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // New user form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [newUserAvatar, setNewUserAvatar] = useState("📚");

  // Leaderboard adjustment state
  const [selectedAdjustUserId, setSelectedAdjustUserId] = useState("");
  const [pointsDelta, setPointsDelta] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<"points" | "wallet">("points");
  const [adjustReason, setAdjustReason] = useState("");

  // Notification wizard form states
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'penalty' | 'admin'>("info");
  const [notifTargetType, setNotifTargetType] = useState<"all" | "specific">("all");
  const [notifTargetUserIds, setNotifTargetUserIds] = useState<string[]>([]);
  const [notifStudentSearchQuery, setNotifStudentSearchQuery] = useState("");

  // Settings editing local state
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    ...settings,
  });

  // Custom visual feedback
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Log filter
  const [logFilterQuery, setLogFilterQuery] = useState("");

  // Active period for the admin statistics chart Choose from 'weekly' | 'monthly' | 'yearly' | 'all'
  const [chartPeriod, setChartPeriod] = useState<
    "weekly" | "monthly" | "yearly" | "all"
  >("weekly");

  // Pre-configured avatars
  const avatars = [
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jude&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Liam&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Oliver&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Amelia&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/micah/svg?seed=Sophia&backgroundColor=e2e8f0",
    "https://api.dicebear.com/7.x/micah/svg?seed=Mia&backgroundColor=e2e8f0",
  ];

  // Timestamps and count calculations for charts dynamically
  let usersCountByDay: { label: string; count: number }[] = [];

  if (chartPeriod === "weekly") {
    // Last 7 days (by day)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    usersCountByDay = days.map((day) => {
      const dayStart = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
      ).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = users.filter(
        (u) => u.createdAt >= dayStart && u.createdAt < dayEnd,
      ).length;
      return {
        label: day.toLocaleDateString("ar-EG", { weekday: "short" }),
        count,
      };
    });
  } else if (chartPeriod === "monthly") {
    // Last 4 weeks (grouped)
    usersCountByDay = Array.from({ length: 4 }, (_, i) => {
      const dStart = new Date();
      dStart.setDate(dStart.getDate() - (4 - i) * 7);
      const dEnd = new Date();
      dEnd.setDate(dEnd.getDate() - (3 - i) * 7);

      const dayStart = new Date(
        dStart.getFullYear(),
        dStart.getMonth(),
        dStart.getDate(),
      ).getTime();
      const dayEnd = new Date(
        dEnd.getFullYear(),
        dEnd.getMonth(),
        dEnd.getDate(),
      ).getTime();
      const count = users.filter(
        (u) => u.createdAt >= dayStart && u.createdAt < dayEnd,
      ).length;
      return {
        label: `أسبوع ${i + 1}`,
        count,
      };
    });
  } else if (chartPeriod === "yearly") {
    // Last 12 months (grouped by month)
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d;
    });
    usersCountByDay = months.map((m) => {
      const monthStart = new Date(m.getFullYear(), m.getMonth(), 1).getTime();
      const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 1).getTime();
      const count = users.filter(
        (u) => u.createdAt >= monthStart && u.createdAt < monthEnd,
      ).length;
      return {
        label: m.toLocaleDateString("ar-EG", { month: "short" }),
        count,
      };
    });
  } else {
    // All time grouped by year (last 4 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 4 }, (_, i) => currentYear - (3 - i));
    usersCountByDay = years.map((yr) => {
      const yearStart = new Date(yr, 0, 1).getTime();
      const yearEnd = new Date(yr + 1, 0, 1).getTime();
      const count = users.filter(
        (u) => u.createdAt >= yearStart && u.createdAt < yearEnd,
      ).length;
      return {
        label: `${yr} م`,
        count,
      };
    });
  }

  // Calculate high level stats
  const totalUsers = users.length;
  const totalGroups = groups.filter((g) => g.isActive).length;
  const totalChallenges = challenges.length;
  const activeRooms = challenges.filter((c) => c.status === "active").length;
  const totalStudyMinutes = users.reduce(
    (acc, u) => acc + (u.totalStudyMinutes || 0),
    0,
  );

  // Challenge status stats
  const pendingCount = challenges.filter((c) => c.status === "pending").length;
  const activeCount = challenges.filter((c) => c.status === "active").length;
  const completedCount = challenges.filter(
    (c) => c.status === "completed",
  ).length;
  const cancelledCount = challenges.filter(
    (c) => c.status === "cancelled",
  ).length;

  // Top 5 users
  const top5Users = [...users]
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const displaySuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const displayError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(""), 4000);
  };

  const handlePublishNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      displayError("يرجى ملء جميع الحقول المطلوبة (العنوان ومضمون الرسالة).");
      return;
    }

    const targetIds = notifTargetType === "all" ? ["all"] : notifTargetUserIds;
    if (notifTargetType === "specific" && targetIds.length === 0) {
      displayError("يرجى تحديد طالب واحد على الأقل للمستهدفين.");
      return;
    }

    const newNotif: UserNotification = {
      id: "notif_" + Date.now(),
      userIds: targetIds,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      timestamp: Date.now(),
      readBy: [],
    };

    onUpdateNotifications([...notifications, newNotif]);
    onAddLog(
      "إرسال إشعار دراسي",
      `تم إرسال تنبيه بعنوان "${notifTitle.trim()}" إلى الجمهور المستهدف (${notifTargetType === 'all' ? 'جميع الطلاب' : `${targetIds.length} طالب`})`
    );

    // Reset Form
    setNotifTitle("");
    setNotifMessage("");
    setNotifType("info");
    setNotifTargetType("all");
    setNotifTargetUserIds([]);
    displaySuccess("تم نشر وإرسال التنبيه الفوري لكافة الطلاب المستهدفين بنجاح! 🚀");
  };

  const handleDeletePastNotification = (notifId: string) => {
    setConfirmState({
      isOpen: true,
      message: "هل أنت متأكد من رغبتك في حذف هذا التنبيه من سجلات الطلاب؟ لن يتوفر لهم بعد الآن.",
      onConfirm: () => {
        const updated = notifications.filter(n => n.id !== notifId);
        onUpdateNotifications(updated);
        onAddLog("حذف إشعار", `تم سحب وحذف الإشعار ذي الرمز ${notifId}`);
        setConfirmState(null);
      }
    });
  };

  // --- ACTIONS ---

  // User additions
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
      displayError("يرجى تعبئة كافة الحقول المطلوبة للمستخدم.");
      return;
    }

    if (
      users.some(
        (u) => u.email.toLowerCase() === newUserEmail.toLowerCase().trim(),
      )
    ) {
      displayError("البريد الإلكتروني هذا مستخدم بالفعل في النظام.");
      return;
    }

    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword,
      avatar: newUserAvatar,
      role: newUserRole,
      points: 200, // starting points
      walletBalance: 0,
      membershipTier: "free",
      totalStudyMinutes: 0,
      challengesJoined: 0,
      challengesCompleted: 0,
      createdAt: Date.now(),
      isActive: true,
    };

    onUpdateUsers([...users, newUser]);
    onAddLog(
      "إضافة مستخدم",
      `تم إنشاء العضو الجديد ${newUser.name} من قبل الإدارة.`,
    );
    displaySuccess(
      `تمت إضافة الزميل ${newUser.name} كـ ${newUserRole === "admin" ? "مشرف" : "مستخدم"} بنجاح.`,
    );

    // reset form fields
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setShowAddUserModal(false);
  };

  // Editing User Save
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = users.map((u) =>
      u.id === editingUser.id ? editingUser : u,
    );
    onUpdateUsers(updated);
    onAddLog("تعديل مستخدم", `تم تحوير ملف الزميل ${editingUser.name}.`);
    displaySuccess("تم تحديث ملف تعريف المستخدم بنجاح.");
    setEditingUser(null);
  };

  // Activate / Deactivate account
  const handleToggleUserActive = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.id === "user-admin" || user.email === "admin@studyroom.app") {
      displayError("لا يمكن تعطيل أو تعديل حساب المدير الأساسي للنظام.");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });

    onUpdateUsers(updated);
    const stateText = !user.isActive ? "تنشيط" : "تعطيل";
    onAddLog(
      `${stateText} مستخدم`,
      `قام المشرف بـ ${stateText} العضو ${user.name}.`,
    );
    displaySuccess(`تم ${stateText} الحساب بنجاح.`);
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    if (userId === "user-admin" || userId === currentUser.id) {
      displayError("لا يمكنك حذف حسابك الخاص أو حساب المدير الأساسي.");
      return;
    }

    const target = users.find((u) => u.id === userId);
    if (!target) return;

    setConfirmState({
      isOpen: true,
      message:
        "هل أنت متأكد من حذف الحساب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!",
      onConfirm: () => {
        const updated = users.filter((u) => u.id !== userId);
        onUpdateUsers(updated);
        onAddLog(
          "حذف مستخدم",
          `تم إقصاء وحذف المستخدم ${target.name} نهائياً.`,
        );
        displaySuccess(
          `تم مسح وحذف الزميل ${target.name} من ركائز قاعدة البيانات.`,
        );
        setConfirmState(null);
      },
    });
  };

  // Bulk status updates
  const handleBulkDeactivate = () => {
    if (selectedUserIds.length === 0) return;
    const adminTargeted =
      selectedUserIds.includes("user-admin") ||
      selectedUserIds.includes(currentUser.id);

    const idsToDeactivate = selectedUserIds.filter(
      (id) => id !== "user-admin" && id !== currentUser.id,
    );
    if (idsToDeactivate.length === 0 && adminTargeted) {
      displayError("لا يمكن تعطيل بيانات المدير أو الحساب الخاص بك.");
      return;
    }

    const updated = users.map((u) => {
      if (idsToDeactivate.includes(u.id)) {
        return { ...u, isActive: false };
      }
      return u;
    });

    onUpdateUsers(updated);
    setSelectedUserIds([]);
    onAddLog(
      "تعطيل جماعي",
      `تعطيل حسابات عدد ${idsToDeactivate.length} من المستخدمين دفعة واحدة.`,
    );
    displaySuccess("تم تعطيل الحسابات المحددة بنجاح بنظام الدفعة الجماعية.");
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) return;

    setConfirmState({
      isOpen: true,
      message:
        "هل أنت متأكد من حذف الحسابات المحددة نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!",
      onConfirm: () => {
        const idsToDelete = selectedUserIds.filter(
          (id) => id !== "user-admin" && id !== currentUser.id,
        );
        if (idsToDelete.length === 0) {
          displayError("لا يمكن حذف حساب الإدارة أو حسابك الشغال.");
          setConfirmState(null);
          return;
        }

        const updated = users.filter((u) => !idsToDelete.includes(u.id));
        onUpdateUsers(updated);
        setSelectedUserIds([]);
        onAddLog(
          "حذف جماعي",
          `إزالة وحذف عدد ${idsToDelete.length} مستخدم من المنصة.`,
        );
        displaySuccess("تم تنظيف وحذف الحسابات المحددة جماعياً.");
        setConfirmState(null);
      },
    });
  };

  const handleToggleGroupActive = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, isActive: !g.isActive };
      }
      return g;
    });

    onUpdateGroups(updated);
    const stateText = !group.isActive ? "تنشيط" : "تعطيل";
    onAddLog(
      `${stateText} مجموعة`,
      `قام المشرف بـ ${stateText} المجموعة ${group.name}.`,
    );
    displaySuccess(`تم ${stateText} المجموعة بنجاح.`);
  };

  // Group Management Saves
  const handleSaveGroupEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    const updated = groups.map((g) =>
      g.id === editingGroup.id ? editingGroup : g,
    );
    onUpdateGroups(updated);
    onAddLog("تعديل مجموعة", `تم تعديل بيانات مجموعة ${editingGroup.name}.`);
    displaySuccess("تم تعديل تفاصيل المجموعة بنجاح.");
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    setConfirmState({
      isOpen: true,
      message: "هل أنت متأكد من حذف المجموعة؟ هذا الإجراء لا يمكن التراجع عنه!",
      onConfirm: () => {
        const updated = groups.filter((g) => g.id !== groupId);
        onUpdateGroups(updated);
        onAddLog(
          "حذف مجموعة",
          `تم التخلص وإلغاء المجموعة ذات المعرف ${groupId}.`,
        );
        displaySuccess("تم مسح وإلغاء المجموعة بنجاح.");
        setConfirmState(null);
      },
    });
  };

  const handleToggleGroupMember = (groupId: string, userId: string) => {
    const groupObj = groups.find((g) => g.id === groupId);
    if (!groupObj) return;

    let updatedMembers = [...groupObj.members];
    if (updatedMembers.includes(userId)) {
      if (updatedMembers.length <= 1) {
        displayError("لا يمكن إفراغ المجموعة من الأعضاء بالكامل.");
        return;
      }
      updatedMembers = updatedMembers.filter((id) => id !== userId);
    } else {
      updatedMembers.push(userId);
    }

    const updated = groups.map((g) => {
      if (g.id === groupId) {
        return { ...g, members: updatedMembers };
      }
      return g;
    });

    onUpdateGroups(updated);
    displaySuccess("تمت معالجة وتعديل أعضاء المجموعة.");
  };

  // Challenge Force functions
  const handleForceStartChallenge = (challengeId: string) => {
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        const start = Date.now();
        const duration = c.durationMinutes || 45;
        return {
          ...c,
          status: "active" as const,
          startTime: start,
          endTime: start + duration * 60 * 1000,
        };
      }
      return c;
    });
    onUpdateChallenges(updated);
    onAddLog(
      "بدء قسري للتحدي",
      `تم تنشيط وبدء التحدي ${challengeId} قسرياً برغبة الإدارة.`,
    );
    displaySuccess("تم تفعيل وبدء التحدي بنجاح بمؤقت حي.");
  };

  const handleForceEndChallenge = (challengeId: string) => {
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          status: "completed" as const,
          endTime: Date.now(),
        };
      }
      return c;
    });
    onUpdateChallenges(updated);
    onAddLog(
      "إنهاء قسري للتحدي",
      `تم إيقاف وإنهاء جلسة التحدي ${challengeId} قسرياً.`,
    );
    displaySuccess("تم تعليم التحدي كمكتمل بنجاح.");
  };

  const handleCancelChallenge = (challengeId: string) => {
    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          status: "cancelled" as const,
        };
      }
      return c;
    });
    onUpdateChallenges(updated);
    onAddLog("إلغاء تحدي", `تم تغيير حالة التحدي ${challengeId} إلى ملغي.`);
    displaySuccess("تم إلغاء التحدي بنجاح.");
  };

  const handleDeleteChallenge = (challengeId: string) => {
    setConfirmState({
      isOpen: true,
      message: "هل أنت متأكد من حذف التحدي؟ هذا الإجراء لا يمكن التراجع عنه!",
      onConfirm: () => {
        const updated = challenges.filter((c) => c.id !== challengeId);
        onUpdateChallenges(updated);
        onAddLog("حذف تحدي", `تم حذف التحدي ${challengeId} نهائياً.`);
        displaySuccess("تم التخلص من التحدي بنجاح.");
        setConfirmState(null);
      },
    });
  };

  const handleSaveChallengeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;

    const updated = challenges.map((c) =>
      c.id === editingChallenge.id ? editingChallenge : c,
    );
    onUpdateChallenges(updated);
    onAddLog(
      "تعديل نقاط التحدي",
      `تم تعديل نقاط تحدي ${editingChallenge.title}.`,
    );
    displaySuccess("تم تحديث التحدي بنجاح.");
    setEditingChallenge(null);
  };

  // Adjust User Points Manually
  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustUserId) {
      displayError("يرجى اختيار العضو وتحديد النقاط.");
      return;
    }

    const textReason = adjustReason.trim() || "تسوية إدارية عامة";
    const targetUser = users.find((u) => u.id === selectedAdjustUserId);
    if (!targetUser) return;

    const updated = users.map((u) => {
      if (u.id === selectedAdjustUserId) {
        if (adjustType === "wallet") {
          const newBalance = Math.max(0, (u.walletBalance || 0) + pointsDelta);
          return { ...u, walletBalance: newBalance };
        } else {
          const newPoints = Math.max(0, u.points + pointsDelta);
          return { ...u, points: newPoints };
        }
      }
      return u;
    });

    onUpdateUsers(updated);
    const unit = adjustType === "wallet" ? "ج.م" : "نقطة";
    const typeLabel = adjustType === "wallet" ? "رصيد المحفظة" : "رصيد النقاط";
    onAddLog(
      "تعديل يدوي للرصيد",
      `تعديل ${typeLabel} للزميل ${targetUser.name}: (${pointsDelta > 0 ? "+" : ""}${pointsDelta} ${unit}) - السبب: ${textReason}`,
    );
    displaySuccess(`تم تعديل ${typeLabel} بنجاح للعضو الملحق.`);

    // reset adjust form
    setSelectedAdjustUserId("");
    setAdjustReason("");
  };

  const handleResetAllPoints = () => {
    setConfirmState({
      isOpen: true,
      message:
        "هل أنت متأكد تماماً من تصفير كافة النقاط لجميع المشتركين؟ جميع النقاط ستبدأ من 0.",
      onConfirm: () => {
        const updated = users.map((u) => ({ ...u, points: 0 }));
        onUpdateUsers(updated);
        onAddLog(
          "تصفير النقاط الشامل",
          "تم تصفير كافة النقاط لجميع مستخدمي المنصة ريادياً.",
        );
        displaySuccess(
          "تم تصفير كافة ميزانيات النقاط بنجاح لكافة حسابات الطلاب.",
        );
        setConfirmState(null);
      },
    });
  };

  // App Settings save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    onAddLog(
      "تحديث لبروتوكول الإعدادات",
      "تم تعديل مصفوفة إعدادات النظام وتحديث نقاط المكافآت والعقوبات.",
    );
    displaySuccess(
      "تم حفظ إعدادات التطبيق العامة وتطبيقها فوراً على الدارسين.",
    );
  };

  // Log filter
  const filteredLogs = logs.filter((log) => {
    if (!logFilterQuery) return true;
    const q = logFilterQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Header section with top alerts */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-rose-600 font-sans flex items-center gap-2">
            <ShieldAlert size={28} />
            لوحة الإدارة الشاملة للتحكم
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            تحكم بكامل تفاصيل StudyRoom من حسابات وأعضاء ومجموعات وبيانات نقاط
            حية بمرونة قصوى.
          </p>
        </div>

        <button
          onClick={() => onNavigate("dashboard")}
          className="px-5 py-2.5 bg-slate-50 border-slate-200/80 text-slate-800 text-xs font-bold rounded-full border border-slate-200 hover:bg-slate-50 border-slate-200"
        >
          العودة للرئيسية
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-600 font-bold text-xs p-4 rounded-xl flex items-center gap-2">
          <span>✔️</span>
          <p>{actionSuccess}</p>
        </div>
      )}

      {actionError && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs p-4 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <p>{actionError}</p>
        </div>
      )}

      {/* Primary Grid Workspace */}
      <div className="w-full">
        {/* Workspace Display Area */}
        <div className="space-y-6">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat panel */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 border border-slate-200 rounded-2xl text-center">
                  <span className="block text-[10px] text-slate-500 font-sans">
                    الطلاب الإجمالي
                  </span>
                  <span className="text-xl md:text-2xl font-black text-red-400 font-mono mt-1 block">
                    {totalUsers}
                  </span>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-2xl text-center">
                  <span className="block text-[10px] text-slate-500 font-sans">
                    المجموعات النشطة
                  </span>
                  <span className="text-xl md:text-2xl font-black text-blue-600 font-mono mt-1 block">
                    {totalGroups}
                  </span>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-2xl text-center">
                  <span className="block text-[10px] text-slate-500 font-sans">
                    عدد التحديات
                  </span>
                  <span className="text-xl md:text-2xl font-black text-warning font-mono mt-1 block">
                    {totalChallenges}
                  </span>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-2xl text-center">
                  <span className="block text-[10px] text-slate-500 font-sans">
                    غرف نشطة الآن
                  </span>
                  <span className="text-xl md:text-2xl font-black text-success font-mono mt-1 block">
                    {activeRooms}
                  </span>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-2xl text-center">
                  <span className="block text-[10px] text-slate-500 font-sans">
                    إجمالي دقائق المذاكرة
                  </span>
                  <span className="text-xl md:text-2xl font-black text-blue-600 font-mono mt-1 block">
                    {totalStudyMinutes} د
                  </span>
                </div>
              </div>

              {/* Flex grids of charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Dynamic range users */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-slate-800 font-sans">
                      {chartPeriod === "weekly" &&
                        "المنضمون الجدد (آخر 7 أيام)"}
                      {chartPeriod === "monthly" &&
                        "المنضمون الجدد (آخر 30 يومًا)"}
                      {chartPeriod === "yearly" &&
                        "المنضمون الجدد (آخر 12 شهرًا)"}
                      {chartPeriod === "all" && "المنضمون الجدد (كل الأوقات)"}
                    </h3>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto font-sans">
                      <button
                        onClick={() => setChartPeriod("weekly")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          chartPeriod === "weekly"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        أسبوعي
                      </button>
                      <button
                        onClick={() => setChartPeriod("monthly")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          chartPeriod === "monthly"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        شهري
                      </button>
                      <button
                        onClick={() => setChartPeriod("yearly")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          chartPeriod === "yearly"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        سنوي
                      </button>
                      <button
                        onClick={() => setChartPeriod("all")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          chartPeriod === "all"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        كل الأوقات
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end gap-2 h-44 pt-4 border-b border-slate-200">
                    {usersCountByDay.map((day, idx) => {
                      const maxVal = Math.max(
                        ...usersCountByDay.map((d) => d.count),
                        1,
                      );
                      const heightPercent = (day.count / maxVal) * 100;
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar"
                        >
                          <span className="text-[10px] text-slate-800 font-mono font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity translate-y-1 bg-slate-800 text-white px-1 py-0.5 rounded text-[9px] pointer-events-none absolute mb-14">
                            {day.count}
                          </span>
                          <span className="text-[10px] text-slate-800 font-mono">
                            {day.count}
                          </span>
                          <div
                            style={{ height: `${Math.max(8, heightPercent)}%` }}
                            className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all group-hover/bar:from-indigo-500 group-hover/bar:to-indigo-300 shadow-sm"
                          ></div>
                          <span
                            className="text-[9px] text-slate-500 font-sans mt-1 text-center truncate max-w-full"
                            title={day.label}
                          >
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Top 5 Users Bar */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md space-y-4">
                  <h3 className="font-bold text-xs text-slate-800 font-sans">
                    أفضل 5 طلاب متصدرين حالياً بالرصيد
                  </h3>
                  <div className="space-y-3 pt-2">
                    {top5Users.map((u, idx) => {
                      const maxPoints = Math.max(
                        ...top5Users.map((user) => user.points),
                        1,
                      );
                      const barWidth = (u.points / maxPoints) * 100;
                      return (
                        <div key={u.id} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-sans">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <span>#{idx + 1}</span>
                              <span>{u.name}</span>
                            </span>
                            <span className="font-mono text-warning font-bold">
                              {u.points} نقطة
                            </span>
                          </div>
                          <div className="w-full bg-slate-50 border-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${barWidth}%` }}
                              className="bg-primary h-full rounded-full transition-all"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 3: Challenges state Status percentage */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md space-y-4 col-span-1 md:col-span-2">
                  <h3 className="font-bold text-xs text-slate-800 font-sans">
                    حالة ونسب التحديات الكلية بالنظام
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                    <div className="bg-slate-50 border-slate-200/30 p-4 border border-slate-200 rounded-xl">
                      <span className="block text-[10px] text-slate-500">
                        قيد الانتظار (معلقة)
                      </span>
                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-xl font-black text-warning font-mono">
                          {pendingCount}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {totalChallenges > 0
                            ? ((pendingCount / totalChallenges) * 100).toFixed(
                                0,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border-slate-200/30 p-4 border border-slate-200 rounded-xl">
                      <span className="block text-[10px] text-slate-500">
                        غرف دراسة نشطة
                      </span>
                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-xl font-black text-success font-mono">
                          {activeCount}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {totalChallenges > 0
                            ? ((activeCount / totalChallenges) * 100).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border-slate-200/30 p-4 border border-slate-200 rounded-xl">
                      <span className="block text-[10px] text-slate-500">
                        تحديات مكتملة بنجاح
                      </span>
                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-xl font-black text-blue-600 font-mono">
                          {completedCount}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {totalChallenges > 0
                            ? (
                                (completedCount / totalChallenges) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border-slate-200/30 p-4 border border-slate-200 rounded-xl">
                      <span className="block text-[10px] text-slate-500">
                        تحديات ملغاة
                      </span>
                      <div className="flex justify-between items-baseline mt-1.5">
                        <span className="text-xl font-black text-red-400 font-mono">
                          {cancelledCount}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {totalChallenges > 0
                            ? (
                                (cancelledCount / totalChallenges) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-5/6">
                  <div className="flex-1 w-full min-w-[200px]">
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="ابحث بالنظام بالاسم أو البريد..."
                      className="w-full bg-white text-sm border border-slate-200 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
                    />
                  </div>

                  <div className="flex-1 w-full flex flex-row gap-2">
                    <select
                      value={filterStage}
                      onChange={(e) => {
                        setFilterStage(e.target.value as any);
                        if (e.target.value === "all") {
                          setFilterLevel("all"); // reset level if stage is all
                        }
                      }}
                      className="w-1/2 bg-white text-sm border border-slate-200 px-3 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-red-400"
                    >
                      <option value="all">كل المراحل</option>
                      <option value="middle">إعدادي</option>
                      <option value="high">ثانوي</option>
                    </select>

                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value as any)}
                      disabled={filterStage === "all"}
                      className="w-1/2 bg-white text-sm border border-slate-200 px-3 py-3 rounded-xl text-slate-800 focus:outline-none focus:border-red-400 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="all">كل الصفوف</option>
                      <option value="1st">الأول</option>
                      <option value="2nd">الثاني</option>
                      <option value="3rd">الثالث</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="shrink-0 px-6 py-3 bg-red-500 text-white font-sans text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus size={16} /> إضافة مستخدم
                  </button>
                </div>

                {selectedUserIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 border-slate-200/40 p-1.5 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 px-2 font-semibold">
                      محدد: {selectedUserIds.length}
                    </span>
                    <button
                      onClick={handleBulkDeactivate}
                      className="px-2.5 py-1 bg-warning/10 text-warning text-[10px] font-bold rounded hover:bg-warning/20 transition-all select-none cursor-pointer"
                    >
                      تعطيل جماعي
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-2.5 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded hover:bg-red-500/20 transition-all select-none cursor-pointer"
                    >
                      حذف نهائي
                    </button>
                  </div>
                )}
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs" dir="rtl">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 border-slate-200/15 text-slate-500 font-sans">
                        <th className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.length === users.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUserIds(users.map((u) => u.id));
                              } else {
                                setSelectedUserIds([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 font-bold">المعرف</th>
                        <th className="px-4 py-3 font-bold">الاسم والملف</th>
                        <th className="px-4 py-3 font-bold">الدور</th>
                        <th className="px-4 py-3 font-bold text-center">
                          النقاط الكلية
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          قنوات النشاط
                        </th>
                        <th className="px-4 py-3 font-bold">الحالة</th>
                        <th className="px-4 py-3 font-bold text-center">
                          أوامر التحكم
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users
                        .filter((u) => {
                          const q = userSearch.toLowerCase();
                          const matchesSearch =
                            u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q);

                          const matchesStage =
                            filterStage === "all" ||
                            u.educationalStage === filterStage;
                          const matchesLevel =
                            filterLevel === "all" ||
                            u.educationalLevel === filterLevel;

                          return matchesSearch && matchesStage && matchesLevel;
                        })
                        .map((user) => {
                          const isSelected = selectedUserIds.includes(user.id);
                          const isAdminRole = user.role === "admin";
                          const isPrimaryAdmin =
                            user.id === "user-admin" ||
                            user.email === "admin@studyroom.app";

                          return (
                            <tr
                              key={user.id}
                              className={`transition-colors hover:bg-slate-50 ${user.id === currentUser.id ? "bg-slate-50 border-slate-200/10" : ""}`}
                            >
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUserIds([
                                        ...selectedUserIds,
                                        user.id,
                                      ]);
                                    } else {
                                      setSelectedUserIds(
                                        selectedUserIds.filter(
                                          (id) => id !== user.id,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                                {user.id}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-lg w-7 h-7 bg-slate-50 border-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {user.avatar?.match(/^(http|data:)/) ? (
                                      <img
                                        src={user.avatar}
                                        alt="avatar"
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      user.avatar
                                    )}
                                  </span>
                                  <div>
                                    <h5 className="font-bold text-slate-800 font-sans flex items-center gap-1.5">
                                      {user.name}
                                      {user.id === currentUser.id && (
                                        <span className="text-[8px] bg-blue-600/20 text-blue-600 px-1 rounded">
                                          انت
                                        </span>
                                      )}
                                    </h5>
                                    <span className="text-[10px] text-slate-500 block">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isAdminRole
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-blue-100 text-blue-600"
                                  }`}
                                >
                                  {isAdminRole ? "مدير" : "مستخدم"}
                                </span>
                                {user.membershipTier && (
                                  <span
                                    className={`px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold block w-fit ${
                                      user.membershipTier === "gold"
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-slate-200 text-blue-600"
                                    }`}
                                  >
                                    {user.membershipTier === "gold"
                                      ? "ذهبية"
                                      : "فضية"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold whitespace-nowrap">
                                <div className="text-warning">
                                  {user.points}ن
                                </div>
                                <div className="text-emerald-600 text-[10px]">
                                  {(user.walletBalance || 0).toFixed(2)}ج.م
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-[10px] text-slate-500 font-sans">
                                📚 {user.challengesCompleted} تم |{" "}
                                {user.totalStudyMinutes} دقيقة
                              </td>
                              <td className="px-4 py-3">
                                <label
                                  className={`relative inline-flex items-center ${isPrimaryAdmin ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                  title={
                                    user.isActive
                                      ? "تعطيل الحساب"
                                      : "تنشيط الحساب"
                                  }
                                >
                                  <input
                                    type="checkbox"
                                    checked={user.isActive}
                                    onChange={() =>
                                      !isPrimaryAdmin &&
                                      handleToggleUserActive(user.id)
                                    }
                                    className="sr-only peer"
                                    disabled={isPrimaryAdmin}
                                  />
                                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setViewingUser(user)}
                                    className="p-1 hover:bg-slate-50 border-slate-200 text-slate-600 rounded transition-all select-none cursor-pointer"
                                    title="عرض البيانات"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(user)}
                                    className="p-1 hover:bg-slate-50 border-slate-200 text-blue-600 rounded transition-all select-none cursor-pointer"
                                    title="تعديل الحساب"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1 hover:bg-red-500/15 text-rose-600 rounded transition-all select-none cursor-pointer"
                                    title="حذف البيانات نهائياً"
                                    disabled={isPrimaryAdmin}
                                  >
                                    <Trash2 size={14} />
                                  </button>
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
          )}

          {/* TAB 3: GROUP MANAGEMENT */}
          {activeTab === "groups" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 bg-slate-50 border-slate-200/10 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-xs text-slate-800 font-sans">
                    تتبع وإدارة مجموعات الأصدقاء ({totalGroups})
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    يتم تنشيط وحذف المجموعات من خلال الأوامر التالية
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs" dir="rtl">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 border-slate-200/10 text-slate-500 font-sans">
                        <th className="px-5 py-3 font-bold">اسم المجموعة</th>
                        <th className="px-5 py-3 font-bold">مؤسس المجموعة</th>
                        <th className="px-5 py-3 font-bold text-center">
                          عدد الأعضاء
                        </th>
                        <th className="px-5 py-3 font-bold text-center">
                          الحالة
                        </th>
                        <th className="px-5 py-3 font-bold text-center">
                          أوامر التحكم والتحرير
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {groups.map((group) => {
                        const creator = users.find(
                          (u) => u.id === group.createdBy,
                        );
                        return (
                          <tr
                            key={group.id}
                            className="transition-colors hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div>
                                <h4 className="font-semibold text-slate-800 font-sans">
                                  {group.name}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-sans block mt-0.5 max-w-sm line-clamp-1">
                                  {group.description}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-800 font-sans">
                              {creator?.name || "مجهول"}
                            </td>
                            <td className="px-5 py-4 text-center font-mono font-bold text-blue-600">
                              {group.members.length} زملاء
                            </td>
                            <td className="px-5 py-4 text-center">
                              <label
                                className="relative inline-flex items-center cursor-pointer"
                                title={
                                  group.isActive
                                    ? "تعطيل المجموعة"
                                    : "تنشيط المجموعة"
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={group.isActive}
                                  onChange={() =>
                                    handleToggleGroupActive(group.id)
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                              </label>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    onSelectGroup(group.id);
                                    onNavigate("group-detail");
                                  }}
                                  className="px-2.5 py-1 bg-slate-50 border-slate-200 border border-slate-200 text-slate-800 rounded hover:bg-slate-200 transition-all cursor-pointer"
                                >
                                  استعراض
                                </button>
                                <button
                                  onClick={() => setEditingGroup(group)}
                                  className="p-1 hover:bg-slate-50 border-slate-200 text-blue-600 rounded transition-all cursor-pointer"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-1 hover:bg-red-500/10 text-rose-600 rounded transition-all cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
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
          )}

          {/* TAB 4: CHALLENGE MANAGEMENT */}
          {activeTab === "challenges" && (
            <div className="space-y-6">
              {/* Admin Reviews Section for Submissions */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 bg-warning/10 border-b border-warning/20">
                  <h3 className="font-bold text-xs text-warning font-sans flex items-center gap-2">
                    <Shield size={16} /> مراجعات الإدارة (مهام أبلغ الزملاء بعدم
                    صحتها)
                  </h3>
                </div>

                <div className="p-4">
                  {(() => {
                    const pendingReviews = challenges.flatMap((ch) =>
                      ch.submissions
                        .filter(
                          (sub) => sub.status === "rejected_pending_admin",
                        )
                        .map((sub) => ({ challenge: ch, submission: sub })),
                    );

                    if (pendingReviews.length === 0) {
                      return (
                        <p className="text-xs text-slate-500 text-center py-4">
                          لا توجد مراجعات بانتظار تدخل الإدارة حالياً.
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {pendingReviews.map((review, i) => {
                          const user = users.find(
                            (u) => u.id === review.submission.userId,
                          );
                          return (
                            <div
                              key={i}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                              <div className="space-y-2 flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-slate-800 text-sm">
                                      الطالب: {user?.name}
                                    </h4>
                                    <p className="text-[10px] text-slate-500">
                                      تحدي: {review.challenge.title} | المادة:{" "}
                                      {review.challenge.subject}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-white p-3 rounded border border-slate-200 text-xs">
                                  <p>{review.submission.proofText}</p>
                                  {review.submission.proofFile && (
                                    <div className="mt-2">
                                      <img
                                        src={review.submission.proofFile}
                                        alt="Proof"
                                        className="max-h-32 object-contain rounded border border-slate-200 bg-slate-100"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                                <button
                                  onClick={() => {
                                    // Approve
                                    const updatedUsers = users.map((u) => {
                                      if (u.id === user?.id) {
                                        return {
                                          ...u,
                                          points: u.points + 20,
                                          challengesCompleted:
                                            u.challengesCompleted + 1,
                                        };
                                      }
                                      return u;
                                    });

                                    const updatedChallenge = {
                                      ...review.challenge,
                                      submissions:
                                        review.challenge.submissions.map(
                                          (s) => {
                                            if (s.userId === user?.id) {
                                              return {
                                                ...s,
                                                status:
                                                  "admin_approved" as const,
                                              };
                                            }
                                            return s;
                                          },
                                        ),
                                    };

                                    onUpdateUsers(updatedUsers);
                                    onUpdateChallenges(
                                      challenges.map((c) =>
                                        c.id === updatedChallenge.id
                                          ? updatedChallenge
                                          : c,
                                      ),
                                    );
                                    onAddLog(
                                      "مراجعة إدارة",
                                      `قامت الإدارة بقبول إثبات ${user?.name} وإضافة 20 نقطة.`,
                                    );
                                  }}
                                  className="flex-1 bg-success/15 hover:bg-success/25 text-success font-bold text-xs py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                                >
                                  <Check size={14} /> قبول واعتماد (+20 ن)
                                </button>
                                <button
                                  onClick={() => {
                                    // Reject
                                    const updatedChallenge = {
                                      ...review.challenge,
                                      submissions:
                                        review.challenge.submissions.map(
                                          (s) => {
                                            if (s.userId === user?.id) {
                                              return {
                                                ...s,
                                                status:
                                                  "admin_rejected" as const,
                                              };
                                            }
                                            return s;
                                          },
                                        ),
                                    };

                                    onUpdateChallenges(
                                      challenges.map((c) =>
                                        c.id === updatedChallenge.id
                                          ? updatedChallenge
                                          : c,
                                      ),
                                    );
                                    onAddLog(
                                      "مراجعة إدارة",
                                      `قامت الإدارة برفض إثبات ${user?.name} نهائياً.`,
                                    );
                                  }}
                                  className="flex-1 bg-rose-50 border-rose-200 border text-rose-600 hover:bg-rose-100 font-bold text-xs py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                                >
                                  <X size={14} /> رفض نهائي
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 bg-slate-50 border-slate-200/10 border-b border-slate-200">
                  <h3 className="font-bold text-xs text-slate-800 font-sans">
                    قائمة كامل تحديات المنصة والتحكم بحالاتها الحية
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs" dir="rtl">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 border-slate-200/10 text-slate-500 font-sans">
                        <th className="px-4 py-3 font-bold">التحدي</th>
                        <th className="px-4 py-3 font-bold">
                          المجموعة والمؤسس
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          المستحقات
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          الحالة
                        </th>
                        <th className="px-4 py-3 font-bold text-center">
                          قائمة التحكم اليدوي للمدير
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {challenges.map((challenge) => {
                        const gp = groups.find(
                          (g) => g.id === challenge.groupId,
                        );
                        const isPending = challenge.status === "pending";
                        const isActive = challenge.status === "active";
                        const isCompleted = challenge.status === "completed";

                        return (
                          <tr
                            key={challenge.id}
                            className="transition-colors hover:bg-slate-50"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <h4 className="font-bold text-slate-800 font-sans">
                                  {challenge.title}
                                </h4>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {challenge.subject} •{" "}
                                  {challenge.durationMinutes} دقيقة •{" "}
                                  {challenge.pageCount} صفحة
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-[11px] font-sans text-slate-800">
                                <span>{gp?.name || "مجهول"}</span>
                                <span className="block text-[10px] text-slate-500">
                                  بواسطة:{" "}
                                  {users.find(
                                    (u) => u.id === challenge.createdBy,
                                  )?.name || "المنشئ"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-warning font-sans font-bold">
                              {challenge.pointsReward}ن / -
                              {challenge.pointsPenalty}ن
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  challenge.status === "active"
                                    ? "bg-emerald-100 text-emerald-600 animate-pulse"
                                    : challenge.status === "completed"
                                      ? "bg-secondary/10 text-blue-600"
                                      : "bg-warning/10 text-warning"
                                }`}
                              >
                                {challenge.status === "active"
                                  ? "نشط ومباشر"
                                  : challenge.status === "completed"
                                    ? "تمت بنجاح"
                                    : challenge.status === "cancelled"
                                      ? "ملغي"
                                      : "مجدول معلق"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {isPending && (
                                  <button
                                    onClick={() =>
                                      handleForceStartChallenge(challenge.id)
                                    }
                                    className="px-2 py-1 bg-success/15 hover:bg-success/25 text-success font-bold text-[10px] rounded transition-all cursor-pointer"
                                  >
                                    بدء فوري
                                  </button>
                                )}

                                {isActive && (
                                  <button
                                    onClick={() =>
                                      handleForceEndChallenge(challenge.id)
                                    }
                                    className="px-2 py-1 bg-secondary/15 hover:bg-rose-200 text-rose-500 font-bold text-[10px] rounded transition-all cursor-pointer"
                                  >
                                    إنهاء قسري
                                  </button>
                                )}

                                {!isCompleted &&
                                  challenge.status !== "cancelled" && (
                                    <button
                                      onClick={() =>
                                        handleCancelChallenge(challenge.id)
                                      }
                                      className="px-2 py-1 bg-red-500/10 text-red-400 font-bold text-[10px] rounded hover:bg-red-500/20 transition-all cursor-pointer"
                                    >
                                      إلغاء التحدي
                                    </button>
                                  )}

                                <button
                                  onClick={() => setEditingChallenge(challenge)}
                                  className="p-1 hover:bg-slate-50 border-slate-200 text-blue-600 rounded transition-all cursor-pointer"
                                >
                                  <Edit size={13} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteChallenge(challenge.id)
                                  }
                                  className="p-1 hover:bg-red-500/10 text-rose-600 rounded transition-all cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
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
          )}

          {/* TAB 5: LEADERBOARD CONTROL */}
          {activeTab === "points" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-sans flex items-center gap-2">
                  <Shield size={18} className="text-warning" />
                  ضبط وتعديل الرصيد يدوياً لأي زميل ومستخدم
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  تتيح لك هذه الأداة المباشرة زيادة رصيد النقاط أو خصمه يدوياً
                  من أي ملف مستخدم فوراً كإجراء تسوية، مع تتبع السبب في سجل نشاط
                  المنصة.
                </p>

                <form
                  onSubmit={handleAdjustPoints}
                  className="space-y-4 max-w-xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-sans mb-1.5">
                        اختر الزميل الطالب
                      </label>
                      <select
                        value={selectedAdjustUserId}
                        onChange={(e) =>
                          setSelectedAdjustUserId(e.target.value)
                        }
                        className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                        required
                      >
                        <option value="">-- حدد المستخدم --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.points} نقطة |{" "}
                            {(u.walletBalance || 0).toFixed(2)} ج.م)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-sans mb-1.5">
                        نوع التعديل
                      </label>
                      <select
                        value={adjustType}
                        onChange={(e) =>
                          setAdjustType(e.target.value as "points" | "wallet")
                        }
                        className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 cursor-pointer"
                        required
                      >
                        <option value="points">رصيد النقاط (P)</option>
                        <option value="wallet">
                          محفظة الطالب بالمبالغ (ج.م)
                        </option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-500 font-sans mb-1.5">
                        فرق وقيمة الرصيد (موجب أو سالب)
                      </label>
                      <input
                        type="number"
                        value={pointsDelta}
                        onChange={(e) =>
                          setPointsDelta(Number(e.target.value) || 0)
                        }
                        placeholder="أدخل القيمة مثلاً 50 أو -20"
                        className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 font-sans mb-1.5">
                      سبب تعديل الميزانية والنقاط
                    </label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="أدخل مبرر التعديل مثلاً: التميز بالمراجعة الكهروضوئية، التغيب المتعمد"
                      className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-sans text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    تطبيق تغييرات الرصيد على الفور
                  </button>
                </form>
              </div>

              {/* Reset panel */}
              <div className="bg-slate-1000 border border-red-500/20 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="text-rose-600 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-rose-600 font-sans">
                      تصفير وتصفية نقاط قاعدة بيانات الطلاب الكلي
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      هذا الأمر فادح ويدمر رصيد المنافسة! سيقوم بإعادة تعيين
                      نقاط جميع المسجلين بالمنصة على الفور إلى 0. تأييد هذا
                      الأمر مستحيل التراجع عنه.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetAllPoints}
                  className="px-5 py-2 bg-red-500/10 border border-red-500/30 text-rose-600 hover:bg-red-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  تصفير وإفراغ كافة النقاط نهائياً ⚠️
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: WALLET CONTROL */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-sans flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-500" />
                  إدارة طلبات المحفظة
                </h3>

                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    لا توجد طلبات محفظة مسجلة في الوقت الحالي.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] text-slate-500 font-sans border-b border-slate-200">
                          <th className="px-4 py-3">المستخدم</th>
                          <th className="px-4 py-3">الرقم/الطريقة</th>
                          <th className="px-4 py-3">المرفق</th>
                          <th className="px-4 py-3">نوع الطلب</th>
                          <th className="px-4 py-3 text-center">المقدار</th>
                          <th className="px-4 py-3 text-center">التاريخ</th>
                          <th className="px-4 py-3 pl-4 text-center">
                            الإجراء
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-xs font-bold text-slate-800">
                              {t.userName}
                            </td>
                            <td
                              className="px-4 py-3 text-[11px] font-mono text-slate-600"
                              dir="ltr"
                            >
                              {t.paymentDetails || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {t.screenshot ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingScreenshot(t.screenshot!)
                                  }
                                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-[10px] cursor-pointer"
                                >
                                  <Eye size={14} /> عرض الإيصال
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 font-sans">
                              {t.type === "withdraw" && (
                                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                                  سحب أموال
                                </span>
                              )}
                              {t.type === "deposit" && (
                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  إيداع أموال
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {t.amountMoney && (
                                <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-1 border border-emerald-200 rounded-md">
                                  {t.amountMoney.toFixed(2)} ج.م
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-[10px] text-slate-400 font-sans">
                              {new Date(t.timestamp).toLocaleString("ar-EG")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {t.status === "pending" ? (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      // Approve
                                      const updated = [...transactions];
                                      const tx = updated.find(
                                        (x) => x.id === t.id,
                                      )!;
                                      tx.status = "approved";
                                      onUpdateTransactions(updated);

                                      // If it is a deposit request, we actually add money to user
                                      if (t.type === "deposit") {
                                        const foundUser = users.find(
                                          (u) => u.id === t.userId,
                                        );
                                        if (foundUser) {
                                          const userCopy = {
                                            ...foundUser,
                                            walletBalance:
                                              (foundUser.walletBalance || 0) +
                                              (t.amountMoney || 0),
                                          };
                                          onUpdateUsers(
                                            users.map((u) =>
                                              u.id === userCopy.id
                                                ? userCopy
                                                : u,
                                            ),
                                          );
                                        }
                                      }

                                      onAddLog(
                                        "عمليات المحفظة",
                                        `تم قبول طلب ${t.type} بمقدار ${t.amountMoney} ج.م للطالب ${t.userName}`,
                                      );
                                    }}
                                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-xl text-[10px] font-bold transition-colors border border-emerald-200"
                                  >
                                    قبول
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Reject
                                      const updated = [...transactions];
                                      const tx = updated.find(
                                        (x) => x.id === t.id,
                                      )!;
                                      tx.status = "rejected";
                                      onUpdateTransactions(updated);

                                      // Return funds if withdraw rejected
                                      if (t.type === "withdraw") {
                                        const foundUser = users.find(
                                          (u) => u.id === t.userId,
                                        );
                                        if (foundUser) {
                                          const userCopy = {
                                            ...foundUser,
                                            walletBalance:
                                              (foundUser.walletBalance || 0) +
                                              (t.amountMoney || 0),
                                          };
                                          onUpdateUsers(
                                            users.map((u) =>
                                              u.id === userCopy.id
                                                ? userCopy
                                                : u,
                                            ),
                                          );
                                        }
                                      }

                                      onAddLog(
                                        "عمليات المحفظة",
                                        `تم رفض طلب ${t.type} بمقدار ${t.amountMoney} ج.م للطالب ${t.userName}`,
                                      );
                                    }}
                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-xl text-[10px] font-bold transition-colors border border-red-200"
                                  >
                                    رفض
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ${t.status === "approved" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                                >
                                  {t.status === "approved"
                                    ? "تم القبول"
                                    : "مرفوض"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: PLANS */}
          {activeTab === "plans" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-800 font-sans flex items-center gap-2">
                    <Crown size={20} className="text-amber-500" />
                    إدارة العضويات والخطط
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {localSettings.subscriptionPlans?.map((plan, index) => (
                    <div
                      key={plan.id}
                      className="border border-slate-200 rounded-2xl p-5 bg-slate-50 relative"
                    >
                      <div className="mb-4">
                        <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                          اسم العضوية
                        </label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const newPlans = [
                              ...(localSettings.subscriptionPlans || []),
                            ];
                            newPlans[index].name = e.target.value;
                            setLocalSettings({
                              ...localSettings,
                              subscriptionPlans: newPlans,
                            });
                          }}
                          className="w-full text-sm font-bold bg-white border-slate-200 border rounded-xl px-3 py-2 text-slate-800"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                          السعر (جنيه مصري)
                        </label>
                        <input
                          type="number"
                          value={plan.priceEgp}
                          onChange={(e) => {
                            const newPlans = [
                              ...(localSettings.subscriptionPlans || []),
                            ];
                            newPlans[index].priceEgp = Number(e.target.value);
                            setLocalSettings({
                              ...localSettings,
                              subscriptionPlans: newPlans,
                            });
                          }}
                          className="w-full text-sm bg-white border-slate-200 border rounded-xl px-3 py-2 text-slate-800 font-mono"
                        />
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                            المدة (بالأيام)
                          </label>
                          <input
                            type="number"
                            value={plan.durationDays || 0}
                            onChange={(e) => {
                              const newPlans = [
                                ...(localSettings.subscriptionPlans || []),
                              ];
                              newPlans[index].durationDays = Number(
                                e.target.value,
                              );
                              setLocalSettings({
                                ...localSettings,
                                subscriptionPlans: newPlans,
                              });
                            }}
                            className="w-full text-sm bg-white border-slate-200 border rounded-xl px-3 py-2 text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                            مكافأة بالنقاط
                          </label>
                          <input
                            type="number"
                            value={plan.bonusPoints || 0}
                            onChange={(e) => {
                              const newPlans = [
                                ...(localSettings.subscriptionPlans || []),
                              ];
                              newPlans[index].bonusPoints = Number(
                                e.target.value,
                              );
                              setLocalSettings({
                                ...localSettings,
                                subscriptionPlans: newPlans,
                              });
                            }}
                            className="w-full text-sm bg-white border-slate-200 border rounded-xl px-3 py-2 text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                          المميزات (افصل بينها بفاصلة ,)
                        </label>
                        <textarea
                          rows={4}
                          value={plan.features.join(" , ")}
                          onChange={(e) => {
                            const newPlans = [
                              ...(localSettings.subscriptionPlans || []),
                            ];
                            newPlans[index].features = e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter(Boolean);
                            setLocalSettings({
                              ...localSettings,
                              subscriptionPlans: newPlans,
                            });
                          }}
                          className="w-full text-xs leading-relaxed bg-white border-slate-200 border rounded-xl px-3 py-2 text-slate-700 resize-none h-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      onUpdateSettings(localSettings);
                      displaySuccess("تم حفظ إعدادات العضويات بنجاح");
                      onAddLog(
                        "تحديث الباقات",
                        "قام الإدمن بتحديث إعدادات وأسعار العضويات.",
                      );
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-md"
                  >
                    <Check size={18} /> حفظ جميع التعديلات
                  </button>
                </div>
              </div>

              {/* Memberships Subscriptions List */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-800 font-sans flex items-center gap-2">
                    <Clock size={20} className="text-blue-500" />
                    الطلاب المشتركين في باقات (الذهبية والفضية)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-100 uppercase text-[10px] text-slate-400">
                        <th className="pb-3 pr-2">المستخدم</th>
                        <th className="pb-3 pr-2">الباقة</th>
                        <th className="pb-3 pr-2 text-center">الوقت المتبقي</th>
                        <th className="pb-3 pr-2">تاريخ الانتهاء</th>
                        <th className="pb-3 pr-2">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(
                        (u) =>
                          (u.membershipTier === "gold" ||
                            u.membershipTier === "silver") &&
                          u.membershipExpiry &&
                          u.membershipExpiry > Date.now(),
                      ).length > 0 ? (
                        users
                          .filter(
                            (u) =>
                              (u.membershipTier === "gold" ||
                                u.membershipTier === "silver") &&
                              u.membershipExpiry &&
                              u.membershipExpiry > Date.now(),
                          )
                          .map((user) => {
                            const isGold = user.membershipTier === "gold";
                            const expiryDate = new Date(
                              user.membershipExpiry || 0,
                            );
                            const daysLeft = Math.max(
                              0,
                              Math.ceil(
                                (user.membershipExpiry! - Date.now()) /
                                  (1000 * 60 * 60 * 24),
                              ),
                            );

                            return (
                              <tr
                                key={user.id}
                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                              >
                                <td className="py-3 px-2 flex items-center gap-3">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs ring-1 ring-slate-300">
                                      {user.name.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-800 text-xs">
                                      {user.name}
                                    </p>
                                    <p
                                      className="text-[9px] text-slate-400 mt-0.5"
                                      dir="ltr"
                                    >
                                      {user.phone || user.email}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-1 rounded-md ${isGold ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"} inline-flex items-center gap-1`}
                                  >
                                    <Crown size={10} />
                                    {isGold ? "ذهبية" : "فضية"}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <div
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] ${
                                      daysLeft < 3
                                        ? "bg-red-50 border-red-200 text-red-600"
                                        : daysLeft < 7
                                          ? "bg-amber-50 border-amber-200 text-amber-600"
                                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    }`}
                                  >
                                    <Timer size={12} />
                                    <span className="font-bold">
                                      {daysLeft} يوم
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 font-mono text-[10px] text-slate-500 font-semibold">
                                  {expiryDate.toLocaleDateString("ar-EG", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="py-3 px-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        setViewingSubscriptionUser(user)
                                      }
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 bg-white border border-blue-200 rounded-lg transition-colors"
                                      title="عرض التفاصيل"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setConfirmState({
                                          isOpen: true,
                                          message: `هل أنت متأكد من إلغاء اشتراك الطالب ${user.name}؟`,
                                          onConfirm: () => {
                                            const plan =
                                              settings.subscriptionPlans?.find(
                                                (p) =>
                                                  p.id === user.membershipTier,
                                              );
                                            const pointsToDeduct =
                                              plan?.bonusPoints || 0;
                                            const updated = users.map((u) =>
                                              u.id === user.id
                                                ? {
                                                    ...u,
                                                    membershipTier:
                                                      "free" as const,
                                                    membershipExpiry: undefined,
                                                    points: Math.max(
                                                      0,
                                                      u.points - pointsToDeduct,
                                                    ),
                                                  }
                                                : u,
                                            );
                                            onUpdateUsers(updated);
                                            onAddLog(
                                              "إلغاء عضوية",
                                              `قام الإدمن بإلغاء اشتراك العضوية للطالب ${user.name} وتم سحب مكافأة الاشتراك المقدرة بـ ${pointsToDeduct} نقطة.`,
                                            );
                                            displaySuccess(
                                              "تم إلغاء عضوية الطالب بنجاح وخصم نقاط العضوية",
                                            );
                                            setConfirmState(null);
                                          },
                                        });
                                      }}
                                      className="text-[10px] font-bold bg-white text-red-500 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                      إلغاء الاشتراك
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-10 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Crown size={32} className="opacity-20 mb-2" />
                              <p className="text-xs">
                                لا يوجد مشتركون حاليون في الباقات المدفوعة.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: APP SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-sm text-slate-800 font-sans mb-4 flex items-center gap-2">
                <Settings size={18} className="text-red-400" />
                تحرير وتعديل مصفوفة إعدادات التطبيق العامة
              </h3>

              <form
                onSubmit={handleSaveSettings}
                className="space-y-4 max-w-xl"
              >
                <div>
                  <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                    شعار المنصة (لوجو)
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group cursor-pointer"
                      onClick={() =>
                        document.getElementById("platform-logo-upload")?.click()
                      }
                    >
                      {localSettings.platformLogo ? (
                        <img
                          src={localSettings.platformLogo}
                          alt="Platform Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-300">
                          <Image size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        id="platform-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              // We import dynamically if needed, or we just put it at the top
                              // but to be safe let's just dynamic import to avoid breaking JSX
                              const { compressImage } = await import("../utils");
                              const resized = await compressImage(file, 200, 200, 0.8);
                              setLocalSettings((prev) => ({
                                ...prev,
                                platformLogo: resized,
                              }));
                            } catch (error) {
                              console.error(error);
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="platform-logo-upload"
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg cursor-pointer transition-colors inline-block mb-1"
                      >
                        تغيير الشعار
                      </label>
                      <p className="text-[10px] text-slate-400">
                        مسموح برفع صور حتى 5 ميجابايت (يتم ضغطها تلقائياً).
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                    اسم المنصة بالتطبيق
                  </label>
                  <input
                    type="text"
                    value={localSettings.appName}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        appName: e.target.value,
                      })
                    }
                    className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                    عنوان الترحيب الرئيسي
                  </label>
                  <input
                    type="text"
                    value={localSettings.loginWelcomeTitle || ""}
                    placeholder={`مثال: مرحباً بك في ${localSettings.appName || "StudyRoom"}`}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        loginWelcomeTitle: e.target.value,
                      })
                    }
                    className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                    النص الترحيبي الفرعي
                  </label>
                  <input
                    type="text"
                    value={localSettings.loginWelcomeSubtitle || ""}
                    placeholder="مثال: دخول ساحات الدراسة التنافسية للأصدقاء"
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        loginWelcomeSubtitle: e.target.value,
                      })
                    }
                    className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      مكافأة الفوز الافتراضية للتحدي
                    </label>
                    <input
                      type="number"
                      value={localSettings.defaultReward}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          defaultReward: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      عقوبة الفشل والانسحاب الافتراضية
                    </label>
                    <input
                      type="number"
                      value={localSettings.defaultPenalty}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          defaultPenalty: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      الحد الأقصى لحجم المجموعة (الأصدقاء)
                    </label>
                    <input
                      type="number"
                      value={localSettings.maxGroupSize}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          maxGroupSize: parseInt(e.target.value) || 20,
                        })
                      }
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] text-slate-500 font-sans mb-1.5 hover:text-slate-700 transition">
                          تفعيل التقييم الذاتي (التقييم للنفس)
                        </span>
                        <span className="text-xs text-slate-800 font-sans block mt-1">
                          {localSettings.allowSelfRating
                            ? "مسموح ومفعل"
                            : "غير مسموح به (افتراضي)"}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.allowSelfRating}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              allowSelfRating: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      سعر تحويل النقاط (كم نقطة = 1 ج.م)
                    </label>
                    <input
                      type="number"
                      value={localSettings.pointsToEgpRate || 25}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          pointsToEgpRate: parseInt(e.target.value) || 25,
                        })
                      }
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      سعر شحن النقاط (1 ج.م = كم نقطة)
                    </label>
                    <input
                      type="number"
                      value={localSettings.egpToPointsRate || 25}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          egpToPointsRate: parseInt(e.target.value) || 25,
                        })
                      }
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] text-slate-500 font-sans mb-1.5">
                        تفعيل وضع الصيانة الشاملة بالتطبيق
                      </span>
                      <span
                        className={`text-xs font-sans font-bold block mt-1 ${localSettings.maintenanceMode ? "text-red-500" : "text-slate-500"}`}
                      >
                        {localSettings.maintenanceMode
                          ? "مُفعَّل (مغلقة للجميع ما عدا الإدارة)"
                          : "يتم الإيقاف (مفتوحة لجميع الطلاب)"}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.maintenanceMode}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            maintenanceMode: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  حفظ وتأمين كافة التغييرات
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: ACTIVITY LOG */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-3/4 lg:w-[80%]">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={logFilterQuery}
                      onChange={(e) => setLogFilterQuery(e.target.value)}
                      placeholder="فلترة وتتبع السجلات بالاسم أو الإجراء..."
                      className="w-full bg-white text-sm border border-slate-200 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setConfirmState({
                        isOpen: true,
                        message: "هل أنت متأكد من مسح جميع السجلات؟",
                        onConfirm: () => {
                          localStorage.setItem("sr_log", JSON.stringify([]));
                          onAddLog(
                            "تنظيف السجلات",
                            "قام المدير بتهيئة ومسح سجلات النشاط يدوياً.",
                          );
                          setConfirmState(null);
                        },
                      });
                    }}
                    className="shrink-0 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-sans text-sm font-bold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    تصفية ومسح السجل
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs" dir="rtl">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 border-slate-200/10 text-slate-500 font-sans">
                        <th className="px-4 py-3 font-bold">التوقيت الحقيقي</th>
                        <th className="px-4 py-3 font-bold">المشغل (العضو)</th>
                        <th className="px-4 py-3 font-bold">الإجراء</th>
                        <th className="px-4 py-3 font-bold">
                          تفاصيل الجلسة المشغلة
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {filteredLogs.slice(0, 100).map((log) => {
                        const dateText = new Date(
                          log.timestamp,
                        ).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });
                        const dateDay = new Date(
                          log.timestamp,
                        ).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <tr
                            key={log.id}
                            className="transition-colors hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                              {dateDay} - {dateText}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-800">
                              {log.userName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-red-400 font-bold">
                              {log.action}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 font-sans">
                              {log.details}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredLogs.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-slate-500 font-sans"
                          >
                            لا يوجد أي سجلات مطابقة للفلترة الحالية.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: NOTIFICATIONS & BROADCASTS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
              {/* Notifications Header Banner */}
              <div className="p-6 bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl text-white shadow-lg relative overflow-hidden text-right">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 bg-white/20 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">BROADCAST HUB</span>
                  <h2 className="text-xl md:text-2xl font-black font-sans">الإشعارات والتنبيهات العامة والخاصة</h2>
                  <p className="text-xs text-white/85 max-w-2xl leading-relaxed font-sans">
                    يمكنك إرسال تنبيهات عامة لكافة الطلاب من أجل الامتحانات والمواعيد، أو توجيه رسائل خاصة ومكافآت/تنبيهات لطلاب محددين. ستصلهم الإشعارات فورياً مع رنين موسيقي!
                  </p>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Column 1: Notification Creation Form */}
                <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4 text-right">
                  <h3 className="font-black text-slate-800 text-sm font-sans flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span>✨</span>
                    إنشاء إشعار جديد وإرساله
                  </h3>

                  {(actionSuccess || actionError) && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      {actionSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-750 text-xs font-semibold rounded-xl text-center font-sans">
                          {actionSuccess}
                        </div>
                      )}
                      {actionError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-750 text-xs font-semibold rounded-xl text-center font-sans">
                          {actionError}
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handlePublishNotification} className="space-y-4 text-xs">
                    {/* Notification Type */}
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">أيقونة ونوع الإشعار</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { key: 'info', icon: '📢', label: 'إداري عام', color: 'bg-blue-50 border-blue-200 text-blue-600' },
                          { key: 'success', icon: '💎', label: 'مكافأة/نجاح', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
                          { key: 'warning', icon: '⚠️', label: 'تحذيري', color: 'bg-amber-50 border-amber-200 text-amber-600' },
                          { key: 'penalty', icon: '🚨', label: 'عقوبي/مخالفة', color: 'bg-rose-50 border-rose-201 text-rose-600' },
                          { key: 'admin', icon: '⭐', label: 'تميز فوري', color: 'bg-purple-50 border-purple-200 text-purple-600' },
                        ].map((typ) => (
                          <button
                            key={typ.key}
                            type="button"
                            onClick={() => setNotifType(typ.key as any)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                              notifType === typ.key
                                ? `${typ.color} ring-2 ring-indigo-500 scale-102 font-bold shadow-sm`
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-600"
                            }`}
                          >
                            <span className="text-sm">{typ.icon}</span>
                            <span className="text-[9px] whitespace-nowrap leading-none scale-90">{typ.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notification Title */}
                    <div>
                      <label className="block text-slate-500 font-bold mb-1 font-sans">عنوان الإشعار</label>
                      <input
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="مثال: تنبيه هام بخصوص موعد البث المباشر الغد"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-sans text-right"
                        required
                      />
                    </div>

                    {/* Notification Message */}
                    <div>
                      <label className="block text-slate-500 font-bold mb-1 font-sans">مضمون الرسالة (الإشعار)</label>
                      <textarea
                        value={notifMessage}
                        onChange={(e) => setNotifMessage(e.target.value)}
                        rows={3}
                        placeholder="اكتب تفاصيل الإعلان هنا بوضوح لكي يظهر للطلاب في صندوق إشعاراتهم..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-sans leading-relaxed text-right"
                        required
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5 font-sans">الجمهور المستهدف (الطلاب)</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl mb-3 shadow-inner">
                        <button
                          type="button"
                          onClick={() => {
                            setNotifTargetType("all");
                            setNotifTargetUserIds([]);
                          }}
                          className={`flex-1 py-1.5 text-center font-bold font-sans rounded-lg transition-all text-[11px] cursor-pointer ${
                            notifTargetType === "all"
                              ? "bg-white text-indigo-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          🌍 جميع الطلاب (عام)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotifTargetType("specific")}
                          className={`flex-1 py-1.5 text-center font-bold font-sans rounded-lg transition-all text-[11px] cursor-pointer ${
                            notifTargetType === "specific"
                              ? "bg-white text-indigo-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          🎯 الطلاب المحددين فقط
                        </button>
                      </div>

                      {/* If Specific: Select students */}
                      {notifTargetType === "specific" && (
                        <div className="border border-slate-205 bg-slate-50/50 rounded-xl p-3.5 space-y-2.5">
                          <label className="block text-slate-400 font-bold text-[10px] font-sans">اضغط لاختيار وتحديد طالب أو أكثر من القائمة:</label>
                          <div className="relative mb-2">
                            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                              <Search size={15} />
                            </span>
                            <input
                              type="text"
                              value={notifStudentSearchQuery}
                              onChange={(e) => setNotifStudentSearchQuery(e.target.value)}
                              placeholder="ابحث بالاسم، الإيميل أو كود الطالب..."
                              className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                            />
                            {notifStudentSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setNotifStudentSearchQuery("")}
                                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer p-2"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                            {users
                              .filter((u) => u.role !== "admin")
                              .filter((u) => {
                                if (!notifStudentSearchQuery.trim()) return true;
                                const q = notifStudentSearchQuery.toLowerCase();
                                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.studentCode && u.studentCode.toLowerCase().includes(q));
                              })
                              .map((u) => {
                                const isSelected = notifTargetUserIds.includes(u.id);
                                return (
                                  <div
                                    key={u.id}
                                    onClick={() => {
                                      if (isSelected) {
                                        setNotifTargetUserIds(notifTargetUserIds.filter(id => id !== u.id));
                                      } else {
                                        setNotifTargetUserIds([...notifTargetUserIds, u.id]);
                                      }
                                    }}
                                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                                      isSelected ? "bg-indigo-50/45 hover:bg-indigo-50/70" : "hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] object-cover shrink-0">
                                        {u.avatar ? (
                                          u.avatar.startsWith("http") ? (
                                            <img src={u.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                          ) : (
                                            <span>{u.avatar}</span>
                                          )
                                        ) : "📚"}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800 leading-tight flex items-center gap-1">
                                          {u.name}
                                          {u.studentCode && <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{u.studentCode}</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono scale-95 origin-right">{u.email}</p>
                                      </div>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}} // handled by click
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-3.5 w-3.5"
                                    />
                                  </div>
                                );
                              })}
                            {users.filter((u) => u.role !== "admin").length === 0 && (
                              <div className="p-4 text-center text-slate-400">لا يوجد طلاب مسجلين في النظام.</div>
                            )}
                            {users.filter((u) => u.role !== "admin").length > 0 && users.filter((u) => u.role !== "admin").filter((u) => {
                                if (!notifStudentSearchQuery.trim()) return true;
                                const q = notifStudentSearchQuery.toLowerCase();
                                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.studentCode && u.studentCode.toLowerCase().includes(q));
                              }).length === 0 && (
                              <div className="p-4 text-center text-slate-400 text-[10px]">لا توجد نتائج بحث متطابقة.</div>
                            )}
                          </div>
                          {notifTargetUserIds.length > 0 && (
                            <p className="text-[10px] font-bold text-indigo-600 font-sans">
                              ✓ تم تحديد {notifTargetUserIds.length} طالب لإرسال الرسالة الخاصة إليهم.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer select-none transition-all duration-250 flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-indigo-500/20 outline-none font-sans"
                    >
                      <span className="text-sm">🚀</span>
                      <span>نشر وبث الإشعار الفوري</span>
                    </button>
                  </form>
                </div>

                {/* Column 2: Old Sent Notifications List */}
                <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4 text-right">
                  <h3 className="font-black text-slate-800 text-sm font-sans flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-2">
                      <span>📊</span>
                      أرشيف الإشعارات ومؤشرات قراءة الطلاب
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      {notifications.length} إشعار
                    </span>
                  </h3>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 space-y-2.5">
                        <span className="text-4xl block">📦</span>
                        <p className="text-xs font-sans">لم يتم إرسال أي إشعارات سابقة حتى الآن.</p>
                      </div>
                    ) : (
                      [...notifications]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((notif) => {
                          const isBroadcast = notif.userIds.includes("all");
                          const totalExpected = isBroadcast
                            ? users.filter(u => u.role !== "admin").length
                            : notif.userIds.length;
                          const readCount = notif.readBy ? notif.readBy.length : 0;
                          const percent = totalExpected > 0 ? Math.round((readCount / totalExpected) * 100) : 0;
                          const safePercent = percent > 100 ? 100 : percent;

                          return (
                            <div
                              key={notif.id}
                              className="p-4 border border-slate-100 rounded-xl hover:border-slate-200/80 hover:shadow-md transition-all duration-200 bg-slate-50/20 text-right"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePastNotification(notif.id)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-all cursor-pointer"
                                  title="حذف وسحب الإشعار فورياً"
                                >
                                  ✕
                                </button>

                                <div className="space-y-1.5 flex-1 text-xs">
                                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-sans ${
                                      isBroadcast ? "bg-teal-50 text-teal-600 border border-teal-100" : "bg-purple-50 text-purple-600 border border-purple-100"
                                    }`}>
                                      {isBroadcast ? "عام" : "خاص"}
                                    </span>
                                    <h4 className="font-black text-slate-800 leading-tight font-sans">{notif.title}</h4>
                                    <span className="text-slate-400 shrink-0">
                                      {notif.type === 'penalty' && <ShieldAlert size={13} className="text-red-500 inline" />}
                                      {notif.type === 'warning' && <AlertCircle size={13} className="text-amber-500 inline" />}
                                      {notif.type === 'success' && <Check size={13} className="text-emerald-500 inline" />}
                                      {notif.type === 'info' && <Settings size={13} className="text-blue-500 inline" />}
                                      {notif.type === 'admin' && <RefreshCw size={13} className="text-purple-500 inline" />}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
                                    {notif.message}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-sans justify-end">
                                    {/* Indicator reads state */}
                                    <span className="flex items-center gap-1 font-bold text-slate-700">
                                      <span className="text-emerald-500">✓</span> 
                                      مؤشر القراءة: {readCount} من {totalExpected} ({safePercent}%)
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={11} className="inline-block" />
                                      {new Date(notif.timestamp).toLocaleString("ar-EG", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  {/* If specific, show names */}
                                  {!isBroadcast && (
                                    <div className="mt-2 p-2 bg-slate-100/50 rounded-lg text-[9px] text-slate-400 leading-tight text-right">
                                      <span className="font-bold text-slate-500">المستلم المخصص:</span>{" "}
                                      {notif.userIds.map((uid) => users.find((u) => u.id === uid)?.name || "طالب مجهول").join(" ، ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS WITHIN ADMIN AREA --- */}

      {/* MODAL 1: ADD USER */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <form
            onSubmit={handleAddNewUser}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 font-sans">
                إضافة مستخدم جديد للنظام
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-500 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="أدخل الاسم"
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@test.com"
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  كلمة المرور المسجلة
                </label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="أدخل الرمز السرّي"
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">
                    الدور بالتطبيق
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(e.target.value as "admin" | "user")
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2 text-slate-800"
                  >
                    <option value="user">مستعمل</option>
                    <option value="admin">مشرف إداري</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">
                    الرمز الرمزي (الافاتار)
                  </label>
                  <select
                    value={newUserAvatar}
                    onChange={(e) => setNewUserAvatar(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2 text-slate-800 text-lg"
                  >
                    {avatars.map((av) => (
                      <option key={av} value={av}>
                        {av}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-success text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 cursor-pointer"
              >
                تخزين وتثبيت الحساب
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL VIEW USER INFO */}
      {viewingSubscriptionUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <div className="w-full max-w-sm flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Crown size={18} className="text-amber-500" />
                تفاصيل اشتراك العضوية
              </h3>
              <button
                onClick={() => setViewingSubscriptionUser(null)}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="flex items-center gap-4 mb-2 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0 overflow-hidden text-slate-400">
                  {viewingSubscriptionUser.avatar?.match(/^(http|data:)/) ? (
                    <img
                      src={viewingSubscriptionUser.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {viewingSubscriptionUser.name}
                  </h4>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${viewingSubscriptionUser.membershipTier === "gold" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}
                  >
                    <Crown size={10} />
                    عضوية{" "}
                    {viewingSubscriptionUser.membershipTier === "gold"
                      ? "ذهبية مميزة"
                      : "فضية"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">تاريخ البدء التقريبي</span>
                  <span className="font-bold text-slate-700 font-mono">
                    {/* We approximate start date based on tier (if gold 90 days, silver 30 days) */}
                    {new Date(
                      (viewingSubscriptionUser.membershipExpiry || Date.now()) -
                        (viewingSubscriptionUser.membershipTier === "gold"
                          ? 90
                          : 30) *
                          24 *
                          60 *
                          60 *
                          1000,
                    ).toLocaleDateString("ar-EG")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">تاريخ الانتهاء</span>
                  <span className="font-bold text-slate-700 font-mono">
                    {viewingSubscriptionUser.membershipExpiry
                      ? new Date(
                          viewingSubscriptionUser.membershipExpiry,
                        ).toLocaleDateString("ar-EG")
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">المدة المتبقية</span>
                  <span
                    className={`font-bold text-[11px] px-2 py-0.5 rounded-lg border ${
                      Math.max(
                        0,
                        Math.ceil(
                          ((viewingSubscriptionUser.membershipExpiry || 0) -
                            Date.now()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      ) < 3
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}
                  >
                    {Math.max(
                      0,
                      Math.ceil(
                        ((viewingSubscriptionUser.membershipExpiry || 0) -
                          Date.now()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )}{" "}
                    يوم
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setViewingSubscriptionUser(null)}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIEW USER INFO */}
      {viewingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Eye size={20} className="text-slate-500" />
                بيانات المستخدم الشاملة
              </h3>
              <button
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-sans text-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0 overflow-hidden text-slate-400">
                  {viewingUser.avatar?.match(/^(http|data:)/) ? (
                    <img
                      src={viewingUser.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-800 flex items-center gap-2">
                    {viewingUser.name}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md ${viewingUser.role === "admin" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-600"}`}
                    >
                      {viewingUser.role === "admin" ? "مدير" : "مستخدم"}
                    </span>
                  </h4>
                  <p
                    className="text-slate-500 text-xs mt-0.5"
                    dir="ltr"
                    text-right
                  >
                    {viewingUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="block text-[10px] text-slate-500 mb-0.5">
                    الحالة
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1.5 ${viewingUser.isActive ? "text-success" : "text-red-500"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${viewingUser.isActive ? "bg-success" : "bg-red-500"}`}
                    ></span>
                    {viewingUser.isActive ? "نشط" : "معطل"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="block text-[10px] text-slate-500 mb-0.5">
                    تاريخ الانضمام
                  </span>
                  <span className="font-bold text-slate-700">
                    {new Date(viewingUser.createdAt).toLocaleDateString(
                      "ar-EG",
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 relative overflow-hidden">
                <div className="absolute -left-2 -top-2 text-amber-500/10 rotate-12 pointer-events-none">
                  <KeyRound size={60} />
                </div>
                <span className="block text-[11px] text-amber-700 font-bold mb-1 relative z-10 flex items-center gap-1">
                  <KeyRound size={12} />
                  كلمة المرور المسجلة
                </span>
                <span
                  className="font-mono font-bold text-slate-800 tracking-wider text-base relative z-10 block text-left"
                  dir="ltr"
                >
                  {viewingUser.password || "غير معروف"}
                </span>
              </div>

              {(() => {
                const isPremium =
                  viewingUser.membershipTier === "gold" ||
                  viewingUser.membershipTier === "silver";
                if (!isPremium) return null;
                const isGold = viewingUser.membershipTier === "gold";
                const totalDays = isGold ? 90 : 30;
                const daysLeft = viewingUser.membershipExpiry
                  ? Math.max(
                      0,
                      Math.ceil(
                        (viewingUser.membershipExpiry - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : 0;
                const progressPercent =
                  totalDays > 0 ? (daysLeft / totalDays) * 100 : 0;
                return (
                  <div
                    className={`mt-2 border rounded-xl p-4 relative overflow-hidden ${isGold ? "bg-gradient-to-l from-amber-50 to-amber-100/50 border-amber-200/50" : "bg-gradient-to-l from-slate-50 to-blue-50 border-blue-200/50"}`}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isGold ? "bg-gradient-to-br from-amber-300 to-yellow-500 border-amber-200 text-white" : "bg-gradient-to-br from-slate-300 to-slate-400 border-slate-200 text-white"}`}
                          >
                            <Crown size={16} />
                          </div>
                          <strong
                            className={`font-black text-sm ${isGold ? "text-amber-700" : "text-slate-700"}`}
                          >
                            {isGold ? "عضوية ذهبية" : "عضوية فضية"}
                          </strong>
                        </div>
                        <div
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isGold ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-slate-100 border-slate-300 text-slate-700"} overflow-hidden relative`}
                        >
                          <div className="vip-shimmer absolute inset-0"></div>
                          <span className="relative z-10">نشط</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-1.5 text-[10px] font-bold">
                          <span
                            className={
                              isGold ? "text-amber-800" : "text-slate-800"
                            }
                          >
                            متبقي من العضوية
                          </span>
                          <span
                            className={
                              isGold ? "text-amber-600" : "text-slate-600"
                            }
                          >
                            {daysLeft} يوم
                          </span>
                        </div>
                        <div
                          className={`h-2 w-full rounded-full overflow-hidden ${isGold ? "bg-amber-200/50" : "bg-slate-200"}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isGold ? "bg-gradient-to-r from-amber-400 to-yellow-500" : "bg-gradient-to-r from-slate-400 to-blue-400"}`}
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

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-xs text-slate-500 mb-1">
                    المرحلة الدراسية
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewingUser.educationalStage === "middle"
                      ? "إعدادي"
                      : viewingUser.educationalStage === "high"
                        ? "ثانوي"
                        : "-"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-xs text-slate-500 mb-1">
                    الصف
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewingUser.educationalLevel === "1st"
                      ? "الأول"
                      : viewingUser.educationalLevel === "2nd"
                        ? "الثاني"
                        : viewingUser.educationalLevel === "3rd"
                          ? "الثالث"
                          : "-"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-xs text-slate-500 mb-1">
                    المحافظة
                  </span>
                  <span className="font-bold text-slate-800">
                    {viewingUser.governorate || "-"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-xs text-slate-500 mb-1">
                    الهاتف
                  </span>
                  <span
                    className="font-bold text-slate-800 block text-left"
                    dir="ltr"
                  >
                    {viewingUser.phone || "-"}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 col-span-2">
                  <span className="block text-xs text-slate-500 mb-1">
                    هاتف ولي الأمر
                  </span>
                  <span
                    className="font-bold text-slate-800 block text-left"
                    dir="ltr"
                  >
                    {viewingUser.parentPhone || "-"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-center">
                <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg">
                  <span className="block text-[10px] text-indigo-500 font-bold mb-0.5">
                    نقاط
                  </span>
                  <span className="font-mono font-black text-indigo-700">
                    {viewingUser.points}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                  <span className="block text-[10px] text-emerald-600 font-bold mb-0.5">
                    محفظة
                  </span>
                  <span className="font-mono font-black text-emerald-800">
                    {(viewingUser.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg">
                  <span className="block text-[10px] text-blue-500 font-bold mb-0.5">
                    دقائق
                  </span>
                  <span className="font-mono font-black text-blue-700">
                    {viewingUser.totalStudyMinutes}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                  <span className="block text-[10px] text-emerald-500 font-bold mb-0.5">
                    إنجاز
                  </span>
                  <span className="font-mono font-black text-emerald-700">
                    {viewingUser.challengesCompleted}
                  </span>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg">
                  <span className="block text-[10px] text-orange-500 font-bold mb-0.5">
                    انضمام
                  </span>
                  <span className="font-mono font-black text-orange-700">
                    {viewingUser.challengesJoined}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: USER EDIT */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <form
            onSubmit={handleSaveUserEdit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 font-sans">
                تعديل حساب الزميل {editingUser.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-500 mb-1">الاسم</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">النقاط</label>
                  <input
                    type="number"
                    value={editingUser.points}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">
                    نوع الدور بالتطبيق
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as "admin" | "user",
                      })
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2 text-slate-800"
                  >
                    <option value="user">مستخدم عادي</option>
                    <option value="admin">مشرف مشرف</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-success text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 cursor-pointer"
              >
                تخزين الملف المعدل
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: GROUP EDIT */}
      {editingGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <form
            onSubmit={handleSaveGroupEdit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 font-sans">
                تعديل بيانات المجموعة
              </h3>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-500 mb-1">
                  اسم المجموعة
                </label>
                <input
                  type="text"
                  value={editingGroup.name}
                  onChange={(e) =>
                    setEditingGroup({ ...editingGroup, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">
                  وصف موجز للمجموعة
                </label>
                <textarea
                  value={editingGroup.description}
                  onChange={(e) =>
                    setEditingGroup({
                      ...editingGroup,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800 h-20 resize-none"
                  required
                />
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="block text-[11px] text-slate-500 mb-2 font-sans">
                  تعديل عضوية الطلاب لهذه المجموعة:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border-slate-200/50 rounded-lg">
                  {users.map((u) => {
                    const isMember = editingGroup.members.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs select-none cursor-pointer mb-2 transition-colors"
                      >
                        <span className="font-sans text-slate-700">
                          {u.name}{" "}
                          <span className="text-[10px] text-slate-400">
                            ({u.email})
                          </span>
                        </span>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={isMember}
                            onChange={() =>
                              handleToggleGroupMember(editingGroup.id, u.id)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-500 text-xs font-semibold rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-success text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                حفظ التحرير
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: CHALLENGE EDIT */}
      {editingChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <form
            onSubmit={handleSaveChallengeEdit}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-800 font-sans">
                تعديل رصيد موازين التحدي
              </h3>
              <button
                type="button"
                onClick={() => setEditingChallenge(null)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-500 mb-1">اسم التحدي</label>
                <input
                  type="text"
                  value={editingChallenge.title}
                  onChange={(e) =>
                    setEditingChallenge({
                      ...editingChallenge,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">
                    نقاط المكافأة عند الإنجاز
                  </label>
                  <input
                    type="number"
                    value={editingChallenge.pointsReward}
                    onChange={(e) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        pointsReward: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">
                    نقاط العقوبة عند الفشل
                  </label>
                  <input
                    type="number"
                    value={editingChallenge.pointsPenalty}
                    onChange={(e) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        pointsPenalty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingChallenge(null)}
                className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-500 text-xs font-semibold rounded-lg cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                حفظ التحديث النقاطي
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CONFIRMATION */}
      {confirmState && confirmState.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-black text-slate-800 text-lg mb-2 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={24} />
              تأكيد الإجراء
            </h3>
            <p className="text-slate-600 text-sm font-sans mb-6">
              {confirmState.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmState.onConfirm}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SCREENSHOT */}
      {viewingScreenshot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          dir="rtl"
          onClick={() => setViewingScreenshot(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-transparent justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingScreenshot(null)}
              className="absolute -top-10 left-0 sm:-right-10 sm:left-auto text-white hover:text-red-400 transition-colors p-2 cursor-pointer"
              title="إغلاق"
            >
              <X size={32} />
            </button>
            <img
              src={viewingScreenshot}
              alt="إيصال الدفع"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border-2 border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
