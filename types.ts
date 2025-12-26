
export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  username?: string;
  password?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

// Psychological Quiz Types
export type PsychoCategory = '政治' | '性別' | '開放性';

export interface PsychoOption {
  label: string;
  score: number;
  size: number; // For UI dot size
}

export interface PsychoQuestion {
  id: string;
  question: string;
  category: PsychoCategory;
  isReverse: boolean; // If true, Agree yields negative score (Right side)
}

export interface QuizResult {
  categoryScores: Record<PsychoCategory, number>;
  completedAt: string;
}

export interface AssignmentMaster {
  id: string;
  title: string;
  deadline: string;
  createdAt: string;
  isActive: boolean;
}

export interface Assignment {
  id: string;
  masterId: string;
  title: string;
  content: string;
  teacherReply?: string;
  feedback?: string; 
  score?: number;
  status: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isAnonymous: boolean;
}

export interface ChatSession {
  id: string;
  topic: string;
  isActive: boolean;
  createdAt: string;
}

export interface Vote {
  voterId: string;
  targetId: string;
  sessionId: string; // To distinguish between different rounds
  timestamp: string;
}

export interface VotingSession {
  isActive: boolean;
  sessionId: string; // Unique ID for current round
  lastStartedAt: string;
}

export interface StudentData extends User {
  balance: number;
  transactions: Transaction[];
  quizResult?: QuizResult; 
  assignments: Assignment[];
  chatNicknames: Record<string, string>; 
}

export interface ClassSettings {
  systemVersion: string;
}
