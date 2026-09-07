import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  Activity, 
  Droplets, 
  Thermometer, 
  Check, 
  Copy, 
  X, 
  Sparkles,
  Info,
  CalendarDays,
  ShieldCheck
} from 'lucide-react';
import { BabyProfile, GrowthRecord, DiaryEntry } from '../types';
import { calculateDailyIO, DailyIOSummary } from '../utils/ioCalculator';
import { exportIOAndVitalSignsXLSX, getDateRangeBounds } from '../utils/excelExporter';

interface IORangeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  diaryEntries: DiaryEntry[];
  onOpenClinicalReportWithRange?: (days: number) => void;
}

export type RangeOption = 7 | 21 | 30 | 90 | 180;

export const IORangeExportModal: React.FC<IORangeExportModalProps> = ({
  isOpen,
  onClose,
  babyProfile,
  growthRecords,
  diaryEntries,
  onOpenClinicalReportWithRange,
}) => {
  const [selectedDays, setSelectedDays] = useState<RangeOption>(7);
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Compute date bounds
  const presetBounds = getDateRangeBounds(selectedDays);
  const startDateStr = isCustomMode ? customStart : presetBounds.startStr;
  const endDateStr = isCustomMode ? customEnd : presetBounds.endStr;
  const rangeLabel = isCustomMode 
    ? `自訂區間 (${startDateStr} ~ ${endDateStr})`
    : presetBounds.label;

  // Latest weight
  const sortedGrowth = [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const babyWeight = sortedGrowth[0]?.weight || babyProfile.birthWeight || 4.5;

  // Filter Vital signs
  const filteredVitals = diaryEntries.filter((e) => {
    if (e.metrics?.temperatureC === undefined) return false;
    return e.date >= startDateStr && e.date <= endDateStr;
  });

  // Calculate daily I/O in range
  const dailySummaries = useMemo(() => {
    const list: (DailyIOSummary & { date: string })[] = [];
    const cur = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (cur <= end) {
      const dStr = cur.toISOString().split('T')[0];
      const sum = calculateDailyIO(diaryEntries, dStr, babyWeight);
      if (sum.totalIntakeMl > 0 || sum.totalOutputMl > 0 || sum.totalDiaperCount > 0) {
        list.push({ date: dStr, ...sum });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return list.reverse();
  }, [diaryEntries, startDateStr, endDateStr, babyWeight]);

  // Range aggregations
  const stats = useMemo(() => {
    const count = dailySummaries.length || 1;
    let sumIntake = 0;
    let sumOutput = 0;
    let sumDiapers = 0;
    let sumRate = 0;
    let sumBalance = 0;

    dailySummaries.forEach((d) => {
      sumIntake += d.totalIntakeMl;
      sumOutput += d.totalOutputMl;
      sumDiapers += d.totalDiaperCount;
      sumRate += d.urineHourlyRate;
      sumBalance += d.netFluidBalanceMl;
    });

    let maxTemp = 0;
    let feverCount = 0;
    filteredVitals.forEach((v) => {
      const t = v.metrics?.temperatureC || 0;
      if (t > maxTemp) maxTemp = t;
      if (t >= 38.0) feverCount++;
    });

    return {
      daysWithData: dailySummaries.length,
      avgIntake: Math.round(sumIntake / count),
      avgOutput: Math.round(sumOutput / count),
      avgDiapers: Number((sumDiapers / count).toFixed(1)),
      avgHourlyRate: Number((sumRate / count).toFixed(2)),
      avgBalance: Math.round(sumBalance / count),
      vitalsCount: filteredVitals.length,
      maxTemp,
      feverCount,
    };
  }, [dailySummaries, filteredVitals]);

  // Handle Excel Export
  const handleExportExcel = () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      exportIOAndVitalSignsXLSX(
        diaryEntries,
        babyProfile,
        growthRecords,
        isCustomMode ? Math.max(1, Math.round((new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000) + 1) : selectedDays,
        rangeLabel
      );
      setExportSuccess(`已成功產出【${rangeLabel}】之 I/O 與生命徵象 Excel (.xlsx) 檔案！`);
    } catch (err: any) {
      alert(`匯出失敗：${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle CSV Download
  const handleExportCSV = () => {
    const header = '日期,總攝入量(ml),總排出量(ml),換尿布(片),每小時排尿率(ml/kg/hr),淨水分平衡(ml),評估狀態\n';
    const rows = dailySummaries.map((d) => 
      `"${d.date}",${d.totalIntakeMl},${d.totalOutputMl},${d.totalDiaperCount},${d.urineHourlyRate},${d.netFluidBalanceMl},"${d.hydrationStatusLabel}"`
    ).join('\n');
    const content = '\uFEFF' + header + rows;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${babyProfile.name}_IO歷程_${rangeLabel.replace(/[\s\(\)~]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open Pediatric Report with this range
  const handlePrintClinicalReport = () => {
    if (onOpenClinicalReportWithRange) {
      onOpenClinicalReportWithRange(selectedDays);
      onClose();
    } else {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-2xl w-full border border-[#D9D1C2] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#2A2723] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold text-[#2A2723]">
                  區間匯出及列印：I/O 與生命徵象
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">
                  臨床數據
                </span>
              </div>
              <p className="text-xs text-[#8C8475] mt-0.5">
                選擇指定時間區間，一鍵列印醫師報告或匯出完整排版之 Excel (.xlsx) 檔案
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Export Success Message */}
        {exportSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#E6EBE6] text-[#3E4A3E] border border-[#D5DDD5] text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* TIME RANGE SELECTOR (User Requested: 一週、三週、一個月、三個月、半年) */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#8C8475]" />
              <span>請選擇常用時間區間範圍：</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-xs text-[#8C8475] hover:text-[#2A2723] underline"
            >
              {isCustomMode ? '切換為常用快捷區間' : '自訂精確日期範圍'}
            </button>
          </div>

          {/* Preset Buttons */}
          {!isCustomMode ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { days: 7 as RangeOption, label: '一週', desc: '過去 7 天' },
                { days: 21 as RangeOption, label: '三週', desc: '過去 21 天' },
                { days: 30 as RangeOption, label: '一個月', desc: '過去 30 天' },
                { days: 90 as RangeOption, label: '三個月', desc: '過去 90 天' },
                { days: 180 as RangeOption, label: '半年', desc: '過去 180 天' },
              ].map((item) => {
                const isActive = selectedDays === item.days;
                return (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setSelectedDays(item.days)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      isActive
                        ? 'bg-[#2A2723] text-white border-[#2A2723] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#6B6457] border-[#EBE7DF] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className={`text-[10px] mt-0.5 ${isActive ? 'text-gray-300' : 'text-[#8C8475]'}`}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Custom Range Inputs */
            <div className="flex items-center gap-2 flex-wrap bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE7DF]">
              <CalendarDays className="w-4 h-4 text-[#8C8475]" />
              <span className="text-xs text-[#6B6457]">起始：</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white border border-[#D9D1C2] rounded-lg px-2.5 py-1 text-xs font-mono text-[#2A2723]"
              />
              <span className="text-xs text-[#6B6457]">至 結束：</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white border border-[#D9D1C2] rounded-lg px-2.5 py-1 text-xs font-mono text-[#2A2723]"
              />
            </div>
          )}

          {/* Selected Range Summary Bar */}
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EBE7DF] flex items-center justify-between text-xs text-[#6B6457]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>當前涵蓋日期：<strong className="text-[#2A2723]">{startDateStr} 至 {endDateStr}</strong></span>
            </span>
            <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              {rangeLabel}
            </span>
          </div>
        </div>

        {/* SUMMARY STATS CARD OF SELECTED RANGE */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#4A453E] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-700" />
              <span>所選區間臨床統計預覽</span>
            </h4>
            <span className="text-[11px] text-[#8C8475]">
              記錄天數：{stats.daysWithData} 天 ｜ 計算體重：{babyWeight} kg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF]">
              <span className="text-[#8C8475] text-[11px] block">每日平均攝入量</span>
              <span className="font-mono font-bold text-base text-[#2A2723] mt-0.5 block">
                {stats.avgIntake} <span className="text-xs font-normal text-[#8C8475]">ml/day</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF]">
              <span className="text-[#8C8475] text-[11px] block">每日平均排出量</span>
              <span className="font-mono font-bold text-base text-[#2A2723] mt-0.5 block">
                {stats.avgOutput} <span className="text-xs font-normal text-[#8C8475]">ml/day</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF]">
              <span className="text-[#8C8475] text-[11px] block">每小時排尿率</span>
              <span className="font-mono font-bold text-base text-[#2A2723] mt-0.5 block">
                {stats.avgHourlyRate} <span className="text-xs font-normal text-[#8C8475]">ml/kg/h</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF]">
              <span className="text-[#8C8475] text-[11px] block">體溫測量與發燒</span>
              <span className="font-mono font-bold text-base text-[#2A2723] mt-0.5 block">
                {stats.vitalsCount} 次 <span className="text-[11px] text-red-700 font-sans">({stats.feverCount}次發燒)</span>
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS: PRINT & EXPORT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Action 1: Print Doctor's Clinical Report */}
          <button
            type="button"
            onClick={handlePrintClinicalReport}
            className="p-4 rounded-[24px] bg-[#2A2723] hover:bg-[#3D3833] text-white flex items-center justify-between transition-all group shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-white">
                <Printer className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">預覽列印醫療報告</div>
                <div className="text-[11px] text-gray-300 mt-0.5">
                  僅顯示醫師就診內容 (含 {rangeLabel} I/O & Vital Sign)
                </div>
              </div>
            </div>
          </button>

          {/* Action 2: Export Excel (.xlsx) */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="p-4 rounded-[24px] bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-between transition-all group shadow-xs active:scale-[0.99] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-white">
                <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">匯出 Excel (.xlsx) 試算表</div>
                <div className="text-[11px] text-emerald-200 mt-0.5">
                  完整排版多工作表，所有記錄一字不漏
                </div>
              </div>
            </div>
          </button>

        </div>

        {/* Secondary Download Links */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EBE7DF] text-xs text-[#8C8475]">
          <button
            type="button"
            onClick={handleExportCSV}
            className="hover:text-[#2A2723] underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載 CSV 數據檔</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#EBE7DF] hover:bg-[#D9D1C2] text-[#2A2723] font-medium transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
