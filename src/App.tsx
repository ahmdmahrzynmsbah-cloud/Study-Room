/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  Group,
  Challenge,
  AppSettings,
  LogEntry,
  Session,
  TransactionRequest,
} from "./types";
import { initializeDB, getDB, saveDB, writeLog, uuid } from "./db";

// Component imports
import Sidebar from "./components/Sidebar";
import CustomModal from "./components/CustomModal";
import DashboardPage from "./components/DashboardPage";
import LeaderboardPage from "./components/LeaderboardPage";
import GroupsPage from "./components/GroupsPage";
import GroupDetailPage from "./components/GroupDetailPage";
import ProfilePage from "./components/ProfilePage";
import AdminPage from "./components/AdminPage";
import RoomPage from "./components/RoomPage";
import WelcomeModal from "./components/WelcomeModal";
import AICopilotPage from "./components/AICopilotPage";

import {
  KeyRound,
  ShieldAlert,
  LogOut,
  Loader2,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  Users,
  Menu,
  AlertCircle,
} from "lucide-react";

export default function App() {
  // Primary Application states
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activePage, setActivePage] = useState<string>("login");
  const [loading, setLoading] = useState(true);

  // Selected sub-entities
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");

  // Modals management
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState("");

  // Group creation States
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  // Challenge creation States
  const [newChallengeTitle, setNewChallengeTitle] = useState("");
  const [newChallengeSubject, setNewChallengeSubject] = useState("");
  const [newChallengeDuration, setNewChallengeDuration] = useState(45);
  const [newChallengePages, setNewChallengePages] = useState(15);
  const [newChallengeGroupId, setNewChallengeGroupId] = useState("");

  // Auth fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPassConfirm, setRegPassConfirm] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regParentPhone, setRegParentPhone] = useState("");
  const [regGovernorate, setRegGovernorate] = useState("");
  const [regStage, setRegStage] = useState<"middle" | "high">("middle");
  const [regLevel, setRegLevel] = useState<"1st" | "2nd" | "3rd">("1st");
  const [regAvatar, setRegAvatar] = useState(
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0",
  );
  const [regError, setRegError] = useState("");

  const governorates = [
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

  // Avatars pick array
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

  // --- INITIALIZATION ---
  useEffect(() => {
    import('./lib/firebase').then(({ db, auth }) => {
      import('firebase/auth').then(({ signInAnonymously }) => {
         signInAnonymously(auth).then(() => {
           // Now authenticated, initialize DB from firestore or seed it
           initializeDB().then(() => {
             import('firebase/firestore').then(({ doc, onSnapshot }) => {
               
               // Listen to Users
               onSnapshot(doc(db, 'app_data', 'sr_users'), (docSnap) => {
                 if (docSnap.exists() && docSnap.data().items) {
                    const data = docSnap.data().items;
                    localStorage.setItem('sr_users', JSON.stringify(data));
                    setUsers(data);
                 }
               }, (err) => console.error("users listener error", err));

               // Listen to Groups
               onSnapshot(doc(db, 'app_data', 'sr_groups'), (docSnap) => {
                 if (docSnap.exists() && docSnap.data().items) {
                    const data = docSnap.data().items;
                    localStorage.setItem('sr_groups', JSON.stringify(data));
                    setGroups(data);
                 }
               }, (err) => console.error("groups listener error", err));

               // Listen to Challenges
               onSnapshot(doc(db, 'app_data', 'sr_challenges'), (docSnap) => {
                 if (docSnap.exists() && docSnap.data().items) {
                    const data = docSnap.data().items;
                    localStorage.setItem('sr_challenges', JSON.stringify(data));
                    setChallenges(data);
                 }
               }, (err) => console.error("challenges listener error", err));

               // Listen to Settings
               onSnapshot(doc(db, 'app_data', 'sr_settings'), (docSnap) => {
                 if (docSnap.exists() && docSnap.data().items) {
                    const data = docSnap.data().items;
                    localStorage.setItem('sr_settings', JSON.stringify(data));
                    setSettings(data);
                 }
               }, (err) => console.error("settings listener error", err));

               // Listen to Logs
               onSnapshot(doc(db, 'app_data', 'sr_log'), (docSnap) => {
                 if (docSnap.exists() && docSnap.data().items) {
                    const data = docSnap.data().items;
                    localStorage.setItem('sr_log', JSON.stringify(data));
                    setLogs(data);
                 }
               }, (err) => console.error("logs listener error", err));

               // Listen to Transactions
               onSnapshot(doc(db, 'app_data', 'sr_transactions'), (docSnap) => {
                 if (docSnap.exists() && docSnap.data().items) {
                    const data = docSnap.data().items;
                    localStorage.setItem('sr_transactions', JSON.stringify(data));
                    setTransactions(data);
                 }
               }, (err) => console.error("transactions listener error", err));
             });
           });
         }).catch(console.error);
      });
    });

    // Fetch records into state
    const loadedUsers = (getDB<User[]>("sr_users", []) || []).filter(Boolean);
    const loadedGroups = (getDB<Group[]>("sr_groups", []) || []).filter(
      Boolean,
    );
    const loadedChallenges = (
      getDB<Challenge[]>("sr_challenges", []) || []
    ).filter(Boolean);

    // Migrate admin avatar to a professional user avatar and ensure walletBalance exists
    let needsUpdate = false;
    loadedUsers.forEach((u) => {
      if (typeof u.walletBalance !== "number") {
        u.walletBalance = 0; // initialize to 0
        needsUpdate = true;
      }
      if (
        (u.role === "admin" || u.id === "user-admin") &&
        (u.avatar?.includes("dicebear") ||
          u.avatar === "📚" ||
          u.avatar?.includes("svg"))
      ) {
        u.avatar =
          "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Cpath%20d%3D%22M%2020%20100%20C%2020%2065%2C%2080%2065%2C%2080%20100%22%20fill%3D%22%231e293b%22%2F%3E%3Cpath%20d%3D%22M%2035%20100%20L%2040%2070%20L%2050%2082%20L%2060%2070%20L%2065%20100%20Z%22%20fill%3D%22%23ffffff%22%2F%3E%3Cpath%20d%3D%22M%2046%2080%20L%2054%2080%20L%2050%20100%20Z%22%20fill%3D%22%23dc2626%22%2F%3E%3Cpath%20d%3D%22M%2040%2050%20L%2040%2075%20L%2060%2075%20L%2060%2050%20Z%22%20fill%3D%22%23ffdbac%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2240%22%20r%3D%2222%22%20fill%3D%22%23ffdbac%22%2F%3E%3Cpath%20d%3D%22M%2028%2040%20C%2028%2010%2C%2072%2010%2C%2072%2040%20C%2072%2025%2C%2028%2025%2C%2028%2040%22%20fill%3D%22%23334155%22%2F%3E%3Cpath%20d%3D%22M%2072%2040%20L%2072%2050%20L%2068%2050%20L%2068%2040%20Z%22%20fill%3D%22%23334155%22%2F%3E%3Cpath%20d%3D%22M%2028%2040%20L%2028%2050%20L%2032%2050%20L%2032%2040%20Z%22%20fill%3D%22%23334155%22%2F%3E%3Crect%20x%3D%2233%22%20y%3D%2235%22%20width%3D%2214%22%20height%3D%2210%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Crect%20x%3D%2253%22%20y%3D%2235%22%20width%3D%2214%22%20height%3D%2210%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Cline%20x1%3D%2247%22%20y1%3D%2240%22%20x2%3D%2253%22%20y2%3D%2240%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Cline%20x1%3D%2228%22%20y1%3D%2240%22%20x2%3D%2233%22%20y2%3D%2240%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Cline%20x1%3D%2267%22%20y1%3D%2240%22%20x2%3D%2272%20%22%20y2%3D%2240%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3C%2Fsvg%3E";
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      saveDB("sr_users", loadedUsers);
    }

    let loadedSettings = getDB<AppSettings>("sr_settings", {
      appName: "StudyRoom",
      defaultReward: 50,
      defaultPenalty: 20,
      allowSelfRating: false,
      maxGroupSize: 20,
      maintenanceMode: false,
      pointsToEgpRate: 25, // 25 points = 1 EGP
      egpToPointsRate: 25, // 1 EGP = 25 points
    });

    const loadedSession = getDB<Session | null>("sr_sessions", null);
    const loadedLogs = getDB<LogEntry[]>("sr_log", []);
    const loadedTransactions = getDB<TransactionRequest[]>(
      "sr_transactions",
      [],
    );

    const now = Date.now();
    let hasExpiredMemberships = false;
    loadedUsers.forEach((user) => {
      if (
        user.membershipTier &&
        user.membershipExpiry &&
        user.membershipExpiry < now
      ) {
        user.membershipTier = undefined; // reset to free
        user.membershipExpiry = undefined;
        hasExpiredMemberships = true;
      }
    });

    if (hasExpiredMemberships) {
      saveDB("sr_users", loadedUsers);
    }

    setUsers(loadedUsers);
    setGroups(loadedGroups);
    setChallenges(loadedChallenges);
    setSettings(loadedSettings);
    setSession(loadedSession);
    setLogs(loadedLogs);
    setTransactions(loadedTransactions);

    // Navigation fallback based on session
    if (loadedSession) {
      const activeUser = loadedUsers.find((u) => u.id === loadedSession.userId);
      if (activeUser && activeUser.isActive !== false) {
        // If there was an active challenge room in memory, keep it
        const activeRoom = loadedChallenges.find(
          (c) =>
            c.status === "active" && c.participants.includes(activeUser.id),
        );
        if (activeRoom && activeUser.role !== "admin") {
          setSelectedChallengeId(activeRoom.id);
          setActivePage("room");
        } else {
          setActivePage(
            activeUser.role === "admin" ? "admin-dashboard" : "dashboard",
          );
        }
      } else {
        // invalid or deactivated session
        localStorage.removeItem("sr_sessions");
        setSession(null);
        setActivePage("login");
      }
    } else {
      setActivePage("login");
    }

    setLoading(false);

    // Add storage listener to sync state across tabs
    const handleStorageChange = () => {
      const newUsers = getDB<User[]>("sr_users", []);
      if (newUsers.length) setUsers(newUsers);
      setSession(getDB<Session | null>("sr_sessions", null));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Reactively clear stale or mismatched sessions
  useEffect(() => {
    if (!loading && session) {
      // Always get fresh users from local storage to verify if disabled concurrently
      const freshUsers = getDB<User[]>("sr_users", users);
      const matched = freshUsers.find((u) => u.id === session.userId);

      if (!matched || matched.isActive === false) {
        localStorage.removeItem("sr_sessions");
        document.documentElement.classList.remove("dark");
        window.dispatchEvent(new Event("theme_changed"));
        setSession(null);
        setActivePage("login");
      }
    }
  }, [loading, session, users]);

  // Sync utilities
  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    saveDB("sr_users", newUsers);
  };

  const handleUpdateGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
    saveDB("sr_groups", newGroups);
  };

  const handleUpdateChallenges = (newChallenges: Challenge[]) => {
    setChallenges(newChallenges);
    saveDB("sr_challenges", newChallenges);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveDB("sr_settings", newSettings);
  };

  const handleUpdateTransactions = (newTransactions: TransactionRequest[]) => {
    setTransactions(newTransactions);
    saveDB("sr_transactions", newTransactions);
  };

  const handleAddLog = (action: string, details: string) => {
    if (!session) return;
    const activeUser = users.find((u) => u.id === session.userId);
    const userName = activeUser ? activeUser.name : "مجهول";
    writeLog(session.userId, userName, action, details);
    setLogs(getDB<LogEntry[]>("sr_log", []));
  };

  // --- ACTIONS NAVIGATION ---
  const handleNavigate = (page: string) => {
    // If maintenance and non-admin, block navigation (secured via main render bounds)
    setActivePage(page);
  };

  // --- AUTH METHODS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail.trim() || !authPassword) {
      setAuthError("يرجى كتابة البريد الإلكتروني وكلمة المرور.");
      return;
    }

    const emailNorm = authEmail.toLowerCase().trim();

    // Verify against fresh DB records to support multi-tab admin testing
    const freshUsers = getDB<User[]>("sr_users", users);
    const matchUser = freshUsers.find(
      (u) => u.email.toLowerCase() === emailNorm,
    );

    if (!matchUser) {
      setAuthError("البريد الإلكتروني هذا غير مسجل لدينا.");
      return;
    }

    if (matchUser.password !== authPassword) {
      setAuthError("الرمز السري غير صحيح. يرجى إعادة المحاولة.");
      return;
    }

    if (matchUser.isActive === false) {
      setAuthError("تم تعطيل حسابك، يرجى التواصل مع الدعم الفني.");
      return;
    }

    // Success login
    const newSession: Session = {
      userId: matchUser.id,
      loginTime: Date.now(),
      token: "tok_" + Math.random().toString(36).substring(2, 10),
    };

    setSession(newSession);
    saveDB("sr_sessions", newSession);

    // Load per-user theme preference
    const userTheme = localStorage.getItem(`theme_${matchUser.id}`);
    if (userTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new Event("theme_changed"));

    // Log Activity
    writeLog(
      matchUser.id,
      matchUser.name,
      "تسجيل دخول",
      "دخل المستخدم للنظام بنجاح.",
    );
    setLogs(getDB<LogEntry[]>("sr_log", []));

    setAuthEmail("");
    setAuthPassword("");
    setActivePage(matchUser.role === "admin" ? "admin-dashboard" : "dashboard");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (
      !regName.trim() ||
      !regEmail.trim() ||
      !regPass ||
      !regPhone.trim() ||
      !regParentPhone.trim() ||
      !regGovernorate
    ) {
      setRegError("يرجى تعبئة كافة الحقول المطلوبة للمستخدم.");
      return;
    }

    const phonePattern = /^01[0125][0-9]{8}$/;
    if (!phonePattern.test(regPhone.trim())) {
      setRegError(
        "رقم الهاتف غير صحيح. يجب أن يكون رقماً مصرياً مكوناً من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015.",
      );
      return;
    }

    if (!phonePattern.test(regParentPhone.trim())) {
      setRegError(
        "رقم هاتف ولي الأمر غير صحيح. يجب أن يكون رقماً مصرياً مكوناً من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015.",
      );
      return;
    }

    if (regPhone.trim() === regParentPhone.trim()) {
      setRegError(
        "لا يمكن أن يكون رقم الهاتف مطابقاً لرقم هاتف ولي الأمر. يرجى التأكد من إدخال رقمين مختلفين لضمان التواصل الصحيح.",
      );
      return;
    }

    if (regPass !== regPassConfirm) {
      setRegError("كلمتا المرور غير متطابقتين.");
      return;
    }

    const emailNorm = regEmail.toLowerCase().trim();
    if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
      setRegError("البريد الإلكتروني هذا مستخدم بالفعل من عضو آخر.");
      return;
    }

    // Create custom user
    const newUser: User = {
      id: uuid(),
      name: regName.trim(),
      email: emailNorm,
      phone: regPhone.trim(),
      parentPhone: regParentPhone.trim(),
      governorate: regGovernorate,
      educationalStage: regStage,
      educationalLevel: regLevel,
      password: regPass,
      avatar: regAvatar,
      role: "user",
      points: 25, // seed starting bonus points
      walletBalance: 0,
      membershipTier: "free",
      totalStudyMinutes: 0,
      challengesJoined: 0,
      challengesCompleted: 0,
      createdAt: Date.now(),
      isActive: true,
    };

    const updatedUsers = [...users, newUser];
    handleUpdateUsers(updatedUsers);

    // Create session auto login
    const newSession: Session = {
      userId: newUser.id,
      loginTime: Date.now(),
      token: "tok_" + Math.random().toString(36).substring(2, 10),
    };

    setSession(newSession);
    saveDB("sr_sessions", newSession);

    // Apply default light theme for new users
    document.documentElement.classList.remove("dark");
    window.dispatchEvent(new Event("theme_changed"));

    writeLog(
      newUser.id,
      newUser.name,
      "إنشاء مستخدم",
      "سجل المستخدم حساب جديد برياح التفوق.",
    );
    setLogs(getDB<LogEntry[]>("sr_log", []));

    // Show Welcome modal
    setRegisteredUserName(newUser.name);
    setShowWelcomeModal(true);

    // Reset register states
    setRegName("");
    setRegEmail("");
    setRegPass("");
    setRegPassConfirm("");
    setRegPhone("");
    setRegParentPhone("");
    setRegGovernorate("");
    setRegStage("middle");
    setRegLevel("1st");
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    if (session) {
      const activeUser = users.find((u) => u.id === session.userId);
      if (activeUser) {
        writeLog(
          activeUser.id,
          activeUser.name,
          "تسجيل خروج",
          "سجل الدارس خروجه من لوحة التحكم.",
        );
      }
    }
    localStorage.removeItem("sr_sessions");
    document.documentElement.classList.remove("dark");
    window.dispatchEvent(new Event("theme_changed"));
    setSession(null);
    setActivePage("login");
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const newUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, ...updates } : u,
    );
    setUsers(newUsers);
    saveDB("sr_users", newUsers);
    writeLog(
      currentUser.id,
      currentUser.name,
      "تحديث الملف الشخصي",
      "قام الدارس أو النظام بتعديل بيانات ملفه الشخصي.",
    );
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;

    // Remove from users list
    const newUsers = users.filter((u) => u.id !== currentUser.id);
    setUsers(newUsers);
    saveDB("sr_users", newUsers);

    // Remove from groups
    const newGroups = groups.map((g) => ({
      ...g,
      members: g.members.filter((m) => m !== currentUser.id),
    }));
    setGroups(newGroups);
    saveDB("sr_groups", newGroups);

    document.documentElement.classList.remove("dark");
    window.dispatchEvent(new Event("theme_changed"));

    localStorage.removeItem("sr_sessions");
    setSession(null);
    setActivePage("login");
  };

  // --- APP LEVEL CREATORS ---
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!currentUser) return;

    if (!newGroupName.trim()) {
      alert("يرجى توفير اسم المجموعة.");
      return;
    }

    const currentUserGroupsCreated = groups.filter(
      (g) => g.createdBy === currentUser.id,
    ).length;
    const tier = currentUser.membershipTier || "free";
    const maxGroups = tier === "gold" ? 1000 : tier === "silver" ? 10 : 1;

    if (currentUserGroupsCreated >= maxGroups && currentUser.role !== "admin") {
      alert(
        `لقد وصلت للحد الأقصى لإنشاء المجموعات لعضويتك الحالية (${maxGroups}). قم بترقية عضويتك لإنشاء المزيد.`,
      );
      return;
    }

    const newGroup: Group = {
      id: uuid(),
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      createdBy: session.userId,
      members: [session.userId], // creator is member 1
      createdAt: Date.now(),
      isActive: true,
    };

    const updatedGroups = [...groups, newGroup];
    handleUpdateGroups(updatedGroups);

    handleAddLog(
      "إنشاء مجموعة",
      `أسس المجموعة الجديدة الشائقة: ${newGroup.name}.`,
    );

    // reset fields
    setNewGroupName("");
    setNewGroupDesc("");
    setIsGroupModalOpen(false);

    // instantly navigate to new group detail
    setSelectedGroupId(newGroup.id);
    setActivePage("group-detail");
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!currentUser) return;

    const targetGroupId = newChallengeGroupId || selectedGroupId;
    if (!targetGroupId) {
      alert("يرجى اختيار مصفوفة المجموعة الحاضنة للتحدي.");
      return;
    }

    if (!newChallengeTitle.trim() || !newChallengeSubject.trim()) {
      alert("يرجى كتابة عنوان التحدي والمادة المستهدفة.");
      return;
    }

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayChallengesCreated = challenges.filter(
      (c) => c.createdBy === currentUser.id && c.createdAt >= todayStart,
    ).length;
    const tier = currentUser.membershipTier || "free";
    const maxDailyChallenges =
      tier === "gold" ? 1000 : tier === "silver" ? 15 : 2;

    if (
      todayChallengesCreated >= maxDailyChallenges &&
      currentUser.role !== "admin"
    ) {
      alert(
        `لقد وصلت للحد الأقصى لإنشاء التحديات اليومية لعضويتك الحالية (${maxDailyChallenges}). قم بترقية عضويتك لإنشاء المزيد.`,
      );
      return;
    }

    const reward = settings?.defaultReward || 50;
    const penalty = settings?.defaultPenalty || 20;

    const newChallenge: Challenge = {
      id: uuid(),
      title: newChallengeTitle.trim(),
      subject: newChallengeSubject.trim(),
      groupId: targetGroupId,
      createdBy: session.userId,
      durationMinutes: Number(newChallengeDuration) || 45,
      pageCount: Number(newChallengePages) || 15,
      startTime: null,
      endTime: null,
      status: "pending",
      participants: [session.userId], // creator is participant 1
      submissions: [],
      pointsReward: reward,
      pointsPenalty: penalty,
      createdAt: Date.now(),
    };

    const updatedChallenges = [...challenges, newChallenge];
    handleUpdateChallenges(updatedChallenges);

    handleAddLog(
      "إنشاء تحدي جديد",
      `صمم تحدياً ملهماً بمجموعة الفيزياء/الرياضيات: ${newChallenge.title}.`,
    );

    // reset fields
    setNewChallengeTitle("");
    setNewChallengeSubject("");
    setIsChallengeModalOpen(false);

    // select and load group-detail
    setSelectedGroupId(targetGroupId);
    setActivePage("group-detail");
  };

  // --- CHALLENGE STATE ACTIONS ---
  const handleStartChallenge = (challengeId: string) => {
    // sets startTime and endTime
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        const start = Date.now();
        const end = start + c.durationMinutes * 60 * 1000;
        return {
          ...c,
          status: "active" as const,
          startTime: start,
          endTime: end,
        };
      }
      return c;
    });

    handleUpdateChallenges(updated);
    handleAddLog(
      "تفعيل وبدء التحدي",
      `تم البدء الفوري لمؤقت التحدي: ${challenge.title}.`,
    );

    setSelectedChallengeId(challengeId);
    setActivePage("room");
  };

  const handleJoinChallengeRoom = (challengeId: string) => {
    if (!session) return;
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    // Append user to participants if not already inside
    let updatedParticipants = [...challenge.participants];
    if (!updatedParticipants.includes(session.userId)) {
      updatedParticipants.push(session.userId);
    }

    const updated = challenges.map((c) => {
      if (c.id === challengeId) {
        return {
          ...c,
          participants: updatedParticipants,
        };
      }
      return c;
    });

    handleUpdateChallenges(updated);
    if (!challenge.participants.includes(session.userId)) {
      handleAddLog(
        "انضمام لتحدي",
        `انضم الدارس بنجاح إلى جلسة تحدي: ${challenge.title}.`,
      );
    }

    setSelectedChallengeId(challengeId);
    setActivePage("room");
  };

  const handleAddGroupMemberByEmail = (email: string) => {
    const groupObj = groups.find((g) => g.id === selectedGroupId);
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
    );
    if (!groupObj || !targetUser) return;

    const updatedMembers = [...groupObj.members, targetUser.id];
    const updated = groups.map((g) => {
      if (g.id === selectedGroupId) {
        return { ...g, members: updatedMembers };
      }
      return g;
    });

    handleUpdateGroups(updated);
    handleAddLog(
      "إضافة عضو للمجموعة",
      `أضاف زميله ${targetUser.name} لمجموعة: ${groupObj.name}.`,
    );
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleDeleteGroupPermanently = (idOfGroup: string) => {
    setConfirmModal({
      isOpen: true,
      message: "هل أنت متأكد من حذف المجموعة؟ هذا الإجراء لا يمكن التراجع عنه!",
      onConfirm: () => {
        const updated = groups.filter((g) => g.id !== idOfGroup);
        handleUpdateGroups(updated);
        handleAddLog(
          "حذف مجموعة",
          `قام المشرف/المنشئ بهدم وحذف المجموعة: ${idOfGroup} كلياً.`,
        );
        setActivePage("groups");
        setConfirmModal(null);
      },
    });
  };

  // --- VIEW RENDERS ---
  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4"
        dir="rtl"
      >
        <Loader2 className="text-blue-600 animate-spin" size={36} />
        <p className="text-slate-500 text-xs font-sans">
          بانتظار تهيئة محركات StudyRoom الأساسية...
        </p>
      </div>
    );
  }

  const currentUser = session
    ? users.find((u) => u.id === session.userId) || null
    : null;

  // Maintenance mode checker
  const isMaintenanceActive =
    settings?.maintenanceMode &&
    session &&
    currentUser &&
    currentUser.role !== "admin";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 selection:bg-primary/30 flex flex-col md:flex-row"
      dir="rtl"
    >
      {/* Maintenance Overly Gate */}
      {isMaintenanceActive ? (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-5">
          <span className="text-6xl animate-bounce">🚧</span>
          <h1 className="text-2xl md:text-3xl font-black text-warning">
            المنصة في وضع الصيانة المجدولة
          </h1>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed font-sans">
            نعمل حالياً على إنجاز بعض التحسينات البنيوية وتطوير خوارزميات
            التقييم، سنعود قريباً بروح دراسية أكثر فاعلية. شكراً لرحابة صدركم
            زملائنا!
          </p>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-[10px] text-slate-500 font-mono">
            STUDYROOM MAINTENANCE PROTOCOL ACTIVE
          </div>
          {session && (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-sans text-xs font-bold rounded-full border border-red-500/20 cursor-pointer"
            >
              تسجيل الخروج والرجوع لاحقاً
            </button>
          )}
        </div>
      ) : null}

      {/* RENDER VIEW ACCORDING STATUS */}
      {!session ||
      !currentUser ||
      activePage === "login" ||
      activePage === "register" ? (
        /* AUTH PAGES GATE (No Sidebar) */
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center">
          {/* Subtle backgrounds */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>

          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 relative z-10 mx-auto">
            {settings?.maintenanceMode && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <span className="text-xl">🚧</span>
                <div>
                  <h3 className="font-bold text-sm text-red-600 font-sans">
                    المنصة في وضع الصيانة
                  </h3>
                  <p className="text-xs text-red-500 font-sans mt-0.5">
                    الدخول مسموح للمشرفين فقط حالياً.
                  </p>
                </div>
              </div>
            )}

            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] flex items-center justify-center text-4xl shadow-lg border border-slate-200 mx-auto overflow-hidden">
                {settings?.platformLogo ? (
                  <img
                    src={settings.platformLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="filter drop-shadow">
                    {activePage === "register" ? "🚀" : "📚"}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-sans">
                {activePage === "register"
                  ? "عضوية دراسية جديدة"
                  : settings?.loginWelcomeTitle ||
                    `مرحباً بك في ${settings?.appName || "StudyRoom"}`}
              </h1>
              <p className="text-xs text-slate-500 font-sans">
                {activePage === "register"
                  ? "أنشئ حساباً لتبدأ قياس نتاج مجهودك ممتعاً"
                  : settings?.loginWelcomeSubtitle ||
                    "دخول ساحات الدراسة التنافسية للأصدقاء"}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-4 shadow-inner">
              <button
                onClick={() => {
                  setRegError("");
                  setAuthError("");
                  setActivePage("login");
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all select-none ${
                  activePage === "login"
                    ? "bg-white shadow-sm text-blue-600 border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => {
                  setRegError("");
                  setAuthError("");
                  setActivePage("register");
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all select-none ${
                  activePage === "register" || activePage === "dashboard" // dashboard indicates we were just trying to login or something, fallback
                    ? "bg-white shadow-sm text-blue-600 border border-slate-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                إنشاء حساب جديد
              </button>
            </div>

            {activePage !== "register" ? (
              /* LOGIN SCREEN */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {authError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 text-center font-sans font-medium">
                    ⚠️ {authError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="example@test.com"
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border rounded-xl px-4 py-3 placeholder-slate-400 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      كلمة المرور المسجلة
                    </label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border rounded-xl px-4 py-3 placeholder-slate-400 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md select-none transition-all active:scale-95 cursor-pointer"
                  >
                    تسجيل الدخول والتحدي
                  </button>
                </form>
              </div>
            ) : (
              /* REGISTER SCREEN */
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 text-center font-sans font-medium">
                    ⚠️ {regError}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1">
                      الاسم بالكامل
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="مثال: أحمد عبد الله"
                      className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 placeholder-slate-400 text-slate-800 focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="student@test.com"
                      className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 placeholder-slate-400 text-slate-800 focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-sans mb-1">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 placeholder-slate-400 text-slate-800 focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-sans mb-1">
                        رقم هاتف ولي الأمر
                      </label>
                      <input
                        type="tel"
                        value={regParentPhone}
                        onChange={(e) => setRegParentPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 placeholder-slate-400 text-slate-800 focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1">
                      المحافظة
                    </label>
                    <select
                      value={regGovernorate}
                      onChange={(e) => setRegGovernorate(e.target.value)}
                      className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- اختر المحافظة --</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-sans mb-1">
                        المرحلة الدراسية
                      </label>
                      <select
                        value={regStage}
                        onChange={(e) => {
                          setRegStage(e.target.value as "middle" | "high");
                          setRegLevel("1st");
                        }}
                        className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary transition-all cursor-pointer"
                      >
                        <option value="middle">إعدادي</option>
                        <option value="high">ثانوي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-sans mb-1">
                        الصف الدراسي
                      </label>
                      <select
                        value={regLevel}
                        onChange={(e) =>
                          setRegLevel(e.target.value as "1st" | "2nd" | "3rd")
                        }
                        className="w-full text-xs bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary transition-all cursor-pointer"
                      >
                        {regStage === "middle" ? (
                          <>
                            <option value="1st">الأول الإعدادي</option>
                            <option value="2nd">الثاني الإعدادي</option>
                            <option value="3rd">الثالث الإعدادي</option>
                          </>
                        ) : (
                          <>
                            <option value="1st">الأول الثانوي</option>
                            <option value="2nd">الثاني الثانوي</option>
                            <option value="3rd">الثالث الثانوي</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-sans mb-1">
                        كلمة المرور
                      </label>
                      <input
                        type="password"
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-sans mb-1">
                        تأكيد الرمز
                      </label>
                      <input
                        type="password"
                        value={regPassConfirm}
                        onChange={(e) => setRegPassConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs font-mono bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Avatar select */}
                  <div>
                    <label className="block text-[11px] text-slate-500 font-sans mb-1.5">
                      اختر الرمز والتميمة المعبرة (الافاتار)
                    </label>
                    <div className="flex flex-wrap justify-center gap-2 p-2 border border-slate-200 bg-slate-50 border-slate-200/30 rounded-xl">
                      {seedAvatars.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setRegAvatar(av)}
                          className={`relative aspect-square w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden cursor-pointer ${
                            regAvatar === av
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
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md select-none transition-all cursor-pointer mt-2"
                  >
                    تأكيد الاشتراك ومباشرة الدراسة 🚀
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CORE APPLICATION LAYOUT (With Navigation Sidebar) */
        <>
          {/* Mobile Top Bar */}
          <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] flex items-center justify-center text-sm shadow-md border border-slate-200 shrink-0 overflow-hidden">
                {settings?.platformLogo ? (
                  <img
                    src={settings.platformLogo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "📚"
                )}
              </div>
              <h1 className="text-lg font-black text-slate-800 font-sans tracking-tight">
                {settings?.appName || (
                  <>
                    STUDY<span className="text-blue-600">ROOM</span>
                  </>
                )}
              </h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Menu size={24} />
            </button>
          </header>

          <Sidebar
            currentUser={currentUser}
            activePage={activePage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            settings={settings!}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />

          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full transition-all overflow-y-auto">
            {activePage === "dashboard" && (
              <DashboardPage
                currentUser={currentUser!}
                users={users}
                groups={groups}
                challenges={challenges}
                onNavigate={handleNavigate}
                onSelectGroup={setSelectedGroupId}
                onJoinChallenge={handleJoinChallengeRoom}
                onOpenCreateGroupModal={() => setIsGroupModalOpen(true)}
                onOpenCreateChallengeModal={() => {
                  // select group 1 if possible
                  const userGroups = groups.filter(
                    (g) => g.isActive && g.members.includes(currentUser!.id),
                  );
                  if (userGroups.length > 0) {
                    setNewChallengeGroupId(userGroups[0].id);
                  }
                  setIsChallengeModalOpen(true);
                }}
              />
            )}

            {activePage === "room" &&
              selectedChallengeId &&
              (() => {
                const currentChallenge = challenges.find(
                  (c) => c.id === selectedChallengeId,
                );
                if (!currentChallenge) {
                  return (
                    <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto mt-10">
                      <span className="text-4xl block">🔍</span>
                      <h3 className="text-lg font-bold text-slate-800">
                        عذراً، التحدي المطلوب غير موجود!
                      </h3>
                      <p className="text-xs text-slate-500">
                        ربما تم إلغاء هذا التحدي أو حذفه بواسطة المشرف.
                      </p>
                      <button
                        onClick={() => setActivePage("dashboard")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                      >
                        العودة للرئيسية
                      </button>
                    </div>
                  );
                }
                return (
                  <RoomPage
                    currentUser={currentUser!}
                    users={users}
                    challenge={currentChallenge}
                    onNavigate={handleNavigate}
                    onAddLog={handleAddLog}
                    onUpdateChallenge={(updatedChallenge) => {
                      const updated = challenges.map((c) =>
                        c.id === updatedChallenge.id ? updatedChallenge : c,
                      );
                      handleUpdateChallenges(updated);
                    }}
                    onUpdateUsers={handleUpdateUsers}
                    onLeaveRoom={() => {
                      const challengeObj = challenges.find(
                        (c) => c.id === selectedChallengeId,
                      );
                      if (challengeObj) {
                        setSelectedGroupId(challengeObj.groupId);
                        setActivePage("group-detail");
                      } else {
                        setActivePage("dashboard");
                      }
                    }}
                    settings={settings!}
                  />
                );
              })()}

            {activePage === "leaderboard" && (
              <LeaderboardPage
                currentUser={currentUser!}
                users={users}
                challenges={challenges}
              />
            )}

            {activePage === "groups" && (
              <GroupsPage
                currentUser={currentUser!}
                groups={groups}
                challenges={challenges}
                onSelectGroup={setSelectedGroupId}
                onNavigate={handleNavigate}
                onOpenCreateGroupModal={() => setIsGroupModalOpen(true)}
              />
            )}

            {activePage === "group-detail" &&
              selectedGroupId &&
              (() => {
                const currentGroup = groups.find(
                  (g) => g.id === selectedGroupId && g.isActive,
                );
                if (!currentGroup) {
                  return (
                    <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4 max-w-lg mx-auto mt-10">
                      <span className="text-4xl block">🧩</span>
                      <h3 className="text-lg font-bold text-slate-800">
                        عذراً، المجموعة المطلوبة غير موجودة!
                      </h3>
                      <p className="text-xs text-slate-500">
                        ربما تم حذف هذه المجموعة أو تعطيلها كلياً.
                      </p>
                      <button
                        onClick={() => setActivePage("groups")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer"
                      >
                        العودة للمجموعات
                      </button>
                    </div>
                  );
                }
                return (
                  <GroupDetailPage
                    currentUser={currentUser!}
                    group={currentGroup}
                    users={users}
                    challenges={challenges}
                    onNavigate={handleNavigate}
                    onStartChallenge={handleStartChallenge}
                    onJoinChallenge={handleJoinChallengeRoom}
                    onOpenCreateChallengeModal={() => {
                      setNewChallengeGroupId(selectedGroupId);
                      setIsChallengeModalOpen(true);
                    }}
                    onAddMember={handleAddGroupMemberByEmail}
                    onDeleteGroup={handleDeleteGroupPermanently}
                  />
                );
              })()}

            {activePage === "profile" && (
              <ProfilePage
                currentUser={currentUser!}
                settings={settings!}
                transactions={transactions}
                onUpdateUser={handleUpdateUser}
                onUpdateTransactions={handleUpdateTransactions}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activePage === "copilot" && (
              <AICopilotPage
                currentUser={currentUser!}
                settings={settings!}
                onNavigate={handleNavigate}
                onUpdateUser={handleUpdateUser}
              />
            )}

            {activePage.startsWith("admin") &&
              currentUser?.role === "admin" && (
                <AdminPage
                  currentUser={currentUser!}
                  users={users}
                  groups={groups}
                  challenges={challenges}
                  settings={settings!}
                  logs={logs}
                  transactions={transactions}
                  onUpdateUsers={handleUpdateUsers}
                  onUpdateGroups={handleUpdateGroups}
                  onUpdateChallenges={handleUpdateChallenges}
                  onUpdateSettings={handleUpdateSettings}
                  onUpdateTransactions={handleUpdateTransactions}
                  onAddLog={handleAddLog}
                  onNavigate={handleNavigate}
                  onSelectGroup={setSelectedGroupId}
                  activeAdminTab={activePage.replace("admin-", "") as any}
                />
              )}
          </main>
        </>
      )}

      {/* --- ALL APP DIALOGS (PORTALS) --- */}

      {/* 1. CREATING GROUP DIALOG */}
      {currentUser && (
        <>
          <CustomModal
            isOpen={isGroupModalOpen}
            onClose={() => setIsGroupModalOpen(false)}
            title="إنشاء مجموعة تفوق ودراسة جديدة"
            footer={
              <div className="flex gap-2">
                <button
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-500 text-xs font-semibold rounded-full hover:bg-slate-100 select-none cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  id="submit-create-group"
                  onClick={handleCreateGroup}
                  className="px-5 py-2 bg-gradient-to-l from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-full select-none cursor-pointer"
                >
                  تأسيس المجموعة الرسمية
                </button>
              </div>
            }
          >
            <div className="space-y-4 font-sans text-xs text-slate-800">
              <div>
                <label className="block text-slate-500 mb-1.5 font-semibold">
                  اسم المجموعة الدراسية
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="مثال: أبطال الفيزياء الحديثة، عباقرة الجبر"
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-semibold">
                  وصف وتوجيهات المجموعة
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="اكتب الهدف من المجموعة للدراسة سوياً وقوانين الالتزام..."
                  className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 h-20 resize-none"
                />
              </div>
            </div>
          </CustomModal>

          {/* 2. CREATING CHALLENGE DIALOG */}
          <CustomModal
            isOpen={isChallengeModalOpen}
            onClose={() => setIsChallengeModalOpen(false)}
            title="تصميم إعدادات ملف تحدي جديد"
            footer={
              <div className="flex gap-2">
                <button
                  onClick={() => setIsChallengeModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 border-slate-200 text-slate-500 text-xs font-semibold rounded-full hover:bg-slate-100 select-none cursor-pointer"
                >
                  رجوع
                </button>
                <button
                  id="submit-create-challenge"
                  onClick={handleCreateChallenge}
                  className="px-5 py-2 bg-gradient-to-l from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-full select-none cursor-pointer"
                >
                  تخزين وبدء التحدي
                </button>
              </div>
            }
          >
            <div className="space-y-4 font-sans text-xs text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-semibold">
                    موضوع التحدي (المادة)
                  </label>
                  <input
                    type="text"
                    value={newChallengeSubject}
                    onChange={(e) => setNewChallengeSubject(e.target.value)}
                    placeholder="مثال: البصريات الهندسية"
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 font-semibold">
                    عنوان ملخص الجلسة
                  </label>
                  <input
                    type="text"
                    value={newChallengeTitle}
                    onChange={(e) => setNewChallengeTitle(e.target.value)}
                    placeholder="مثال: مراجعة قوانين الفصل الثاني"
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-semibold">
                    المدة المستغرقة بمؤقت الغرفة (دقائق)
                  </label>
                  <input
                    type="number"
                    value={newChallengeDuration}
                    onChange={(e) =>
                      setNewChallengeDuration(parseInt(e.target.value) || 45)
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 font-semibold font-mono">
                    عدد الصفحات المطلوب مذاكرتها
                  </label>
                  <input
                    type="number"
                    value={newChallengePages}
                    onChange={(e) =>
                      setNewChallengePages(parseInt(e.target.value) || 15)
                    }
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Group chooser if created from Dashboard layout option */}
              {!newChallengeGroupId && (
                <div>
                  <label className="block text-slate-500 mb-1.5 font-semibold">
                    اختر المجموعة الدراسية الحاضنة
                  </label>
                  <select
                    value={newChallengeGroupId}
                    onChange={(e) => setNewChallengeGroupId(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                    required
                  >
                    <option value="">-- حدد المجموعة --</option>
                    {groups
                      .filter(
                        (g) => g.isActive && g.members.includes(currentUser.id),
                      )
                      .map((gp) => (
                        <option key={gp.id} value={gp.id}>
                          {gp.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </CustomModal>
        </>
      )}

      {/* CONFIRM MODAL GLOBALLY */}
      {confirmModal && confirmModal.isOpen && (
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
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WELCOME MODAL */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={registeredUserName}
      />
    </div>
  );
}
