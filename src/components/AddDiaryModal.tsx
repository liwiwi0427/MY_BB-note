import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Baby,
  Moon,
  Sparkles,
  Droplets,
  Layers,
  Thermometer,
  Pill,
  Clock,
  Smile,
} from 'lucide-react';
import type { DiaryEntry, DiaryType } from '../types';

interface AddDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<DiaryEntry>) => void;
  editingEntry?: DiaryEntry | null;
  currentMemberName: string;
}

export const AddDiaryModal: React.FC<AddDiaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  currentMemberName,
}) => {
  const [type, setType] = useState<DiaryType>(editingEntry?.type || 'feed_bottle');
  const [timestamp, setTimestamp] = useState(
    editingEntry ? editingEntry.timestamp.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [title, setTitle] = useState(editingEntry?.title || '');
  const [note, setNote] = useState(editingEntry?.note || '');
  const [amountMl, setAmountMl] = useState<number | ''>(editingEntry?.amountMl || 120);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(
    editingEntry?.durationMinutes || 60
  );
  const [temperatureCelsius, setTemperatureCelsius] = useState<number | ''>(
    editingEntry?.temperatureCelsius || 36.8
  );
  const [diaperWetness, setDiaperWetness] = useState<string>(editingEntry?.diaperWetness || '適中正常');
  const [diaperColor, setDiaperColor] = useState(editingEntry?.diaperColor || '金黃色 (正常)');
  const [diaperStoolTexture, setDiaperStoolTexture] = useState<string>(
    editingEntry?.diaperStoolTexture || '糊狀軟便'
  );
  const [mood, setMood] = useState<DiaryEntry['mood']>(editingEntry?.mood || 'happy');
  const [loggedBy, setLoggedBy] = useState(
    editingEntry?.loggedBy || currentMemberName || '媽媽'
  );

  React.useEffect(() => {
    if (isOpen) {
      setType(editingEntry?.type || 'feed_bottle');
      setTimestamp(editingEntry ? editingEntry.timestamp.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setTitle(editingEntry?.title || '');
      setNote(editingEntry?.note || '');
      setAmountMl(editingEntry?.amountMl || 120);
      setDurationMinutes(editingEntry?.durationMinutes || 60);
      setTemperatureCelsius(editingEntry?.temperatureCelsius || 36.8);
      setDiaperWetness(editingEntry?.diaperWetness || '適中正常');
      setDiaperColor(editingEntry?.diaperColor || '金黃色 (正常)');
      setDiaperStoolTexture(editingEntry?.diaperStoolTexture || '糊狀軟便');
      setMood(editingEntry?.mood || 'happy');
      setLoggedBy(editingEntry?.loggedBy || currentMemberName || '媽媽');
    }
  }, [isOpen, editingEntry, currentMemberName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let defaultAutoTitle = title;
    if (!defaultAutoTitle) {
      if (type === 'feed_bottle') defaultAutoTitle = `瓶餵 ${amountMl || 120}ml`;
      else if (type === 'feed_breast') defaultAutoTitle = `親餵 ${durationMinutes || 20}分鐘`;
      else if (type === 'feed_solid') defaultAutoTitle = '副食品點心餐';
      else if (type === 'diaper_wet') defaultAutoTitle = `換濕尿布 (${diaperWetness})`;
      else if (type === 'diaper_dirty') defaultAutoTitle = `更換便便尿布 (${diaperColor.split(' ')[0]})`;
      else if (type === 'diaper_both') defaultAutoTitle = `尿布又濕又便 (${diaperColor.split(' ')[0]})`;
      else if (type === 'sleep') defaultAutoTitle = `小睡 ${durationMinutes || 60}分鐘`;
      else if (type === 'temperature') defaultAutoTitle = `體溫量測 ${temperatureCelsius || 36.8}°C`;
      else defaultAutoTitle = '日常照護紀錄';
    }

    const payload: Partial<DiaryEntry> = {
      type,
      timestamp: new Date(timestamp).toISOString(),
      title: defaultAutoTitle,
      note: note.trim(),
      amountMl: type === 'feed_bottle' ? Number(amountMl) : undefined,
      durationMinutes:
        type === 'sleep' || type === 'feed_breast' || type === 'tummy_time'
          ? Number(durationMinutes)
          : undefined,
      temperatureCelsius: type === 'temperature' ? Number(temperatureCelsius) : undefined,
      diaperWetness: type === 'diaper_wet' || type === 'diaper_both' ? diaperWetness : undefined,
      diaperColor: type === 'diaper_dirty' || type === 'diaper_both' ? diaperColor : undefined,
      diaperStoolTexture: type === 'diaper_dirty' || type === 'diaper_both' ? diaperStoolTexture : undefined,
      mood,
      loggedBy: loggedBy.trim() || '照護者',
    };

    onSave(payload);
    onClose();
  };

  const typeOptions: { id: DiaryType; label: string; icon: string }[] = [
    { id: 'feed_bottle', label: '瓶餵 (奶/水)', icon: '🍼' },
    { id: 'feed_breast', label: '母乳親餵', icon: '🤱' },
    { id: 'feed_solid', label: '副食品泥', icon: '🥣' },
    { id: 'diaper_wet', label: '尿布濕濕 (尿尿)', icon: '💧' },
    { id: 'diaper_dirty', label: '尿布便便 (大便)', icon: '💩' },
    { id: 'diaper_both', label: '又濕又便 (雙重)', icon: '🧻' },
    { id: 'sleep', label: '睡眠小憩', icon: '🌙' },
    { id: 'temperature', label: '量測體溫', icon: '🌡️' },
    { id: 'medication', label: '服藥/保健品', icon: '💊' },
    { id: 'tummy_time', label: '趴撐練習', icon: '👶' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#F9F6F0] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                {editingEntry ? '編輯日常照護日記' : '新增寶寶日常打卡紀錄'}
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                快速記錄餵奶、睡眠、便尿與體溫
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C8475] hover:text-[#2A2723] rounded-xl hover:bg-[#EBE7DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pick Grid */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#6B6457] font-medium font-sans">選擇紀錄分類</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {typeOptions.map((opt) => {
              const isSelected = type === opt.id;
              let customStyle = 'bg-white border border-[#D9D1C2] text-[#2A2723] hover:bg-[#EBE7DF]';
              
              if (isSelected) {
                if (opt.id === 'diaper_wet') {
                  customStyle = 'bg-sky-600 text-white font-bold shadow-xs border-transparent';
                } else if (opt.id === 'diaper_dirty') {
                  customStyle = 'bg-amber-800 text-white font-bold shadow-xs border-transparent';
                } else if (opt.id === 'diaper_both') {
                  customStyle = 'bg-teal-700 text-white font-bold shadow-xs border-transparent';
                } else {
                  customStyle = 'bg-[#2A2723] text-[#F9F6F0] font-semibold shadow-xs border-transparent';
                }
              } else {
                if (opt.id === 'diaper_wet') {
                  customStyle = 'bg-sky-50/60 border border-sky-200 text-sky-900 hover:bg-sky-100';
                } else if (opt.id === 'diaper_dirty') {
                  customStyle = 'bg-amber-50/60 border border-amber-200 text-amber-900 hover:bg-amber-100';
                } else if (opt.id === 'diaper_both') {
                  customStyle = 'bg-teal-50/60 border border-teal-200 text-teal-900 hover:bg-teal-100';
                }
              }

              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setType(opt.id)}
                  className={`p-2 rounded-xl text-xs font-sans text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${customStyle}`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6457] font-medium mb-1">記錄時間</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono text-[#2A2723] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">照護者稱謂</label>
              <input
                type="text"
                value={loggedBy}
                onChange={(e) => setLoggedBy(e.target.value)}
                placeholder="例如: 媽媽 / 爸爸 / 月嫂"
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
              />
            </div>
          </div>

          {/* Conditional Field Inputs depending on category */}
          {type === 'feed_bottle' && (
            <div className="p-4 bg-white rounded-2xl border border-[#EBE7DF] space-y-2">
              <label className="text-xs font-semibold text-[#2A2723] block">餵奶量 (ml)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="10"
                  value={amountMl}
                  onChange={(e) => setAmountMl(Number(e.target.value))}
                  className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723]"
                  placeholder="120"
                />
                <span className="text-xs text-[#8C8475] font-mono">ml</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[60, 90, 120, 150, 180, 210].map((ml) => (
                  <button
                    type="button"
                    key={ml}
                    onClick={() => setAmountMl(ml)}
                    className="px-2 py-1 rounded-lg bg-[#EBE7DF] hover:bg-[#D9D1C2] text-[11px] font-mono cursor-pointer"
                  >
                    {ml}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(type === 'sleep' || type === 'feed_breast' || type === 'tummy_time') && (
            <div className="p-4 bg-white rounded-2xl border border-[#EBE7DF] space-y-2">
              <label className="text-xs font-semibold text-[#2A2723] block">
                {type === 'sleep' ? '睡眠時長 (分鐘)' : type === 'feed_breast' ? '親餵時長 (分鐘)' : '趴撐練習時長 (分鐘)'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723]"
                  placeholder="60"
                />
                <span className="text-xs text-[#8C8475] font-mono">分鐘</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[15, 30, 45, 60, 90, 120].map((min) => (
                  <button
                    type="button"
                    key={min}
                    onClick={() => setDurationMinutes(min)}
                    className="px-2 py-1 rounded-lg bg-[#EBE7DF] hover:bg-[#D9D1C2] text-[11px] font-mono cursor-pointer"
                  >
                    {min}分
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'temperature' && (
            <div className="p-4 bg-white rounded-2xl border border-[#EBE7DF] space-y-2">
              <label className="text-xs font-semibold text-[#2A2723] block">量測體溫 (°C)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={temperatureCelsius}
                  onChange={(e) => setTemperatureCelsius(parseFloat(e.target.value))}
                  className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723]"
                  placeholder="36.8"
                />
                <span className="text-xs text-[#8C8475] font-mono">°C</span>
              </div>
              <p className="text-[11px] text-[#8C8475]">
                {Number(temperatureCelsius) >= 38.0
                  ? '⚠️ 提示：體溫達 38.0°C 以上屬發燒，請持續觀察並評估就醫。'
                  : '一般正常嬰幼兒耳溫/肛溫範圍約 36.5°C ~ 37.5°C。'}
              </p>
            </div>
          )}

          {/* Diaper Wet Specific Inputs */}
          {type === 'diaper_wet' && (
            <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <span>💧 尿布濕度 / 尿量評估</span>
                </label>
                <span className="text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-mono">
                  尿尿打卡
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '微濕 (剛尿/少量)',
                  '適中正常 (及時更換)',
                  '沈重一大包 (換新乾爽)',
                  '側漏滲出 (需調版型)',
                ].map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setDiaperWetness(w)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      diaperWetness === w
                        ? 'bg-sky-600 text-white shadow-2xs font-semibold'
                        : 'bg-white text-sky-900 border border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-sky-700 leading-relaxed">
                💡 兒科衛教：寶寶一天更換 6 片以上適量濕尿布，代表奶量充足且排泄水分正常，勤換尿布可預防紅屁屁。
              </p>
            </div>
          )}

          {/* Diaper Dirty Specific Inputs */}
          {type === 'diaper_dirty' && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span>💩 便便顏色 (依國健署大便卡比對)</span>
                </label>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-mono">
                  大便打卡
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '金黃色 (正常 7-9號)',
                  '黃綠色 (正常 7-9號)',
                  '墨綠色 (正常 7-9號)',
                  '深褐色 (正常)',
                  '灰白/淡黃 (警訊 1-6號 ⚠️)',
                  '鮮紅/血絲 (警訊 ⚠️)',
                  '黑色柏油狀 (需注意 ⚠️)',
                ].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setDiaperColor(c)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      diaperColor === c
                        ? c.includes('警訊')
                          ? 'bg-rose-700 text-white shadow-2xs font-bold'
                          : 'bg-amber-800 text-white shadow-2xs font-bold'
                        : c.includes('警訊')
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                        : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Stool Texture */}
              <div className="pt-2 border-t border-amber-200/60 space-y-1.5">
                <label className="text-xs font-semibold text-amber-900 block">質地形態</label>
                <div className="flex flex-wrap gap-1.5">
                  {['糊狀軟便 (良好)', '帶奶瓣顆粒 (正常消化)', '水狀稀便 (觀察防脫水)', '黏液軟便', '偏硬羊屎粒 (可能缺水)'].map(
                    (t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setDiaperStoolTexture(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors ${
                          diaperStoolTexture === t
                            ? 'bg-amber-900 text-white font-medium shadow-2xs'
                            : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed">
                💡 兒科衛教：若寶寶大便呈現 1~6 號灰白淡黃色，可能為膽道閉鎖警訊，請儘速帶便便尿布前往兒科就診。
              </p>
            </div>
          )}

          {/* Diaper Both (Wet + Dirty) */}
          {type === 'diaper_both' && (
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <span>🧻 雙重更換 (尿布又濕又便)</span>
                </label>
                <span className="text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full font-mono">
                  尿尿 + 大便
                </span>
              </div>

              {/* Wetness */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-teal-900">💧 尿量程度:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['微濕', '適中正常', '沈重一大包'].map((w) => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => setDiaperWetness(w)}
                      className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                        diaperWetness === w
                          ? 'bg-teal-700 text-white font-medium'
                          : 'bg-white text-teal-900 border border-teal-200'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stool Color */}
              <div className="space-y-1 pt-1.5 border-t border-teal-200/60">
                <span className="text-[11px] font-semibold text-teal-900">💩 便便顏色與質地:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['金黃色 (正常)', '黃綠色 (正常)', '墨綠色 (正常)', '糊狀軟便', '水狀稀便', '偏硬羊便', '灰白/警訊 ⚠️'].map(
                    (c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setDiaperColor(c)}
                        className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                          diaperColor === c
                            ? 'bg-teal-900 text-white font-medium'
                            : 'bg-white text-teal-900 border border-teal-200'
                        }`}
                      >
                        {c}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">標題摘要 (選填)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="留空將依項目自動生成"
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">備註心得 (選填)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如: 喝奶順利拍出大嗝、心情平穩安睡..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#D9D1C2] text-xs text-[#6B6457] hover:bg-[#EBE7DF] cursor-pointer"
            >
              取消
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-6 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-semibold hover:bg-[#4A453E] shadow-xs cursor-pointer"
            >
              {editingEntry ? '儲存變更' : '新增紀錄'}
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
