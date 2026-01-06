
import React, { useState } from 'react';
import { UserRole } from '../types';
import { School, User, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthViewProps {
  onLoginSuccess: (user: any) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Default role is STUDENT for new registrations
  const role = UserRole.STUDENT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = authService.login(username, password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('帳號或密碼錯誤');
        }
      } else {
        if (!name || !username || !password) {
          setError('請填寫所有欄位');
          return;
        }
        // Always register as STUDENT
        const newUser = authService.register(name, username, password, UserRole.STUDENT);
        onLoginSuccess(newUser);
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-50 to-orange-50 p-10 text-center border-b border-stone-50">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 text-violet-500 shadow-xl shadow-violet-100/50">
            <School className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">ClassSync</h1>
          <p className="text-stone-500 text-sm mt-2 font-medium">智慧班級管理系統</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-50 p-2 gap-2 bg-stone-50/50">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${isLogin ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
            登入
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${!isLogin ? 'bg-white text-violet-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
          >
            註冊學生
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-500 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake border border-rose-100">
              <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
              {error}
            </div>
          )}

          {!isLogin && (
             <div className="space-y-5 animate-fade-in">
                <div className="relative">
                  <UserPlus className="w-5 h-5 text-stone-300 absolute left-4 top-4" />
                  <input
                    type="text"
                    placeholder="真實姓名 (例如: 陳小明)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 transition-all outline-none font-bold text-stone-700 placeholder-stone-400"
                  />
                </div>
             </div>
          )}

          <div className="relative">
            <User className="w-5 h-5 text-stone-300 absolute left-4 top-4" />
            <input
              type="text"
              placeholder="帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 transition-all outline-none font-bold text-stone-700 placeholder-stone-400"
            />
          </div>

          <div className="relative">
            <Lock className="w-5 h-5 text-stone-300 absolute left-4 top-4" />
            <input
              type="password"
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-stone-50 border-2 border-transparent focus:bg-white focus:border-violet-200 focus:ring-4 focus:ring-violet-50 transition-all outline-none font-bold text-stone-700 placeholder-stone-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? (
               <>
                 登入系統 <ArrowRight className="w-5 h-5" />
               </>
            ) : (
               <>
                 建立帳號 <UserPlus className="w-5 h-5" />
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthView;
