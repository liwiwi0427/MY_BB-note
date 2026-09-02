import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Edit3,
  Baby,
  Moon,
  Sparkles,
  Droplets,
  Layers,
  Thermometer,
  Pill,
  Smile,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { DiaryEntry, BabyProfile } from '../types';
import { formatTime, formatDate } from '../utils/dateUtils';
import { audioSynthesizer } from '../utils/audioSynthesizer';
import { TotalIOTracker } from './TotalIOTracker';
import { useToast } from '../context/ToastContext';

interface DiaryJournalProps {
  entries: DiaryEntry[];
  baby: BabyProfile;
  onAddEntry: () => void;
  onEditEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onQuickAdd: (type: DiaryEntry['type'], title: string, amountMl?: number) => void;
}

export const DiaryJournal: React.FC<DiaryJournalProps> = ({
  entries,
  baby,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onQuickAdd,
}) => {
  const { success } = useToast();
  const [filterType, setFilterType] = useState<string>('all');
  const [isWhiteNoiseOn, setIsWhiteNoiseOn] = useState<boolean>(false);

  const toggleNoise = () => {
    const nextState = !isWhiteNoiseOn;
    audioSynthesizer.toggleWhiteNoise(nextState);
    setIsWhiteNoiseOn(nextState);
    if (nextState) {
      success('安撫白噪音已開啟', '純物理羊水頻率，有助寶寶放鬆與小睡');
    }
  };

  const handleQuickLog = (type: DiaryEntry['type'], title: string, amountMl?: number) => {
    onQuickAdd(type, title, amountMl);
    success('已快速打卡記錄 ✨', title);
  };

  const getEntryIcon = (type: DiaryEntry['type']) => {
    switch (type) {
      case 'feed_bottle':
      case 'feed_breast':
      case 'feed_solid':
        return <Baby className="w-5 h-5 text-amber-700" />;
      case 'sleep':
        return <Moon className="w-5 h-5 text-indigo-700" />;
      case 'diaper_wet':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'diaper_dirty':
        return <Sparkles className="w-5 h-5 text-amber-800" />;
      case 'diaper_both':
        return <Layers className="w-5 h-5 text-teal-700" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-rose-700" />;
      case 'medication':
        return <Pill className="w-5 h-5 text-purple-700" />;
      default:
        return <Smile className="w-5 h-5 text-emerald-700" />;
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (filterType === 'all') return true;
    if (filterType === 'feed') return e.type.startsWith('feed_');
    if (filterType === 'diaper_wet') return e.type === 'diaper_wet' || e.type === 'diaper_both';
    if (filterType === 'diaper_dirty') return e.type === 'diaper_dirty' || e.type === 'diaper_both';
    if (filterType === 'sleep') return e.type === 'sleep';
    if (filterType === 'health') return e.type === 'temperature' || e.type === 'medication';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Responsive Grid for PC (Desktop 2-column / Mobile 1-column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Timeline Feed (8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Timeline Header & Search / Filters */}
          <div className="bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#2A2723]">
                成長日常時間軸
              </h2>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#2A2723] border border-[#D9D1C2] shadow-2xs">
                {filteredEntries.length} 筆
              </span>
            </div>

            {/* Filter Pills with motion */}
            <div className="flex items-center space-x-1 bg-[#EBE7DF]/80 p-1 rounded-full border border-[#D9D1C2] overflow-x-auto shadow-2xs relative">
              {[
                { id: 'all', label: '全部' },
                { id: 'feed', label: '🍼 哺乳飲食' },
                { id: 'diaper_wet', label: '💧 尿布濕濕' },
                { id: 'diaper_dirty', label: '💩 尿布便便' },
                { id: 'sleep', label: '🌙 睡眠' },
                { id: 'health', label: '🌡️ 體溫用藥' },
              ].map((f) => {
                const isActive = filterType === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`relative px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-colors cursor-pointer select-none z-10 ${
                      isActive
                        ? 'text-[#F9F6F0] font-medium'
                        : 'text-[#6B6457] hover:text-[#2A2723] hover:bg-white/40'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterPill"
                        className="absolute inset-0 bg-[#2A2723] rounded-full shadow-2xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diary List Feed with Animations */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-10 text-center text-[#8C8475] font-sans shadow-xs"
                >
                  <Baby className="w-10 h-10 mx-auto mb-2.5 text-[#D1CEC4]" />
                  <p className="text-sm font-semibold text-[#2A2723]">尚無此分類日常紀錄</p>
                  <p className="text-xs text-[#8C8475] mt-1">點擊右側「詳細紀錄」或「1秒極速打卡」開始記錄寶寶的一天</p>
                </motion.div>
              ) : (
                filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                    className="bg-[#F9F6F0] rounded-2xl sm:rounded-[24px] border border-[#D9D1C2] p-4 sm:p-5 shadow-xs hover:border-[#8C8475] hover:shadow-sm transition-colors flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 3 }}
                        className="w-11 h-11 rounded-2xl bg-white border border-[#EBE7DF] flex items-center justify-center shrink-0 shadow-2xs mt-0.5"
                      >
                        {getEntryIcon(entry.type)}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-serif font-bold text-sm sm:text-base text-[#2A2723]">
                            {entry.title || '日常紀錄'}
                          </span>
                          <span className="text-[11px] font-mono text-[#8C8475] flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-md border border-[#EBE7DF]">
                            <Clock className="w-3 h-3" />
                            {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                          </span>
                          {entry.loggedBy && (
                            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#EBE7DF] text-[#6B6457] border border-[#D9D1C2]">
                              由 {entry.loggedBy} 記錄
                            </span>
                          )}
                        </div>

                        {/* Badges details */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {entry.amountMl && (
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-100/80 text-amber-900 border border-amber-300 shadow-2xs">
                              🥛 {entry.amountMl} ml
                            </span>
                          )}
                          {entry.durationMinutes && (
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-100/80 text-indigo-900 border border-indigo-300 shadow-2xs">
                              ⏱️ {entry.durationMinutes} 分鐘
                            </span>
                          )}
                          {entry.temperatureCelsius && (
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-rose-100/80 text-rose-900 border border-rose-300 shadow-2xs">
                              🌡️ {entry.temperatureCelsius} °C
                            </span>
                          )}

                          {/* Diaper Wet Badges */}
                          {entry.type === 'diaper_wet' && (
                            <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-lg bg-sky-100/90 text-sky-950 border border-sky-300 shadow-2xs flex items-center gap-1">
                              💧 尿布濕濕 {entry.diaperWetness ? `(${entry.diaperWetness})` : '(正常尿尿)'}
                            </span>
                          )}

                          {/* Diaper Dirty Badges */}
                          {entry.type === 'diaper_dirty' && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-lg bg-amber-100/90 text-amber-950 border border-amber-300 shadow-2xs flex items-center gap-1">
                                💩 尿布便便 {entry.diaperColor ? `· ${entry.diaperColor}` : ''}
                              </span>
                              {entry.diaperStoolTexture && (
                                <span className="text-[11px] font-sans px-2 py-0.5 rounded-md bg-white/90 text-amber-900 border border-amber-200">
                                  {entry.diaperStoolTexture}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Diaper Both Badges */}
                          {entry.type === 'diaper_both' && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-lg bg-teal-100/90 text-teal-950 border border-teal-300 shadow-2xs">
                                🧻 雙重更換 (💧濕 + 💩便)
                              </span>
                              {entry.diaperColor && (
                                <span className="text-[11px] font-sans px-2 py-0.5 rounded-md bg-white/90 text-teal-900 border border-teal-200">
                                  便色: {entry.diaperColor}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {entry.note && (
                          <p className="text-xs text-[#524C42] mt-2.5 font-sans leading-relaxed bg-white/80 p-3 rounded-xl border border-[#EBE7DF] shadow-2xs">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditEntry(entry)}
                        className="p-2 text-[#8C8475] hover:text-[#2A2723] hover:bg-white rounded-xl transition-colors shadow-2xs cursor-pointer"
                        title="修改此紀錄"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-2 text-[#D1CEC4] hover:text-[#C4685D] hover:bg-white rounded-xl transition-colors shadow-2xs cursor-pointer"
                        title="刪除此紀錄"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Sticky Quick Actions & Live Stats Dashboard (5 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-20">
          
          {/* 1-Second Quick Action Dock */}
          <div className="bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-serif font-bold text-[#2A2723] flex items-center gap-1.5">
                ⚡ 1 秒極速打卡
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleNoise}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans transition-colors shadow-2xs cursor-pointer ${
                  isWhiteNoiseOn
                    ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                    : 'bg-white text-[#6B6457] border border-[#D9D1C2] hover:bg-[#EBE7DF]'
                }`}
                title="純物理子宮羊水白噪音生成器，安撫寶寶小睡"
              >
                {isWhiteNoiseOn ? <Volume2 className="w-3.5 h-3.5 text-purple-700" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="font-medium">{isWhiteNoiseOn ? '白噪音播放中' : '安撫白噪音'}</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Feed Bottle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleQuickLog('feed_bottle', '瓶餵配方奶 120ml', 120)}
                className="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-amber-300 hover:bg-amber-50/60 text-left transition-colors group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-[#8C8475] mb-1">
                  <span>🍼 瓶餵</span>
                  <span className="font-mono text-amber-800 font-bold">+120ml</span>
                </div>
                <div className="text-xs font-bold text-[#2A2723]">記錄餵奶</div>
              </motion.button>

              {/* Diaper Wet */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleQuickLog('diaper_wet', '換濕尿布 (正常尿尿)')}
                className="p-3.5 rounded-2xl bg-white border border-sky-200 hover:border-sky-400 hover:bg-sky-50/70 text-left transition-colors group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-sky-700 mb-1">
                  <span className="flex items-center gap-1 font-medium">💧 尿布</span>
                  <span className="text-sky-800 font-bold text-[11px] bg-sky-100 px-1.5 py-0.2 rounded">噓噓</span>
                </div>
                <div className="text-xs font-bold text-sky-950">換濕尿布</div>
              </motion.button>

              {/* Diaper Dirty */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleQuickLog('diaper_dirty', '換便便尿布 (金黃正常)')}
                className="p-3.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/70 text-left transition-colors group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
                  <span className="flex items-center gap-1 font-medium">💩 尿布</span>
                  <span className="text-amber-900 font-bold text-[11px] bg-amber-100 px-1.5 py-0.2 rounded">大便</span>
                </div>
                <div className="text-xs font-bold text-amber-950">換便便尿布</div>
              </motion.button>

              {/* Sleep */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleQuickLog('sleep', '入睡小憩 60分鐘', 60)}
                className="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-indigo-300 hover:bg-indigo-50/60 text-left transition-colors group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-[#8C8475] mb-1">
                  <span>🌙 睡眠</span>
                  <span className="font-mono text-indigo-800 font-bold">+60分</span>
                </div>
                <div className="text-xs font-bold text-[#2A2723]">記錄入眠小睡</div>
              </motion.button>

              {/* Custom Detailed Entry */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onAddEntry}
                className="col-span-2 p-3.5 rounded-2xl bg-[#2A2723] text-[#F9F6F0] hover:bg-[#4A453E] text-left transition-colors flex items-center justify-between shadow-2xs cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📝</span>
                  <div>
                    <div className="text-xs font-bold text-[#F9F6F0]">自訂日常日記詳細打卡</div>
                    <div className="text-[10px] text-[#D9D1C2]">包含母乳親餵、大便顏色卡、體溫、用藥與備註</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-[#FAF3EB]" />
              </motion.button>
            </div>
          </div>

          {/* 24-Hour Total I/O Calculation Widget */}
          <TotalIOTracker entries={entries} />

        </div>

      </div>

    </div>
  );
};
