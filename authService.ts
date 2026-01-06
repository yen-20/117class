
import { User, StudentData, UserRole, ClassSettings, QuizResult, ChatMessage, ChatSession, AssignmentMaster, VotingSession, Vote } from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHER, INITIAL_SETTINGS, MOCK_CHATS } from '../constants';

const USERS_STORAGE_KEY = 'class_sync_users';
const CURRENT_USER_KEY = 'class_sync_current_user';
const SETTINGS_STORAGE_KEY = 'class_sync_settings';
const CHAT_MSG_STORAGE_KEY = 'class_sync_chat_msgs';
const CHAT_SESSIONS_KEY = 'class_sync_chat_sessions';
const ASSIGNMENT_MASTERS_KEY = 'class_sync_assignment_masters';
const VOTING_SESSION_KEY = 'class_sync_voting_session';
const VOTES_KEY = 'class_sync_votes';

const getAllUsers = (): (User | StudentData)[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    const initialData = [INITIAL_TEACHER, ...INITIAL_STUDENTS];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
};

export const authService = {
  init: () => {
    getAllUsers();
    if (!localStorage.getItem(SETTINGS_STORAGE_KEY)) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(CHAT_MSG_STORAGE_KEY)) {
      localStorage.setItem(CHAT_MSG_STORAGE_KEY, JSON.stringify(MOCK_CHATS));
    }
    if (!localStorage.getItem(CHAT_SESSIONS_KEY)) {
      localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(ASSIGNMENT_MASTERS_KEY)) {
      localStorage.setItem(ASSIGNMENT_MASTERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(VOTING_SESSION_KEY)) {
      localStorage.setItem(VOTING_SESSION_KEY, JSON.stringify({ isActive: false, sessionId: 'init', lastStartedAt: '' }));
    }
    if (!localStorage.getItem(VOTES_KEY)) {
      localStorage.setItem(VOTES_KEY, JSON.stringify([]));
    }
  },

  login: (username: string, password: string): User | StudentData | null => {
    const users = getAllUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (name: string, username: string, password: string, role: UserRole): User | StudentData => {
    const users = getAllUsers();
    if (users.some(u => u.username === username)) {
      throw new Error('帳號已存在');
    }
    const baseUser = {
      id: Date.now().toString(),
      name,
      username,
      password,
      role
    };
    let newUser: User | StudentData;
    if (role === UserRole.STUDENT) {
      newUser = {
        ...baseUser,
        balance: 0,
        transactions: [],
        assignments: [],
        chatNicknames: {} 
      } as StudentData;
    } else {
      newUser = baseUser;
    }
    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getStudents: (): StudentData[] => {
    const users = getAllUsers();
    return users.filter(u => u.role === UserRole.STUDENT) as StudentData[];
  },

  updateStudent: (studentData: StudentData) => {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === studentData.id);
    if (index !== -1) {
      users[index] = studentData;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === studentData.id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(studentData));
      }
    }
  },

  saveStudentNickname: (studentId: string, sessionId: string, nickname: string) => {
    const users = getAllUsers();
    const student = users.find(u => u.id === studentId) as StudentData;
    if (student && student.role === UserRole.STUDENT) {
      if (!student.chatNicknames) student.chatNicknames = {};
      student.chatNicknames[sessionId] = nickname;
      authService.updateStudent(student);
    }
  },

  submitQuizResult: (studentId: string, result: QuizResult) => {
    const users = getAllUsers();
    const student = users.find(u => u.id === studentId) as StudentData;
    if (student && student.role === UserRole.STUDENT) {
      student.quizResult = result;
      authService.updateStudent(student);
    }
  },

  getSettings: (): ClassSettings => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
  },

  getChatSessions: (): ChatSession[] => {
    const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  createChatSession: (topic: string): ChatSession => {
    const sessions = authService.getChatSessions();
    const newSession: ChatSession = {
      id: Date.now().toString(),
      topic,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify([newSession, ...sessions]));
    return newSession;
  },

  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => {
    const sessions = authService.getChatSessions();
    const updatedSessions = sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(updatedSessions));
  },

  getChatMessages: (): ChatMessage[] => {
    const stored = localStorage.getItem(CHAT_MSG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_CHATS;
  },

  addChatMessage: (message: ChatMessage) => {
    const stored = localStorage.getItem(CHAT_MSG_STORAGE_KEY);
    const messages = stored ? JSON.parse(stored) : [];
    localStorage.setItem(CHAT_MSG_STORAGE_KEY, JSON.stringify([...messages, message]));
  },

  getAssignmentMasters: (): AssignmentMaster[] => {
    const stored = localStorage.getItem(ASSIGNMENT_MASTERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  createAssignmentMaster: (title: string, deadline: string): AssignmentMaster => {
    const masters = authService.getAssignmentMasters();
    const newMaster: AssignmentMaster = {
      id: Date.now().toString(),
      title,
      deadline,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(ASSIGNMENT_MASTERS_KEY, JSON.stringify([newMaster, ...masters]));
    return newMaster;
  },

  getVotingSession: (): VotingSession => {
    const stored = localStorage.getItem(VOTING_SESSION_KEY);
    return stored ? JSON.parse(stored) : { isActive: false, sessionId: 'init', lastStartedAt: '' };
  },

  updateVotingSession: (isActive: boolean) => {
    const currentSession = authService.getVotingSession();
    const session: VotingSession = {
      isActive,
      sessionId: isActive && !currentSession.isActive ? Date.now().toString() : currentSession.sessionId,
      lastStartedAt: isActive && !currentSession.isActive ? new Date().toISOString() : currentSession.lastStartedAt
    };
    localStorage.setItem(VOTING_SESSION_KEY, JSON.stringify(session));
  },

  getVotes: (): Vote[] => {
    const stored = localStorage.getItem(VOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  castVote: (voterId: string, targetId: string) => {
    const session = authService.getVotingSession();
    if (!session.isActive) throw new Error('投票目前已關閉');

    const votes = authService.getVotes();
    const myVotesInSession = votes.filter(v => v.voterId === voterId && v.sessionId === session.sessionId);
    
    if (myVotesInSession.length >= 3) {
      throw new Error('您在本輪投票中已經投完 3 票了');
    }
    if (myVotesInSession.some(v => v.targetId === targetId)) {
        throw new Error('您已經投過這位同學了');
    }

    const newVote: Vote = {
      voterId,
      targetId,
      sessionId: session.sessionId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(VOTES_KEY, JSON.stringify([...votes, newVote]));
  }
};
