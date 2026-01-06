
import React, { useState, useEffect } from 'react';
import { StudentData, UserRole, Vote, VotingSession } from '../types';
import { authService } from '../services/authService';
import { Heart, Trophy, Power, Users, AlertCircle, BarChart3, CheckCircle2, Info, Lock, History, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VotingViewProps {
  currentUser: any;
  students: StudentData[];
}

const VotingView: React.FC<VotingViewProps> = ({ currentUser, students }) => {
  const [session, setSession] = useState<VotingSession>(authService.getVotingSession());
  const [votes, setVotes] = useState<Vote[]>(authService.getVotes());
  const [viewMode, setViewMode] = useState<'current' | 'cumulative'>('current');

  // Logic for calculations
  const currentSessionVotes = votes.filter(v => v.sessionId === session.sessionId);
  const myVotesInCurrentSession = currentSessionVotes.filter(v => v.voterId === currentUser.id);
  const remainingVotes = 3 - myVotesInCurrentSession.length;

  const totalVotesForMe = votes.filter(v => v.targetId === currentUser.id).length;

  useEffect(() => {
    const fetchData = () => {
        setVotes(authService.getVotes());
        setSession(authService.getVotingSession());
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const toggleVoting = () => {
    const newStatus = !session.isActive;
    authService.updateVotingSession(newStatus);
    const updatedSession = authService.getVotingSession();
    setSession(updatedSession);
    if (newStatus) setViewMode('current');
  };

  const handleVote = (targetId: string) => {
    if (targetId === currentUser.id) {
        alert("不能投給自己喔！");
        return;
    }
    try {
        authService.castVote(currentUser.id, targetId);
        setVotes(authService.getVotes());
    } catch (e: any) {
        alert(e.message);
    }
  };

  // --- TEACHER VIEW ---
  if (currentUser.role === UserRole.TEACHER) {
    const currentVoteData = students.map(s => ({
      name: s.name,
      votes: currentSessionVotes.filter(v => v.targetId === s.id).length
    })).sort((a, b) => b.votes - a.votes);

    const cumulativeVoteData = students.map(s => ({
      name: s.name,
      votes: votes.filter(v => v.targetId === s.id).length
    })).sort((a, b) => b.votes - a.votes);

    const activeData = viewMode === 'current' ? currentVoteData : cumulativeVoteData;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-3xl font-extrabold text-stone-800 flex items-center gap-3">
                    <Heart className={`w-8 h-8 ${session.isActive ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-stone-300'}`} />
                    好感度投票管理
                </h2>
                <p className="text-stone-500 text-sm mt-2 font-medium">關閉時學生無法投票，重新開啟將進入新一輪（歷史數據會保留）。</p>
            </div>
            <button 
                onClick={toggleVoting}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                    session.isActive 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                    : 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-200'
                }`}
            >
                <Power className="w-5 h-5" />
                {session.isActive ? '停止投票系統' : '啟動新一輪投票'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center transition-all ${session.isActive ? 'ring-2 ring-rose-100' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${session.isActive ? 'bg-rose-50 text-rose-500' : 'bg-stone-50 text-stone-400'}`}>
                    {session.isActive ? <TrendingUp className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div className="text-sm font-bold text-stone-800">{session.isActive ? '投票進行中' : '投票已關閉'}</div>
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">系統狀態</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center text-violet-500 mb-2">
                    <Users className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black text-stone-800">{currentSessionVotes.length}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">本輪票數</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-2">
                    <History className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black text-stone-800">{votes.length}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">歷史總票數</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                    <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black text-stone-800">{cumulativeVoteData[0]?.votes || 0}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">最高累計票數</div>
            </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-violet-500" />
                    投票數據分析表
                </h3>
                <div className="flex bg-stone-50 p-1 rounded-xl border border-stone-100">
                    <button 
                        onClick={() => setViewMode('current')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'current' ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        本輪即時
                    </button>
                    <button 
                        onClick={() => setViewMode('cumulative')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'cumulative' ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        全期累計
                    </button>
                </div>
            </div>
            
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                        <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={80} 
                            tick={{fontSize: 12, fontWeight: 'bold', fill: '#78716c'}} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="votes" barSize={30} radius={[8, 8, 0, 0]}>
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={viewMode === 'current' ? '#f43f5e' : '#8b5cf6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-stone-400 text-xs mt-4 font-medium italic">
                {viewMode === 'current' ? `目前顯示：Session ${session.sessionId} 的投票紀錄` : '目前顯示：系統啟動以來的所有歷史累計好感度'}
            </p>
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW ---
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {/* Student Dashboard Card - Only Cumulative Total shown now */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-100 transition-colors"></div>
            <div>
                <h2 className="text-3xl font-extrabold text-stone-800 mb-2">累計總好感度</h2>
                <p className="text-stone-500 font-medium">全學期累積獲得的好感票數。</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-stone-400">
                    <History className="w-4 h-4" />
                    包含所有歷史輪次的統計
                </div>
            </div>
            <div className="flex flex-col items-center relative z-10">
                <div className="text-7xl font-black text-rose-500 drop-shadow-sm">{totalVotesForMe}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-2">Total Score</div>
            </div>
        </div>

        {/* Voting Interface */}
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-4">
                <h3 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-stone-400" />
                    投票給心目中的好隊友
                </h3>
                {session.isActive ? (
                    <div className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                        remainingVotes === 0 ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                    }`}>
                        {remainingVotes === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Heart className="w-4 h-4 fill-current" />}
                        {remainingVotes === 0 ? '本輪 3 票已全數投出' : `您在本輪還剩下 ${remainingVotes} 票`}
                    </div>
                ) : (
                    <div className="bg-stone-100 text-stone-400 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-stone-200">
                        <Lock className="w-4 h-4" /> 目前非投票時間
                    </div>
                )}
            </div>

            {session.isActive ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {students.filter(s => s.id !== currentUser.id).map(student => {
                        const alreadyVotedForHim = myVotesInCurrentSession.some(v => v.targetId === student.id);
                        const canVote = session.isActive && remainingVotes > 0 && !alreadyVotedForHim;
                        
                        return (
                            <div 
                                key={student.id} 
                                className={`p-6 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm flex flex-col items-center transition-all ${
                                    canVote ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer group active:scale-95' : 'opacity-60 grayscale-[0.5]'
                                }`}
                                onClick={() => canVote && handleVote(student.id)}
                            >
                                <div className="relative mb-4">
                                    <div className="w-20 h-20 rounded-3xl bg-stone-50 text-stone-400 flex items-center justify-center font-black text-3xl border-4 border-white shadow-md">
                                        {student.name[0]}
                                    </div>
                                    {alreadyVotedForHim && (
                                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="font-bold text-stone-700 text-lg">{student.name}</div>
                                
                                {alreadyVotedForHim ? (
                                    <div className="mt-3 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                        已投遞
                                    </div>
                                ) : canVote ? (
                                    <div className="mt-3 p-2.5 rounded-full bg-stone-50 text-stone-300 group-hover:bg-rose-50 group-hover:text-rose-400 transition-all border border-stone-100">
                                        <Heart className="w-5 h-5 group-hover:fill-current" />
                                    </div>
                                ) : (
                                    <div className="mt-3 h-8"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white/50 border-2 border-dashed border-stone-200 py-24 rounded-[3rem] flex flex-col items-center text-stone-400">
                    <Lock className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-bold text-lg">好感度投票目前暫時關閉</p>
                    <p className="text-sm mt-2 max-w-xs text-center leading-relaxed font-medium">
                        投票系統正處於非活動狀態。老師重新開啟新一輪後，您將會獲得新的 3 票投票權。
                    </p>
                </div>
            )}
        </div>

        {/* Rules Footer */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 flex items-start gap-5 shadow-sm">
            <div className="bg-violet-50 p-3 rounded-2xl text-violet-500">
                <Info className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-stone-800 mb-2">投票機制說明</h4>
                <ul className="text-sm text-stone-500 space-y-2 font-medium">
                    <li>• 每位學生在每輪投票中擁有 <strong className="text-stone-800">3 票</strong>。</li>
                    <li>• 同一輪內，每位同學限投 <strong className="text-stone-800">1 票</strong>（不可重複投給同一人）。</li>
                    <li>• 投票過程為 <strong className="text-stone-800">完全匿名</strong>，您的身份不會被揭露。</li>
                    <li>• <strong className="text-rose-500">累計總好感度</strong> 會跨輪持續採計，本輪票數則在每次重新開啟時歸零重計。</li>
                </ul>
            </div>
        </div>
    </div>
  );
};

export default VotingView;
