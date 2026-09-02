import React from 'react';
import { Milk, Moon, Droplets, Sparkles, Thermometer } from 'lucide-react';
import type { DiaryEntry } from '../types';
import { calculateDailyIO } from '../utils/ioCalculator';

interface TotalIOTrackerProps {
  entries: DiaryEntry[];
}

export const TotalIOTracker: React.FC<TotalIOTrackerProps> = ({ entries }) => {
  const io = calculateDailyIO(entries);

  const totalWet = io.wetDiapersCount + io.bothDiapersCount;
  const totalDirty = io.dirtyDiapersCount + io.bothDiapersCount;

  return (
    <div className="bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-serif font-bold text-xs sm:text-sm text-[#2A2723]">
          今日 24 小時出入量與作息統計 (Total I/O)
        </span>
        <span className="text-[11px] font-mono text-[#8C8475]">
          統計日: {io.date}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        
        {/* Total Fluid In */}
        <div className="p-3 bg-white rounded-2xl border border-[#EBE7DF]">
          <div className="flex items-center space-x-1.5 text-xs text-amber-800">
            <Milk className="w-3.5 h-3.5" />
            <span className="font-medium">總奶量 / 哺乳</span>
          </div>
          <div className="mt-1.5 font-mono font-bold text-lg text-[#2A2723]">
            {io.totalMilkMl} <span className="text-xs font-normal">ml</span>
          </div>
          <div className="text-[10px] text-[#8C8475] mt-0.5 font-sans">
            親餵: {io.breastFeedDurationMinutes} 分鐘
          </div>
        </div>

        {/* Diapers Wet */}
        <div className="p-3 bg-white rounded-2xl border border-sky-200 bg-sky-50/30">
          <div className="flex items-center space-x-1.5 text-xs text-sky-800">
            <Droplets className="w-3.5 h-3.5" />
            <span className="font-medium">💧 尿布濕濕</span>
          </div>
          <div className="mt-1.5 font-mono font-bold text-lg text-sky-950">
            {totalWet} <span className="text-xs font-normal">次</span>
          </div>
          <div className="text-[10px] text-sky-700 mt-0.5 font-sans">
            {totalWet >= 6 ? '✓ 達標水分充足' : `建議每日 ≥ 6次`}
          </div>
        </div>

        {/* Diapers Dirty */}
        <div className="p-3 bg-white rounded-2xl border border-amber-200 bg-amber-50/30">
          <div className="flex items-center space-x-1.5 text-xs text-amber-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">💩 尿布便便</span>
          </div>
          <div className="mt-1.5 font-mono font-bold text-lg text-amber-950">
            {totalDirty} <span className="text-xs font-normal">次</span>
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-sans">
            排便形態觀察
          </div>
        </div>

        {/* Sleep Total */}
        <div className="p-3 bg-white rounded-2xl border border-[#EBE7DF]">
          <div className="flex items-center space-x-1.5 text-xs text-indigo-800">
            <Moon className="w-3.5 h-3.5" />
            <span className="font-medium">總睡眠時長</span>
          </div>
          <div className="mt-1.5 font-mono font-bold text-lg text-[#2A2723]">
            {Math.floor(io.totalSleepMinutes / 60)}h {io.totalSleepMinutes % 60}m
          </div>
          <div className="text-[10px] text-[#8C8475] mt-0.5 font-sans">
            作息小憩累計
          </div>
        </div>

        {/* Highest Temp */}
        <div className="p-3 bg-white rounded-2xl border border-[#EBE7DF] col-span-2 sm:col-span-1">
          <div className="flex items-center space-x-1.5 text-xs text-rose-800">
            <Thermometer className="w-3.5 h-3.5" />
            <span className="font-medium">今日最高溫</span>
          </div>
          <div className="mt-1.5 font-mono font-bold text-lg text-[#2A2723]">
            {io.highestTemp ? `${io.highestTemp}°C` : '--'}
          </div>
          <div className="text-[10px] text-[#8C8475] mt-0.5 font-sans">
            量測 {io.tempMeasurementsCount} 次
          </div>
        </div>

      </div>
    </div>
  );
};
