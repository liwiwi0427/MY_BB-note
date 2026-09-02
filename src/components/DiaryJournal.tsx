import React, { useState, useMemo } from 'react';
import { 
  BookHeart, 
  Sparkles, 
  Plus, 
  Baby, 
  Moon, 
  Milk, 
  Thermometer, 
  Smile, 
  Clock, 
  Calendar, 
  Trash2, 
  Image as ImageIcon,
  Heart,
  Tag,
  Award,
  Layers,
  Droplets,
  Activity,
  ArrowRight
} from 'lucide-react';
import { BabyProfile, DiaryCategory, DiaryEntry, BabyMood } from '../types';
import { calculateDailyIO } from '../utils/ioCalculator';

interface DiaryJournalProps {
  babyProfile: BabyProfile;
  diaryEntries: DiaryEntry[];
  onAddDiary: () => void;
  onQuickLog: (category: DiaryCategory) => void;
  onDeleteDiary: (id: string) => void;
  onOpenTotalIO?: () => void;
}

export const DiaryJournal: React.FC<DiaryJournalProps> = ({
  babyProfile,
  diaryEntries,
  onAddDiary,
  onQuickLog,
  onDeleteDiary,
  onOpenTotalIO,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Today's Date String
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Calculate Today's Total I/O summary
  const todayIO = useMemo(() => {
    const w = babyProfile.birthWeight > 0 ? babyProfile.birthWeight : 4.5;
    return calculateDailyIO(diaryEntries, todayStr, w);
  }, [diaryEntries, todayStr, babyProfile.birthWeight]);

  // Sorted entries by date & time desc
  const sortedEntries = [...diaryEntries].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || '12:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.time || '12:00'}`).getTime();
    return timeB - timeA;
  });

  const filteredEntries = sortedEntries.filter((entry) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'milestone') return entry.category === 'milestone' || !!entry.milestoneTag;
    return entry.category === selectedCategory;
  });

  const moodEmojis: Record<BabyMood, { emoji: string; label: string; bg: string }> = {
    happy: { emoji: '😊', label: '心情極佳', bg: 'bg-[#F2EDE4] text-[#2A2723] border border-[#D9D1C2]' },
    playful: { emoji: '🧸', label: '活力滿滿', bg: 'bg-[#F2E6E6] text-[#6B3E3E] border border-[#E0D0D0]' },
    calm: { emoji: '🌿', label: '安穩乖巧', bg: 'bg-[#E6EBE6] text-[#3E4A3E] border border-[#D5DDD5]' },
    sleepy: { emoji: '😴', label: '想睡愛睏', bg: 'bg-[#E6E9F2] text-[#3A4050] border border-[#D5D9E6]' },
    fussy: { emoji: '🥺', label: '哭鬧撒嬌', bg: 'bg-[#F5EEDB] text-[#5C4D2E] border border-[#E5DBBF]' },
    curious: { emoji: '🐣', label: '好奇探索', bg: 'bg-[#EBF2EA] text-[#354D35] border border-[#D0E0CE]' },
  };

  const categoryLabels: Record<DiaryCategory, { label: string; color: string }> = {
    milestone: { label: '🌟 成長里程碑', color: 'bg-[#2A2723] text-[#F9F6F0] border-[#4A453E]' },
    daily: { label: '📔 生活日記', color: 'bg-[#F2EDE4] text-[#4A453E] border-[#D9D1C2]' },
    feeding: { label: '🍼 餵奶飲食', color: 'bg-[#F5EEDB] text-[#5C4D2E] border-[#E5DBBF]' },
    sleep: { label: '💤 睡眠紀錄', color: 'bg-[#E6E9F2] text-[#3A4050] border-[#D5D9E6]' },
    diaper: { label: '🧻 尿布排便', color: 'bg-[#E6EBE6] text-[#3E4A3E] border-[#D5DDD5]' },
    temperature: { label: '🌡️ 體溫量測', color: 'bg-[#F2E6E6] text-[#6B3E3E] border-[#E0D0D0]' },
    medical: { label: '🏥 就診用藥', color: 'bg-[#EAE6F2] text-[#423854] border-[#D7CEE5]' },
    io: { label: '💧 Total I/O', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  };

  return (
    <div className="space-y-8">
      
      {/* Top Controls & Quick Routine Logger Header */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EBE7DF]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2723]">
              {babyProfile.nickname || babyProfile.name} 的成長日常日記
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6457] mt-1 font-sans">
              點滴記錄第一次翻身、餵奶量、尿布排泄與日常照護
            </p>
          </div>

          <button
            id="write-diary-btn"
            onClick={onAddDiary}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-sans uppercase tracking-wider bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] shadow-sm transition-all self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>寫一篇新日記</span>
          </button>
        </div>

        {/* Quick Routine Shortcut Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => onQuickLog('feeding')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#F5EEDB] hover:bg-[#EDE3CB] text-[#2A2723] border border-[#E5DBBF] transition-all group text-left"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C8475] mb-2">飲食紀錄</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Milk className="w-4 h-4 text-[#8C7A58]" strokeWidth={1.5} />
              <span>快速記奶量</span>
            </div>
          </button>

          <button
            onClick={() => onQuickLog('diaper')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#E6EBE6] hover:bg-[#D8E2D8] text-[#2A2723] border border-[#D5DDD5] transition-all group text-left"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#6E7D6E] mb-2">尿布排便</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Baby className="w-4 h-4 text-[#5A6D5A]" strokeWidth={1.5} />
              <span>快速換尿布</span>
            </div>
          </button>

          <button
            onClick={() => onQuickLog('sleep')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#E6E9F2] hover:bg-[#D9DEEE] text-[#2A2723] border border-[#D5D9E6] transition-all group text-left"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#757E94] mb-2">睡眠時長</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Moon className="w-4 h-4 text-[#5F6B8A]" strokeWidth={1.5} />
              <span>快速記小睡</span>
            </div>
          </button>

          <button
            onClick={() => onQuickLog('temperature')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#F2E6E6] hover:bg-[#E8D7D7] text-[#2A2723] border border-[#E0D0D0] transition-all group text-left"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#947575] mb-2">體溫監測</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Thermometer className="w-4 h-4 text-[#8C5D5D]" strokeWidth={1.5} />
              <span>快速量體溫</span>
            </div>
          </button>
        </div>

        {/* TODAY TOTAL I/O QUICK WIDGET BAR */}
        <div className="mt-5 p-4 rounded-[24px] bg-gradient-to-r from-sky-50/90 via-sky-50/50 to-amber-50/60 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#2A2723] flex items-center gap-2">
                <span>今日 24h Total I/O 即時概況</span>
                <span className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${todayIO.hydrationStatusColor}`}>
                  {todayIO.hydrationStatusLabel}
                </span>
              </div>
              <div className="text-[11px] text-[#6B6457] mt-0.5 flex items-center gap-3 flex-wrap">
                <span>🥛 總攝入 (Intake): <strong className="text-sky-900 font-mono">{todayIO.totalIntakeMl} ml</strong></span>
                <span>🧷 總排出 (Output): <strong className="text-amber-900 font-mono">{todayIO.totalOutputMl} ml</strong></span>
                <span>尿布: <strong className="font-mono">{todayIO.totalDiaperCount} 片</strong> (重尿布 {todayIO.heavyDiaperCount}/6)</span>
                <span>排尿率: <strong className="text-emerald-800 font-mono">{todayIO.urineHourlyRate} ml/kg/hr</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Categories Chips */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 pt-1">
          {[
            { id: 'all', label: '全部動態' },
            { id: 'milestone', label: '🌟 里程碑' },
            { id: 'feeding', label: '🍼 飲食' },
            { id: 'diaper', label: '🧷 尿布/排泄' },
            { id: 'sleep', label: '💤 睡眠' },
            { id: 'temperature', label: '🌡️ 體溫' },
            { id: 'io', label: '💧 Total I/O' },
            { id: 'daily', label: '📔 心情' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-[#2A2723] text-[#F9F6F0] shadow-2xs font-bold'
                  : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Diary Feed Stream */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-[36px] p-12 text-center border border-[#EBE7DF] shadow-xs">
          <BookHeart className="w-12 h-12 text-[#D9D1C2] mx-auto mb-3" strokeWidth={1.25} />
          <h3 className="text-xl font-serif italic text-[#2A2723]">此分類尚無日記記錄</h3>
          <p className="text-xs text-[#8C8475] mt-1 max-w-sm mx-auto font-sans">
            點擊上方「寫一篇新日記」或快速記錄按鈕，隨手記錄寶寶的可愛日常與重要里程碑！
          </p>
          <button
            onClick={onAddDiary}
            className="mt-6 px-6 py-2.5 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-sans uppercase tracking-wider hover:bg-[#3D3833]"
          >
            立即寫日記
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredEntries.map((entry) => {
            const mood = moodEmojis[entry.mood] || moodEmojis.happy;
            const categoryInfo = categoryLabels[entry.category] || categoryLabels.daily;

            return (
              <article
                key={entry.id}
                className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#EBE7DF] hover:border-[#D1CEC4] shadow-xs transition-all duration-300 group"
              >
                {/* Entry Header Ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2EDE4]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-medium text-[#2A2723] flex items-center gap-1.5 bg-[#F2EDE4] px-3 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5 text-[#8C8475]" strokeWidth={1.5} />
                      {entry.date}
                    </span>
                    <span className="text-xs text-[#8C8475] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#A69D8D]" strokeWidth={1.5} />
                      {entry.time || '12:00'}
                    </span>
                    <span className={`text-[11px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${categoryInfo.color}`}>
                      {categoryInfo.label}
                    </span>
                    {entry.milestoneTag && (
                      <span className="text-[11px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D9D1C2] text-[#2A2723] border border-[#C7BBA8] flex items-center gap-1 font-bold">
                        <Award className="w-3 h-3 text-[#2A2723]" strokeWidth={1.75} />
                        {entry.milestoneTag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Mood pill */}
                    <span className={`text-xs px-3 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${mood.bg}`}>
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </span>

                    {/* Author */}
                    {entry.author && (
                      <span className="text-[11px] text-[#8C8475] font-sans bg-[#F9F6F0] px-2.5 py-0.5 rounded-full border border-[#EBE7DF]">
                        {entry.author} 記
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteDiary(entry.id)}
                      className="p-1.5 text-[#D1CEC4] hover:text-[#C4685D] rounded-full hover:bg-[#F2E6E6] transition-colors opacity-70 group-hover:opacity-100"
                      title="刪除此篇日記"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Entry Title & Content */}
                <div className="mt-4">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723] tracking-tight">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-[#4A453E] leading-relaxed mt-2.5 whitespace-pre-wrap font-sans">
                    {entry.content}
                  </p>
                </div>

                {/* Metrics Badges Container */}
                {entry.metrics && (
                  <div className="mt-4 pt-3.5 border-t border-[#F2EDE4] flex items-center gap-2.5 flex-wrap text-xs font-sans">
                    {entry.metrics.feedingAmountMl && (
                      <span className="bg-sky-50 text-sky-950 border border-sky-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                        <Milk className="w-3.5 h-3.5 text-sky-700" strokeWidth={1.5} />
                        {entry.metrics.feedingType === 'formula' ? '配方奶' : entry.metrics.feedingType === 'solid' ? '副食品' : '母乳'}：
                        <strong className="font-mono">{entry.metrics.feedingAmountMl} ml</strong>
                        {entry.metrics.feedingDurationMins && ` (${entry.metrics.feedingDurationMins}分鐘)`}
                      </span>
                    )}
                    {entry.metrics.waterAmountMl && (
                      <span className="bg-sky-50 text-sky-950 border border-sky-200 px-3 py-1 rounded-full">
                        💧 水/電解水：<strong className="font-mono">{entry.metrics.waterAmountMl} ml</strong>
                      </span>
                    )}
                    {entry.metrics.solidFoodDetails && (
                      <span className="bg-[#F5EEDB] text-[#2A2723] border border-[#E5DBBF] px-3 py-1 rounded-full">
                        🥄 食材：{entry.metrics.solidFoodDetails}
                      </span>
                    )}
                    {entry.metrics.diaperType && (
                      <span className="bg-amber-50 text-amber-950 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                        <Droplets className="w-3.5 h-3.5 text-amber-700" />
                        尿布：{entry.metrics.diaperType === 'wet' ? '純尿尿' : entry.metrics.diaperType === 'dirty' ? '大便' : '尿尿+大便'}
                        {entry.metrics.diaperWetnessLevel && (
                          <span className="text-[11px] text-amber-800">
                            ({entry.metrics.diaperWetnessLevel === 'heavy' ? '重尿布 ~100ml' : entry.metrics.diaperWetnessLevel === 'medium' ? '中度 ~60ml' : '輕度 ~30ml'})
                          </span>
                        )}
                        {entry.metrics.stoolConsistency && (
                          <span className="text-[11px] text-amber-900 font-bold ml-1">
                            [{entry.metrics.stoolConsistency === 'soft' ? '正常軟便' : entry.metrics.stoolConsistency === 'watery' ? '水便' : '稀便'}]
                          </span>
                        )}
                      </span>
                    )}
                    {entry.metrics.vomitSeverity && entry.metrics.vomitSeverity !== 'none' && (
                      <span className="bg-rose-50 text-rose-900 border border-rose-200 px-3 py-1 rounded-full">
                        🤮 溢/吐奶：{entry.metrics.vomitSeverity === 'spit_up' ? '輕微溢奶 (~15ml)' : entry.metrics.vomitSeverity === 'moderate' ? '中度吐奶 (~40ml)' : '噴射狀嘔吐 (~80ml)'}
                      </span>
                    )}
                    {entry.metrics.sleepHours && (
                      <span className="bg-[#E6E9F2] text-[#2A2723] border border-[#D5D9E6] px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-[#5F6B8A]" strokeWidth={1.5} />
                        {entry.metrics.sleepType === 'night' ? '夜間長睡眠' : '日間小睡'}：
                        <strong className="font-mono">{entry.metrics.sleepHours} 小時</strong>
                      </span>
                    )}
                    {entry.metrics.temperatureC && (
                      <span className={`px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                        entry.metrics.temperatureC >= 38.0
                          ? 'bg-[#F2E6E6] text-[#6B3E3E] border-[#E0D0D0] font-bold'
                          : entry.metrics.temperatureC >= 37.5
                          ? 'bg-[#F5EEDB] text-[#5C4D2E] border-[#E5DBBF]'
                          : 'bg-[#E6EBE6] text-[#3E4A3E] border-[#D5DDD5]'
                      }`}>
                        <Thermometer className="w-3.5 h-3.5" strokeWidth={1.5} />
                        體溫：<strong className="font-mono">{entry.metrics.temperatureC} °C</strong>
                        {entry.metrics.temperatureC >= 38.0 ? '(發燒)' : entry.metrics.temperatureC >= 37.5 ? '(微熱)' : '(正常)'}
                      </span>
                    )}
                    {entry.metrics.medicationTaken && (
                      <span className="bg-[#EAE6F2] text-[#423854] border border-[#D7CEE5] px-3 py-1 rounded-full">
                        💊 用藥/處置：{entry.metrics.medicationTaken}
                      </span>
                    )}
                  </div>
                )}

                {/* Photo Attachments Gallery */}
                {entry.photos && entry.photos.length > 0 && (
                  <div className="mt-5 flex items-center gap-3 overflow-x-auto pb-1">
                    {entry.photos.map((imgUrl, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setSelectedPhoto(imgUrl)}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] overflow-hidden border border-[#D1CEC4] p-1 bg-[#F9F6F0] shadow-2xs cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                      >
                        <img
                          src={imgUrl}
                          alt="日記照片"
                          className="w-full h-full object-cover rounded-[16px]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                )}

              </article>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/90 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full bg-transparent p-2">
            <img
              src={selectedPhoto}
              alt="放大檢視照片"
              className="w-full h-auto max-h-[85vh] object-contain rounded-[32px] shadow-2xl border border-[#4A453E]"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#2A2723] text-white hover:bg-black font-bold flex items-center justify-center border border-[#4A453E]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
