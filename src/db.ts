/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Group, Challenge, AppSettings, LogEntry, Session } from './types';

export const uuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'sr_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
};

// Initial Seed Users
const seedUsers: User[] = [
  {
    id: 'user-admin',
    name: 'المدير',
    email: 'admin@studyroom.app',
    password: 'admin123',
    avatar: 'data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Cpath%20d%3D%22M%2020%20100%20C%2020%2065%2C%2080%2065%2C%2080%20100%22%20fill%3D%22%231e293b%22%2F%3E%3Cpath%20d%3D%22M%2035%20100%20L%2040%2070%20L%2050%2082%20L%2060%2070%20L%2065%20100%20Z%22%20fill%3D%22%23ffffff%22%2F%3E%3Cpath%20d%3D%22M%2046%2080%20L%2054%2080%20L%2050%20100%20Z%22%20fill%3D%22%23dc2626%22%2F%3E%3Cpath%20d%3D%22M%2040%2050%20L%2040%2075%20L%2060%2075%20L%2060%2050%20Z%22%20fill%3D%22%23ffdbac%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2240%22%20r%3D%2222%22%20fill%3D%22%23ffdbac%22%2F%3E%3Cpath%20d%3D%22M%2028%2040%20C%2028%2010%2C%2072%2010%2C%2072%2040%20C%2072%2025%2C%2028%2025%2C%2028%2040%22%20fill%3D%22%23334155%22%2F%3E%3Cpath%20d%3D%22M%2072%2040%20L%2072%2050%20L%2068%2050%20L%2068%2040%20Z%22%20fill%3D%22%23334155%22%2F%3E%3Cpath%20d%3D%22M%2028%2040%20L%2028%2050%20L%2032%2050%20L%2032%2040%20Z%22%20fill%3D%22%23334155%22%2F%3E%3Crect%20x%3D%2233%22%20y%3D%2235%22%20width%3D%2214%22%20height%3D%2210%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Crect%20x%3D%2253%22%20y%3D%2235%22%20width%3D%2214%22%20height%3D%2210%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Cline%20x1%3D%2247%22%20y1%3D%2240%22%20x2%3D%2253%22%20y2%3D%2240%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Cline%20x1%3D%2228%22%20y1%3D%2240%22%20x2%3D%2233%22%20y2%3D%2240%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3Cline%20x1%3D%2267%22%20y1%3D%2240%22%20x2%3D%2272%20%22%20y2%3D%2240%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222.5%22%2F%3E%3C%2Fsvg%3E',
    role: 'admin',
    points: 1000,
    walletBalance: 0,
    totalStudyMinutes: 300,
    challengesJoined: 5,
    challengesCompleted: 5,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    id: 'user-ahmed',
    name: 'أحمد',
    email: 'ahmed@test.com',
    password: '1234',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0',
    role: 'user',
    points: 340,
    walletBalance: 0,
    totalStudyMinutes: 180,
    challengesJoined: 4,
    challengesCompleted: 3,
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    id: 'user-sara',
    name: 'سارة',
    email: 'sara@test.com',
    password: '1234',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Aria&backgroundColor=e2e8f0',
    role: 'user',
    points: 520,
    walletBalance: 0,
    totalStudyMinutes: 240,
    challengesJoined: 6,
    challengesCompleted: 5,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    id: 'user-omar',
    name: 'عمر',
    email: 'omar@test.com',
    password: '1234',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Liam&backgroundColor=e2e8f0',
    role: 'user',
    points: 210,
    walletBalance: 0,
    totalStudyMinutes: 120,
    challengesJoined: 3,
    challengesCompleted: 2,
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    id: 'user-nour',
    name: 'نور',
    email: 'nour@test.com',
    password: '1234',
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Mia&backgroundColor=e2e8f0',
    role: 'user',
    points: 450,
    walletBalance: 0,
    totalStudyMinutes: 210,
    challengesJoined: 5,
    challengesCompleted: 4,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    isActive: true
  }
];

// Initial Seed Groups
const seedGroups: Group[] = [
  {
    id: 'group-physics',
    name: 'مجموعة الفيزياء',
    description: 'مجموعة مخصصة لمذاكرة الفيزياء وحل المسائل والاستعداد للامتحانات معاً.',
    createdBy: 'user-sara',
    members: ['user-ahmed', 'user-sara', 'user-omar'],
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    id: 'group-math',
    name: 'أبطال الرياضيات',
    description: 'مكان لتحديات التفاضل والتكامل، الجبر والهندسة والتشجيع المتبادل.',
    createdBy: 'user-nour',
    members: ['user-sara', 'user-nour', 'user-ahmed'],
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    isActive: true
  }
];

// Initial Seed Challenges
const seedChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'مراجعة الفصل الخامس',
    subject: 'الفيزياء الحديثة',
    groupId: 'group-physics',
    createdBy: 'user-sara',
    durationMinutes: 60,
    pageCount: 20,
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000,
    endTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    status: 'completed',
    participants: ['user-ahmed', 'user-sara', 'user-omar'],
    submissions: [
      {
        userId: 'user-sara',
        submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 1000,
        proofText: 'أتممت دراسة الفصل الخامس بالكامل ولخصت القوانين الخاصة بالظاهرة الكهروضوئية.',
        ratings: [
          { fromUserId: 'user-ahmed', score: 5 },
          { fromUserId: 'user-omar', score: 4 }
        ],
        averageRating: 4.5
      },
      {
        userId: 'user-ahmed',
        submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 1000,
        proofText: 'قرأت 18 صفحة وكتبت ملاحظات شاملة في دفتري الخاص.',
        ratings: [
          { fromUserId: 'user-sara', score: 4 },
          { fromUserId: 'user-omar', score: 4 }
        ],
        averageRating: 4
      },
      {
        userId: 'user-omar',
        submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 1000,
        proofText: 'أكملت حل 10 تمارين على الفصل بنجاح.',
        ratings: [
          { fromUserId: 'user-sara', score: 4 },
          { fromUserId: 'user-ahmed', score: 5 }
        ],
        averageRating: 4.5
      }
    ],
    pointsReward: 50,
    pointsPenalty: 20,
    createdAt: Date.now() - 2.5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'challenge-2',
    title: 'حل مسائل التفاضل',
    subject: 'الرياضيات التطبيقية',
    groupId: 'group-math',
    createdBy: 'user-sara',
    durationMinutes: 45,
    pageCount: 15,
    // active from 15 mins ago to 30 mins from now
    startTime: Date.now() - 15 * 60 * 1000,
    endTime: Date.now() + 30 * 60 * 1000,
    status: 'active',
    participants: ['user-sara', 'user-nour', 'user-ahmed'],
    submissions: [],
    pointsReward: 50,
    pointsPenalty: 20,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

const defaultSettings: AppSettings = {
  appName: 'StudyRoom',
  defaultReward: 50,
  defaultPenalty: 20,
  allowSelfRating: false,
  maxGroupSize: 20,
  maintenanceMode: false,
  pointsToEgpRate: 100,
  egpToPointsRate: 100,
};

const initialLog: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    userId: 'user-admin',
    userName: 'المدير',
    action: 'تهيئة النظام',
    details: 'تم إطلاق نظام StudyRoom وتهيئة البيانات الأولية.'
  }
];

export const getDB = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultVal;
  }
};

export const saveDB = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const initializeDB = (): void => {
  if (!localStorage.getItem('sr_users')) {
    saveDB('sr_users', seedUsers);
  }
  if (!localStorage.getItem('sr_groups')) {
    saveDB('sr_groups', seedGroups);
  }
  if (!localStorage.getItem('sr_challenges')) {
    saveDB('sr_challenges', seedChallenges);
  }
  if (!localStorage.getItem('sr_settings')) {
    saveDB('sr_settings', defaultSettings);
  }
  if (!localStorage.getItem('sr_log')) {
    saveDB('sr_log', initialLog);
  }
};

export const writeLog = (userId: string, userName: string, action: string, details: string): void => {
  const logs = getDB<LogEntry[]>('sr_log', []);
  const newLog: LogEntry = {
    id: uuid(),
    timestamp: Date.now(),
    userId,
    userName,
    action,
    details
  };
  // limit logger to last 150 items
  const updatedLogs = [newLog, ...logs].slice(0, 150);
  saveDB('sr_log', updatedLogs);
};
