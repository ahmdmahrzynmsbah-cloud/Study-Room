/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MembershipTier = 'free' | 'silver' | 'gold';

export interface SubscriptionPlan {
  id: MembershipTier;
  name: string;
  priceEgp: number;
  bonusPoints: number;
  durationDays: number;
  features: string[];
  color: string;
}

export interface User {
  id: string;
  studentCode?: string;
  name: string;
  phone?: string;
  parentPhone?: string;
  governorate?: string;
  educationalStage?: 'middle' | 'high';
  educationalLevel?: '1st' | '2nd' | '3rd';
  email: string;
  password?: string; // plain text for demo
  avatar: string; // initials or emoji
  role: 'admin' | 'user';
  membershipTier?: MembershipTier; // Optional for backward compatibility, default free
  membershipExpiry?: number; // timestamp in milliseconds
  points: number;
  walletBalance: number; // Balance in EGP
  totalStudyMinutes: number;
  challengesJoined: number;
  challengesCompleted: number;
  createdAt: number;
  isActive: boolean;
  lazyExpiry?: number; // timestamp in ms when the lazy badge expires
  customPunishments?: string[]; // user self-customized punishments list
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string; // userId
  members: string[]; // array of userIds
  createdAt: number;
  isActive: boolean;
}

export interface Submission {
  userId: string;
  submittedAt: number;
  proofText: string;
  proofFile?: string; // Base64
  ratings: { fromUserId: string; isApproved?: boolean; score?: number }[]; 
  averageRating?: number;
  status?: 'pending' | 'approved' | 'rejected_pending_admin' | 'admin_approved' | 'admin_rejected';
}

export interface Challenge {
  id: string;
  title: string;
  subject: string;
  groupId: string;
  createdBy: string; // userId
  durationMinutes: number;
  pageCount: number;
  startTime: number | null; // timestamp
  endTime: number | null; // timestamp
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  participants: string[]; // userIds
  submissions: Submission[];
  pointsReward: number;
  pointsPenalty: number;
  createdAt: number;
  focusViolations?: {
    id: string;
    userId: string;
    userName: string;
    platform: string;
    timestamp: number;
    penaltyPoints: number;
  }[];
}

export interface TransactionRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'withdraw' | 'deposit' | 'convert_points_to_money' | 'convert_money_to_points';
  amountPoints?: number;
  amountMoney?: number;
  paymentDetails?: string;
  screenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface AppSettings {
  appName: string;
  platformLogo?: string; // App Logo base64
  loginWelcomeTitle?: string;
  loginWelcomeSubtitle?: string;
  welcomeMessage?: string;
  defaultReward: number;
  defaultPenalty: number;
  allowSelfRating: boolean;
  maxGroupSize: number;
  maintenanceMode: boolean;
  pointsToEgpRate: number; // e.g., 100 points = 1 EGP
  egpToPointsRate: number; // e.g., 1 EGP = 100 points
  subscriptionPlans?: SubscriptionPlan[];
}

export interface Session {
  userId: string;
  loginTime: number;
  token: string;
}

export interface UserNotification {
  id: string;
  userIds: string[]; // List of targeted user/student IDs, or ["all"] for system-wide broadcasts
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'penalty' | 'admin' | 'violation';
  timestamp: number;
  readBy: string[]; // List of user IDs who have marked this notification as read
}
