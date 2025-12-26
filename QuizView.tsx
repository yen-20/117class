
import React, { useState, useEffect } from 'react';
import { QuizResult, StudentData, UserRole, PsychoQuestion, PsychoCategory } from '../types';
import { PSYCHO_QUESTIONS, STANDARD_OPTIONS } from '../constants';
import { Brain, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface QuizViewProps {
  student: StudentData;
  viewerRole: UserRole;
  onUpdate?: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ student, viewerRole, onUpdate }) => {
  const [questions, setQuestions] = useState<PsychoQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showIntro, setShowIntro] = useState(!student.quizResult);

  useEffect(() => {
    // Only shuffle if it's the first time or we're starting fresh
    if (questions.length === 0) {
      const shuffled = [...PSYCHO_QUESTIONS];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQuestions(shuffled);
    }
  }, [student.id, showIntro, questions.length]);

  const calculateResult = (finalAnswers: Record<string, number>): QuizResult => {
    const scores: Record<PsychoCategory, number> = {
        '政治': 0,
        '性別': 0,
        '開放性': 0
    };
    
    PSYCHO_QUESTIONS.forEach(q => {
        const userScore = finalAnswers[q.id];
        if (userScore !== undefined) {
            const adjustedScore = userScore * (q.isReverse ? -1 : 1);
            scores[q.category] += adjustedScore;
        }
    });
    
    return {
        categoryScores: scores,
        completedAt: new Date().toISOString().split('T')[0]
    };
  };

  if (viewerRole === UserRole.TEACHER) {
    if (!student.quizResult) {
      return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-stone-200">
          <Brain className="w-16 h-16 text-stone-200 mb-4" />
          <p className="text-stone-400 font-bold">該學生尚未進行心理測驗</p>
        </div>
      );
    }
    return <ResultAnalysis result={student.quizResult} studentName={student.name} />;
  }

  if (student.quizResult && !showIntro) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <ResultAnalysis result={student.quizResult} studentName="你" />
        <div className="flex justify-center">
            <div className="text-stone-400 text-sm font-bold bg-white/50 px-6 py-3 rounded-full border border-stone-100 italic">
                您已完成本學期價值觀測驗，測驗結果已存檔。
            </div>
        </div>
      </div>
    );
  }

  if (showIntro && Object.keys(answers).length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-stone-100 text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mx-auto text-violet-500">
            <Brain className="w-12 h-12" />
        </div>
        <div>
            <h2 className="text-3xl font-extrabold text-stone-800 mb-4">價值觀分佈測驗</h2>
            <p className="text-stone-500 max-w-lg mx-auto leading-relaxed font-medium">
                本測驗將衡量你在社會發展、平等正義及新倫理規範方面的深層價值觀。請根據你的直覺進行填答。<br/>
                <span className="text-rose-500 font-bold">注意：每位學生限測驗一次，但在提交前可自由修改答案。</span>
            </p>
            <div className="mt-6 flex justify-center gap-6 text-xs text-stone-400 font-bold uppercase tracking-wider">
               <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4"/> 隨機排序</span>
               <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4"/> 共 {PSYCHO_QUESTIONS.length} 題</span>
            </div>
        </div>
        <button 
            onClick={() => setShowIntro(false)}
            className="bg-violet-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-violet-200 hover:bg-violet-600 transition-all hover:scale-105 active:scale-95"
        >
            開始測驗
        </button>
      </div>
    );
  }

  const handleOptionSelect = (score: number) => {
    const currentQ = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const result = calculateResult(newAnswers);
      authService.submitQuizResult(student.id, result);
      setShowIntro(false);
      if (onUpdate) onUpdate();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (questions.length === 0) return <div className="text-center py-20 text-stone-400 font-bold">載入中...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-center text-sm font-bold text-stone-400 uppercase tracking-wide">
        <div className="flex items-center gap-4">
            {currentQuestionIndex > 0 && (
                <button 
                    onClick={handlePrev}
                    className="flex items-center gap-1 text-violet-400 hover:text-violet-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> 上一步
                </button>
            )}
            <span>題目 {currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <span className="px-3 py-1 bg-white border border-stone-200 rounded-full text-stone-400 text-xs italic">匿名議題</span>
      </div>
      
      <div className="w-full bg-stone-200 rounded-full h-3 mb-16 overflow-hidden">
        <div 
            className="bg-violet-400 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-sm border border-stone-100 flex flex-col items-center">
        <h3 className="text-2xl md:text-3xl font-extrabold text-stone-800 mb-20 leading-relaxed text-center max-w-2xl">
            {currentQuestion.question}
        </h3>

        <div className="w-full max-w-3xl">
            <div className="relative flex items-center justify-between mb-8">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -translate-y-1/2 -z-10"></div>
                
                {STANDARD_OPTIONS.map((option, idx) => {
                    const isSelected = currentAnswer === option.score;
                    return (
                        <div key={idx} className="flex flex-col items-center group">
                            <button
                                onClick={() => handleOptionSelect(option.score)}
                                style={{ width: option.size, height: option.size }}
                                className={`rounded-full border-2 bg-white transition-all flex items-center justify-center hover:border-violet-400 hover:shadow-lg hover:scale-110 active:scale-95 group-hover:bg-violet-50 ${isSelected ? 'border-violet-500 ring-4 ring-violet-100 shadow-md' : 'border-stone-200'}`}
                            >
                                <div className={`rounded-full transition-colors
                                    ${idx === 0 || idx === 5 ? 'w-3 h-3' : idx === 1 || idx === 4 ? 'w-2.5 h-2.5' : 'w-2 h-2'}
                                    ${isSelected ? 'bg-violet-500' : 'bg-stone-400 group-hover:bg-violet-500'}
                                `}></div>
                            </button>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex justify-between text-[13px] font-bold text-stone-400 px-1">
                <span className="w-20 text-center -ml-6">強烈反對</span>
                <span className="w-20 text-center invisible">反對</span>
                <span className="w-20 text-center">略微反對</span>
                <span className="w-20 text-center">基本同意</span>
                <span className="w-20 text-center invisible">同意</span>
                <span className="w-20 text-center -mr-6">非常同意</span>
            </div>
        </div>
      </div>
    </div>
  );
};

const ResultAnalysis = ({ result, studentName }: { result: QuizResult, studentName: string }) => {
    
    const getDetailedInfo = (category: PsychoCategory, score: number) => {
        let sideLabel = '';
        let level = 1;
        const absScore = Math.abs(score);

        if (absScore <= 20) level = 1;
        else if (absScore <= 45) level = 2;
        else level = 3;

        if (score >= 0) {
            if (category === '政治') sideLabel = '左派';
            else if (category === '性別') sideLabel = '女性主義者';
            else if (category === '開放性') sideLabel = '開放型';
            return { label: `${sideLabel} ${level}`, isLeft: true, displayScore: -absScore };
        } else {
            if (category === '政治') sideLabel = '右派';
            else if (category === '性別') sideLabel = '平等主義者';
            else if (category === '開放性') sideLabel = '傳統型';
            return { label: `${sideLabel} ${level}`, isLeft: false, displayScore: absScore };
        }
    };

    const categories: PsychoCategory[] = ['政治', '性別', '開放性'];
    const data = categories.map(cat => {
        const score = result.categoryScores[cat];
        const info = getDetailedInfo(cat, score);
        return {
            name: cat,
            score: score,
            displayScore: info.displayScore,
            label: info.label,
            isLeft: info.isLeft
        };
    });

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.map(item => (
                    <div key={item.name} className={`relative p-8 rounded-[2.5rem] shadow-sm border-2 transition-all ${item.isLeft ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'}`}>
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.isLeft ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'}`}>
                            {item.name}領域
                        </div>
                        <div className="text-center py-4">
                            <div className={`text-3xl font-black ${item.isLeft ? 'text-rose-600' : 'text-blue-700'}`}>
                                {item.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-stone-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold text-stone-800 mb-2">{studentName} 的價值觀座標</h2>
                        <p className="text-stone-400 text-sm font-medium">紅色向左為進步/左派傾向；藍色向右為傳統/右派傾向</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
                            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                            左派/女性主義/開放
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            右派/平等主義/傳統
                        </div>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f4" />
                            <XAxis type="number" domain={[-80, 80]} hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={80} 
                                tick={{fontWeight: 'bold', fill: '#57534e', fontSize: 14}} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-white p-5 rounded-2xl shadow-2xl border border-stone-50 animate-fade-in">
                                                <div className="text-stone-400 text-[10px] font-black mb-1 uppercase tracking-widest">{d.name}面向</div>
                                                <div className={`text-xl font-black ${d.isLeft ? 'text-rose-500' : 'text-blue-600'}`}>
                                                    {d.label}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <ReferenceLine x={0} stroke="#d6d3d1" strokeWidth={2} />
                            <Bar dataKey="displayScore" barSize={36} radius={[10, 10, 10, 10]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isLeft ? '#f43f5e' : '#2563eb'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 flex justify-between text-[10px] font-black text-stone-300 uppercase tracking-widest px-10">
                    <span>左派傾向 (紅)</span>
                    <span>右派傾向 (藍)</span>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-stone-100 space-y-12">
                <h2 className="text-2xl font-black text-stone-800 border-b border-stone-100 pb-6 text-center">每個區域是如何測量的？</h2>
                
                <section className="space-y-6">
                    <h3 className="text-lg font-extrabold text-stone-700 flex items-center gap-3">
                        <div className="w-2 h-6 bg-stone-200 rounded-full"></div>
                        政治領域
                    </h3>
                    <div className="text-stone-500 leading-relaxed space-y-4 font-medium">
                        <p>政治維度衡量人們對政府角色的態度。</p>
                        <ul className="space-y-4 pl-4">
                            <li className="flex gap-4">
                                <ChevronRight className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
                                <span>支持政府的立場 —— 即政府應透過財富再分配積極縮小貧富差距，並透過福利保障社會安全 —— 被歸類為<strong className="text-rose-500 font-bold">「左派」</strong>，用<strong className="text-rose-500 font-bold">紅線</strong>表示。</span>
                            </li>
                            <li className="flex gap-4">
                                <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span>支持個人的立場 —— 即政府應最大限度地發揮個人努力和自由，並透過自由市場競爭追求經濟成長 —— 被歸類為<strong className="text-blue-600 font-bold">「右派」</strong>，用<strong className="text-blue-600 font-bold">藍線</strong>表示。</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-6">
                    <h3 className="text-lg font-extrabold text-stone-700 flex items-center gap-3">
                        <div className="w-2 h-6 bg-stone-200 rounded-full"></div>
                        性別領域
                    </h3>
                    <div className="text-stone-500 leading-relaxed space-y-4 font-medium">
                        <p>性別維度衡量的是對女性主義的整體態度。</p>
                        <ul className="space-y-4 pl-4">
                            <li className="flex gap-4">
                                <ChevronRight className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
                                <span>由於男性既得利益在現代社會依然存在，你越認同必須改善對女性的歧視這一前提，你就越會被歸類為<strong className="text-rose-500 font-bold">「女性主義者」</strong>（紅色）。</span>
                            </li>
                            <li className="flex gap-4">
                                <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span>相反，你越認為對女性的單方面歧視已基本消除，兩性所面臨的具體不平等必須得到同等解決，並且只提倡歧視女性是「反向歧視」，你就越會被歸類為<strong className="text-blue-600 font-bold">「平等主義者」</strong>（藍色）。</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-6">
                    <h3 className="text-lg font-extrabold text-stone-700 flex items-center gap-3">
                        <div className="w-2 h-6 bg-stone-200 rounded-full"></div>
                        開放區域
                    </h3>
                    <div className="text-stone-500 leading-relaxed space-y-4 font-medium">
                        <p>開放性向度衡量一個人對社會少數群體 and 新倫理規範的態度。</p>
                        <ul className="space-y-4 pl-4">
                            <li className="flex gap-4">
                                <ChevronRight className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
                                <span>支持有利於社會少數群體的政策並願意接受取代現有倫理規範的新倫理規範的人被歸類為<strong className="text-rose-500 font-bold">「開放型」</strong>，以<strong className="text-rose-500 font-bold">紅線</strong>表示。</span>
                            </li>
                            <li className="flex gap-4">
                                <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                                <span>偏好多數群體觀點而非少數群體觀點，以及偏好現有倫理規範而非新倫理規範的人則被歸類為<strong className="text-blue-600 font-bold">「傳統型」</strong>，以<strong className="text-blue-600 font-bold">藍線</strong>表示。</span>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default QuizView;
