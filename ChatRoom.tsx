
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User, StudentData, ChatSession } from '../types';
import { Send, MessageSquare, Plus, Lock, ArrowRight, XCircle, Power, VenetianMask } from 'lucide-react';
import { authService } from '../services/authService';

interface ChatRoomProps {
  currentUser: User;
  allMessages: ChatMessage[];
  selectedSession: ChatSession | null; 
  onUpdateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  onCreateSession: (topic: string) => void;
  onSaveNickname: (sessionId: string, nickname: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ 
    currentUser, 
    allMessages, 
    selectedSession, 
    onUpdateSession, 
    onCreateSession,
    onSaveNickname 
}) => {
  
  const messages = selectedSession 
    ? allMessages.filter(m => m.sessionId === selectedSession.id) 
    : [];
  
  const [inputText, setInputText] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [nickname, setNickname] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to track the last session ID to distinguish session switch vs data sync
  const lastSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedSession) {
        setHasJoined(false);
        setNickname('');
        lastSessionIdRef.current = null;
        return;
    }

    const isSessionSwitch = lastSessionIdRef.current !== selectedSession.id;
    
    if (isSessionSwitch) {
        // Initial setup for a NEW session
        lastSessionIdRef.current = selectedSession.id;
        
        if (currentUser.role === 'TEACHER') {
            setHasJoined(true);
            setNickname(currentUser.name);
        } else {
            const student = currentUser as StudentData;
            const savedNickname = student.chatNicknames?.[selectedSession.id];
            if (savedNickname) {
                setNickname(savedNickname);
                setHasJoined(true);
            } else {
                setHasJoined(false);
                setNickname('');
            }
        }
    } else {
        // Data SYNC (Polling) for the SAME session
        // Only update if we weren't joined but now the server says we have a nickname
        if (currentUser.role === 'STUDENT') {
            const student = currentUser as StudentData;
            const savedNickname = student.chatNicknames?.[selectedSession.id];
            if (savedNickname && !hasJoined) {
                setNickname(savedNickname);
                setHasJoined(true);
            }
        }
    }
  }, [selectedSession?.id, currentUser]); // currentUser is needed to sync saved states from polling

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, hasJoined]);

  const handleJoin = () => {
    if (nickname.trim() && selectedSession) {
        // Set local state immediately for better UX
        setHasJoined(true);
        if (currentUser.role === 'STUDENT') {
            onSaveNickname(selectedSession.id, nickname);
        }
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedSession) return;
    if (!selectedSession.isActive) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: selectedSession.id,
      userId: currentUser.id,
      userName: nickname || '匿名同學',
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAnonymous: currentUser.role === 'STUDENT',
    };

    authService.addChatMessage(newMessage);
    setInputText('');
  };

  const handleCreateRoom = () => {
    if (!newTopic.trim()) {
        alert('請輸入聊天室主題');
        return;
    }
    onCreateSession(newTopic);
    setNewTopic('');
  };

  // --- View 1: Teacher Setup ---
  if (!selectedSession) {
      if (currentUser.role === 'TEACHER') {
        return (
            <div className="flex flex-col h-[600px] bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden items-center justify-center p-12 text-center animate-fade-in">
                <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mb-8 text-violet-500">
                    <MessageSquare className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-extrabold text-stone-800 mb-4">建立新的匿名聊天室</h2>
                <p className="text-stone-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                    輸入主題後，系統將會在左側列表建立一個新的聊天檔案。
                </p>
                
                <div className="w-full max-sm space-y-6">
                    <div className="text-left">
                        <label className="text-xs font-bold text-stone-500 ml-2 mb-2 block uppercase tracking-wider">聊天室主題</label>
                        <input 
                            type="text" 
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="例如: 針對本次班會的看法..."
                            className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-50 focus:outline-none transition-all font-bold text-stone-700"
                        />
                    </div>
                    <button 
                        onClick={handleCreateRoom}
                        disabled={!newTopic.trim()}
                        className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                    >
                        <Plus className="w-5 h-5" /> 建立並開啟
                    </button>
                </div>
            </div>
        );
      } else {
         return (
            <div className="flex flex-col h-[500px] bg-white/50 rounded-[2.5rem] border-2 border-dashed border-stone-200 items-center justify-center text-stone-400">
                <MessageSquare className="w-14 h-14 mb-4 text-stone-300" />
                <p className="font-medium">請從左側選單選擇一個聊天室加入</p>
            </div>
         );
      }
  }

  // --- View 2: Student Pre-Join ---
  if (currentUser.role === 'STUDENT' && !hasJoined && selectedSession.isActive) {
    return (
        <div className="flex flex-col h-[600px] bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden items-center justify-center p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-8 text-teal-600">
                <VenetianMask className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-extrabold text-stone-800 mb-2">進入匿名聊天室</h2>
            <p className="text-stone-500 mb-10 max-w-xs mx-auto font-medium">
                目前主題：<span className="font-bold text-stone-800">{selectedSession.topic}</span>
            </p>
            
            <div className="w-full max-w-xs space-y-6">
                <div className="text-left">
                    <label className="text-xs font-bold text-stone-500 ml-2 mb-2 block uppercase tracking-wider">設定你的暱稱</label>
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="例如: 神秘的獅子"
                        className="w-full px-6 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:bg-white focus:border-teal-300 focus:ring-4 focus:ring-teal-50 focus:outline-none transition-all font-bold text-stone-700"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                </div>
                <button 
                    onClick={handleJoin}
                    disabled={!nickname.trim()}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                >
                    進入聊天 <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  }

  const isReadOnly = !selectedSession.isActive;

  // --- View 4: Chat Interface ---
  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden animate-fade-in relative">
      
      {/* Header */}
      <div className={`p-6 flex items-center justify-between z-10 ${isReadOnly ? 'bg-stone-100 border-b border-stone-200' : 'bg-white border-b border-stone-100'}`}>
        <div>
            <div className={`flex items-center gap-3 font-extrabold text-xl ${isReadOnly ? 'text-stone-500' : 'text-stone-800'}`}>
                <MessageSquare className={`w-6 h-6 ${isReadOnly ? 'text-stone-400' : 'text-violet-500'}`} />
                {selectedSession.topic}
            </div>
            <div className={`text-xs mt-2 flex items-center gap-1.5 font-bold ${isReadOnly ? 'text-stone-400' : 'text-teal-500'}`}>
                {isReadOnly ? (
                    <span className="flex items-center gap-1 bg-stone-200 text-stone-500 px-2 py-0.5 rounded-lg">
                        <Lock className="w-3 h-3" />
                        已關閉 (唯讀模式)
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 bg-teal-50 px-2 py-0.5 rounded-lg">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                        聊天室進行中
                    </span>
                )}
            </div>
        </div>
        
        {currentUser.role === 'TEACHER' && isReadOnly && (
             <button 
                onClick={() => onCreateSession("")} 
                className="text-xs bg-white border border-stone-200 text-stone-500 hover:text-violet-600 hover:border-violet-200 px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
             >
                建立新聊天
             </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfaf8]">
        {messages.length === 0 && (
            <div className="text-center py-20 text-stone-300 text-sm font-medium">
                {isReadOnly ? '本次聊天室沒有發言紀錄' : '目前沒有訊息，當第一位發言者吧！'}
            </div>
        )}
        {messages.map((msg) => {
        const isMe = msg.userId === currentUser.id;
        return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-6 py-4 text-sm shadow-sm font-medium leading-relaxed ${
                    isMe 
                    ? 'bg-violet-500 text-white rounded-[1.5rem] rounded-tr-sm' 
                    : 'bg-white text-stone-600 border border-stone-100 rounded-[1.5rem] rounded-tl-sm'
                }`}>
                    <div className={`text-[10px] mb-1 font-bold tracking-wide opacity-80 ${isMe ? 'text-violet-100 text-right' : 'text-stone-400'}`}>
                    {msg.userName} • {msg.timestamp}
                    </div>
                    <p>{msg.content}</p>
                </div>
            </div>
        );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isReadOnly ? (
          <div className="p-8 bg-stone-50 border-t border-stone-200 text-center text-stone-400 text-sm font-bold flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              此聊天室已關閉，無法再傳送訊息
          </div>
      ) : (
        <div className="p-5 bg-white border-t border-stone-100 flex gap-3">
            <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`以 ${nickname} 的身份發言...`}
            className="flex-1 px-6 py-4 bg-stone-50 border-2 border-transparent rounded-full focus:bg-white focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-50 transition-all text-stone-700 font-medium placeholder-stone-400"
            />
            <button
            onClick={handleSend}
            className="bg-violet-500 hover:bg-violet-600 text-white p-4 rounded-full transition-all shadow-lg shadow-violet-200 hover:scale-105 active:scale-95"
            >
            <Send className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
