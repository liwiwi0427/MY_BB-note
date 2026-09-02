import React, { useState, useEffect, useMemo } from 'react';
import { 
  BabyProfile, 
  GrowthRecord, 
  VaccineRecord, 
  MedicalVisit, 
  DiaryEntry,
  CloudSyncInfo 
} from '../types';
import { 
  FileText, 
  Cloud, 
  Milk, 
  Thermometer, 
  Volume2, 
  VolumeX, 
  Clock, 
  Utensils, 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Heart, 
  Activity, 
  Info,
  RotateCcw,
  Sliders,
  BellRing,
  Droplets
} from 'lucide-react';
import { audioSynthesizer, SoundType } from '../utils/audioSynthesizer';
import { FOOD_DATABASE, FoodCategory, FoodTrialStatus, FoodItem } from '../data/foodAllergenData';
import { TotalIOTracker } from './TotalIOTracker';

interface ToolboxProps {
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  medicalVisits: MedicalVisit[];
  diaryEntries: DiaryEntry[];
  syncInfo: CloudSyncInfo;
  onOpenPediatricReport: () => void;
  onOpenCloudSync: () => void;
  onAddDiaryEntry?: (entry: DiaryEntry) => void;
}

type ActiveToolTab = 'totalio' | 'milk' | 'fever' | 'whitenoise' | 'wakewindow' | 'foodtracker';

const FOOD_STORAGE_KEY = 'BABY_FOOD_TRIALS_STATE_V1';

export const Toolbox: React.FC<ToolboxProps> = ({
  babyProfile,
  growthRecords,
  vaccineRecords,
  medicalVisits,
  diaryEntries,
  syncInfo,
  onOpenPediatricReport,
  onOpenCloudSync,
  onAddDiaryEntry,
}) => {
  const [activeTool, setActiveTool] = useState<ActiveToolTab>('totalio');

  // Calculate current baby age in months and days
  const babyAge = useMemo(() => {
    if (!babyProfile.birthday) return { months: 0, days: 0, text: '初生' };
    const bDate = new Date(babyProfile.birthday);
    const now = new Date();
    const diffMs = now.getTime() - bDate.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const months = parseFloat((days / 30.4375).toFixed(1));
    return {
      months,
      days,
      text: months < 1 ? `初生 ${days} 天` : `${months} 個月 (${days} 天)`,
    };
  }, [babyProfile.birthday]);

  // Latest weight from growth records or baby profile
  const defaultWeight = useMemo(() => {
    if (growthRecords.length > 0) {
      const sorted = [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sorted[0].weight;
    }
    return babyProfile.birthWeight > 0 ? babyProfile.birthWeight : 4.5;
  }, [growthRecords, babyProfile.birthWeight]);

  // ----------------------------------------------------
  // TOOL 1: MILK & FORMULA CALCULATOR STATE
  // ----------------------------------------------------
  const [calcWeight, setCalcWeight] = useState<number>(defaultWeight);
  const [mealsPerDay, setMealsPerDay] = useState<number>(6);
  const [feedingStandard, setFeedingStandard] = useState<'standard' | 'high' | 'early'>('standard');

  useEffect(() => {
    if (defaultWeight > 0) {
      setCalcWeight(defaultWeight);
    }
  }, [defaultWeight]);

  const milkResults = useMemo(() => {
    const w = Math.max(1.5, Math.min(20, calcWeight || 4.5));
    // ml per kg per day
    let multiplierMin = 120;
    let multiplierMax = 150;

    if (feedingStandard === 'early') {
      multiplierMin = 100;
      multiplierMax = 120;
    } else if (feedingStandard === 'high') {
      multiplierMin = 140;
      multiplierMax = 160;
    }

    const totalMin = Math.round(w * multiplierMin);
    const totalMax = Math.round(w * multiplierMax);
    const perMealMin = Math.round(totalMin / mealsPerDay);
    const perMealMax = Math.round(totalMax / mealsPerDay);

    return {
      weight: w,
      totalMin,
      totalMax,
      perMealMin,
      perMealMax,
      mealsPerDay,
    };
  }, [calcWeight, mealsPerDay, feedingStandard]);

  // ----------------------------------------------------
  // TOOL 2: FEVER & ANTIPYRETIC CALCULATOR STATE
  // ----------------------------------------------------
  const [feverWeight, setFeverWeight] = useState<number>(defaultWeight);
  const [feverTemp, setFeverTemp] = useState<number>(38.2);
  const [tempRoute, setTempRoute] = useState<'ear' | 'rectal' | 'axillary' | 'forehead'>('ear');

  const feverAssessment = useMemo(() => {
    const t = feverTemp;
    const isUnder3Months = babyAge.months < 3;
    let level: 'normal' | 'mild' | 'moderate' | 'high' = 'normal';
    let label = '正常體溫';
    let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (t >= 39.0) {
      level = 'high';
      label = '高燒 (≥ 39.0°C)';
      colorClass = 'text-red-700 bg-red-50 border-red-200';
    } else if (t >= 38.5) {
      level = 'moderate';
      label = '中度發燒 (38.5 ~ 38.9°C)';
      colorClass = 'text-amber-800 bg-amber-50 border-amber-200';
    } else if (t >= 38.0) {
      level = 'mild';
      label = '輕微發燒 (38.0 ~ 38.4°C)';
      colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (t >= 37.5) {
      level = 'mild';
      label = '微溫 / 發熱中 (37.5 ~ 37.9°C)';
      colorClass = 'text-blue-700 bg-blue-50 border-blue-200';
    }

    // Dosage calculations based on Taiwanese standard pediatric liquid suspensions
    const w = Math.max(2, feverWeight || 5);
    
    // 1. Acetaminophen syrup (24mg/ml, e.g. 安佳適 / 普拿疼口服液)
    // 10 ~ 15 mg/kg => (w * 10 / 24) to (w * 15 / 24) => w * 0.42 to w * 0.62 ml
    const acetMinMl = (w * 0.42).toFixed(1);
    const acetMaxMl = (w * 0.62).toFixed(1);
    const acetRecMl = (w * 0.5).toFixed(1); // Standard ~ weight / 2

    // 2. Ibuprofen suspension (20mg/ml, e.g. 依普芬 / 馬蓋先, 僅限滿6個月以上)
    // 5 ~ 10 mg/kg => (w * 5 / 20) to (w * 10 / 20) => w * 0.25 to w * 0.5 ml
    const isIbuprofenAllowed = babyAge.months >= 6;
    const ibuMinMl = (w * 0.25).toFixed(1);
    const ibuMaxMl = (w * 0.5).toFixed(1);
    const ibuRecMl = (w * 0.35).toFixed(1);

    return {
      t,
      level,
      label,
      colorClass,
      isUnder3Months,
      isIbuprofenAllowed,
      weight: w,
      acetMinMl,
      acetMaxMl,
      acetRecMl,
      ibuMinMl,
      ibuMaxMl,
      ibuRecMl,
    };
  }, [feverTemp, feverWeight, babyAge.months]);

  // ----------------------------------------------------
  // TOOL 3: WHITE NOISE & SOUND SYNTHESIZER STATE
  // ----------------------------------------------------
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<SoundType>('heartbeat');
  const [volume, setVolume] = useState<number>(0.5);
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);

  // Audio timer loop
  useEffect(() => {
    let interval: any = null;
    if (isPlayingAudio && remainingSecs !== null && remainingSecs > 0) {
      interval = setInterval(() => {
        setRemainingSecs((prev) => {
          if (prev === null || prev <= 1) {
            audioSynthesizer.stop();
            setIsPlayingAudio(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio, remainingSecs]);

  const handleToggleSound = (type: SoundType) => {
    if (isPlayingAudio && activeSound === type) {
      audioSynthesizer.stop();
      setIsPlayingAudio(false);
      setRemainingSecs(null);
    } else {
      audioSynthesizer.setVolume(volume);
      audioSynthesizer.play(type);
      setActiveSound(type);
      setIsPlayingAudio(true);
      if (timerMinutes > 0) {
        setRemainingSecs(timerMinutes * 60);
      } else {
        setRemainingSecs(null);
      }
    }
  };

  const handleStopAudio = () => {
    audioSynthesizer.stop();
    setIsPlayingAudio(false);
    setRemainingSecs(null);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioSynthesizer.setVolume(newVol);
  };

  const handleTimerChange = (mins: number) => {
    setTimerMinutes(mins);
    if (isPlayingAudio) {
      if (mins > 0) {
        setRemainingSecs(mins * 60);
      } else {
        setRemainingSecs(null);
      }
    }
  };

  // ----------------------------------------------------
  // TOOL 4: WAKE WINDOW & SLEEP ROUTINE STATE
  // ----------------------------------------------------
  const [lastWakeTime, setLastWakeTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const wakeWindowData = useMemo(() => {
    const m = babyAge.months;
    let windowMinMins = 60;
    let windowMaxMins = 90;
    let napsPerDay = '3 ~ 4 次';
    let totalSleep = '14 ~ 16 小時';
    let stageLabel = '2~3 個月（作息初探期）';

    if (m < 1) {
      windowMinMins = 45;
      windowMaxMins = 60;
      napsPerDay = '4 ~ 5 次';
      totalSleep = '16 ~ 18 小時';
      stageLabel = '初生新生兒（0~1 個月）';
    } else if (m < 4) {
      windowMinMins = 60;
      windowMaxMins = 90;
      napsPerDay = '3 ~ 4 次';
      totalSleep = '14 ~ 16 小時';
      stageLabel = '2~3 個月（作息初探期）';
    } else if (m < 7) {
      windowMinMins = 90;
      windowMaxMins = 150;
      napsPerDay = '3 次';
      totalSleep = '13 ~ 15 小時';
      stageLabel = '4~6 個月（作息建立期）';
    } else if (m < 10) {
      windowMinMins = 150;
      windowMaxMins = 210;
      napsPerDay = '2 次';
      totalSleep = '12 ~ 14 小時';
      stageLabel = '7~9 個月（穩定兩次小睡）';
    } else if (m < 13) {
      windowMinMins = 180;
      windowMaxMins = 240;
      napsPerDay = '2 次';
      totalSleep = '12 ~ 14 小時';
      stageLabel = '10~12 個月（預備一歲轉換）';
    } else {
      windowMinMins = 240;
      windowMaxMins = 330;
      napsPerDay = '1 ~ 2 次';
      totalSleep = '11 ~ 13 小時';
      stageLabel = '1歲以上幼兒期';
    }

    // Calculate next nap time from lastWakeTime
    const [hStr, mStr] = (lastWakeTime || '08:00').split(':');
    const wakeDate = new Date();
    wakeDate.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0);

    const nextNapMinDate = new Date(wakeDate.getTime() + windowMinMins * 60 * 1000);
    const nextNapMaxDate = new Date(wakeDate.getTime() + windowMaxMins * 60 * 1000);

    const formatTime = (d: Date) => {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    };

    return {
      stageLabel,
      windowMinMins,
      windowMaxMins,
      napsPerDay,
      totalSleep,
      nextNapMinTime: formatTime(nextNapMinDate),
      nextNapMaxTime: formatTime(nextNapMaxDate),
    };
  }, [babyAge.months, lastWakeTime]);

  // ----------------------------------------------------
  // TOOL 5: SOLID FOOD & ALLERGEN TRACKER STATE
  // ----------------------------------------------------
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<FoodCategory | 'all'>('all');
  const [foodTrialStatuses, setFoodTrialStatuses] = useState<Record<string, FoodTrialStatus>>(() => {
    try {
      const saved = localStorage.getItem(FOOD_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return {};
  });

  const handleUpdateFoodStatus = (foodId: string, status: FoodTrialStatus) => {
    const updated = {
      ...foodTrialStatuses,
      [foodId]: status,
    };
    setFoodTrialStatuses(updated);
    try {
      localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const filteredFoods = useMemo(() => {
    if (foodCategoryFilter === 'all') return FOOD_DATABASE;
    return FOOD_DATABASE.filter((f) => f.category === foodCategoryFilter);
  }, [foodCategoryFilter]);

  const foodStats = useMemo(() => {
    const total = FOOD_DATABASE.length;
    let passedCount = 0;
    let tryingCount = 0;
    let allergicCount = 0;

    FOOD_DATABASE.forEach((f) => {
      const st = foodTrialStatuses[f.id] || 'untried';
      if (st === 'passed') passedCount++;
      else if (st === 'trying') tryingCount++;
      else if (st === 'allergic') allergicCount++;
    });

    return {
      total,
      passedCount,
      tryingCount,
      allergicCount,
      percent: Math.round((passedCount / total) * 100),
    };
  }, [foodTrialStatuses]);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* SECTION 1: TOP CORE MANAGEMENT & EXPORT CARDS (Prominently moved to Toolbox) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* PDF Clinical Report Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#EBE7DF] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9D1C2] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9F6F0] rounded-bl-full -mr-6 -mt-6 pointer-events-none opacity-60"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8C8475] bg-[#F2EDE4] px-3 py-1 rounded-full border border-[#D9D1C2] flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-[#2A2723]" />
                兒科門診專用
              </span>
              <span className="text-xs font-mono font-bold text-[#8C8475]">PDF PRINTABLE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
              匯出兒科就診專用報告
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6457] mt-2 font-sans leading-relaxed">
              一鍵彙整寶寶最新 WHO 生長百分位、未接種疫苗時程、近期就診診斷用藥與體溫紀錄，並支援看診自訂提問清單。
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-[#F2EDE4] flex items-center justify-between">
            <span className="text-xs text-[#8C8475] font-sans">
              支援一鍵另存 PDF / A4 醫療排版
            </span>
            <button
              id="toolbox-open-report-btn"
              onClick={onOpenPediatricReport}
              className="px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider bg-[#2A2723] text-[#F9F6F0] hover:bg-[#3D3833] transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-[#D9D1C2]" />
              <span>開啟就醫報告</span>
            </button>
          </div>
        </div>

        {/* Cloud Sync & Backup Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#EBE7DF] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#D9D1C2] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6E9F2]/50 rounded-bl-full -mr-6 -mt-6 pointer-events-none opacity-60"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#3A4050] bg-[#E6E9F2] px-3 py-1 rounded-full border border-[#D5D9E6] flex items-center gap-1.5">
                <Cloud className="w-3 h-3 text-[#3A4050]" />
                家庭多裝置同步
              </span>
              <div className="flex items-center gap-1.5 text-xs font-sans text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>同步就緒</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
                家庭雲端同步碼
              </h3>
              <span className="text-lg font-mono font-bold text-[#2A2723] bg-[#F2EDE4] px-2.5 py-0.5 rounded-lg border border-[#D9D1C2]">
                {syncInfo.syncCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6457] mt-2 font-sans leading-relaxed">
              爸爸媽媽或保母可在不同手機輸入相同的 6 位數同步碼，隨時即時備份與跨裝置無縫讀取所有成長紀錄。
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-[#F2EDE4] flex items-center justify-between">
            <span className="text-[11px] text-[#8C8475] font-sans">
              上次備份：<span className="font-mono text-[#6B6457]">{syncInfo.lastSyncedAt ? new Date(syncInfo.lastSyncedAt).toLocaleString('zh-TW', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '尚未手動備份'}</span>
            </span>
            <button
              id="toolbox-open-sync-btn"
              onClick={onOpenCloudSync}
              className="px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider bg-[#F2EDE4] hover:bg-[#E6DFD1] text-[#2A2723] border border-[#D9D1C2] transition-all flex items-center gap-2 active:scale-95"
            >
              <Cloud className="w-3.5 h-3.5 text-[#6B6457]" />
              <span>同步與備份設定</span>
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 2: PRACTICAL PARENTING TOOLS SUITE */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EBE7DF]">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8C8475] block mb-1">
              Practical Parenting Utilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2723]">
              日常實用育兒小工具
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6457] mt-1 font-sans">
              專為寶寶日常照護設計的科學計算器、舒緩白噪音與副食品指南
            </p>
          </div>

          {/* Baby Status Reminder */}
          <div className="flex items-center gap-3 bg-[#F9F6F0] px-4 py-2 rounded-2xl border border-[#EBE7DF] self-start sm:self-auto">
            <Activity className="w-4 h-4 text-[#8C8475]" />
            <div className="text-xs font-sans">
              <span className="text-[#8C8475]">寶寶當前：</span>
              <span className="font-bold text-[#2A2723] ml-1">{babyAge.text}</span>
              <span className="text-[#8C8475] ml-2">最新體重：</span>
              <span className="font-mono font-bold text-[#2A2723]">{defaultWeight > 0 ? `${defaultWeight} kg` : '未設定'}</span>
            </div>
          </div>
        </div>

        {/* Tools Sub-Navigation Pills */}
        <div className="flex items-center gap-2 py-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'totalio', label: '💧 Total I/O 水分排泄監控', icon: Droplets, en: 'Total I/O' },
            { id: 'milk', label: '奶量需求計算機', icon: Milk, en: 'Milk Calc' },
            { id: 'fever', label: '發燒與退燒藥計算', icon: Thermometer, en: 'Fever Dosage' },
            { id: 'whitenoise', label: '安撫白噪音播放器', icon: Volume2, en: 'White Noise' },
            { id: 'wakewindow', label: '清醒作息時鐘', icon: Clock, en: 'Wake Windows' },
            { id: 'foodtracker', label: '副食品過敏原打卡', icon: Utensils, en: 'Solid Food' },
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                id={`tool-subtab-${tool.id}`}
                onClick={() => setActiveTool(tool.id as ActiveToolTab)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-sans whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  isActive
                    ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723] shadow-sm scale-[1.02]'
                    : 'bg-[#F9F6F0] text-[#6B6457] border-[#EBE7DF] hover:bg-[#F2EDE4] hover:text-[#2A2723]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9D1C2]' : 'text-[#8C8475]'}`} strokeWidth={1.75} />
                <span className="font-medium">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* TOOL 0: TOTAL I/O TRACKER */}
        {activeTool === 'totalio' && (
          <div className="pt-2 animate-fadeIn">
            <TotalIOTracker
              babyProfile={babyProfile}
              growthRecords={growthRecords}
              diaryEntries={diaryEntries}
              onAddDiaryEntry={onAddDiaryEntry}
            />
          </div>
        )}

        {/* TOOL 1: MILK CALCULATOR */}
        {activeTool === 'milk' && (
          <div className="space-y-6 pt-2 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Input Controls */}
              <div className="lg:col-span-5 bg-[#F9F6F0] rounded-[28px] p-6 border border-[#EBE7DF] space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-serif font-bold text-[#2A2723] flex items-center gap-2">
                    <Milk className="w-4 h-4 text-[#8C7A58]" />
                    <span>輸入寶寶參數</span>
                  </h4>
                  <span className="text-[11px] text-[#8C8475] font-sans">兒科標準公式</span>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5 flex justify-between">
                    <span>寶寶目前體重 (kg)</span>
                    <span className="font-mono text-[#2A2723] font-bold">{calcWeight} kg</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="2.0"
                      max="15.0"
                      step="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                      className="flex-1 accent-[#2A2723] h-2 bg-[#EBE7DF] rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="2.0"
                      max="20.0"
                      step="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 4.5)}
                      className="w-20 px-3 py-1.5 bg-white border border-[#D9D1C2] rounded-xl font-mono text-sm text-center font-bold text-[#2A2723]"
                    />
                  </div>
                </div>

                {/* Meals Per Day Input */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5 flex justify-between">
                    <span>每日餵奶總餐數 (次)</span>
                    <span className="font-mono text-[#2A2723] font-bold">{mealsPerDay} 餐/日 (約每 {parseFloat((24 / mealsPerDay).toFixed(1))} 小時)</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[4, 5, 6, 7, 8].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMealsPerDay(n)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          mealsPerDay === n
                            ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        {n} 餐
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feeding Standard */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5">
                    月齡與食量階段標準
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'early', label: '初生適應期', sub: '100~120ml/kg' },
                      { id: 'standard', label: '標準需求量', sub: '120~150ml/kg' },
                      { id: 'high', label: '猛長期需求', sub: '140~160ml/kg' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFeedingStandard(st.id as any)}
                        className={`p-2.5 rounded-2xl text-left border transition-all ${
                          feedingStandard === st.id
                            ? 'bg-white border-[#2A2723] ring-1 ring-[#2A2723]'
                            : 'bg-white/60 border-[#EBE7DF] hover:bg-white'
                        }`}
                      >
                        <div className="text-xs font-medium text-[#2A2723]">{st.label}</div>
                        <div className="text-[10px] text-[#8C8475] font-mono mt-0.5">{st.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Result Display */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Single Meal Output */}
                  <div className="bg-[#F5EEDB] rounded-[28px] p-6 border border-[#E5DBBF]">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C7A58] block mb-1">
                      單餐建議沖泡 / 瓶餵量
                    </span>
                    <div className="flex items-baseline gap-1.5 my-2">
                      <span className="text-3xl sm:text-4xl font-serif font-bold text-[#2A2723] font-mono">
                        {milkResults.perMealMin} ~ {milkResults.perMealMax}
                      </span>
                      <span className="text-sm font-sans text-[#8C7A58] font-bold">ml / 餐</span>
                    </div>
                    <p className="text-xs text-[#6B6457] font-sans leading-relaxed">
                      依每日 {milkResults.mealsPerDay} 餐均分計算，可依寶寶飢餓訊號微調 ±10~20ml。
                    </p>
                  </div>

                  {/* Daily Total Output */}
                  <div className="bg-[#E6EBE6] rounded-[28px] p-6 border border-[#D5DDD5]">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#5A6D5A] block mb-1">
                      全日建議總奶量區間
                    </span>
                    <div className="flex items-baseline gap-1.5 my-2">
                      <span className="text-3xl sm:text-4xl font-serif font-bold text-[#2A2723] font-mono">
                        {milkResults.totalMin} ~ {milkResults.totalMax}
                      </span>
                      <span className="text-sm font-sans text-[#5A6D5A] font-bold">ml / 日</span>
                    </div>
                    <p className="text-xs text-[#6B6457] font-sans leading-relaxed">
                      體重 {milkResults.weight} kg 之全日基本水份與熱量攝取基準。
                    </p>
                  </div>

                </div>

                {/* Pediatric Guidance Tips */}
                <div className="bg-[#F9F6F0] rounded-[24px] p-5 border border-[#EBE7DF] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#2A2723]">
                    <Info className="w-4 h-4 text-[#8C8475]" />
                    <span>兒科醫師奶量充足評估指標：</span>
                  </div>
                  <ul className="text-xs text-[#6B6457] space-y-1.5 font-sans list-disc list-inside">
                    <li><strong className="text-[#2A2723]">尿布重量：</strong>每日應有 6 片以上沈甸甸的濕尿布（每片約 3~4 湯匙水重），尿液清澈淡黃。</li>
                    <li><strong className="text-[#2A2723]">體重成長：</strong>出生兩週後恢復出生體重，前 3 個月每週平均增重 150~200 克。</li>
                    <li><strong className="text-[#2A2723]">親餵媽媽：</strong>母乳為供需平衡且消化迅速，可依寶寶尋乳訊號按需餵哺，不必嚴格限縮毫升數。</li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TOOL 2: FEVER & ANTIPYRETIC CALCULATOR */}
        {activeTool === 'fever' && (
          <div className="space-y-6 pt-2 animate-fadeIn">
            
            {/* Red Flag Emergency Warning if under 3 months */}
            {feverAssessment.isUnder3Months && feverAssessment.t >= 38.0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-[24px] p-5 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-red-900">
                    ⚠️ 緊急警訊：未滿 3 個月嬰兒發燒為兒科急症！
                  </h4>
                  <p className="text-xs text-red-800 font-sans mt-1 leading-relaxed">
                    未滿 3 個月新生兒免疫系統尚未健全，體溫達 38.0°C 容易隱藏嚴重細菌感染，<strong>請勿自行在家餵食退燒藥掩蓋病情</strong>，應立即攜帶健保卡前往大型醫院兒科急診就醫檢查。
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Controls */}
              <div className="lg:col-span-5 bg-[#F9F6F0] rounded-[28px] p-6 border border-[#EBE7DF] space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-serif font-bold text-[#2A2723] flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-[#8C5D5D]" />
                    <span>體溫與體重輸入</span>
                  </h4>
                  <span className="text-[11px] text-[#8C8475] font-sans">衛福部兒科用藥指引</span>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5 flex justify-between">
                    <span>寶寶體重 (kg)</span>
                    <span className="font-mono text-[#2A2723] font-bold">{feverWeight} kg</span>
                  </label>
                  <input
                    type="range"
                    min="3.0"
                    max="18.0"
                    step="0.1"
                    value={feverWeight}
                    onChange={(e) => setFeverWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#8C5D5D] h-2 bg-[#EBE7DF] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Temperature Input */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5 flex justify-between">
                    <span>實測體溫 (°C)</span>
                    <span className="font-mono text-[#8C5D5D] font-bold text-base">{feverTemp} °C</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="36.0"
                      max="41.0"
                      step="0.1"
                      value={feverTemp}
                      onChange={(e) => setFeverTemp(parseFloat(e.target.value))}
                      className="flex-1 accent-[#8C5D5D] h-2 bg-[#EBE7DF] rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="35.0"
                      max="42.0"
                      step="0.1"
                      value={feverTemp}
                      onChange={(e) => setFeverTemp(parseFloat(e.target.value) || 38.0)}
                      className="w-20 px-3 py-1.5 bg-white border border-[#D9D1C2] rounded-xl font-mono text-sm text-center font-bold text-[#8C5D5D]"
                    />
                  </div>
                </div>

                {/* Measurement Route */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5">測量部位</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'ear', label: '耳溫 (常見標準)' },
                      { id: 'rectal', label: '肛溫 (最精準)' },
                      { id: 'axillary', label: '腋溫 (+0.5°C)' },
                      { id: 'forehead', label: '額溫 (易受環境干擾)' },
                    ].map((route) => (
                      <button
                        key={route.id}
                        type="button"
                        onClick={() => setTempRoute(route.id as any)}
                        className={`p-2.5 rounded-xl text-left text-xs font-sans border transition-all ${
                          tempRoute === route.id
                            ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        {route.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Liquid Medication Dosage Cards */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Temperature Status Banner */}
                <div className={`p-4 rounded-[24px] border ${feverAssessment.colorClass} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-sm font-serif font-bold">{feverAssessment.label}</div>
                      <div className="text-xs opacity-80 mt-0.5">實測值 {feverAssessment.t} °C ｜ 體重 {feverAssessment.weight} kg</div>
                    </div>
                  </div>
                  <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-white/80">
                    {feverAssessment.t < 38.0 ? '暫不需退燒藥' : '體溫 ≥ 38.5°C 且不適時評估'}
                  </span>
                </div>

                {/* 1. Acetaminophen Syrup (安佳適) */}
                <div className="bg-white rounded-[28px] p-5 border border-[#EBE7DF] shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C5D5D] bg-[#F2E6E6] px-2.5 py-0.5 rounded-full font-bold">
                          第一線退燒常用
                        </span>
                        <h4 className="text-base font-serif font-bold text-[#2A2723]">
                          乙醯胺酚糖漿 (Acetaminophen, 24mg/ml)
                        </h4>
                      </div>
                      <p className="text-xs text-[#8C8475] mt-1">
                        如：安佳適 (Anti-phen) 甜味口服懸液劑、普拿疼糖漿
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#8C8475] font-sans">單次建議服用量</div>
                      <div className="text-2xl font-serif font-bold text-[#8C5D5D] font-mono">
                        {feverAssessment.acetRecMl} <span className="text-xs font-sans text-[#2A2723]">ml</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#8C8475]">
                        ({feverAssessment.acetMinMl} ~ {feverAssessment.acetMaxMl} ml)
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#6B6457] font-sans flex-wrap gap-2">
                    <span>⏱️ 服用間隔：<strong>至少 4 ~ 6 小時</strong></span>
                    <span>🚫 每日上限：<strong>24 小時不超過 5 次</strong></span>
                  </div>
                </div>

                {/* 2. Ibuprofen Suspension (依普芬) */}
                <div className={`rounded-[28px] p-5 border shadow-xs ${
                  feverAssessment.isIbuprofenAllowed 
                    ? 'bg-white border-[#EBE7DF]' 
                    : 'bg-[#F9F6F0] border-[#EBE7DF] opacity-80'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-sans uppercase tracking-widest text-[#5F6B8A] bg-[#E6E9F2] px-2.5 py-0.5 rounded-full font-bold">
                          消炎解熱 (滿6個月適用)
                        </span>
                        <h4 className="text-base font-serif font-bold text-[#2A2723]">
                          依普芬口服懸液 (Ibuprofen, 20mg/ml)
                        </h4>
                      </div>
                      <p className="text-xs text-[#8C8475] mt-1">
                        如：依普芬 (Ibuprofen) 糖漿、馬蓋先懸液（需滿 6 個月以上）
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#8C8475] font-sans">單次建議服用量</div>
                      {feverAssessment.isIbuprofenAllowed ? (
                        <>
                          <div className="text-2xl font-serif font-bold text-[#5F6B8A] font-mono">
                            {feverAssessment.ibuRecMl} <span className="text-xs font-sans text-[#2A2723]">ml</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8475]">
                            ({feverAssessment.ibuMinMl} ~ {feverAssessment.ibuMaxMl} ml)
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md">未滿6個月禁用</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#6B6457] font-sans flex-wrap gap-2">
                    <span>⏱️ 服用間隔：<strong>至少 6 ~ 8 小時</strong></span>
                    <span>⚠️ 脫水、嘔吐或腎功能異常時請先諮詢醫師</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TOOL 3: WHITE NOISE & SOUND SYNTHESIZER */}
        {activeTool === 'whitenoise' && (
          <div className="space-y-6 pt-2 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {[
                { 
                  id: 'heartbeat', 
                  name: '子宮心跳音', 
                  desc: '重現母親子宮規律咚咚聲，給予初生極致安全感', 
                  icon: Heart, 
                  color: 'bg-[#F2E6E6] border-[#E0D0D0] text-[#8C5D5D]' 
                },
                { 
                  id: 'rain', 
                  name: '舒緩粉紅雨聲', 
                  desc: '自然柔和落雨頻率，有效阻隔外界突發噪音', 
                  icon: Sparkles, 
                  color: 'bg-[#E6E9F2] border-[#D5D9E6] text-[#5F6B8A]' 
                },
                { 
                  id: 'shushing', 
                  name: '溫柔安撫噓聲', 
                  desc: '模擬大人在耳邊輕柔的 Shh... 呼吸節奏', 
                  icon: Volume2, 
                  color: 'bg-[#E6EBE6] border-[#D5DDD5] text-[#5A6D5A]' 
                },
                { 
                  id: 'lullaby', 
                  name: '水晶音樂盒', 
                  desc: '清脆微甜的搖籃旋律，引導大腦放鬆進入夢鄉', 
                  icon: Activity, 
                  color: 'bg-[#F5EEDB] border-[#E5DBBF] text-[#8C7A58]' 
                },
              ].map((snd) => {
                const Icon = snd.icon;
                const isSelected = activeSound === snd.id;
                const isCurrentlyPlaying = isPlayingAudio && isSelected;
                return (
                  <div
                    key={snd.id}
                    className={`rounded-[28px] p-5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#2A2723] ring-2 ring-[#2A2723]/20 shadow-md scale-[1.01]'
                        : 'bg-[#F9F6F0] border-[#EBE7DF] hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-2xl ${snd.color}`}>
                          <Icon className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        {isCurrentlyPlaying && (
                          <span className="flex items-center gap-1.5 text-[10px] font-sans text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            播放中
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-serif font-bold text-[#2A2723]">{snd.name}</h4>
                      <p className="text-xs text-[#6B6457] mt-1.5 font-sans leading-relaxed">{snd.desc}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#EBE7DF]">
                      <button
                        type="button"
                        onClick={() => handleToggleSound(snd.id as SoundType)}
                        className={`w-full py-2.5 rounded-full text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isCurrentlyPlaying
                            ? 'bg-[#8C5D5D] text-white hover:bg-[#784A4A]'
                            : 'bg-[#2A2723] text-[#F9F6F0] hover:bg-[#3D3833]'
                        }`}
                      >
                        {isCurrentlyPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>暫停播放</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>播放此音效</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Audio Control Bar */}
            <div className="bg-[#F9F6F0] rounded-[28px] p-6 border border-[#EBE7DF] flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Volume Slider */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Volume2 className="w-4 h-4 text-[#8C8475] shrink-0" />
                <span className="text-xs font-sans text-[#6B6457] shrink-0">音量控制：</span>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full md:w-36 accent-[#2A2723] h-2 bg-[#D9D1C2] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-[#2A2723] w-10 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Sleep Timer Selector */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                <Clock className="w-4 h-4 text-[#8C8475] shrink-0" />
                <span className="text-xs font-sans text-[#6B6457]">定時關閉：</span>
                {[
                  { m: 15, label: '15分' },
                  { m: 30, label: '30分' },
                  { m: 60, label: '60分' },
                  { m: 0, label: '連續' },
                ].map((t) => (
                  <button
                    key={t.m}
                    type="button"
                    onClick={() => handleTimerChange(t.m)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      timerMinutes === t.m
                        ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                        : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Master Play/Stop & Remaining Time */}
              <div className="flex items-center gap-3 shrink-0">
                {isPlayingAudio && remainingSecs !== null && (
                  <span className="text-xs font-mono text-[#8C5D5D] font-bold bg-white px-3 py-1 rounded-full border border-[#E0D0D0]">
                    剩餘 {Math.floor(remainingSecs / 60)}分 {remainingSecs % 60}秒
                  </span>
                )}
                {isPlayingAudio ? (
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="px-4 py-2 rounded-full bg-[#8C5D5D] text-white text-xs font-sans hover:bg-[#784A4A] transition-all flex items-center gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>停止所有音效</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleSound(activeSound)}
                    className="px-4 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-sans hover:bg-[#3D3833] transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>啟動播放</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TOOL 4: WAKE WINDOW & SLEEP ROUTINE */}
        {activeTool === 'wakewindow' && (
          <div className="space-y-6 pt-2 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Controls */}
              <div className="lg:col-span-5 bg-[#F9F6F0] rounded-[28px] p-6 border border-[#EBE7DF] space-y-5">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C8475] block mb-1">
                    當前月齡評估
                  </span>
                  <h4 className="text-lg font-serif font-bold text-[#2A2723]">
                    {wakeWindowData.stageLabel}
                  </h4>
                  <p className="text-xs text-[#6B6457] mt-1 font-sans">
                    寶寶實足年齡 {babyAge.text} 之科學清醒極限
                  </p>
                </div>

                {/* Last Wake Time Input */}
                <div>
                  <label className="block text-xs font-sans text-[#6B6457] mb-1.5">
                    寶寶上次小睡醒來時間：
                  </label>
                  <input
                    type="time"
                    value={lastWakeTime}
                    onChange={(e) => setLastWakeTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#D9D1C2] rounded-2xl font-mono text-base font-bold text-[#2A2723] focus:outline-none focus:border-[#2A2723]"
                  />
                </div>

                {/* Stage Reference Stats */}
                <div className="bg-white rounded-2xl p-4 border border-[#EBE7DF] space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-[#F2EDE4]">
                    <span className="text-[#8C8475]">建議極限清醒時間：</span>
                    <span className="font-mono font-bold text-[#2A2723]">
                      {wakeWindowData.windowMinMins} ~ {wakeWindowData.windowMaxMins} 分鐘
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F2EDE4]">
                    <span className="text-[#8C8475]">全日建議小睡次數：</span>
                    <span className="font-medium text-[#2A2723]">{wakeWindowData.napsPerDay}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#8C8475]">全日理想總睡眠：</span>
                    <span className="font-medium text-[#2A2723]">{wakeWindowData.totalSleep}</span>
                  </div>
                </div>

              </div>

              {/* Recommended Next Nap Target */}
              <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                
                <div className="bg-[#E6E9F2] rounded-[28px] p-6 sm:p-7 border border-[#D5D9E6]">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#5F6B8A] block mb-1">
                    預估下次最佳入睡準備時間
                  </span>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#2A2723] font-mono">
                      {wakeWindowData.nextNapMinTime} ~ {wakeWindowData.nextNapMaxTime}
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6B8A] font-sans leading-relaxed">
                    請於目標時間前 15 分鐘開始進行睡眠儀式（調暗燈光、換乾淨尿布、播放白噪音、輕抱搖安撫）。
                  </p>
                </div>

                {/* Sleep Signs Guide */}
                <div className="bg-[#F9F6F0] rounded-[24px] p-5 border border-[#EBE7DF] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#2A2723]">
                    <BellRing className="w-4 h-4 text-[#8C8475]" />
                    <span>抓住黃金入睡訊號（避免過累大哭）：</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#6B6457] font-sans">
                    <div className="bg-white p-2.5 rounded-xl border border-[#EBE7DF]">
                      <strong className="text-[#2A2723] block">初階睡眠訊號（最佳時機）：</strong>
                      眼神放空發呆、動作減緩、微揉眼睛、偶爾打哈欠。
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#EBE7DF]">
                      <strong className="text-red-700 block">過累警訊（需更多安撫）：</strong>
                      抓耳朵、身體弓起後仰、狂躁尖叫、摩擦臉頰大哭。
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TOOL 5: SOLID FOOD ALLERGEN TRACKER */}
        {activeTool === 'foodtracker' && (
          <div className="space-y-6 pt-2 animate-fadeIn">
            
            {/* Progress & Category Filter */}
            <div className="bg-[#F9F6F0] rounded-[28px] p-5 sm:p-6 border border-[#EBE7DF] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-serif font-bold text-[#2A2723]">
                    副食品食材探索與過敏解鎖
                  </h4>
                  <span className="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-[#D9D1C2] text-[#2A2723]">
                    已解鎖 {foodStats.passedCount} / {foodStats.total} 種 ({foodStats.percent}%)
                  </span>
                </div>
                <p className="text-xs text-[#6B6457] mt-1 font-sans">
                  建議 4~6 個月開始引入副食品，每次單一食材少量嘗試，連續觀察 3 天無過敏再換下一種。
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: '全部食材' },
                  { id: 'grains', label: '五穀根莖' },
                  { id: 'vegetables', label: '蔬菜類' },
                  { id: 'fruits', label: '水果類' },
                  { id: 'proteins', label: '肉品蛋類' },
                  { id: 'allergens', label: '常見高致敏' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFoodCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all ${
                      foodCategoryFilter === cat.id
                        ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
                        : 'bg-white text-[#6B6457] border border-[#D9D1C2] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map((food) => {
                const currentStatus = foodTrialStatuses[food.id] || 'untried';
                
                let statusBadge = {
                  label: '尚未嘗試',
                  color: 'bg-[#F2EDE4] text-[#8C8475] border-[#D9D1C2]',
                };
                if (currentStatus === 'trying') {
                  statusBadge = {
                    label: '嘗試觀察中 (第 1~3 天)',
                    color: 'bg-amber-50 text-amber-800 border-amber-200',
                  };
                } else if (currentStatus === 'passed') {
                  statusBadge = {
                    label: '已解鎖安全食材',
                    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  };
                } else if (currentStatus === 'allergic') {
                  statusBadge = {
                    label: '疑似過敏 (先暫停)',
                    color: 'bg-red-50 text-red-800 border-red-200',
                  };
                }

                return (
                  <div
                    key={food.id}
                    className={`bg-white rounded-[24px] p-5 border transition-all flex flex-col justify-between ${
                      currentStatus === 'passed' ? 'border-emerald-200 bg-emerald-50/10' :
                      currentStatus === 'trying' ? 'border-amber-200 bg-amber-50/10' :
                      currentStatus === 'allergic' ? 'border-red-200 bg-red-50/10' : 'border-[#EBE7DF]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="text-base font-serif font-bold text-[#2A2723]">
                          {food.name}
                        </h5>
                        <span className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full border font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#8C8475] font-sans mb-2">
                        <span>建議月齡：<strong>滿 {food.recommendedAgeMonths} 個月</strong></span>
                        <span>•</span>
                        <span className={food.allergenRisk === 'high' ? 'text-amber-700 font-bold' : ''}>
                          致敏風險：{food.allergenRisk === 'high' ? '高 (及早少量)' : food.allergenRisk === 'medium' ? '中' : '低'}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B6457] font-sans leading-relaxed bg-[#F9F6F0] p-2.5 rounded-xl border border-[#EBE7DF]">
                        👩‍🍳 <strong className="text-[#2A2723]">料理要點：</strong>{food.prepTips}
                      </p>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-[#F2EDE4] grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateFoodStatus(food.id, 'trying')}
                        className={`py-1.5 rounded-lg text-[11px] font-sans border transition-all ${
                          currentStatus === 'trying'
                            ? 'bg-amber-600 text-white border-amber-600 font-bold'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-amber-50'
                        }`}
                      >
                        🟡 觀察中
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateFoodStatus(food.id, 'passed')}
                        className={`py-1.5 rounded-lg text-[11px] font-sans border transition-all ${
                          currentStatus === 'passed'
                            ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-emerald-50'
                        }`}
                      >
                        🟢 過關安全
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateFoodStatus(food.id, 'allergic')}
                        className={`py-1.5 rounded-lg text-[11px] font-sans border transition-all ${
                          currentStatus === 'allergic'
                            ? 'bg-red-700 text-white border-red-700 font-bold'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-red-50'
                        }`}
                      >
                        🔴 疑似過敏
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
