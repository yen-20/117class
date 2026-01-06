
import { StudentData, UserRole, User, PsychoQuestion, PsychoOption, ClassSettings } from './types';

export const INITIAL_TEACHER: User = {
  id: 't1', 
  name: '羅峻賢', 
  role: UserRole.TEACHER,
  username: 'chlo123',
  password: 'chlo123'
};

export const INITIAL_SETTINGS: ClassSettings = {
  systemVersion: '1.0'
};

export const STANDARD_OPTIONS: PsychoOption[] = [
  { label: '強烈反對', score: -5, size: 48 },
  { label: '反對', score: -3, size: 40 },
  { label: '略為反對', score: -1, size: 34 },
  { label: '基本同意', score: 1, size: 34 },
  { label: '同意', score: 3, size: 40 },
  { label: '非常同意', score: 5, size: 48 }
];

export const PSYCHO_QUESTIONS: PsychoQuestion[] = [
  // --- 政治：左派 (isReverse: false -> Agree = Positive/Left/Red) ---
  { id: 'p_l1', category: '政治', isReverse: false, question: '對進口商品徵收關稅是保護國內就業的好方法' },
  { id: 'p_l2', category: '政治', isReverse: false, question: '政府必須比現在更努力地重新分配財富' },
  { id: 'p_l3', category: '政治', isReverse: false, question: '道路、電力等公共設施必須由政府營運' },
  { id: 'p_l4', category: '政治', isReverse: false, question: '政府應該對高階主管的薪酬設定上限' },
  { id: 'p_l5', category: '政治', isReverse: false, question: '勞動所得利潤比股票所得利潤更合理' },
  { id: 'p_l6', category: '政治', isReverse: false, question: '應該對以投資而非居住為目的的房地產購買進行監管' },
  { id: 'p_l7', category: '政治', isReverse: false, question: '無論病情輕重，經濟條件好的人不應該更容易獲得更好的醫療保健服務' },
  { id: 'p_l8', category: '政治', isReverse: false, question: '只要有工作，無論工作表現如何，都應該有最低收入保障' },

  // --- 政治：右派 (isReverse: true -> Agree = Negative/Right/Blue) ---
  { id: 'p_r1', category: '政治', isReverse: true, question: '與其政府制定政策，不如交給自由市場' },
  { id: 'p_r2', category: '政治', isReverse: true, question: '我不想生活在一個人人收入都一樣的國家' },
  { id: 'p_r3', category: '政治', isReverse: true, question: '我不應該為那些與我無關的公共工程項目繳納稅款' },
  { id: 'p_r4', category: '政治', isReverse: true, question: '競爭通常會讓世界變得更美好' },
  { id: 'p_r5', category: '政治', isReverse: true, question: '多數決通常會做出錯誤的決定' },
  { id: 'p_r6', category: '政治', isReverse: true, question: '貧窮的責任主要在於自己' },
  { id: 'p_r7', category: '政治', isReverse: true, question: '透過繼承獲得財富是合法的' },
  { id: 'p_r8', category: '政治', isReverse: true, question: '優先考慮經濟成長的政策比優先考慮福利的政策更有助於擺脫貧困' },

  // --- 性別：女權 (isReverse: false -> Agree = Positive/Feminist/Red) ---
  { id: 'g_f1', category: '性別', isReverse: false, question: '如果女性主導世界歷史，暴力和戰爭將會少得多' },
  { id: 'g_f2', category: '性別', isReverse: false, question: '政府必須為女性分配一定比例的公職' },
  { id: 'g_f3', category: '性別', isReverse: false, question: '在「女演員」、「女詩人」、「女記者」等職業名稱前加上性別標籤，是貶低女性的一種方式' },
  { id: 'g_f4', category: '性別', isReverse: false, question: '政府應該對女性在男性主導的高收入職業(例如企業主管)中實施配額制度' },
  { id: 'g_f5', category: '性別', isReverse: false, question: '以身穿內衣或泳裝的女性模特為主角的性感寫真，是女性權利成就的倒退' },
  { id: 'g_f6', category: '性別', isReverse: false, question: '企業在晉升考核時，應主動扣除女性因懷育、產假而損失的工時權重，以確保她們不會因為生理功能而在職業生涯中落後。' },
  { id: 'g_f7', category: '性別', isReverse: false, question: '影視作品若存在過度的『男性救世主』情節或將女性描繪為脆弱客體，即便不違法，也應受到社會輿論與補助政策的抵制。' },
  { id: 'g_f8', category: '性別', isReverse: false, question: '在家庭中，女性通常承擔更多的『情緒勞動』（如照顧親戚關係、安排家務細節），這類勞動在離婚財產分配時應獲得高額的經濟補償。' },

  // --- 性別：平權 (isReverse: true -> Agree = Negative/Equality/Blue) ---
  { id: 'g_e1', category: '性別', isReverse: true, question: '在當今台灣社會，女性在許多方面比男性生活得更舒適' },
  { id: 'g_e2', category: '性別', isReverse: true, question: '性別薪資差距是個謬論，女性從事相同工作早已獲得同等報酬' },
  { id: 'g_e3', category: '性別', isReverse: true, question: '因為男女之間的差異是顯而易見的，所以讓他們扮演不同的社會角色並互補是理想的' },
  { id: 'g_e4', category: '性別', isReverse: true, question: '在資本主義市場中，男性的能力通常比女性的能力更有價值' },
  { id: 'g_e5', category: '性別', isReverse: true, question: '如果男性的平均薪資高於女性，那是因為男性的公作表現較好' },
  { id: 'g_e6', category: '性別', isReverse: true, question: '如果女性要求與男性平等的社會地位，那她們也應該像男性一樣承擔義務役的國防職責。' },
  { id: 'g_e7', category: '性別', isReverse: true, question: '目前的社會氛圍過度保護女性，反而導致男性在錄取或社會輿論中，成為了新的弱勢群體。' },
  { id: 'g_e8', category: '性別', isReverse: true, question: '如果女性可以請生理假，那男性也應該擁有等額的『心理健康假』或『體能恢復假』，以維持職場競爭起跑點的公平。' },

  // --- 開放性：傳統 (isReverse: true -> Agree = Negative/Traditional/Blue) ---
  { id: 'o_t1', category: '開放性', isReverse: true, question: '對於正直無私的人來說，政府的監視其實可以起到保護作用' },
  { id: 'o_t2', category: '開放性', isReverse: true, question: '來到台灣的移民，應想盡辦法融入台灣文化' },
  { id: 'o_t3', category: '開放性', isReverse: true, question: '在我們的社會裡，死刑是必要的' },
  { id: 'o_t4', category: '開放性', isReverse: true, question: '我無法認同殘疾人在交通高峰期抗議並造成阻礙的行為' },
  { id: 'o_t5', category: '開放性', isReverse: true, question: '必須盡可能減少進入我國的移民人數' },
  { id: 'o_t6', category: '開放性', isReverse: true, question: '為了團隊合作，我們都必須一起參加公司聚餐，即使我們不想去' },
  { id: 'o_t7', category: '開放性', isReverse: true, question: '美國對黑人的歧視並非毫無道理' },
  { id: 'o_t8', category: '開放性', isReverse: true, question: '即使是反抗獨裁統治，也絕對不能容忍暴力' },

  // --- 開放性：開放 (isReverse: false -> Agree = Positive/Open/Red) ---
  { id: 'o_o1', category: '開放性', isReverse: false, question: '同性伴侶應該享有和異性伴侶相同的權利，包括結婚和收養的權利' },
  { id: 'o_o2', category: '開放性', isReverse: false, question: '所有餐廳都應該盡可能提供至少一份素食菜單' },
  { id: 'o_o3', category: '開放性', isReverse: false, question: '在穆斯林人口眾多的地區，地方政府需要根據伊斯蘭教法支持清真食品認證系統' },
  { id: 'o_o4', category: '開放性', isReverse: false, question: '在廣播節目中加入手語翻譯是保護聾人權利的自然措施，應該在所有廣播節目中以更大的圖顯示' },
  { id: 'o_o5', category: '開放性', isReverse: false, question: '為了促進社會平等，在重新詮釋經典文化作品時，應優先考慮加入少數族裔元素，即便這會改變作品原本的樣貌。' },
  { id: 'o_o6', category: '開放性', isReverse: false, question: '為了讓下一代擁有更好的健康或智力，父母應該有權透過基因編輯技術來挑選胎兒的特徵。' },
  { id: 'o_o7', category: '開放性', isReverse: false, question: '性交易與大麻等軟性毒品應該全面合法化並由政府納稅管理，而非一味禁止。' },
  { id: 'o_o8', category: '開放性', isReverse: false, question: '即便在公共場合裸露身體（如母乳哺育或特定的藝術表達），也是個人自由的一部分，政府不應以『妨害風化』為由干預。' }
];

export const INITIAL_STUDENTS: StudentData[] = [];
export const MOCK_CHATS = [];
