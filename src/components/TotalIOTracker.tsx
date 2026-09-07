import React, { useState, useMemo } from 'react';
import { 
  BabyProfile, 
  GrowthRecord, 
  DiaryEntry 
} from '../types';
import { 
  calculateDailyIO, 
  DailyIOSummary,
  isIOEntry,
  getIOEntryDetail
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
  RotateCcw,
  Search,
  X,
  Trash2,
  CalendarDays,
  ListFilter,
  Check,
  Layers,
  Baby,
  FileSpreadsheet,
  Edit3
} from 'lucide-react';
import { IORangeExportModal } from './IORangeExportModal';

interface TotalIOTrackerProps {
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  diaryEntries: DiaryEntry[];
  onAddDiaryEntry?: (entry: DiaryEntry) => void;
  onEditDiaryEntry?: (entry: DiaryEntry) => void;
  onDeleteDiaryEntry?: (id: string) => void;
  onQuickLogCategory?: (category: any) => void;
  onOpenPediatricReport?: (days?: number) => void;
}

export const TotalIOTracker: React.FC<TotalIOTrackerProps> = ({
  babyProfile,
  growthRecords,
  diaryEntries,
  onAddDiaryEntry,
  onEditDiaryEntry,
  onDeleteDiaryEntry,
  onQuickLogCategory,
  onOpenPediatricReport,
}) => {
  // Current selected date for calendar tracking (default: today YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Active view tab: 'day' for selected day analysis & details, 'all' for all I/O records history
  const [activeViewMode, setActiveViewMode] = useState<'day' | 'all'>('day');

  // Modal for range export and print
  const [isRangeExportOpen, setIsRangeExportOpen] = useState(false);

  // Filter & Search inside "All I/O records" tab
  const [allSearchQuery, setAllSearchQuery] = useState<string>('');
  const [allTypeFilter, setAllTypeFilter] = useState<'all' | 'intake' | 'output' | 'vomit'>('all');
  
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
  const [quickFeedingType, setQuickFeedingType] = useState<'formula' | 'breast' | 'water'>('formula');
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

  // All entries that belong to the selected day
  const selectedDayEntries = useMemo(() => {
    return diaryEntries
      .filter((e) => e.date === selectedDate && isIOEntry(e))
      .sort((a, b) => (b.time || '12:00').localeCompare(a.time || '12:00'));
  }, [diaryEntries, selectedDate]);

  // ALL I/O entries across history in Firebase/local data
  const allIOEntries = useMemo(() => {
    return diaryEntries
      .filter(isIOEntry)
      .sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time || '12:00'}`).getTime();
        const timeB = new Date(`${b.date}T${b.time || '12:00'}`).getTime();
        return timeB - timeA;
      });
  }, [diaryEntries]);

  // Filtered entries for "All I/O Records" tab
  const filteredAllIOEntries = useMemo(() => {
    return allIOEntries.filter((entry) => {
      const detail = getIOEntryDetail(entry);

      // Type filter
      if (allTypeFilter === 'intake' && detail.kind === 'output') return false;
      if (allTypeFilter === 'output' && detail.kind === 'intake') return false;
      if (allTypeFilter === 'vomit' && !entry.metrics?.vomitSeverity && !entry.metrics?.vomitMl) return false;

      // Keyword search
      if (allSearchQuery.trim()) {
        const q = allSearchQuery.trim().toLowerCase();
        const matches = 
          entry.title.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          entry.date.includes(q) ||
          (entry.author && entry.author.toLowerCase().includes(q)) ||
          detail.summaryText.toLowerCase().includes(q) ||
          detail.badgeLabel.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allIOEntries, allTypeFilter, allSearchQuery]);

  // Historical overall statistics across all data
  const overallHistoryStats = useMemo(() => {
    let totalIntake = 0;
    let totalOutput = 0;
    let totalFeedings = 0;
    let totalDiapers = 0;
    let totalVomits = 0;
    const distinctDates = new Set<string>();

    allIOEntries.forEach((e) => {
      distinctDates.add(e.date);
      const detail = getIOEntryDetail(e);
      totalIntake += detail.intakeMl;
      totalOutput += detail.outputMl;
      if (detail.intakeMl > 0) totalFeedings += 1;
      if (e.category === 'diaper' || e.metrics?.diaperType) totalDiapers += 1;
      if (e.metrics?.vomitSeverity || e.metrics?.vomitMl) totalVomits += 1;
    });

    return {
      daysCount: distinctDates.size,
      totalIntake,
      totalOutput,
      totalFeedings,
      totalDiapers,
      totalVomits,
    };
  }, [allIOEntries]);

  // Recent 14-days calendar navigation pills
  const calendarDays = useMemo(() => {
    const list: { dateStr: string; label: string; weekday: string; hasRecords: boolean; intakeMl: number; isToday: boolean }[] = [];
    const baseDate = new Date();
    
    // Generate 13 days before today up to today (or tomorrow)
    for (let i = 13; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekday = weekdays[d.getDay()];

      const dayIO = calculateDailyIO(diaryEntries, dateStr, activeWeight);
      const hasRecords = dayIO.feedingsCount > 0 || dayIO.totalDiaperCount > 0 || dayIO.vomitCount > 0;

      list.push({
        dateStr,
        label: `${month}/${day}`,
        weekday,
        hasRecords,
        intakeMl: dayIO.totalIntakeMl,
        isToday: dateStr === todayStr,
      });
    }

    return list;
  }, [diaryEntries, activeWeight, todayStr]);

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
    setSelectedDate(todayStr);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === todayStr;

  // Quick Log Submit
  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddDiaryEntry) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = `diary_quick_io_${Date.now()}`;

    if (quickType === 'feeding') {
      const typeLabel = quickFeedingType === 'breast' ? '母乳' : quickFeedingType === 'water' ? '溫開水' : '配方奶';
      const newEntry: DiaryEntry = {
        id,
        date: selectedDate,
        time: timeStr,
        title: `I/O 紀錄：喝奶 ${quickAmount} ml (${typeLabel})`,
        content: `於 ${timeStr} 攝取 ${typeLabel} ${quickAmount} ml。`,
        category: 'feeding',
        mood: 'happy',
        metrics: {
          feedingType: quickFeedingType,
          feedingAmountMl: quickFeedingType !== 'water' ? quickAmount : undefined,
          waterAmountMl: quickFeedingType === 'water' ? quickAmount : undefined,
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
        title: `I/O 紀錄：換尿布 (${quickDiaperKind === 'wet' ? '純尿尿' : quickDiaperKind === 'dirty' ? '大便' : '尿尿+大便'})`,
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
    } else if (quickType === 'vomit') {
      const newEntry: DiaryEntry = {
        id,
        date: selectedDate,
        time: timeStr,
        title: `I/O 紀錄：溢奶/吐奶`,
        content: `於 ${timeStr} 溢吐奶約 15 ml。`,
        category: 'io',
        mood: 'fussy',
        metrics: {
          vomitSeverity: 'spit_up',
          vomitMl: 15,
        },
        author: '照護者',
      };
      onAddDiaryEntry(newEntry);
    }

    setIsQuickLogging(false);
  };

  // Direct fast-log preset
  const handleFastAddIntake = (amount: number) => {
    if (!onAddDiaryEntry) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: DiaryEntry = {
      id: `diary_io_fast_${Date.now()}`,
      date: selectedDate,
      time: timeStr,
      title: `喝奶 ${amount} ml`,
      content: `於 ${timeStr} 攝取配方奶/母乳 ${amount} ml。`,
      category: 'feeding',
      mood: 'happy',
      metrics: {
        feedingType: 'formula',
        feedingAmountMl: amount,
      },
      author: '照護者',
    };
    onAddDiaryEntry(newEntry);
  };

  const handleFastAddDiaper = (kind: 'wet' | 'dirty' | 'both', level: 'light' | 'medium' | 'heavy') => {
    if (!onAddDiaryEntry) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const levelMl = level === 'light' ? 30 : level === 'medium' ? 60 : 100;
    const newEntry: DiaryEntry = {
      id: `diary_io_fast_${Date.now()}`,
      date: selectedDate,
      time: timeStr,
      title: `換尿布 (${kind === 'wet' ? '純尿尿' : kind === 'dirty' ? '排便' : '尿+便'})`,
      content: `濕度等級：${level === 'light' ? '輕度' : level === 'medium' ? '中度' : '重尿布'} (~${levelMl}ml)`,
      category: 'diaper',
      mood: 'calm',
      metrics: {
        diaperType: kind,
        diaperWetnessLevel: level,
        urineAmountMl: levelMl,
      },
      author: '照護者',
    };
    onAddDiaryEntry(newEntry);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Calendar Date Switcher Bar */}
      <div className="bg-white border border-[#EBE7DF] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="p-2 sm:p-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#2A2723] flex items-center gap-2 flex-wrap">
                  <span>Total I/O 水分與排泄臨床監測</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[#8C8475] font-sans mt-0.5">
                  自動統計當日 24h Total Intake & Output、每小時排尿率與脫水風險評估
                </p>
              </div>
            </div>
          </div>

          {/* Primary View Mode Switcher & Range Export Button */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1 sm:gap-2 bg-[#F2EDE4] p-1 rounded-full border border-[#D9D1C2] flex-1 sm:flex-initial">
              <button
                onClick={() => setActiveViewMode('day')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-sans transition-all ${
                  activeViewMode === 'day'
                    ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
                    : 'text-[#6B6457] hover:text-[#2A2723]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>當日日曆分析</span>
              </button>
              <button
                onClick={() => setActiveViewMode('all')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-sans transition-all ${
                  activeViewMode === 'all'
                    ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
                    : 'text-[#6B6457] hover:text-[#2A2723]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>全部記錄 ({allIOEntries.length})</span>
              </button>
            </div>

            {/* Range Export & Print Trigger Button */}
            <button
              type="button"
              onClick={() => setIsRangeExportOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-sans font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-all shadow-xs shrink-0"
              title="選擇常用區間 (一週/三週/一個月/三個月/半年) 並匯出 Excel (.xlsx) 或列印"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              <span>區間匯出與列印</span>
            </button>
          </div>
        </div>

        {/* CALENDAR SEARCH & DATE CONTROLS */}
        <div className="pt-3 border-t border-[#F2EDE4] flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Direct Date Picker with HTML input date */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-[#D9D1C2] text-xs font-sans text-[#2A2723]">
              <CalendarDays className="w-4 h-4 text-[#8C8475]" />
              <span className="font-medium text-[#6B6457]">日曆搜索：</span>
              <input
                id="io-calendar-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="bg-transparent font-mono font-bold text-[#2A2723] outline-none cursor-pointer text-xs"
              />
            </div>

            {/* Quick date jump buttons */}
            <button
              onClick={handlePrevDay}
              className="w-8 h-8 rounded-full bg-white text-[#4A453E] border border-[#D9D1C2] hover:bg-[#F2EDE4] flex items-center justify-center transition-colors shadow-2xs"
              title="前一天"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleNextDay}
              className="w-8 h-8 rounded-full bg-white text-[#4A453E] border border-[#D9D1C2] hover:bg-[#F2EDE4] flex items-center justify-center transition-colors shadow-2xs"
              title="後一天"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSetYesterday}
              className={`px-3 py-1.5 text-xs font-sans rounded-full border transition-all ${
                selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                  ? 'bg-[#2A2723] text-white border-[#2A2723]'
                  : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#F2EDE4]'
              }`}
            >
              昨日
            </button>

            <button
              onClick={handleSetToday}
              className={`px-3 py-1.5 text-xs font-sans rounded-full border transition-all ${
                isToday
                  ? 'bg-[#2A2723] text-white border-[#2A2723] font-bold'
                  : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#F2EDE4]'
              }`}
            >
              今天 (Today)
            </button>
          </div>

          {/* Current selected date display & weight indicator */}
          <div className="flex items-center gap-3 text-xs font-sans text-[#6B6457]">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-sm text-[#2A2723]">{selectedDate}</span>
              <span className="text-[11px] text-[#8C8475]">({isToday ? '今日即時' : '歷史檔案'})</span>
            </div>
            <div className="flex items-center gap-1 pl-3 border-l border-[#EBE7DF]">
              <Scale className="w-3.5 h-3.5 text-[#8C8475]" />
              <span>體重：</span>
              <span className="font-mono font-bold text-[#2A2723]">{activeWeight} kg</span>
            </div>
          </div>

        </div>

        {/* 14-DAY CALENDAR NAVIGATION STRIP */}
        <div className="pt-2 border-t border-[#F2EDE4]">
          <div className="text-[11px] text-[#8C8475] font-sans mb-2 flex items-center justify-between">
            <span>最近日曆排程快捷列（點擊任一日快速切換）：</span>
            <span className="text-[10px] text-sky-700">● 藍點代表該日有 I/O 記錄</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {calendarDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex flex-col items-center min-w-[56px] py-2 px-2.5 rounded-2xl border transition-all duration-200 text-center shrink-0 ${
                    isSelected
                      ? 'bg-[#2A2723] text-white border-[#2A2723] shadow-xs scale-[1.03]'
                      : 'bg-[#FAF8F5] text-[#4A453E] border-[#EBE7DF] hover:bg-[#F2EDE4]'
                  }`}
                >
                  <span className="text-[10px] font-sans opacity-75">週{day.weekday}</span>
                  <span className="text-xs font-mono font-bold my-0.5">{day.label}</span>
                  <div className="flex items-center gap-1 h-3">
                    {day.hasRecords && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-300' : 'bg-sky-600'}`} />
                    )}
                    {day.isToday && (
                      <span className={`text-[9px] font-sans ${isSelected ? 'text-amber-200' : 'text-amber-700'} font-bold`}>
                        今
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* VIEW MODE 1: SELECTED DAY ANALYSIS & DETAILS */}
      {activeViewMode === 'day' && (
        <>
          {/* Main Big 3 Indicator Metric Cards (Auto calculated for selectedDate) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            
            {/* Card 1: Total Intake (I) */}
            <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 space-y-3 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 flex items-center gap-1.5">
                  <Milk className="w-3.5 h-3.5" />
                  <span>Total Intake (24h 總攝入)</span>
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

              <div className="text-[11px] text-[#8C8475] pt-1 flex justify-between border-t border-[#F2EDE4] flex-wrap gap-1">
                <span>配方奶: {ioSummary.intakeBreakdown.formulaMilkMl}ml</span>
                <span>母乳: {ioSummary.intakeBreakdown.breastMilkMl}ml</span>
                <span>溫水: {ioSummary.intakeBreakdown.waterMl}ml</span>
              </div>
            </div>

            {/* Card 2: Total Output (O) */}
            <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 space-y-3 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Total Output (24h 總排出)</span>
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

              <div className="text-[11px] text-[#8C8475] pt-1 flex justify-between border-t border-[#F2EDE4] flex-wrap gap-1">
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
                兒科臨床標準: &gt; 1.0 ~ 2.0 ml/kg/hr 代表排尿代謝充足
              </div>
            </div>

          </div>

          {/* Quick Action Logging Strip */}
          {onAddDiaryEntry && (
            <div className="bg-[#FAF8F5] border border-[#EBE7DF] rounded-[28px] p-4 sm:p-5 font-sans space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>快速記錄至 {selectedDate} (喝奶・尿布・吐奶)</span>
                </span>
                <button
                  onClick={() => setIsQuickLogging(!isQuickLogging)}
                  className="text-xs font-medium text-[#2A2723] hover:underline"
                >
                  {isQuickLogging ? '收起快速記錄' : '展開自訂記錄面板 ▾'}
                </button>
              </div>

              {/* Fast 1-click Preset Bar */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-[#8C8475]">一鍵速記：</span>
                <button
                  type="button"
                  onClick={() => handleFastAddIntake(120)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans bg-white border border-[#D9D1C2] hover:bg-sky-50 hover:border-sky-300 text-sky-900 transition-all shadow-2xs"
                >
                  + 喝奶 120ml
                </button>
                <button
                  type="button"
                  onClick={() => handleFastAddIntake(150)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans bg-white border border-[#D9D1C2] hover:bg-sky-50 hover:border-sky-300 text-sky-900 transition-all shadow-2xs"
                >
                  + 喝奶 150ml
                </button>
                <button
                  type="button"
                  onClick={() => handleFastAddIntake(180)}
                  className="px-3 py-1.5 rounded-full text-xs font-sans bg-white border border-[#D9D1C2] hover:bg-sky-50 hover:border-sky-300 text-sky-900 transition-all shadow-2xs"
                >
                  + 喝奶 180ml
                </button>
                <button
                  type="button"
                  onClick={() => handleFastAddDiaper('wet', 'medium')}
                  className="px-3 py-1.5 rounded-full text-xs font-sans bg-white border border-[#D9D1C2] hover:bg-amber-50 hover:border-amber-300 text-amber-900 transition-all shadow-2xs"
                >
                  + 純尿尿 (中度 ~60ml)
                </button>
                <button
                  type="button"
                  onClick={() => handleFastAddDiaper('both', 'medium')}
                  className="px-3 py-1.5 rounded-full text-xs font-sans bg-white border border-[#D9D1C2] hover:bg-amber-50 hover:border-amber-300 text-amber-900 transition-all shadow-2xs"
                >
                  + 尿尿+大便
                </button>
              </div>

              {/* Full Expandable Form */}
              {isQuickLogging && (
                <form onSubmit={handleQuickLogSubmit} className="space-y-4 pt-3 border-t border-[#EBE7DF]">
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
                    <button
                      type="button"
                      onClick={() => setQuickType('vomit')}
                      className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
                        quickType === 'vomit' ? 'bg-[#2A2723] text-white shadow-xs' : 'bg-white text-[#6B6457] border border-[#D1CEC4]'
                      }`}
                    >
                      🤮 溢奶/吐奶
                    </button>
                  </div>

                  {quickType === 'feeding' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[#6B6457]">飲食品類：</label>
                        <div className="flex gap-2">
                          {[
                            { id: 'formula', label: '配方奶' },
                            { id: 'breast', label: '母乳' },
                            { id: 'water', label: '溫開水' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setQuickFeedingType(t.id as any)}
                              className={`px-3 py-1 rounded-xl text-xs font-medium ${
                                quickFeedingType === t.id ? 'bg-sky-800 text-white' : 'bg-white text-[#2A2723] border border-[#D1CEC4]'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-[#6B6457]">選擇份量 (ml)：</label>
                        <div className="grid grid-cols-6 gap-2">
                          {[60, 90, 120, 150, 180, 210].map((ml) => (
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
                        <label className="text-xs text-[#6B6457]">尿布份量：</label>
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
                    className="w-full py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-white text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>儲存此筆至 {selectedDate}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SELECTED DAY I/O RECORDS LIST SECTION */}
          <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F2EDE4]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#2A2723] flex items-center gap-2">
                  <span>{selectedDate} 當日 I/O 明細條目清單</span>
                  <span className="text-xs font-mono font-normal text-[#8C8475]">
                    (共 {selectedDayEntries.length} 筆紀錄)
                  </span>
                </h3>
                <p className="text-xs text-[#8C8475]">
                  自動計入當日 Total Intake 與 Total Output 統計
                </p>
              </div>

              <div className="text-xs font-mono text-[#6B6457]">
                Intake: <strong className="text-sky-900 font-bold">+{ioSummary.totalIntakeMl}ml</strong> / Output: <strong className="text-amber-900 font-bold">-{ioSummary.totalOutputMl}ml</strong>
              </div>
            </div>

            {selectedDayEntries.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F5] rounded-[24px] border border-dashed border-[#D9D1C2] space-y-3">
                <Droplets className="w-8 h-8 text-[#C2BCAE] mx-auto" />
                <div className="text-sm font-serif font-bold text-[#2A2723]">
                  {selectedDate} 尚無任何 I/O 紀錄
                </div>
                <p className="text-xs text-[#8C8475] max-w-md mx-auto">
                  可使用上方的「一鍵速記」按鈕，快速填寫寶寶在此日期的餵奶量或尿布更換紀錄。
                </p>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => handleFastAddIntake(120)}
                    className="px-4 py-1.5 rounded-full text-xs font-sans bg-[#2A2723] text-white hover:bg-[#3D3833]"
                  >
                    + 記一筆 120ml 喝奶
                  </button>
                  <button
                    onClick={() => handleFastAddDiaper('wet', 'medium')}
                    className="px-4 py-1.5 rounded-full text-xs font-sans bg-amber-700 text-white hover:bg-amber-800"
                  >
                    + 記一次換尿布
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEntries.map((entry) => {
                  const detail = getIOEntryDetail(entry);
                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 sm:p-4 rounded-[22px] bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#D1CEC4] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl shrink-0 ${
                          detail.kind === 'intake' 
                            ? 'bg-sky-100 text-sky-800' 
                            : detail.kind === 'output' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {detail.kind === 'intake' ? (
                            <Milk className="w-4 h-4" />
                          ) : (
                            <Droplets className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-[#2A2723] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8C8475]" />
                              {entry.time || '12:00'}
                            </span>
                            <span className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full border ${detail.badgeColor}`}>
                              {detail.badgeLabel}
                            </span>
                            <span className="text-xs font-serif font-bold text-[#2A2723]">
                              {entry.title}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#6B6457] mt-0.5">
                            {entry.content}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBE7DF]">
                        <span className="text-xs font-mono font-bold text-[#2A2723] bg-white px-2.5 py-1 rounded-xl border border-[#E0DBD1]">
                          {detail.summaryText}
                        </span>

                        {onEditDiaryEntry && (
                          <button
                            type="button"
                            onClick={() => onEditDiaryEntry(entry)}
                            className="p-1.5 rounded-lg text-[#6B6457] hover:text-[#2A2723] hover:bg-[#EBE7DF] transition-colors"
                            title="編輯此筆 I/O 記錄"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onDeleteDiaryEntry && (
                          <button
                            onClick={() => {
                              if (window.confirm('確定要刪除此筆 I/O 記錄嗎？')) {
                                onDeleteDiaryEntry(entry.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#A69D8D] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="刪除紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 24-Hour 4 Time-Blocks Timeline Distribution */}
          <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8C8475]" />
                <span>24小時時段水分進出分佈 (Intake vs Output)</span>
              </span>
              <span className="text-[11px] text-[#8C8475]">時段平衡評估</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(ioSummary.timeBlocks).map(([key, block]) => {
                const balance = block.intake - block.output;
                return (
                  <div key={key} className="p-3.5 bg-[#FAF8F5] rounded-[22px] border border-[#EBE7DF] space-y-2">
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
                  觀察寶寶外觀、囟門與尿布，輔助判斷水分攝取是否充足
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
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] flex items-center gap-2 text-[#6B6457]">
                <Info className="w-4 h-4 text-sky-700 shrink-0" />
                <span className="text-[11px]">點擊任一項目可手動切換檢查狀態，提供小兒科醫師判讀參考。</span>
              </div>

            </div>
          </div>
        </>
      )}

      {/* VIEW MODE 2: ALL I/O RECORDS DATABASE OVERVIEW (所有 I/O 記錄) */}
      {activeViewMode === 'all' && (
        <div className="space-y-6">
          
          {/* Historical Overview Banner */}
          <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs font-sans space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2EDE4]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#2A2723] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-700" />
                  <span>全部 I/O 歷程資料庫總覽</span>
                </h3>
                <p className="text-xs text-[#8C8475] mt-0.5">
                  已同步儲存於 Firebase Firestore 雲端，跨日期彙整所有餵奶與換尿布紀錄
                </p>
              </div>

              <div className="text-xs text-[#6B6457] font-mono">
                累計記錄 <strong className="text-[#2A2723] font-bold">{overallHistoryStats.daysCount}</strong> 天 / 共 <strong className="text-[#2A2723] font-bold">{allIOEntries.length}</strong> 筆
              </div>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
                <div className="text-[#6B6457] text-[11px]">累計進食次數</div>
                <div className="text-xl font-mono font-bold text-sky-950 mt-1">{overallHistoryStats.totalFeedings} 次</div>
                <div className="text-[10px] text-sky-800 mt-0.5">總奶量: {overallHistoryStats.totalIntake} ml</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="text-[#6B6457] text-[11px]">累計換尿布</div>
                <div className="text-xl font-mono font-bold text-amber-950 mt-1">{overallHistoryStats.totalDiapers} 片</div>
                <div className="text-[10px] text-amber-800 mt-0.5">排出估算: {overallHistoryStats.totalOutput} ml</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                <div className="text-[#6B6457] text-[11px]">累計溢吐奶</div>
                <div className="text-xl font-mono font-bold text-rose-950 mt-1">{overallHistoryStats.totalVomits} 次</div>
                <div className="text-[10px] text-rose-800 mt-0.5">需注意反覆噴射嘔吐</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="text-[#6B6457] text-[11px]">雲端備份狀態</div>
                <div className="text-xl font-serif font-bold text-emerald-950 mt-1">即時同步</div>
                <div className="text-[10px] text-emerald-800 mt-0.5">雙向即時推播連線中</div>
              </div>
            </div>

            {/* Filter & Search Bar for All Records */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C8475] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={allSearchQuery}
                  onChange={(e) => setAllSearchQuery(e.target.value)}
                  placeholder="搜尋所有 I/O 記錄（例：150、母乳、配方奶、便便、日期...）"
                  className="w-full pl-10 pr-8 py-2 bg-[#FAF8F5] rounded-full border border-[#D9D1C2] focus:border-[#2A2723] text-xs font-sans text-[#2A2723] outline-none shadow-2xs"
                />
                {allSearchQuery && (
                  <button
                    onClick={() => setAllSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8475] hover:text-[#2A2723]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'intake', label: '🍼 喝奶攝入' },
                  { id: 'output', label: '🧷 換尿布' },
                  { id: 'vomit', label: '🤮 溢吐奶' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAllTypeFilter(item.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
                      allTypeFilter === item.id
                        ? 'bg-[#2A2723] text-white font-bold shadow-2xs'
                        : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* List of Filtered Historical Records */}
          <div className="space-y-4">
            {filteredAllIOEntries.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-[#EBE7DF] shadow-xs space-y-3">
                <Droplets className="w-10 h-10 text-[#C2BCAE] mx-auto" />
                <h4 className="text-base font-serif font-bold text-[#2A2723]">
                  {allSearchQuery ? `未找到符合「${allSearchQuery}」的 I/O 記錄` : '尚無符合條件的 I/O 記錄'}
                </h4>
                <p className="text-xs text-[#8C8475] max-w-sm mx-auto font-sans">
                  可清除篩選條件，或使用「當日日曆分析」快速記錄寶寶的喝奶與尿布數據。
                </p>
                {allSearchQuery && (
                  <button
                    onClick={() => setAllSearchQuery('')}
                    className="mt-2 px-4 py-1.5 rounded-full bg-[#F2EDE4] text-xs font-sans hover:bg-[#E6DFD1]"
                  >
                    清除關鍵字搜尋
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#EBE7DF] rounded-[32px] p-5 sm:p-6 shadow-xs space-y-4 font-sans">
                <div className="flex items-center justify-between text-xs text-[#8C8475] pb-2 border-b border-[#F2EDE4]">
                  <span>共顯示 {filteredAllIOEntries.length} 筆 I/O 歷程紀錄（由新到舊排序）</span>
                  <span>點擊「分析當日」可直接跳轉至該日日曆</span>
                </div>

                <div className="space-y-3">
                  {filteredAllIOEntries.map((entry) => {
                    const detail = getIOEntryDetail(entry);
                    return (
                      <div
                        key={entry.id}
                        className="p-3.5 sm:p-4 rounded-[22px] bg-[#FAF8F5] border border-[#EBE7DF] hover:border-[#D1CEC4] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-2xl shrink-0 ${
                            detail.kind === 'intake' 
                              ? 'bg-sky-100 text-sky-800' 
                              : detail.kind === 'output' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {detail.kind === 'intake' ? (
                              <Milk className="w-4 h-4" />
                            ) : (
                              <Droplets className="w-4 h-4" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-[#2A2723] bg-white px-2.5 py-0.5 rounded-lg border border-[#E0DBD1]">
                                {entry.date} {entry.time || '12:00'}
                              </span>
                              <span className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full border ${detail.badgeColor}`}>
                                {detail.badgeLabel}
                              </span>
                              <span className="text-xs font-serif font-bold text-[#2A2723]">
                                {entry.title}
                              </span>
                            </div>

                            <div className="text-[11px] text-[#6B6457] mt-0.5">
                              {entry.content}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBE7DF]">
                          <span className="text-xs font-mono font-bold text-[#2A2723] bg-white px-2.5 py-1 rounded-xl border border-[#E0DBD1]">
                            {detail.summaryText}
                          </span>

                          {/* Jump to this day button */}
                          <button
                            onClick={() => {
                              setSelectedDate(entry.date);
                              setActiveViewMode('day');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-sans bg-[#F2EDE4] hover:bg-[#E6DFD1] text-[#2A2723] transition-colors flex items-center gap-1"
                            title="跳轉至該日進行 24h 日曆統計"
                          >
                            <Calendar className="w-3 h-3 text-sky-700" />
                            <span>日曆分析</span>
                          </button>

                          {onEditDiaryEntry && (
                            <button
                              type="button"
                              onClick={() => onEditDiaryEntry(entry)}
                              className="p-1.5 rounded-lg text-[#6B6457] hover:text-[#2A2723] hover:bg-[#EBE7DF] transition-colors"
                              title="編輯此筆 I/O 記錄"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteDiaryEntry && (
                            <button
                              onClick={() => {
                                if (window.confirm('確定要刪除此筆 I/O 記錄嗎？')) {
                                  onDeleteDiaryEntry(entry.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#A69D8D] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="刪除紀錄"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Range Export & Print Modal */}
      <IORangeExportModal
        isOpen={isRangeExportOpen}
        onClose={() => setIsRangeExportOpen(false)}
        babyProfile={babyProfile}
        growthRecords={growthRecords}
        diaryEntries={diaryEntries}
        onOpenClinicalReportWithRange={(days) => {
          setIsRangeExportOpen(false);
          if (onOpenPediatricReport) {
            onOpenPediatricReport(days);
          }
        }}
      />

    </div>
  );
};
