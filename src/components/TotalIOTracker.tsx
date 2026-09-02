import React, { useState, useMemo } from 'react';
import { 
  BabyProfile, 
  GrowthRecord, 
  DiaryEntry 
} from '../types';
import { 
  calculateDailyIO, 
  DailyIOSummary 
} from '../utils/ioCalculator';
import { 
  Milk, 
  Droplets, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Sparkles, 
  Heart, 
  Info,
  Scale,
  Smile,
  Frown,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface TotalIOTrackerProps {
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  diaryEntries: DiaryEntry[];
  onAddDiaryEntry?: (entry: DiaryEntry) => void;
  onQuickLogCategory?: (category: any) => void;
}

export const TotalIOTracker: React.FC<TotalIOTrackerProps> = ({
  babyProfile,
  growthRecords,
  diaryEntries,
  onAddDiaryEntry,
  onQuickLogCategory,
}) => {
  // Current selected date (default: today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  // Custom manual weight override or default latest weight
  const latestWeight = useMemo(() => {
    if (growthRecords.length > 0) {
      const sorted = [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sorted[0].weight;
    }
    return babyProfile.birthWeight > 0 ? babyProfile.birthWeight : 4.5;
  }, [growthRecords, babyProfile.birthWeight]);

  const [activeWeight, setActiveWeight] = useState<number>(latestWeight);

  // Quick logging states
  const [isQuickLogging, setIsQuickLogging] = useState(false);
  const [quickType, setQuickType] = useState<'feeding' | 'diaper' | 'vomit'>('feeding');
  const [quickAmount, setQuickAmount] = useState<number>(120);
  const [quickDiaperLevel, setQuickDiaperLevel] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [quickDiaperKind, setQuickDiaperKind] = useState<'wet' | 'dirty' | 'both'>('wet');

  // Dehydration Physical Check states
  const [dehydrationChecks, setDehydrationChecks] = useState({
    fontanelle: true, // true = normal/flat, false = sunken
    tears: true, // true = tears present, false = no tears
    mouth: true, // true = moist, false = dry
    skinTurgor: true, // true = elastic, false = tenting
    alertness: true, // true = active, false = lethargic
  });

  // Calculate Daily I/O for selected date
  const ioSummary: DailyIOSummary = useMemo(() => {
    return calculateDailyIO(diaryEntries, selectedDate, activeWeight);
  }, [diaryEntries, selectedDate, activeWeight]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Quick Log Submit
  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddDiaryEntry) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `diary_quick_io_${Date.now()}`;

    if (quickType === 'feeding') {
      const newEntry: DiaryEntry = {
        id,
        date: selectedDate,
        time: timeStr,
        title: `快速記錄：喝奶 ${quickAmount} ml`,
        content: `於 ${timeStr} 攝取配方奶/母乳 ${quickAmount} ml。`,
        category: 'feeding',
        mood: 'happy',
        metrics: {
          feedingType: 'formula',
          feedingAmountMl: quickAmount,
        },
        author: '照護者',
      };
      onAddDiaryEntry(newEntry);
    } else if (quickType === 'diaper') {
      const levelMl = quickDiaperLevel === 'light' ? 30 : quickDiaperLevel === 'medium' ? 60 : 100;
      const newEntry: DiaryEntry = {
        id,
        date: selectedDate,
        time: timeStr,
        title: `快速記錄：換尿布 (${quickDiaperKind === 'wet' ? '純尿尿' : quickDiaperKind === 'dirty' ? '大便' : '尿尿+大便'})`,
        content: `濕度等級：${quickDiaperLevel === 'light' ? '輕度 (~30ml)' : quickDiaperLevel === 'medium' ? '中度 (~60ml)' : '重尿布 (~100ml)'}`,
        category: 'diaper',
        mood: 'calm',
        metrics: {
          diaperType: quickDiaperKind,
          diaperWetnessLevel: quickDiaperLevel,
          urineAmountMl: levelMl,
          stoolConsistency: quickDiaperKind !== 'wet' ? 'soft' : undefined,
        },
        author: '照護者',
      };
      onAddDiaryEntry(newEntry);
    }

    setIsQuickLogging(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Date Switcher Bar */}
      <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200">
              <Droplets className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
                Total I/O 24小時水分與排泄監控
              </h2>
              <p className="text-xs text-[#8C8475] font-sans mt-0.5">
                Intake & Output 臨床液體平衡、每小時排尿率與脫水評估
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 bg-[#F2EDE4] p-1.5 rounded-full border border-[#D9D1C2]">
          <button
            onClick={handlePrevDay}
            className="w-8 h-8 rounded-full bg-white text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center transition-colors shadow-2xs"
            title="前一天"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-3 text-center">
            <div className="text-xs font-mono font-bold text-[#2A2723]">
              {selectedDate}
            </div>
            <div className="text-[10px] text-[#8C8475] font-sans">
              {isToday ? '今日即時' : '歷史記錄'}
            </div>
          </div>

          <button
            onClick={handleNextDay}
            className="w-8 h-8 rounded-full bg-white text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center transition-colors shadow-2xs"
            title="後一天"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={handleSetToday}
              className="px-2.5 py-1 text-[11px] font-sans font-medium bg-[#2A2723] text-white rounded-full hover:bg-[#3D3833] transition-colors"
            >
              回今日
            </button>
          )}
        </div>
      </div>

      {/* Main Big 3 Indicator Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        
        {/* Card 1: Total Intake (I) */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 flex items-center gap-1.5">
              <Milk className="w-3.5 h-3.5" />
              <span>Total Intake (24h 攝入)</span>
            </span>
            <span className="text-[11px] text-[#8C8475]">共 {ioSummary.feedingsCount} 次進食</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-sky-950">
              {ioSummary.totalIntakeMl}
            </span>
            <span className="text-sm font-sans text-sky-800">ml</span>
          </div>

          {/* Progress bar towards daily target */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[#6B6457]">
              <span>目標 {ioSummary.targetIntakeMinMl}~{ioSummary.targetIntakeMaxMl} ml</span>
              <span className="font-mono font-bold text-sky-900">{ioSummary.intakePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ioSummary.intakePercentage)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-[#8C8475] pt-1 flex justify-between border-t border-[#F2EDE4]">
            <span>配方奶: {ioSummary.intakeBreakdown.formulaMilkMl}ml</span>
            <span>母乳: {ioSummary.intakeBreakdown.breastMilkMl}ml</span>
            <span>水/電解水: {ioSummary.intakeBreakdown.waterMl}ml</span>
          </div>
        </div>

        {/* Card 2: Total Output (O) */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>Total Output (24h 排出)</span>
            </span>
            <span className="text-[11px] text-[#8C8475]">尿布 {ioSummary.totalDiaperCount} 片</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-950">
              {ioSummary.totalOutputMl}
            </span>
            <span className="text-sm font-sans text-amber-800">ml 估算</span>
          </div>

          {/* Details breakdown */}
          <div className="space-y-1 pt-1 text-[11px] text-[#6B6457]">
            <div className="flex justify-between">
              <span>總排尿量估算:</span>
              <span className="font-mono font-bold text-amber-900">{ioSummary.totalUrineMl} ml</span>
            </div>
            <div className="flex justify-between">
              <span>重尿布達標 (≥6片):</span>
              <span className="font-mono font-bold">{ioSummary.heavyDiaperCount} / 6 片 ({ioSummary.heavyDiaperCount >= 6 ? '✅ 充足' : '待累積'})</span>
            </div>
          </div>

          <div className="text-[11px] text-[#8C8475] pt-1 flex justify-between border-t border-[#F2EDE4]">
            <span>大便次數: {ioSummary.stoolCount} 次</span>
            <span>溢奶/嘔吐: {ioSummary.vomitCount} 次 ({ioSummary.totalVomitMl}ml)</span>
          </div>
        </div>

        {/* Card 3: Net Fluid Balance & Clinical Rate */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 space-y-3 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>淨液體平衡 & 排尿率</span>
            </span>
            <span className="text-[11px] font-mono text-[#8C8475]">體重 {activeWeight}kg</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-[#8C8475]">Net Balance (淨水份)</div>
              <div className="text-2xl font-serif font-bold text-emerald-950 flex items-center gap-1">
                {ioSummary.netFluidBalanceMl >= 0 ? '+' : ''}{ioSummary.netFluidBalanceMl} <span className="text-xs font-sans">ml</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#8C8475]">每小時尿量率</div>
              <div className="text-2xl font-mono font-bold text-emerald-700">
                {ioSummary.urineHourlyRate} <span className="text-xs font-sans text-[#6B6457]">ml/kg/hr</span>
              </div>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border text-[11px] font-sans font-medium flex items-center gap-2 ${ioSummary.hydrationStatusColor}`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{ioSummary.hydrationStatusLabel}</span>
          </div>

          <div className="text-[10px] text-[#8C8475] pt-0.5 text-center">
            臨床標準: &gt; 1.0 ~ 2.0 ml/kg/hr 為正常排尿代謝
          </div>
        </div>

      </div>

      {/* Quick Action Logging Strip */}
      {onAddDiaryEntry && (
        <div className="bg-[#F2EDE4] border border-[#D9D1C2] rounded-[28px] p-4 sm:p-5 font-sans space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>快速記錄 I/O (秒記喝奶與換尿布)</span>
            </span>
            <button
              onClick={() => setIsQuickLogging(!isQuickLogging)}
              className="text-xs font-medium text-[#2A2723] hover:underline"
            >
              {isQuickLogging ? '收起快速記錄' : '展開快速記錄面板 ▾'}
            </button>
          </div>

          {isQuickLogging && (
            <form onSubmit={handleQuickLogSubmit} className="space-y-4 pt-2 border-t border-[#D9D1C2]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickType('feeding')}
                  className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                    quickType === 'feeding' ? 'bg-[#2A2723] text-white shadow-xs' : 'bg-white text-[#6B6457] border border-[#D1CEC4]'
                  }`}
                >
                  🍼 記錄喝奶 (Intake)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickType('diaper')}
                  className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                    quickType === 'diaper' ? 'bg-[#2A2723] text-white shadow-xs' : 'bg-white text-[#6B6457] border border-[#D1CEC4]'
                  }`}
                >
                  🧷 換尿布 (Output)
                </button>
              </div>

              {quickType === 'feeding' && (
                <div className="space-y-2">
                  <label className="text-xs text-[#6B6457]">快速選擇奶量 (ml)：</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[60, 90, 120, 150, 180].map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => setQuickAmount(ml)}
                        className={`py-2 rounded-2xl text-xs font-mono font-bold transition-all ${
                          quickAmount === ml ? 'bg-sky-700 text-white' : 'bg-white text-[#2A2723] border border-[#D1CEC4]'
                        }`}
                      >
                        {ml} ml
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quickType === 'diaper' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#6B6457]">尿布內容：</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'wet', label: '純尿尿' },
                        { id: 'dirty', label: '大便' },
                        { id: 'both', label: '尿+便' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setQuickDiaperKind(item.id as any)}
                          className={`py-1.5 rounded-xl text-xs font-medium ${
                            quickDiaperKind === item.id ? 'bg-amber-700 text-white' : 'bg-white text-[#2A2723] border border-[#D1CEC4]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#6B6457]">尿布濕度/份量：</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'light', label: '輕 (~30ml)' },
                        { id: 'medium', label: '中 (~60ml)' },
                        { id: 'heavy', label: '重 (~100ml)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setQuickDiaperLevel(item.id as any)}
                          className={`py-1.5 rounded-xl text-xs font-medium ${
                            quickDiaperLevel === item.id ? 'bg-amber-700 text-white' : 'bg-white text-[#2A2723] border border-[#D1CEC4]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-white text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>儲存至今日 I/O 日記</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 24-Hour 4 Time-Blocks Timeline Distribution */}
      <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs space-y-4 font-sans">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#8C8475]" />
            <span>24小時時段水分進出分佈 (Intake vs Output)</span>
          </span>
          <span className="text-[11px] text-[#8C8475]">早中晚夜間平衡</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(ioSummary.timeBlocks).map(([key, block]) => {
            const balance = block.intake - block.output;
            return (
              <div key={key} className="p-3.5 bg-[#F9F6F0] rounded-[22px] border border-[#EBE7DF] space-y-2">
                <div className="text-xs font-bold text-[#2A2723] truncate">
                  {block.label}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-sky-800 font-medium">
                    <span>進 (Intake):</span>
                    <span className="font-mono font-bold">+{block.intake} ml</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>出 (Output):</span>
                    <span className="font-mono font-bold">-{block.output} ml</span>
                  </div>
                  <div className="flex justify-between text-[#6B6457] text-[11px] pt-1 border-t border-[#EBE7DF]">
                    <span>淨差值:</span>
                    <span className={`font-mono font-bold ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {balance >= 0 ? `+${balance}` : balance} ml
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Physical Hydration Assessment Checklist */}
      <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs space-y-4 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2A2723] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>兒科脫水物理檢查表 (Physical Dehydration Assessment)</span>
            </h3>
            <p className="text-xs text-[#8C8475] mt-0.5">
              觀察寶寶外觀與活力，判斷水分攝取是否充沛
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          
          {/* Check 1 */}
          <div 
            onClick={() => setDehydrationChecks(p => ({ ...p, fontanelle: !p.fontanelle }))}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              dehydrationChecks.fontanelle ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <div className="font-bold">1. 前囟門 (Fontanelle)</div>
              <div className="text-[11px] opacity-80">{dehydrationChecks.fontanelle ? '🟢 平坦飽滿 (正常)' : '🔴 凹陷 (疑似缺水)'}</div>
            </div>
            <CheckCircle2 className={`w-5 h-5 ${dehydrationChecks.fontanelle ? 'text-emerald-600' : 'text-rose-500'}`} />
          </div>

          {/* Check 2 */}
          <div 
            onClick={() => setDehydrationChecks(p => ({ ...p, tears: !p.tears }))}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              dehydrationChecks.tears ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <div className="font-bold">2. 哭泣眼淚 (Tears)</div>
              <div className="text-[11px] opacity-80">{dehydrationChecks.tears ? '🟢 哭泣有豐富眼淚' : '🔴 無眼淚/乾哭 (缺水)'}</div>
            </div>
            <CheckCircle2 className={`w-5 h-5 ${dehydrationChecks.tears ? 'text-emerald-600' : 'text-rose-500'}`} />
          </div>

          {/* Check 3 */}
          <div 
            onClick={() => setDehydrationChecks(p => ({ ...p, mouth: !p.mouth }))}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              dehydrationChecks.mouth ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <div className="font-bold">3. 唇舌黏膜 (Mucosa)</div>
              <div className="text-[11px] opacity-80">{dehydrationChecks.mouth ? '🟢 口唇濕潤粉嫩' : '🔴 唇乾舌燥、口水稠'}</div>
            </div>
            <CheckCircle2 className={`w-5 h-5 ${dehydrationChecks.mouth ? 'text-emerald-600' : 'text-rose-500'}`} />
          </div>

          {/* Check 4 */}
          <div 
            onClick={() => setDehydrationChecks(p => ({ ...p, skinTurgor: !p.skinTurgor }))}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              dehydrationChecks.skinTurgor ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <div className="font-bold">4. 皮膚彈性 (Skin Turgor)</div>
              <div className="text-[11px] opacity-80">{dehydrationChecks.skinTurgor ? '🟢 輕捏腹部皮膚回彈快' : '🔴 回彈慢、鬆垮'}</div>
            </div>
            <CheckCircle2 className={`w-5 h-5 ${dehydrationChecks.skinTurgor ? 'text-emerald-600' : 'text-rose-500'}`} />
          </div>

          {/* Check 5 */}
          <div 
            onClick={() => setDehydrationChecks(p => ({ ...p, alertness: !p.alertness }))}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              dehydrationChecks.alertness ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div>
              <div className="font-bold">5. 活動力與神智 (Activity)</div>
              <div className="text-[11px] opacity-80">{dehydrationChecks.alertness ? '🟢 眼神明亮、反應靈活' : '🔴 嗜睡、無力、難安撫'}</div>
            </div>
            <CheckCircle2 className={`w-5 h-5 ${dehydrationChecks.alertness ? 'text-emerald-600' : 'text-rose-500'}`} />
          </div>

          {/* Clinical Advice */}
          <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF] flex items-center gap-2 text-[#6B6457]">
            <Info className="w-4 h-4 text-sky-700 shrink-0" />
            <span className="text-[11px]">點擊任一項目可手動切換檢查狀態，協助就醫時提供醫師判讀。</span>
          </div>

        </div>
      </div>

    </div>
  );
};
