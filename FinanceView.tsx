
import React, { useState } from 'react';
import { StudentData, UserRole } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PlusCircle, MinusCircle } from 'lucide-react';

interface FinanceViewProps {
  student: StudentData;
  currentUserRole?: UserRole;
  onManageFund?: (amount: number, description: string, type: 'income' | 'expense') => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ student, currentUserRole, onManageFund }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleTransaction = (type: 'income' | 'expense') => {
    if (!amount || !description || !onManageFund) return;
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) {
        alert('請輸入有效金額');
        return;
    }
    onManageFund(val, description, type);
    setAmount('');
    setDescription('');
  };

  const sortedTransactions = [...student.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let currentSimulatedBalance = 0; 
  const trendData = sortedTransactions.map(t => {
    currentSimulatedBalance += t.type === 'income' ? t.amount : -t.amount;
    return {
      date: t.date.slice(5),
      balance: currentSimulatedBalance
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* --- Teacher Control Panel --- */}
      {currentUserRole === UserRole.TEACHER && onManageFund && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-200 to-orange-200"></div>
            <h3 className="text-lg font-extrabold text-stone-800 mb-6 flex items-center gap-3">
                <div className="bg-violet-50 p-2 rounded-xl text-violet-500"><Wallet className="w-5 h-5" /></div>
                資金管理控制台
            </h3>
            <div className="flex flex-col md:flex-row gap-5 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-stone-500 ml-2 mb-2 block uppercase tracking-wider">金額</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-stone-400 font-bold">$</span>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-violet-300 focus:outline-none font-bold text-stone-700 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-[2] w-full">
                    <label className="text-xs font-bold text-stone-500 ml-2 mb-2 block uppercase tracking-wider">事由</label>
                    <input 
                        type="text" 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="例如: 作業優異獎勵..."
                        className="w-full px-5 py-3 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-violet-300 focus:outline-none font-medium text-stone-700 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => handleTransaction('income')}
                        disabled={!amount || !description}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-teal-100"
                    >
                        <PlusCircle className="w-5 h-5" /> 發放
                    </button>
                    <button 
                         onClick={() => handleTransaction('expense')}
                         disabled={!amount || !description}
                         className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-400 hover:bg-rose-500 text-white px-6 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-rose-100"
                    >
                        <MinusCircle className="w-5 h-5" /> 扣款
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-100 transition-colors"></div>
          <div className="flex items-center gap-3 opacity-60 mb-3 relative z-10 text-stone-500">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">目前資產</span>
          </div>
          <div className="text-4xl font-black tracking-tight text-stone-800 relative z-10">${student.balance.toLocaleString()}</div>
        </div>
        
        <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <span className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-3 relative z-10">近期變動</span>
             <div className="flex items-center gap-3 relative z-10">
                {student.transactions.length > 0 && student.transactions[student.transactions.length -1].type === 'income' ? (
                    <TrendingUp className="w-8 h-8 text-teal-500" />
                ) : (
                    <TrendingDown className="w-8 h-8 text-rose-400" />
                )}
                <span className={`text-2xl font-black ${student.transactions.length > 0 && student.transactions[student.transactions.length -1].type === 'income' ? 'text-teal-600' : 'text-rose-500'}`}>
                    {student.transactions.length > 0 ? Math.abs(student.transactions[student.transactions.length -1].amount) : 0}
                </span>
             </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
        <h3 className="text-lg font-extrabold text-stone-800 mb-8">資產趨勢</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#a8a29e'}} stroke="#d6d3d1" tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{fontSize: 12, fill: '#a8a29e'}} stroke="#d6d3d1" tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                cursor={{stroke: '#e7e5e4', strokeWidth: 2}}
              />
              <Line type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={4} dot={{r: 0}} activeDot={{r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 bg-stone-50 border-b border-stone-100 font-bold text-stone-700">
            交易紀錄
        </div>
        <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto">
          {[...student.transactions].reverse().map((t) => (
            <div key={t.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    t.type === 'income' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-500'
                }`}>
                    <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-stone-700 text-base">{t.description}</div>
                  <div className="text-xs text-stone-400 font-medium mt-1">{t.date}</div>
                </div>
              </div>
              <div className={`font-black text-lg ${t.type === 'income' ? 'text-teal-600' : 'text-rose-500'}`}>
                {t.type === 'income' ? '+' : '-'}{t.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
