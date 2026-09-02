import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Calculator,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Thermometer,
  Moon,
  Clock,
  HelpCircle,
  Milk,
  Luggage,
  AlertTriangle,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { initialFoodAllergenList, type FoodAllergenItem } from '../data/foodAllergenData';
import { audioSynthesizer } from '../utils/audioSynthesizer';
import type { BabyProfile } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface ToolboxProps {
  baby: BabyProfile;
}

type ToolTab = 'all' | 'feed' | 'sleep' | 'health' | 'stool' | 'allergen' | 'outing';

interface OutingItem {
  id: string;
  category: string;
  name: string;
  description: string;
  checked: boolean;
}

const defaultOutingItems: OutingItem[] = [
  { id: 'o-1', category: '衛生清潔', name: '尿布 4-5 片', description: '依外出時長每 2-3 小時更換 1 片預備', checked: true },
  { id: 'o-2', category: '衛生清潔', name: '純水濕紙巾 (外出隨身包)', description: '溫和無酒精成分，擦拭手口屁屁', checked: true },
  { id: 'o-3', category: '衛生清潔', name: '拋棄式換尿布墊 / 防水墊', description: '公用哺乳室隔絕接觸衛生防護', checked: false },
  { id: 'o-4', category: '衛生清潔', name: '小塑膠袋 / 尿布除臭袋', description: '包裹髒尿布與換洗衣物', checked: false },
  { id: 'o-5', category: '哺育飲食', name: '保溫瓶 (70°C 熱水)', description: 'WHO 標準沖泡配方奶殺菌水溫', checked: true },
  { id: 'o-6', category: '哺育飲食', name: '冷開水隨身瓶', description: '隔水降溫或適度降溫使用', checked: false },
  { id: 'o-7', category: '哺育飲食', name: '奶粉分裝盒 / 拋棄式奶粉袋', description: '按餐數預先定量分裝', checked: true },
  { id: 'o-8', category: '哺育飲食', name: '已消毒奶瓶 (2 支)', description: '附密封瓶蓋與矽膠奶嘴', checked: true },
  { id: 'o-9', category: '哺育飲食', name: '拋棄式圍兜 / 紗布巾 3 條', description: '拍嗝溢奶與擦口水必備', checked: true },
  { id: 'o-10', category: '更換衣物', name: '換洗衣物 1-2 套 (包屁衣+褲子)', description: '預防炸屎或嚴重溢奶髒污', checked: true },
  { id: 'o-11', category: '更換衣物', name: '薄包巾 / 小薄毯', description: '冷氣房防風保暖或遮光使用', checked: false },
  { id: 'o-12', category: '重要證件與安撫', name: '兒童健康手冊 + 健保卡', description: '臨時就診或疫苗接種必備', checked: true },
  { id: 'o-13', category: '重要證件與安撫', name: '安撫奶嘴 (附防掉鍊與收納盒)', description: '哭鬧安撫或入睡神器', checked: true },
];

export const Toolbox: React.FC<ToolboxProps> = ({ baby }) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('all');
  const [allergens, setAllergens] = useState<FoodAllergenItem[]>(initialFoodAllergenList);
  const [isWhiteNoisePlaying, setIsWhiteNoisePlaying] = useState(false);

  // Milk volume calculator states
  const [babyWeightInput, setBabyWeightInput] = useState<number>(baby.birthWeight || 4.5);
  const [dailyFeedsInput, setDailyFeedsInput] = useState<number>(6);

  // Fever assessment states
  const [feverTempInput, setFeverTempInput] = useState<number>(37.8);
  const [feverAgeMonths, setFeverAgeMonths] = useState<number>(() => {
    const age = calculateAge(baby.birthDate);
    return age.months;
  });

  // Wake window age selector
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('0-2M');

  // Stool color guide state
  const [selectedStoolNumber, setSelectedStoolNumber] = useState<number | null>(7);

  // Diaper bag checklist
  const [outingChecklist, setOutingChecklist] = useState<OutingItem[]>(() => {
    try {
      const saved = localStorage.getItem('baby_outing_checklist');
      return saved ? JSON.parse(saved) : defaultOutingItems;
    } catch {
      return defaultOutingItems;
    }
  });

  // Save outing checklist to local storage
  useEffect(() => {
    localStorage.setItem('baby_outing_checklist', JSON.stringify(outingChecklist));
  }, [outingChecklist]);

  const totalDailyMilk = Math.round(babyWeightInput * 150); // 150ml per kg
  const perFeedMilk = Math.round(totalDailyMilk / (dailyFeedsInput || 1));

  const toggleNoise = () => {
    const nextState = !isWhiteNoisePlaying;
    audioSynthesizer.toggleWhiteNoise(nextState);
    setIsWhiteNoisePlaying(nextState);
  };

  const toggleAllergenTested = (index: number) => {
    setAllergens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, tested: !item.tested } : item))
    );
  };

  const toggleOutingItem = (id: string) => {
    setOutingChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const resetOutingChecklist = () => {
    setOutingChecklist(defaultOutingItems.map((i) => ({ ...i, checked: false })));
  };

  // Fever diagnosis evaluation
  const getFeverEvaluation = () => {
    const isUnder3Months = feverAgeMonths < 3;
    const isFever = feverTempInput >= 38.0;
    const isHighFever = feverTempInput >= 39.0;
    const isMildWarm = feverTempInput >= 37.5 && feverTempInput < 38.0;

    if (isUnder3Months && feverTempInput >= 38.0) {
      return {
        level: 'emergency',
        badge: '🚨 未滿 3 個月急症發燒',
        color: 'bg-rose-50 border-rose-400 text-rose-950',
        message: '未滿 3 個月新生兒發燒 ≥ 38.0°C 屬於兒科急症！新生兒免疫系統尚未健全，需立即前往大醫院急診或小兒科進行抽血、驗尿或血液檢查，請勿自行服用成藥退燒。',
      };
    }
    if (isHighFever) {
      return {
        level: 'high',
        badge: '⚠️ 高燒注意 (≥ 39.0°C)',
        color: 'bg-rose-50 border-rose-300 text-rose-900',
        message: '體溫偏高，請密切觀察寶寶的精神活動力與呼吸狀況。可依醫師醫囑給予退燒藥物，補充足夠水分或電解質水，若伴隨呼吸急促、抽搐或活動力低下請立即送醫。',
      };
    }
    if (isFever) {
      return {
        level: 'fever',
        badge: '🌡️ 發燒 (38.0°C - 38.9°C)',
        color: 'bg-amber-50 border-amber-300 text-amber-950',
        message: '發燒是免疫系統對抗病原的正常生理防禦反應。重點在於觀察精神、食慾與大小便。發抖或手腳冰冷時注意保暖；體溫升高發熱冒汗時則應適度減少衣物並保持空氣流通。',
      };
    }
    if (isMildWarm) {
      return {
        level: 'mild',
        badge: '☀️ 微熱 (37.5°C - 37.9°C)',
        color: 'bg-amber-50/60 border-amber-200 text-amber-900',
        message: '體溫略高，可能由於衣物包覆過厚、剛喝完熱奶、大哭用力或室內溫度偏高。可先解開一件外衣，休息 20-30 分鐘後再次測量耳溫或肛溫。',
      };
    }
    return {
      level: 'normal',
      badge: '✅ 體溫正常 (36.5°C - 37.4°C)',
      color: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      message: '體溫處於嬰幼兒正常生理範圍，活力與食慾良好時持續維持規律作息即可。',
    };
  };

  const feverEval = getFeverEvaluation();

  // Wake windows data
  const wakeWindowData: Record<
    string,
    { title: string; window: string; naps: string; totalSleep: string; tips: string }
  > = {
    '0-2M': {
      title: '0 - 2 個月 (新生兒期)',
      window: '45 - 60 分鐘',
      naps: '4 - 5 次小睡',
      totalSleep: '16 - 18 小時',
      tips: '新生兒耐受清醒時間極短，喝完奶、換尿布後約 1 小時就需準備安撫入睡，過度疲勞易造成傍晚哭鬧不休 (黃昏哭/腸絞痛)。',
    },
    '3-4M': {
      title: '3 - 4 個月 (睡眠退化期)',
      window: '75 - 90 分鐘 (約 1.5 小時)',
      naps: '3 - 4 次小睡',
      totalSleep: '14 - 16 小時',
      tips: '嬰兒開始建立晝夜生理節律，白天小睡約 3-4 次，可開始建立固定的就寢儀式（洗澡-按摩-暗燈-白噪音）。',
    },
    '5-6M': {
      title: '5 - 6 個月 (副食品初探期)',
      window: '2 - 2.5 小時',
      naps: '3 次小睡',
      totalSleep: '13 - 15 小時',
      tips: '白天小睡逐漸規律化為早、中、傍晚小睡，傍晚小睡不宜超過下午 5:00 以免影響夜間長睡眠入睡。',
    },
    '7-9M': {
      title: '7 - 9 個月 (兩次小睡轉換期)',
      window: '2.5 - 3.5 小時',
      naps: '2 次小睡 (上午 + 下午)',
      totalSleep: '12 - 14 小時',
      tips: '大動作發育期（翻身、爬行、坐立），夜醒可能增多。維持一致的睡前儀式並給予充足的白天趴玩放電。',
    },
    '10-12M': {
      title: '10 - 12 個月 (滿週歲前夕)',
      window: '3 - 4 小時',
      naps: '2 次小睡 (上午 1-1.5h, 下午 1-1.5h)',
      totalSleep: '12 - 14 小時',
      tips: '清醒時間拉長，夜間可維持 10-11 小時長睡眠，白天副食品熱量增加有助於穩定夜間不再討奶。',
    },
    '1-2Y': {
      title: '1 - 2 歲 (幼兒階段)',
      window: '4 - 5.5 小時',
      naps: '1 次小睡 (通常在午餐後)',
      totalSleep: '11 - 13 小時',
      tips: '大多數幼兒在 15-18 個月時會自然過渡為每天只需 1 次午間小睡 (約 1.5-2.5 小時)。',
    },
  };

  // Stool 9-color card details
  const stoolColorGuide: Record<
    number,
    { name: string; hex: string; isNormal: boolean; description: string }
  > = {
    1: { name: '1號 灰白色', hex: '#E2E2DF', isNormal: false, description: '⚠️ 不正常！膽道閉鎖警訊色。膽汁完全未排入腸道，需立即帶大便檢體就診小兒腸胃專科！' },
    2: { name: '2號 灰白色', hex: '#DCD4C6', isNormal: false, description: '⚠️ 不正常！膽汁滯留或膽道閉鎖可能，新生兒黃金篩檢期為出生 60 天內需及早葛西手術。' },
    3: { name: '3號 淡黃白色', hex: '#EAE1BC', isNormal: false, description: '⚠️ 不正常！嚴重肝膽疾病徵兆，請立即拍照留存並攜帶尿布至小兒科門診。' },
    4: { name: '4號 陶土色', hex: '#D1BEA8', isNormal: false, description: '⚠️ 不正常！陶土色便代表膽紅素代謝排泄異常，不可延誤！' },
    5: { name: '5號 淡黃色', hex: '#ECD78A', isNormal: false, description: '⚠️ 不正常！顏色過淡，與正常金黃色有明顯落差，建議尋求兒科醫師專業評估。' },
    6: { name: '6號 淡黃褐色', hex: '#D4B876', isNormal: false, description: '⚠️ 不正常！偏淡之黃褐色，若持續出現需高度警覺。' },
    7: { name: '7號 金黃色', hex: '#E9AF27', isNormal: true, description: '✅ 正常健康色！純母乳寶寶典型的金黃色軟糊狀大便，帶有淡淡酸奶味與顆粒。' },
    8: { name: '8號 黃綠色', hex: '#B89F2A', isNormal: true, description: '✅ 正常健康色！配方奶或混哺寶寶常見顏色，膽汁經腸道氧化後呈現黃綠色。' },
    9: { name: '9號 墨綠/深綠色', hex: '#5A6335', isNormal: true, description: '✅ 正常健康色！配方奶中含豐富鐵質，未被腸道完全吸收之鐵質與空氣氧化呈現深綠色，無須擔憂。' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBE7DF] text-[#2A2723] text-[11px] font-mono font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>BB-NOTE SCIENCE TOOLKIT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
              新手爸媽育兒科學百寶箱
            </h2>
            <p className="text-xs text-[#6B6457] mt-1 font-sans">
              整合兒科每日標準奶量計算、發燒就醫評估、清醒小睡時序表、母乳沖奶溫控、大便九色卡與外出媽媽包清單
            </p>
          </div>

          <button
            onClick={toggleNoise}
            className={`px-4 py-2.5 rounded-2xl text-xs font-sans font-medium flex items-center space-x-2 transition-all ${
              isWhiteNoisePlaying
                ? 'bg-rose-700 text-white shadow-md animate-pulse'
                : 'bg-[#2A2723] text-[#F9F6F0] hover:bg-[#4A453E]'
            }`}
          >
            {isWhiteNoisePlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>停止白噪音 (播放中)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>安撫白噪音</span>
              </>
            )}
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-5 border-t border-[#EBE7DF] mt-5 no-scrollbar">
          {[
            { id: 'all', label: '全部工具' },
            { id: 'feed', label: '標準奶量與母乳溫控' },
            { id: 'health', label: '發燒與就醫評估' },
            { id: 'sleep', label: '清醒時間與小睡表' },
            { id: 'stool', label: '大便九色卡' },
            { id: 'allergen', label: '副食品過敏檢核' },
            { id: 'outing', label: '媽媽包必備清單' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ToolTab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2A2723] text-[#F9F6F0]'
                  : 'bg-white text-[#6B6457] border border-[#EBE7DF] hover:bg-[#EBE7DF]/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Milk Calculation Calculator Card */}
        {(activeTab === 'all' || activeTab === 'feed') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2A2723]">
                  兒科每日標準奶量計算器
                </h3>
                <p className="text-[11px] text-[#8C8475] font-sans">
                  公式：體重 (kg) × 150ml / 每日餵奶次數
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-[#EBE7DF]">
              <div>
                <label className="text-xs text-[#8C8475] block mb-1 font-sans">寶寶體重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={babyWeightInput}
                  onChange={(e) => setBabyWeightInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#8C8475] block mb-1 font-sans">每日預計餵奶次數</label>
                <input
                  type="number"
                  value={dailyFeedsInput}
                  onChange={(e) => setDailyFeedsInput(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#2A2723] text-[#F9F6F0] p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#A69D8D]">建議 24 小時總奶量</div>
                <div className="text-xl font-mono font-bold">{totalDailyMilk} ml</div>
              </div>
              <div className="text-right border-l border-[#4A453E] pl-4">
                <div className="text-[11px] text-[#A69D8D]">每餐建議奶量 (約)</div>
                <div className="text-xl font-mono font-bold text-amber-300">{perFeedMilk} ml</div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B6457] bg-white p-3 rounded-xl border border-[#EBE7DF] space-y-1">
              <span className="font-bold text-[#2A2723] block">💡 兒科醫師哺育提醒：</span>
              <p>• 1-4 個月寶寶每日所需液體量約 120-150 ml/kg；</p>
              <p>• 滿 6 個月以上副食品熱量比例提高後，每日奶量約維持 500-800 ml 即可。</p>
            </div>
          </div>
        )}

        {/* 2. Breastmilk & Formula Prep Temperature Guide */}
        {(activeTab === 'all' || activeTab === 'feed') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                <Milk className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2A2723]">
                  母乳儲存期限 (3-3-3) 與 70°C 泡奶水溫
                </h3>
                <p className="text-[11px] text-[#8C8475] font-sans">
                  世界衛生組織 (WHO) 嬰幼兒安全哺餵指引
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-[#EBE7DF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#2A2723]">🍼 母乳儲存黃金 3-3-3 口訣</span>
                  <span className="text-[10px] font-mono bg-[#EBE7DF] px-2 py-0.5 rounded-md text-[#6B6457]">保存期限</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#F9F6F0]">
                    <div className="font-bold text-[#2A2723]">室溫 &lt; 25°C</div>
                    <div className="text-amber-800 font-mono font-bold mt-0.5">3 - 4 小時</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F9F6F0]">
                    <div className="font-bold text-[#2A2723]">冷藏室 &lt; 4°C</div>
                    <div className="text-blue-800 font-mono font-bold mt-0.5">3 - 5 天</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F9F6F0]">
                    <div className="font-bold text-[#2A2723]">冷凍庫 -18°C</div>
                    <div className="text-emerald-800 font-mono font-bold mt-0.5">3 - 6 個月</div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-300 p-3.5 rounded-2xl text-xs text-amber-950 space-y-1.5">
                <div className="font-serif font-bold flex items-center space-x-1.5 text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>配方奶沖泡水溫必須 ≥ 70°C！</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  嬰兒配方奶粉非無菌製品，必須以 <strong>70°C 以上開水</strong> 沖泡，以有效殺滅致命的阪崎腸桿菌 (Cronobacter) 與沙門氏菌，再隔水降溫至 40°C 餵哺。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Pediatric Fever Assessment Guide */}
        {(activeTab === 'all' || activeTab === 'health') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2A2723]">
                  嬰幼兒發燒就醫評估與照護指引
                </h3>
                <p className="text-[11px] text-[#8C8475] font-sans">
                  輸入當前測量體溫，快速比對兒科紅旗危險警訊
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-[#EBE7DF]">
              <div>
                <label className="text-xs text-[#8C8475] block mb-1 font-sans">量測體溫 (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={feverTempInput}
                  onChange={(e) => setFeverTempInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#8C8475] block mb-1 font-sans">寶寶月齡 (月)</label>
                <input
                  type="number"
                  value={feverAgeMonths}
                  onChange={(e) => setFeverAgeMonths(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723] focus:outline-none"
                />
              </div>
            </div>

            {/* Assessment result alert box */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${feverEval.color}`}>
              <div className="font-serif font-bold flex items-center justify-between">
                <span>{feverEval.badge}</span>
                <span className="font-mono">{feverTempInput}°C</span>
              </div>
              <p className="leading-relaxed text-[11px]">{feverEval.message}</p>
            </div>

            {/* Red flags */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#EBE7DF] text-[11px] space-y-1 text-[#6B6457]">
              <span className="font-bold text-rose-800 block">🚨 兒科立即就醫 5 大紅旗警訊：</span>
              <p>1. 意識不清、嗜睡難以叫醒，或眼神呆滯無反應</p>
              <p>2. 呼吸急促、喘鳴、胸骨肋骨凹陷或發出呻吟聲</p>
              <p>3. 發生熱痙攣抽搐發作</p>
              <p>4. 皮膚出現紫斑、發紺或異常蒼白</p>
              <p>5. 持續嘔吐無法進食，或 24 小時尿布少於 3 片（脫水）</p>
            </div>
          </div>
        )}

        {/* 4. Wake Windows & Sleep Schedule */}
        {(activeTab === 'all' || activeTab === 'sleep') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2A2723]">
                  寶寶清醒時間 (Wake Windows) 與小睡表
                </h3>
                <p className="text-[11px] text-[#8C8475] font-sans">
                  掌握嬰幼兒生理清醒耐受極限，避免過度疲勞大哭
                </p>
              </div>
            </div>

            {/* Age Group Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {Object.keys(wakeWindowData).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedAgeGroup(key)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-mono font-medium text-center transition-all ${
                    selectedAgeGroup === key
                      ? 'bg-[#2A2723] text-[#F9F6F0]'
                      : 'bg-white text-[#6B6457] border border-[#EBE7DF] hover:bg-[#EBE7DF]'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Selected age info card */}
            <div className="bg-white p-4 rounded-2xl border border-[#EBE7DF] space-y-3">
              <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-2">
                <span className="font-serif font-bold text-sm text-[#2A2723]">
                  {wakeWindowData[selectedAgeGroup].title}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#F9F6F0]">
                  <div className="text-[10px] text-[#8C8475]">清醒耐受極限</div>
                  <div className="font-mono font-bold text-amber-800 text-xs sm:text-sm mt-0.5">
                    {wakeWindowData[selectedAgeGroup].window}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F9F6F0]">
                  <div className="text-[10px] text-[#8C8475]">白天小睡次數</div>
                  <div className="font-mono font-bold text-[#2A2723] text-xs sm:text-sm mt-0.5">
                    {wakeWindowData[selectedAgeGroup].naps}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F9F6F0]">
                  <div className="text-[10px] text-[#8C8475]">全日總睡眠</div>
                  <div className="font-mono font-bold text-indigo-900 text-xs sm:text-sm mt-0.5">
                    {wakeWindowData[selectedAgeGroup].totalSleep}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#6B6457] leading-relaxed bg-[#F9F6F0]/60 p-3 rounded-xl">
                💡 <strong>照護重點：</strong> {wakeWindowData[selectedAgeGroup].tips}
              </p>
            </div>
          </div>
        )}

        {/* 5. Infant Stool Color 9-Card Guide */}
        {(activeTab === 'all' || activeTab === 'stool') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2A2723]">
                  台灣衛福部「嬰兒大便九色卡」膽道閉鎖篩檢對照
                </h3>
                <p className="text-[11px] text-[#8C8475] font-sans">
                  出生滿 60 天內為膽道閉鎖黃金治療期，點選色號立即查看異常與正常分析
                </p>
              </div>
            </div>

            {/* 9 Color Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const item = stoolColorGuide[num];
                const isSelected = selectedStoolNumber === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedStoolNumber(num)}
                    style={{ backgroundColor: item.hex }}
                    className={`h-16 rounded-2xl p-2 flex flex-col justify-between text-left transition-all border-2 ${
                      isSelected ? 'border-[#2A2723] scale-105 shadow-md' : 'border-black/10 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.isNormal ? 'bg-black/40 text-white' : 'bg-rose-800 text-white'
                      }`}>
                        {num}號
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold ${
                      item.isNormal ? 'text-white drop-shadow-xs' : 'text-stone-900'
                    }`}>
                      {item.isNormal ? '正常' : '不正常'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Stool Details */}
            {selectedStoolNumber && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                stoolColorGuide[selectedStoolNumber].isNormal
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-400 text-rose-950'
              }`}>
                <div className="font-serif font-bold text-sm flex items-center justify-between">
                  <span>{stoolColorGuide[selectedStoolNumber].name}</span>
                  <span className="font-mono">
                    {stoolColorGuide[selectedStoolNumber].isNormal ? '✅ 正常便便' : '🚨 異常！請立即就診'}
                  </span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  {stoolColorGuide[selectedStoolNumber].description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. Solid Food Allergen Tracker Section */}
        {(activeTab === 'all' || activeTab === 'allergen') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2A2723]">
                    4-12 個月副食品食材過敏測試檢核清單
                  </h3>
                  <p className="text-[11px] text-[#8C8475] font-sans">
                    每次引入新食材連續觀察 3 天，記錄是否有紅疹、腹瀉、嘔吐或過敏反應
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {allergens.map((item, index) => (
                <div
                  key={item.name}
                  onClick={() => toggleAllergenTested(index)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    item.tested
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                      : 'bg-white border-[#EBE7DF] hover:border-[#8C8475]'
                  }`}
                >
                  <div>
                    <div className="font-serif font-bold text-xs sm:text-sm text-[#2A2723]">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#8C8475] font-sans mt-0.5">
                      {item.category} • {item.riskLevel === 'high' ? '高敏食材' : item.riskLevel === 'medium' ? '中度過敏' : '低敏初期'}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      item.tested ? 'bg-emerald-700 text-white' : 'bg-[#EBE7DF] text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Diaper Bag & Outing Checklist */}
        {(activeTab === 'all' || activeTab === 'outing') && (
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
                  <Luggage className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2A2723]">
                    外出媽媽包與看診待產必備互動檢核清單
                  </h3>
                  <p className="text-[11px] text-[#8C8475] font-sans">
                    帶寶寶出門不再手忙腳亂，點擊即可勾選完成項目
                  </p>
                </div>
              </div>

              <button
                onClick={resetOutingChecklist}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EBE7DF] text-[#6B6457] hover:bg-[#D9D1C2] text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設勾選</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {outingChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleOutingItem(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between space-x-3 ${
                    item.checked
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-white border-[#EBE7DF] hover:border-[#8C8475]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBE7DF] text-[#6B6457] font-mono">
                        {item.category}
                      </span>
                    </div>
                    <div className={`font-serif font-bold text-xs sm:text-sm text-[#2A2723] ${
                      item.checked ? 'line-through opacity-70' : ''
                    }`}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[#8C8475] font-sans">
                      {item.description}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      item.checked ? 'bg-emerald-700 text-white' : 'bg-[#EBE7DF] text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
