
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, StudentData, ChatMessage, Assignment, ChatSession, AssignmentMaster, Transaction } from './types';
import { MOCK_CHATS, INITIAL_SETTINGS } from './constants';
import ChatRoom from './components/ChatRoom';
import FinanceView from './components/FinanceView';
import QuizView from './components/QuizView';
import AssignmentView from './components/AssignmentView';
import VotingView from './components/VotingView';
import AuthView from './components/AuthView';
import { authService } from './services/authService';
import { LogOut, School, UserCircle, List, CheckSquare, PlusCircle, MinusCircle, X, FolderOpen, Folder, File, Brain, Wallet, Users, Settings, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  
  // Lists Data
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [assignmentMasters, setAssignmentMasters] = useState<AssignmentMaster[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Selection State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedAssignmentMasterId, setSelectedAssignmentMasterId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // States for Teacher Bulk Action
  const [checkedStudentIds, setCheckedStudentIds] = useState<Set<string>>(new Set());
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundDesc, setFundDesc] = useState('');
  const [fundType, setFundType] = useState<'income' | 'expense'>('income');

  // Navigation
  const [activeTab, setActiveTab] = useState<'list' | 'chat' | 'finance' | 'quiz' | 'assignment' | 'voting'>('finance');

  const refreshAllData = useCallback(() => {
    setChatMessages(authService.getChatMessages());
    setStudents(authService.getStudents());
    setChatSessions(authService.getChatSessions());
    setAssignmentMasters(authService.getAssignmentMasters());
    
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Initialize Data
  useEffect(() => {
    authService.init();
    refreshAllData();
    
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.role === UserRole.STUDENT) {
        setActiveTab('finance');
      } else {
        setActiveTab('list');
      }
    }
    
    const interval = setInterval(() => {
        const current = authService.getCurrentUser();
        if (current) {
            refreshAllData();
        }
    }, 3000); 

    return () => clearInterval(interval);
  }, [refreshAllData]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    refreshAllData();
    if (loggedInUser.role === UserRole.STUDENT) {
        setActiveTab('finance');
    } else {
        setActiveTab('list');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSelectedStudentId(null);
    setSelectedSessionId(null);
    setSelectedAssignmentMasterId(null);
    setCheckedStudentIds(new Set());
    setActiveTab('finance');
  };

  const toggleStudentCheck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(checkedStudentIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCheckedStudentIds(newSet);
  };

  const toggleSelectAll = () => {
    if (checkedStudentIds.size === students.length) setCheckedStudentIds(new Set());
    else setCheckedStudentIds(new Set(students.map(s => s.id)));
  };

  const handleBulkFundUpdate = () => {
    if (!fundAmount || !fundDesc) {
        alert("請輸入金額與事由");
        return;
    }
    const amount = parseInt(fundAmount);
    if (isNaN(amount) || amount <= 0) {
        alert("請輸入有效金額");
        return;
    }

    const idsToUpdate = Array.from(checkedStudentIds);
    idsToUpdate.forEach(id => {
        const student = students.find(s => s.id === id);
        if (student) {
            const newTransaction: Transaction = {
                id: Date.now().toString() + Math.random().toString(),
                date: new Date().toISOString().split('T')[0],
                description: fundDesc,
                amount: amount,
                type: fundType
            };
            const newBalance = fundType === 'income' ? student.balance + amount : student.balance - amount;
            const updatedStudent: StudentData = {
                ...student,
                balance: newBalance,
                transactions: [...student.transactions, newTransaction]
            };
            authService.updateStudent(updatedStudent);
        }
    });
    refreshAllData();
    setIsFundModalOpen(false);
    setCheckedStudentIds(new Set());
    setFundAmount('');
    setFundDesc('');
    alert(`已成功更新 ${idsToUpdate.length} 位學生的資金紀錄。`);
  };

  const handleSingleStudentFundUpdate = (amount: number, description: string, type: 'income' | 'expense') => {
      const targetId = selectedStudentId;
      if (!targetId) return;

      const student = students.find(s => s.id === targetId);
      if (student) {
          const newTransaction: Transaction = {
                id: Date.now().toString() + Math.random().toString(),
                date: new Date().toISOString().split('T')[0],
                description: description,
                amount: amount,
                type: type
          };
          const newBalance = type === 'income' ? student.balance + amount : student.balance - amount;
          const updatedStudent: StudentData = {
              ...student,
              balance: newBalance,
              transactions: [...student.transactions, newTransaction]
          };
          authService.updateStudent(updatedStudent);
          refreshAllData();
      }
  };

  const handleCreateChatSession = (topic: string) => {
    const newSession = authService.createChatSession(topic);
    refreshAllData();
    setSelectedSessionId(newSession.id);
  };

  const handleUpdateChatSession = (sessionId: string, updates: Partial<ChatSession>) => {
    authService.updateChatSession(sessionId, updates);
    refreshAllData();
  };

  const handleSaveNickname = (sessionId: string, nickname: string) => {
    if (user?.id) {
        authService.saveStudentNickname(user.id, sessionId, nickname);
        const currentUser = authService.getCurrentUser();
        if(currentUser) setUser(currentUser);
    }
  };

  const handleCreateAssignmentMaster = (title: string, deadline: string) => {
    authService.createAssignmentMaster(title, deadline);
    refreshAllData();
  };

  const handleStudentSubmitAssignment = (masterId: string, content: string) => {
    if (!user || user.role !== UserRole.STUDENT) return;
    const master = assignmentMasters.find(m => m.id === masterId);
    if (!master) return;
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      masterId: masterId,
      title: master.title,
      content,
      status: 'submitted',
      submittedAt: new Date().toISOString().split('T')[0],
      teacherReply: ''
    };
    const studentToUpdate = students.find(s => s.id === user.id);
    if (studentToUpdate) {
        const updatedStudent = {
            ...studentToUpdate,
            assignments: [newAssignment, ...studentToUpdate.assignments]
        };
        authService.updateStudent(updatedStudent);
        setUser(updatedStudent); 
    }
  };

  const handleGradeAssignment = (studentId: string, assignmentId: string, score: number) => {
    const studentToUpdate = students.find(s => s.id === studentId);
    if (studentToUpdate) {
        const updatedAssignments = studentToUpdate.assignments.map(a => 
            a.id === assignmentId ? { ...a, score, status: 'graded' as const } : a
        );
        const updatedStudent = { ...studentToUpdate, assignments: updatedAssignments };
        authService.updateStudent(updatedStudent);
        refreshAllData();
    }
  };

  const handleTeacherReplyAssignment = (studentId: string, assignmentId: string, reply: string) => {
    const studentToUpdate = students.find(s => s.id === studentId);
    if (studentToUpdate) {
        const updatedAssignments = studentToUpdate.assignments.map(a => 
            a.id === assignmentId ? { ...a, teacherReply: reply } : a
        );
        const updatedStudent = { ...studentToUpdate, assignments: updatedAssignments };
        authService.updateStudent(updatedStudent);
        refreshAllData();
    }
  };

  if (!user) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  const targetStudent = user.role === UserRole.STUDENT 
    ? (user as StudentData)
    : selectedStudentId 
      ? students.find(s => s.id === selectedStudentId)
      : null;

  const selectedSession = chatSessions.find(s => s.id === selectedSessionId) || null;
  const selectedAssignmentMaster = assignmentMasters.find(m => m.id === selectedAssignmentMasterId) || null;

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex flex-col md:flex-row font-sans text-stone-600">
      
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-stone-100 z-50 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-stone-800 font-black text-lg">
            <div className="bg-violet-100 p-1.5 rounded-lg text-violet-600">
                <School className="w-5 h-5" />
            </div>
            ClassSync
        </div>
        <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold border-2 border-white shadow-sm ring-1 ring-stone-100">
                {user.name[0]}
            </div>
            <button 
                type="button"
                onClick={handleLogout}
                className="p-3 text-stone-400 hover:text-rose-500 active:scale-90 transition-all cursor-pointer"
                aria-label="Logout"
            >
                <LogOut className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="bg-white border-r border-stone-100 md:w-72 flex-shrink-0 flex flex-col fixed md:relative bottom-0 w-full md:h-screen z-20 order-2 md:order-1 h-20 md:pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] md:shadow-[0_0_20px_rgba(0,0,0,0.03)] rounded-t-3xl md:rounded-none">
        <div className="p-8 hidden md:block">
           <div className="flex items-center gap-3 text-stone-700 font-extrabold text-2xl tracking-tight">
              <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                <School className="w-6 h-6" />
              </div>
              <span>ClassSync</span>
           </div>
        </div>

        <div className="md:px-6 md:mb-8 hidden md:block">
           <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold border-2 border-white shadow-sm">
                 {user.name[0]}
              </div>
              <div>
                 <div className="font-bold text-base text-stone-800">{user.name}</div>
                 <div className="text-xs text-stone-500 font-medium">{user.role === UserRole.TEACHER ? '老師' : '學生'}</div>
              </div>
           </div>
        </div>

        <nav className="flex-1 flex md:flex-col justify-around md:justify-start md:px-6 gap-3 p-3 md:p-0 overflow-x-auto md:overflow-visible no-scrollbar">
          {user.role === UserRole.TEACHER && (
             <NavButton 
                active={activeTab === 'list' && !selectedStudentId} 
                onClick={() => { setActiveTab('list'); setSelectedStudentId(null); }}
                icon={<Users className="w-5 h-5" />}
                label="班級管理控制台"
             />
          )}

          <NavFolder 
            label="匿名聊天室"
            isActive={activeTab === 'chat'}
            onClick={() => { setActiveTab('chat'); setSelectedSessionId(null); setSelectedStudentId(null); }}
            isOpen={activeTab === 'chat'} 
          >
             {chatSessions.map(session => (
                <NavFile 
                    key={session.id}
                    label={session.topic}
                    active={selectedSessionId === session.id}
                    onClick={() => { setSelectedSessionId(session.id); }}
                    isClosed={!session.isActive}
                />
             ))}
          </NavFolder>

          <NavFolder 
            label="心得作業"
            isActive={activeTab === 'assignment'}
            onClick={() => { setActiveTab('assignment'); setSelectedAssignmentMasterId(null); setSelectedStudentId(null); }}
            isOpen={activeTab === 'assignment'}
          >
             {assignmentMasters.map(master => (
                 <NavFile 
                    key={master.id}
                    label={master.title}
                    active={selectedAssignmentMasterId === master.id}
                    onClick={() => setSelectedAssignmentMasterId(master.id)}
                 />
             ))}
          </NavFolder>

          <NavButton 
            active={activeTab === 'voting'} 
            onClick={() => { setActiveTab('voting'); setSelectedStudentId(null); }}
            icon={<Heart className="w-5 h-5" />}
            label="好感度投票"
          />

          {(user.role === UserRole.STUDENT || selectedStudentId) && (
             <NavButton 
                active={activeTab === 'finance'} 
                onClick={() => setActiveTab('finance')}
                icon={<Wallet className="w-5 h-5" />}
                label="資金與交易"
             />
          )}

          {(user.role === UserRole.STUDENT || selectedStudentId) && (
              <NavButton 
                active={activeTab === 'quiz'} 
                onClick={() => setActiveTab('quiz')}
                icon={<Brain className="w-5 h-5" />}
                label="心理測驗"
              />
          )}
        </nav>
        
        <div className="p-6 hidden md:block border-t border-stone-100">
          <button 
            type="button"
            onClick={handleLogout} 
            className="flex items-center gap-3 text-stone-400 hover:text-stone-600 hover:bg-stone-50 w-full px-4 py-3 rounded-2xl transition-all text-sm font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> 登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 pt-20 md:pt-10 order-1 md:order-2">
        {user.role === UserRole.TEACHER && activeTab === 'list' && !selectedStudentId && (
            <div className="max-w-6xl mx-auto animate-fade-in space-y-8 relative pb-20">
                <div className="sticky top-0 md:top-0 z-20 bg-[#fcfaf8]/95 backdrop-blur-md py-4 border-b border-stone-200/50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3 tracking-tight">
                                <Settings className="w-8 h-8 text-violet-500" />
                                班級管理控制台
                            </h1>
                            <p className="text-stone-500 text-sm mt-1 font-medium">勾選下方學生以進行操作，或點擊卡片查看個人詳情。</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-stone-100 overflow-x-auto">
                            {students.length > 0 && (
                                <button 
                                    onClick={toggleSelectAll} 
                                    className="px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-colors flex items-center gap-2 border-r border-stone-100 pr-5 whitespace-nowrap"
                                >
                                    <CheckSquare className={`w-5 h-5 ${checkedStudentIds.size === students.length ? 'text-violet-500' : 'text-stone-300'}`} />
                                    {checkedStudentIds.size === students.length ? '取消全選' : '全選'}
                                </button>
                            )}
                            <button 
                                onClick={() => { setFundType('income'); setIsFundModalOpen(true); }} 
                                disabled={checkedStudentIds.size === 0}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 rounded-xl transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <PlusCircle className="w-4 h-4" /> 發放資金
                            </button>
                            <button 
                                onClick={() => { setFundType('expense'); setIsFundModalOpen(true); }} 
                                disabled={checkedStudentIds.size === 0}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <MinusCircle className="w-4 h-4" /> 扣除款項
                            </button>
                            {checkedStudentIds.size > 0 && (
                                <span className="bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-fade-in whitespace-nowrap shadow-md shadow-violet-200">
                                    {checkedStudentIds.size}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {students.length === 0 ? (
                     <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-stone-200 text-stone-400">
                        <Users className="w-16 h-16 mx-auto mb-4 text-stone-200" />
                        目前尚未有學生註冊
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.map(s => (
                          <div 
                            key={s.id}
                            onClick={() => { setSelectedStudentId(s.id); setActiveTab('finance'); }}
                            className={`relative p-8 rounded-3xl shadow-sm border transition-all cursor-pointer group hover:-translate-y-1 duration-300 ${checkedStudentIds.has(s.id) ? 'bg-violet-50 border-violet-200 ring-2 ring-violet-100' : 'bg-white border-stone-100 hover:shadow-xl hover:shadow-stone-200/50 hover:border-violet-200'}`}
                          >
                             <div onClick={(e) => toggleStudentCheck(e, s.id)} className={`absolute top-5 right-5 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all z-10 ${checkedStudentIds.has(s.id) ? 'bg-violet-500 border-violet-500 text-white scale-110' : 'border-stone-200 hover:border-violet-300 bg-white text-transparent'}`}>
                                 <CheckSquare className="w-4 h-4" />
                             </div>
                             <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center font-black text-2xl shadow-sm border border-violet-100">
                                    {s.name[0]}
                                </div>
                                <div>
                                   <h3 className="font-extrabold text-xl text-stone-800 group-hover:text-violet-600 transition-colors">{s.name}</h3>
                                   <div className="flex gap-2 mt-2">
                                        {s.quizResult ? <span className="text-[10px] px-3 py-1 bg-teal-50 text-teal-600 rounded-full font-bold border border-teal-100">測驗已完成</span> : <span className="text-[10px] px-3 py-1 bg-stone-100 text-stone-500 rounded-full font-bold">未測驗</span>}
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-3 text-sm text-stone-500 font-medium">
                                <div className="flex justify-between border-b border-stone-50 pb-3"><span>資產</span><span className={`font-bold text-base ${checkedStudentIds.has(s.id) ? 'text-violet-600' : 'text-stone-700'}`}>${s.balance}</span></div>
                                <div className="flex justify-between"><span>作業</span>{s.assignments.some(a => a.status === 'submitted') ? <span className="text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-lg">待批改</span> : <span className="text-stone-300">無待辦</span>}</div>
                             </div>
                          </div>
                        ))}
                     </div>
                 )}
            </div>
        )}

        {activeTab === 'chat' && (
             <div className="max-w-4xl mx-auto animate-fade-in">
                <ChatRoom 
                    currentUser={user}
                    allMessages={chatMessages}
                    selectedSession={selectedSession}
                    onUpdateSession={handleUpdateChatSession}
                    onCreateSession={handleCreateChatSession}
                    onSaveNickname={handleSaveNickname}
                />
             </div>
        )}

        {activeTab === 'assignment' && !selectedStudentId && (
            <div className="max-w-5xl mx-auto animate-fade-in">
                <AssignmentView 
                    role={user.role}
                    allStudents={students}
                    myAssignments={user.role === UserRole.STUDENT ? (user as StudentData).assignments : []}
                    selectedMaster={selectedAssignmentMaster}
                    onCreateMaster={handleCreateAssignmentMaster}
                    onStudentSubmit={handleStudentSubmitAssignment}
                    onGrade={handleGradeAssignment}
                    onTeacherReply={handleTeacherReplyAssignment}
                />
            </div>
        )}

        {activeTab === 'voting' && (
             <VotingView 
                currentUser={user}
                students={students}
             />
        )}

        {targetStudent && (activeTab === 'finance' || activeTab === 'quiz') && (
          <div className="max-w-4xl mx-auto animate-slide-up">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
               <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800 flex items-center gap-4 tracking-tight">
                     {user.role === UserRole.TEACHER && (
                        <button onClick={() => { setSelectedStudentId(null); setActiveTab('list'); }} className="text-stone-300 hover:text-stone-600 transition-colors p-2 rounded-2xl hover:bg-stone-100">←</button>
                     )}
                     {activeTab === 'finance' && '資金與交易'}
                     {activeTab === 'quiz' && '價值觀心理測驗'}
                  </h1>
                  <p className="text-stone-500 mt-2 ml-1 font-medium">{user.role === UserRole.TEACHER ? `目前檢視: ${targetStudent.name}` : `歡迎回來，${targetStudent.name}`}</p>
               </div>
            </header>
            <div className="space-y-8">
              {activeTab === 'finance' && (
                  <FinanceView 
                    student={targetStudent} 
                    currentUserRole={user.role} 
                    onManageFund={handleSingleStudentFundUpdate}
                  />
              )}
              {activeTab === 'quiz' && <QuizView student={targetStudent} viewerRole={user.role} onUpdate={refreshAllData} />}
            </div>
          </div>
        )}
      </main>

      {/* Fund Modal */}
      {isFundModalOpen && (
        <div className="fixed inset-0 bg-stone-900/20 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-stone-300/50">
                <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-stone-800">{fundType === 'income' ? '發放資金' : '扣除款項'}</h3><button onClick={() => setIsFundModalOpen(false)} className="text-stone-300 hover:text-stone-500"><X className="w-6 h-6" /></button></div>
                <div className="bg-violet-50 p-4 rounded-2xl text-sm text-violet-700 mb-6 font-bold flex items-center gap-3 border border-violet-100">
                    <Users className="w-5 h-5" />
                    將對 {checkedStudentIds.size} 位學生執行操作
                </div>
                <div className="space-y-6">
                    <div><label className="block text-sm font-bold text-stone-600 mb-2">金額</label><div className="relative"><span className="absolute left-4 top-3.5 text-stone-400 font-bold">$</span><input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="w-full pl-8 pr-5 py-3 border-2 border-stone-100 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-50 focus:outline-none font-bold text-lg text-stone-700" placeholder="輸入金額" autoFocus /></div></div>
                    <div><label className="block text-sm font-bold text-stone-600 mb-2">事由</label><input type="text" value={fundDesc} onChange={e => setFundDesc(e.target.value)} className="w-full px-5 py-3 border-2 border-stone-100 rounded-2xl focus:border-violet-400 focus:ring-4 focus:ring-violet-50 focus:outline-none font-medium" placeholder={fundType === 'income' ? "例如: 作業表現優異" : "例如: 購買班級物品"} /></div>
                    <button onClick={handleBulkFundUpdate} className={`w-full py-4 rounded-2xl text-white font-bold transition-all shadow-lg hover:shadow-xl mt-2 ${fundType === 'income' ? 'bg-teal-500 hover:bg-teal-600 shadow-teal-200' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'}`}>確認{fundType === 'income' ? '發放' : '扣除'}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} className={`flex items-center gap-4 px-5 py-4 rounded-3xl transition-all w-full md:w-auto md:mb-2 whitespace-nowrap group cursor-pointer ${active ? 'bg-white text-violet-600 shadow-lg shadow-stone-200/50 font-bold' : 'text-stone-400 hover:bg-white hover:text-stone-600 hover:shadow-sm'}`}>
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className={`text-sm ${active ? 'font-bold' : 'font-medium'} hidden md:block`}>{label}</span>
  </button>
);

const NavFolder: React.FC<{ label: string, isActive: boolean, onClick: () => void, isOpen: boolean, children?: React.ReactNode }> = ({ label, isActive, onClick, isOpen, children }) => (
    <div className="md:mb-2">
        <button type="button" onClick={onClick} className={`flex items-center justify-between w-full px-5 py-4 rounded-3xl transition-all whitespace-nowrap cursor-pointer ${isActive && (!children || React.Children.count(children) === 0) ? 'bg-white text-violet-600 shadow-lg shadow-stone-200/50 font-bold' : 'text-stone-400 hover:bg-white hover:text-stone-600 hover:shadow-sm'}`}>
            <div className="flex items-center gap-4">
                {isOpen ? <FolderOpen className={`w-5 h-5 ${isActive ? 'text-violet-500' : 'text-stone-300'}`} /> : <Folder className="w-5 h-5 text-stone-300" />}
                <span className={`text-sm hidden md:block ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </div>
        </button>
        {isOpen && (
            <div className="hidden md:flex flex-col gap-1 mt-2 ml-5 border-l-2 border-stone-100 pl-3 animate-fade-in">
                {children}
            </div>
        )}
    </div>
);

const NavFile: React.FC<{ label: string, active: boolean, onClick: () => void, isClosed?: boolean }> = ({ label, active, onClick, isClosed }) => (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(); }} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${active ? 'bg-violet-50 text-violet-700 font-bold shadow-sm' : 'text-stone-400 hover:bg-white hover:text-stone-600'}`}>
        <File className={`w-4 h-4 shrink-0 ${isClosed ? 'text-stone-300' : ''}`} />
        <span className={`text-xs truncate max-w-[140px] ${isClosed ? 'text-stone-300 line-through' : ''}`}>{label || '未命名'}</span>
    </button>
);

export default App;
