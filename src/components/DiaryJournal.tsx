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
  ArrowRight,
  Search,
  X,
  Edit3,
  Weight
} from 'lucide-react';
import { BabyProfile, DiaryCategory, DiaryEntry, BabyMood } from '../types';
import { calculateDailyIO } from '../utils/ioCalculator';

interface DiaryJournalProps {
  babyProfile: BabyProfile;
  diaryEntries: DiaryEntry[];
  onAddDiary: () => void;
  onQuickLog: (category: DiaryCategory) => void;
  onEditDiary?: (entry: DiaryEntry) => void;
  onDeleteDiary: (id: string) => void;
  onOpenTotalIO?: () => void;
  onAddGrowth?: () => void;
}

export const DiaryJournal: React.FC<DiaryJournalProps> = ({
  babyProfile,
  diaryEntries,
  onAddDiary,
  onQuickLog,
  onEditDiary,
  onDeleteDiary,
  onOpenTotalIO,
  onAddGrowth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Today's Date String
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Calculate Today's Total I/O summary
  const todayIO = useMemo(() => {
    const w = babyProfile.birthWeight > 0 ? babyProfile.birthWeight : 4.5;
    return calculateDailyIO(diaryEntries, todayStr, w);
  }, [diaryEntries, todayStr, babyProfile.birthWeight]);

  // Sorted entries by date & time desc
  const sortedEntries = useMemo(() => {
    return [...diaryEntries].sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time || '12:00'}`).getTime();
      const timeB = new Date(`${b.date}T${b.time || '12:00'}`).getTime();
      return timeB - timeA;
    });
  }, [diaryEntries]);

  // Combined Filter: Category + Keyword Search
  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      // 1. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'milestone') {
          if (entry.category !== 'milestone' && !entry.milestoneTag) return false;
        } else if (entry.category !== selectedCategory) {
          return false;
        }
      }

      // 2. Keyword Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        
        // Exact text match in title, content, author, tags, milestoneTag, date
        const matchesText = 
          entry.title.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          (entry.author && entry.author.toLowerCase().includes(q)) ||
          (entry.milestoneTag && entry.milestoneTag.toLowerCase().includes(q)) ||
          (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(q))) ||
          entry.date.includes(q);

        if (matchesText) return true;

        // Semantic keyword matches for common baby terms
        const isFeedingTerm = q.includes('奶') || q.includes('餵') || q.includes('母乳') || q.includes('配方');
        if (isFeedingTerm && (entry.category === 'feeding' || (entry.metrics?.feedingAmountMl ?? 0) > 0 || !!entry.metrics?.feedingType)) {
          return true;
        }

        const isFeverTerm = q.includes('燒') || q.includes('溫') || q.includes('熱') || q.includes('度');
        if (isFeverTerm && (entry.category === 'temperature' || (entry.metrics?.temperature ?? 0) > 0)) {
          return true;
        }

        const isVaccineTerm = q.includes('疫苗') || q.includes('打針') || q.includes('接種') || q.includes('預防針');
        if (isVaccineTerm && (entry.category === 'medical' || entry.title.includes('疫苗') || entry.content.includes('疫苗'))) {
          return true;
        }

        const isDiaperTerm = q.includes('尿') || q.includes('便') || q.includes('布') || q.includes('屎');
        if (isDiaperTerm && (entry.category === 'diaper' || !!entry.metrics?.diaperType)) {
          return true;
        }

        const isSleepTerm = q.includes('睡') || q.includes('眠') || q.includes('醒');
        if (isSleepTerm && (entry.category === 'sleep' || (entry.metrics?.sleepDurationMins ?? 0) > 0)) {
          return true;
        }

        const isFoodTerm = q.includes('副食') || q.includes('泥') || q.includes('粥') || q.includes('米糊');
        if (isFoodTerm && (entry.metrics?.feedingType === 'solid' || entry.title.includes('副食') || entry.content.includes('副食'))) {
          return true;
        }

        const isIOTerm = q.includes('io') || q.includes('i/o') || q.includes('水分') || q.includes('攝入') || q.includes('排出');
        if (isIOTerm && (entry.category === 'io' || entry.category === 'feeding' || entry.category === 'diaper')) {
          return true;
        }

        return false;
      }

      return true;
    });
  }, [sortedEntries, selectedCategory, searchQuery]);

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

  // Preset keywords requested by user
  const quickSearchKeywords = [
    { label: '🍼 奶量', query: '奶量' },
    { label: '🌡️ 發燒', query: '發燒' },
    { label: '💉 疫苗', query: '疫苗' },
    { label: '🧻 換尿布', query: '換尿布' },
    { label: '🌟 里程碑', query: '里程碑' },
    { label: '🥣 副食品', query: '副食品' },
    { label: '💤 小睡', query: '睡眠' },
    { label: '💧 Total I/O', query: 'Total I/O' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Controls & Quick Routine Logger Header */}
      <div className="bg-white rounded-[26px] sm:rounded-[36px] p-4 sm:p-8 border border-[#EBE7DF] shadow-xs">
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

        {/* SEARCH BAR (Added at the top of DiaryJournal as requested) */}
        <div className="mt-6 p-4 rounded-[26px] bg-[#FAF8F5] border border-[#EBE7DF] space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8C8475] absolute left-3.5 pointer-events-none" />
            <input
              id="diary-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋日記關鍵字（例：奶量、疫苗、發燒、翻身、換尿布、副食品...）"
              className="w-full pl-10 pr-10 py-2.5 bg-white rounded-full border border-[#D9D1C2] focus:border-[#2A2723] focus:ring-1 focus:ring-[#2A2723] text-xs font-sans text-[#2A2723] placeholder-[#A69D8D] outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-[#8C8475] hover:text-[#2A2723] hover:bg-[#F2EDE4] transition-colors"
                title="清除搜尋"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Keyword Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-[#8C8475] font-sans mr-1">快捷搜尋：</span>
            {quickSearchKeywords.map((item) => {
              const isSelected = searchQuery.toLowerCase() === item.query.toLowerCase();
              return (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => setSearchQuery(isSelected ? '' : item.query)}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723] shadow-2xs'
                      : 'bg-white text-[#5C5549] border-[#E0DBD1] hover:bg-[#F2EDE4] hover:text-[#2A2723]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] text-rose-700 hover:text-rose-900 underline ml-2 font-sans"
              >
                重設搜尋
              </button>
            )}
          </div>

          {/* Search Result Counter Tag */}
          {searchQuery && (
            <div className="text-[11px] text-[#6B6457] font-sans flex items-center justify-between pt-1 border-t border-[#EBE7DF]">
              <span>
                關鍵字「<strong className="text-[#2A2723] font-medium">{searchQuery}</strong>」篩選結果：共找到 <strong className="text-[#2A2723] font-bold">{filteredEntries.length}</strong> 則日記
              </span>
              <span className="text-[#8C8475]">（點擊右上叉叉或重設可返回全部）</span>
            </div>
          )}
        </div>

        {/* Quick Routine Shortcut Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          <button
            onClick={() => onQuickLog('feeding')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#F5EEDB] hover:bg-[#EDE3CB] text-[#2A2723] border border-[#E5DBBF] transition-all group text-left cursor-pointer active:scale-95"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C8475] mb-2">飲食紀錄</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Milk className="w-4 h-4 text-[#8C7A58]" strokeWidth={1.5} />
              <span>快速記奶量</span>
            </div>
          </button>

          <button
            onClick={() => onQuickLog('diaper')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#E6EBE6] hover:bg-[#D8E2D8] text-[#2A2723] border border-[#D5DDD5] transition-all group text-left cursor-pointer active:scale-95"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#6E7D6E] mb-2">尿布排便</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Baby className="w-4 h-4 text-[#5A6D5A]" strokeWidth={1.5} />
              <span>快速換尿布</span>
            </div>
          </button>

          <button
            onClick={() => onQuickLog('sleep')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#E6E9F2] hover:bg-[#D9DEEE] text-[#2A2723] border border-[#D5D9E6] transition-all group text-left cursor-pointer active:scale-95"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#757E94] mb-2">睡眠時長</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Moon className="w-4 h-4 text-[#5F6B8A]" strokeWidth={1.5} />
              <span>快速記小睡</span>
            </div>
          </button>

          <button
            onClick={() => onQuickLog('temperature')}
            className="flex flex-col justify-between p-4 rounded-[24px] bg-[#F2E6E6] hover:bg-[#E8D7D7] text-[#2A2723] border border-[#E0D0D0] transition-all group text-left cursor-pointer active:scale-95"
          >
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#947575] mb-2">體溫監測</span>
            <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
              <Thermometer className="w-4 h-4 text-[#8C5D5D]" strokeWidth={1.5} />
              <span>快速量體溫</span>
            </div>
          </button>

          {onAddGrowth && (
            <button
              onClick={onAddGrowth}
              className="flex flex-col justify-between p-4 rounded-[24px] bg-[#F9F6F0] hover:bg-[#EFE9DD] text-[#2A2723] border border-[#D9D1C2] transition-all group text-left cursor-pointer active:scale-95 col-span-2 sm:col-span-1"
            >
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C8475] mb-2">生長發育</span>
              <div className="flex items-center gap-1.5 font-serif font-semibold text-base">
                <Weight className="w-4 h-4 text-[#2A2723]" strokeWidth={1.5} />
                <span>快速記生長</span>
              </div>
            </button>
          )}
        </div>

        {/* TODAY TOTAL I/O QUICK WIDGET BAR */}
        <div 
          onClick={onOpenTotalIO}
          className="mt-5 p-4 rounded-[24px] bg-gradient-to-r from-sky-50/90 via-sky-50/50 to-amber-50/60 border border-sky-200/80 hover:border-sky-300 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800 shrink-0 group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#2A2723] flex items-center gap-2 flex-wrap">
                <span>今日 24h Total I/O 即時概況</span>
                <span className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${todayIO.hydrationStatusColor}`}>
                  {todayIO.hydrationStatusLabel}
                </span>
                <span className="text-[10px] text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  查看完整 I/O 監測專區 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
          <h3 className="text-xl font-serif italic text-[#2A2723]">
            {searchQuery ? `找不到與「${searchQuery}」相關的日記` : '此分類尚無日記記錄'}
          </h3>
          <p className="text-xs text-[#8C8475] mt-1 max-w-sm mx-auto font-sans">
            {searchQuery 
              ? '建議嘗試其他關鍵字（如：奶量、發燒、疫苗、換尿布），或點擊下方按鈕清除搜尋。'
              : '點擊上方「寫一篇新日記」或快速記錄按鈕，隨手記錄寶寶的可愛日常與重要里程碑！'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 rounded-full bg-[#F2EDE4] text-[#2A2723] text-xs font-sans font-medium hover:bg-[#E6DFD1] transition-all"
              >
                清除關鍵字搜尋
              </button>
            )}
            <button
              onClick={onAddDiary}
              className="px-6 py-2.5 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-sans uppercase tracking-wider hover:bg-[#3D3833]"
            >
              立即寫日記
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredEntries.map((entry) => {
            const mood = moodEmojis[entry.mood] || moodEmojis.happy;
            const categoryInfo = categoryLabels[entry.category] || categoryLabels.daily;

            return (
              <article
                key={entry.id}
                className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-7 border border-[#EBE7DF] hover:border-[#D1CEC4] shadow-xs transition-all duration-300 group"
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

                    {/* Edit button */}
                    {onEditDiary && (
                      <button
                        onClick={() => onEditDiary(entry)}
                        className="p-1.5 text-[#8C8475] hover:text-[#2A2723] rounded-full hover:bg-[#EBE7DF] transition-colors opacity-70 group-hover:opacity-100"
                        title="編輯此篇日記與數值"
                      >
                        <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
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
