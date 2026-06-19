/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Group, Challenge, AppSettings, LogEntry, Session } from './types';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const uuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'sr_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
};

// Seed definitions ...
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
  }
];

const seedGroups: Group[] = [];
const seedChallenges: Challenge[] = [];
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
const initialLog: LogEntry[] = [];

// Fallback logic for localStorage
export const getDB = <T>(key: string, defaultVal: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultVal;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultVal;
  }
};

export const saveDB = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
  // Sync to firestore silently
  setDoc(doc(db, 'app_data', key), { items: data }).catch(e => console.error(e));
};

export const initializeDB = async (): Promise<void> => {
  // Try to pull data from Firestore, if missing, seed it.
  try {
    const userDoc = await getDoc(doc(db, 'app_data', 'sr_users'));
    if (!userDoc.exists()) {
      saveDB('sr_users', seedUsers);
    }
    const groupDoc = await getDoc(doc(db, 'app_data', 'sr_groups'));
    if (!groupDoc.exists()) {
      saveDB('sr_groups', seedGroups);
    }
    const challengeDoc = await getDoc(doc(db, 'app_data', 'sr_challenges'));
    if (!challengeDoc.exists()) {
      saveDB('sr_challenges', seedChallenges);
    }
    const settingDoc = await getDoc(doc(db, 'app_data', 'sr_settings'));
    if (!settingDoc.exists()) {
      saveDB('sr_settings', defaultSettings);
    }
    const logDoc = await getDoc(doc(db, 'app_data', 'sr_log'));
    if (!logDoc.exists()) {
      saveDB('sr_log', initialLog);
    }
  } catch (error) {
    console.error("Firestore initialization error:", error);
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
  const updatedLogs = [newLog, ...logs].slice(0, 150);
  saveDB('sr_log', updatedLogs);
};

