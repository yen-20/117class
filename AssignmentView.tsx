
import React, { useState, useEffect } from 'react';
import { Assignment, StudentData, UserRole, AssignmentMaster } from '../types';
import { FileText, Sparkles, CheckCircle, Clock, Calendar, Edit3, Plus, Lock, AlertCircle } from 'lucide-react';

interface AssignmentViewProps {
  role: UserRole;
  allStudents?: StudentData[];
  myAssignments?: Assignment[];
  selectedMaster: AssignmentMaster | null;
  
  onCreateMaster: (title: string, deadline: string) => void;
  onStudentSubmit: (masterId: string, content: string) => void;
  onGrade: (studentId: string, assignmentId: string, score: number) => void;
  onTeacherReply: (studentId: string, assignmentId: string, reply: string) => void;
}

const AssignmentView: React.FC<AssignmentViewProps> = ({ 
  role, 
  allStudents, 
  myAssignments,
  selectedMaster,
  onCreateMaster,
  onStudentSubmit,
  onGrade,
  onTeacherReply
}) => {
  
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editScoreId, setEditScoreId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<string>('');
  const [replyInput, setReplyInput] = useState<string>('');

  // Auto-update check for expiration
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const handleCreate = () => {
    if (!newTitle || !newDeadline) {
        alert("請填寫完整資訊");
        return;
    }
    onCreateMaster(newTitle, newDeadline);
    setNewTitle('');
    setNewDeadline('');
    alert('作業已建立！請從左側選單點擊該作業以進行管理。');
  };

  const handleSubmit = async () => {
    if (!content || !selectedMaster) return;
    setIsSubmitting(true);
    await onStudentSubmit(selectedMaster.id, content);
    setContent('');
    setIsSubmitting(false);
  };

  const handleStartGrade = (assignment: Assignment, studentId: string) => {
    setEditScoreId(`${studentId}-${assignment.id}`);
    setScoreInput(assignment.score?.toString() || '');
    setReplyInput(assignment.teacherReply || '');
  };

  const handleSaveGrade = (studentId: string, assignment: Assignment) => {
    const score = parseFloat(scoreInput);
    if (!isNaN(score)) {
        onGrade(studentId, assignment.id, score);
    }
    if (replyInput) {
        onTeacherReply(studentId, assignment.id, replyInput);
    }
    setEditScoreId(null);
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
  };

  // Helper to check expiration
  const isExpired = selectedMaster ? new Date(selectedMaster.deadline).getTime() < now.getTime() : false;

  // TEACHER - CREATE MODE
  if (role === UserRole.TEACHER && !selectedMaster) {
      return (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-stone-200 max-w-2xl mx-auto text-center">
             <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8 text-orange-500">
                <Edit3 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-stone-800 mb-2">派發新作業</h2>
            <p className="text-stone-500 mb-10 font-medium">建立一份新的作業文件，設定截止日期與時間。</p>
            
            <div className="text-left space-y-6 max-w-md mx-auto">
                <div>
                    <label className="block text-sm font-bold text-stone-500 mb-2">作業標題</label>
                    <input 
                        type="text" 
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="例如: 本週心得 - 領導力的定義"
                        className="w-full px-5 py-3 border-2 border-stone-100 bg-stone-50 rounded-2xl focus:bg-white focus:border-violet-300 focus:outline-none transition-all font-bold text-stone-700"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-500 mb-2">繳交期限 (日期與時間)</label>
                    <input 
                        type="datetime-local" 
                        value={newDeadline}
                        onChange={e => setNewDeadline(e.target.value)}
                        className="w-full px-5 py-3 border-2 border-stone-100 bg-stone-50 rounded-2xl focus:bg-white focus:border-violet-300 focus:outline-none transition-all font-bold text-stone-700"
                    />
                </div>
                <button 
                    onClick={handleCreate}
                    className="w-full bg-violet-500 text-white px-8 py-4 rounded-2xl hover:bg-violet-600 transition-all font-bold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-violet-200 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> 建立作業文件
                </button>
            </div>
        </div>
      );
  }

  // STUDENT - SELECT MODE
  if (role === UserRole.STUDENT && !selectedMaster) {
      return (
        <div className="flex flex-col h-[500px] bg-white/50 rounded-[2.5rem] border-2 border-dashed border-stone-200 items-center justify-center text-stone-400">
            <FileText className="w-16 h-16 mb-4 text-stone-200" />
            <p className="font-bold">請從左側選單選擇一份作業</p>
        </div>
      );
  }

  if (!selectedMaster) return null;

  // TEACHER - VIEW SUBMISSIONS
  if (role === UserRole.TEACHER) {
      const submittedStudents = allStudents?.filter(s => s.assignments.some(a => a.masterId === selectedMaster.id)) || [];

      return (
        <div className="space-y-8 animate-fade-in">
             <div className="flex items-center justify-between bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
                <div>
                    <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">{selectedMaster.title}</h2>
                    <div className="flex gap-5 text-sm text-stone-500 mt-2 font-medium items-center">
                        <span className={`flex items-center gap-1.5 ${isExpired ? 'text-rose-500 font-bold' : ''}`}>
                            <Clock className="w-4 h-4"/> 
                            期限: {formatDateTime(selectedMaster.deadline)}
                            {isExpired && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-xs ml-2">已截止</span>}
                        </span>
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> 已繳交: {submittedStudents.length} 人</span>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-6 bg-stone-50 border-b border-stone-100 font-bold text-stone-600 pl-8">
                    繳交列表
                </div>
                <div className="divide-y divide-stone-50">
                    {submittedStudents.length === 0 ? (
                        <div className="p-16 text-center text-stone-400 font-medium">目前尚無學生繳交此作業</div>
                    ) : (
                        submittedStudents.map(student => {
                            const submission = student.assignments.find(a => a.masterId === selectedMaster.id);
                            if (!submission) return null;
                            const isEditing = editScoreId === `${student.id}-${submission.id}`;

                            return (
                                <div key={student.id} className="p-8 hover:bg-stone-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                                                {student.name[0]}
                                            </div>
                                            <div>
                                                <span className="font-bold text-stone-800 text-lg">{student.name}</span>
                                                <span className="text-xs text-stone-400 ml-3 font-medium">繳交於 {submission.submittedAt}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2 animate-fade-in bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
                                                    <input 
                                                        type="number" 
                                                        value={scoreInput}
                                                        onChange={e => setScoreInput(e.target.value)}
                                                        className="w-20 px-3 py-2 border border-stone-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-violet-300 font-bold text-stone-700 bg-stone-50"
                                                        autoFocus
                                                        placeholder="分數"
                                                    />
                                                    <button onClick={() => handleSaveGrade(student.id, submission)} className="bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-600 transition-colors">
                                                        儲存
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    {submission.score !== undefined ? (
                                                        <span className="text-xl font-black text-teal-600">{submission.score} 分</span>
                                                    ) : (
                                                        <span className="text-xs bg-stone-100 text-stone-400 px-3 py-1.5 rounded-lg font-bold">未評分</span>
                                                    )}
                                                    <button onClick={() => handleStartGrade(submission, student.id)} className="bg-violet-50 text-violet-600 hover:bg-violet-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                                        {submission.score !== undefined ? '修改' : '評分/回覆'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl text-stone-600 text-sm mb-4 border border-stone-100 leading-relaxed whitespace-pre-wrap shadow-sm">
                                        {submission.content}
                                    </div>
                                    
                                    {isEditing ? (
                                        <div className="mt-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                            <label className="text-xs font-bold text-stone-500 block mb-2 uppercase tracking-wide">老師回覆</label>
                                            <textarea
                                                value={replyInput}
                                                onChange={e => setReplyInput(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl text-sm focus:ring-4 focus:ring-violet-50 focus:border-violet-300 focus:outline-none transition-all"
                                                rows={3}
                                                placeholder="給予學生回饋..."
                                            />
                                        </div>
                                    ) : (
                                        submission.teacherReply && (
                                            <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 mt-4 text-sm text-violet-800">
                                                <div className="flex items-center gap-2 mb-2 font-bold">
                                                    <Sparkles className="w-4 h-4" />
                                                    老師回覆
                                                </div>
                                                <p className="leading-relaxed opacity-90">{submission.teacherReply}</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
             </div>
        </div>
      );
  }

  // STUDENT - VIEW/SUBMIT
  const mySubmission = myAssignments?.find(a => a.masterId === selectedMaster.id);

  return (
    <div className="space-y-8 animate-slide-up">
        {/* Header Info */}
        <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isExpired ? 'bg-stone-100' : 'bg-violet-50'}`}></div>
            <h2 className="text-2xl font-extrabold mb-3 text-stone-800 relative z-10">{selectedMaster.title}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-6 text-stone-500 text-sm font-medium relative z-10">
                <div className={`flex items-center gap-2 ${isExpired ? 'text-rose-500 font-bold' : ''}`}>
                    {isExpired ? <Lock className="w-4 h-4" /> : <Clock className="w-4 h-4 text-violet-400" />}
                    <span>截止期限: {formatDateTime(selectedMaster.deadline)}</span>
                    {isExpired && <span className="bg-rose-100 px-2 py-0.5 rounded text-xs">已截止</span>}
                </div>
                {mySubmission && (
                     <div className="flex items-center gap-2 bg-teal-50 text-teal-600 px-3 py-1 rounded-lg border border-teal-100">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold">已繳交</span>
                     </div>
                )}
            </div>
        </div>

        {/* Submission Area */}
        {mySubmission ? (
             <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-stone-800 text-lg">我的作業</h3>
                        <p className="text-xs text-stone-400 font-medium mt-1">繳交於 {formatDateTime(mySubmission.submittedAt || '')}</p>
                    </div>
                    {mySubmission.score !== undefined ? (
                        <div className="bg-teal-500 text-white px-5 py-2 rounded-xl font-black shadow-lg shadow-teal-100 text-xl">
                            {mySubmission.score} 分
                        </div>
                    ) : (
                        <div className="bg-stone-100 text-stone-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                            <Clock className="w-3 h-3"/> 待批改
                        </div>
                    )}
                </div>
                
                <div className="bg-stone-50 p-6 rounded-2xl text-stone-700 text-sm mb-6 leading-relaxed whitespace-pre-wrap border border-stone-100">
                    {mySubmission.content}
                </div>
                
                {mySubmission.teacherReply && (
                    <div className="bg-violet-50 border border-violet-100 p-6 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3 text-violet-600 font-bold text-sm">
                            <Sparkles className="w-4 h-4" />
                            老師評語
                        </div>
                        <p className="text-violet-900 text-sm leading-relaxed opacity-90">
                            {mySubmission.teacherReply}
                        </p>
                    </div>
                )}
             </div>
        ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm relative">
                <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-violet-500" />
                    撰寫作業內容
                </h3>
                
                {isExpired ? (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                        <Lock className="w-12 h-12 mb-4 text-stone-300" />
                        <h4 className="font-bold text-lg text-stone-500">作業繳交時間已截止</h4>
                        <p className="text-sm mt-2">您已無法提交此作業，請聯繫老師。</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full px-6 py-5 border-2 border-stone-100 bg-stone-50 rounded-2xl focus:bg-white focus:border-violet-300 focus:outline-none h-64 align-top transition-all font-medium text-stone-700"
                            placeholder="請在此寫下你的心得..."
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || !content}
                                className="px-10 py-4 rounded-2xl bg-violet-500 text-white hover:bg-violet-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all"
                            >
                                <CheckCircle className="w-5 h-5" />
                                提交作業
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default AssignmentView;
