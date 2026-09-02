import React, { useState } from 'react';
import { 
  BookHeart, 
  Smile, 
  Award, 
  Milk, 
  Moon, 
  Baby, 
  Thermometer, 
  Image as ImageIcon,
  Plus, 
  Trash2,
  Droplets,
  Activity
} from 'lucide-react';
import { BabyProfile, DiaryCategory, DiaryEntry, BabyMood } from '../types';

interface AddDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  initialCategory?: DiaryCategory;
  onSave: (entry: DiaryEntry) => void;
}

export const AddDiaryModal: React.FC<AddDiaryModalProps> = ({
  isOpen,
  onClose,
  babyProfile,
  initialCategory = 'daily',
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);
  const [category, setCategory] = useState<DiaryCategory>(initialCategory);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<BabyMood>('happy');
  const [milestoneTag, setMilestoneTag] = useState('');
  const [author, setAuthor] = useState('媽媽');

  // Intake Routine metrics fields
  const [feedingType, setFeedingType] = useState<'breast' | 'formula' | 'solid' | 'water'>('formula');
  const [feedingAmountMl, setFeedingAmountMl] = useState('');
  const [feedingDurationMins, setFeedingDurationMins] = useState('');
  const [waterAmountMl, setWaterAmountMl] = useState('');
  const [solidFoodDetails, setSolidFoodDetails] = useState('');
  
  // Output Routine metrics fields
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both' | 'clean'>('wet');
  const [diaperWetnessLevel, setDiaperWetnessLevel] = useState<'light' | 'medium' | 'heavy' | 'measured'>('medium');
  const [urineAmountMl, setUrineAmountMl] = useState('');
  const [stoolConsistency, setStoolConsistency] = useState<'soft' | 'watery' | 'loose' | 'formed' | 'hard'>('soft');
  const [stoolColor, setStoolColor] = useState('yellow');
  const [vomitSeverity, setVomitSeverity] = useState<'none' | 'spit_up' | 'moderate' | 'projectile'>('none');
  const [vomitMl, setVomitMl] = useState('');

  // Routine general
  const [sleepHours, setSleepHours] = useState('');
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('night');
  const [temperatureC, setTemperatureC] = useState('');
  const [medicationTaken, setMedicationTaken] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [photosList, setPhotosList] = useState<string[]>([]);

  if (!isOpen) return null;

  const moodsList: { id: BabyMood; emoji: string; label: string }[] = [
    { id: 'happy', emoji: '😊', label: '開心' },
    { id: 'playful', emoji: '🧸', label: '活潑' },
    { id: 'calm', emoji: '🌿', label: '安穩' },
    { id: 'sleepy', emoji: '😴', label: '愛睏' },
    { id: 'fussy', emoji: '🥺', label: '哭鬧' },
    { id: 'curious', emoji: '🐣', label: '好奇' },
  ];

  const milestonePresets = [
    '第一次自己翻身',
    '第一次冒出乳牙',
    '第一次笑出聲音',
    '第一次嘗試副食品',
    '睡過夜連續 6 小時',
    '第一次抓握玩具',
    '會發出「爸、媽」音',
  ];

  const handleAddPhoto = () => {
    if (photoUrl.trim()) {
      setPhotosList([...photosList, photoUrl.trim()]);
      setPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotosList(photosList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (
      category === 'feeding' ? `喝奶 ${feedingAmountMl ? `${feedingAmountMl}ml` : ''}` :
      category === 'diaper' ? `換尿布 (${diaperType === 'wet' ? '純尿' : diaperType === 'dirty' ? '大便' : '尿+便'})` :
      category === 'io' ? 'Total I/O 水分進出紀錄' :
      category === 'sleep' ? `小睡/睡眠 ${sleepHours ? `${sleepHours}小時` : ''}` :
      '寶寶成長動態'
    );

    const metricsObj: any = {};
    if (feedingAmountMl) metricsObj.feedingAmountMl = parseFloat(feedingAmountMl);
    if (feedingDurationMins) metricsObj.feedingDurationMins = parseFloat(feedingDurationMins);
    if (waterAmountMl) metricsObj.waterAmountMl = parseFloat(waterAmountMl);
    if (feedingType) metricsObj.feedingType = feedingType;
    if (solidFoodDetails.trim()) metricsObj.solidFoodDetails = solidFoodDetails.trim();
    
    if (category === 'diaper' || category === 'io') {
      metricsObj.diaperType = diaperType;
      metricsObj.diaperWetnessLevel = diaperWetnessLevel;
      if (urineAmountMl) metricsObj.urineAmountMl = parseFloat(urineAmountMl);
      metricsObj.stoolConsistency = stoolConsistency;
      metricsObj.stoolColor = stoolColor;
      if (vomitSeverity !== 'none') {
        metricsObj.vomitSeverity = vomitSeverity;
        if (vomitMl) metricsObj.vomitMl = parseFloat(vomitMl);
      }
    }

    if (sleepHours) metricsObj.sleepHours = parseFloat(sleepHours);
    if (sleepType) metricsObj.sleepType = sleepType;
    if (temperatureC) metricsObj.temperatureC = parseFloat(temperatureC);
    if (medicationTaken.trim()) metricsObj.medicationTaken = medicationTaken.trim();

    const newEntry: DiaryEntry = {
      id: `diary_${Date.now()}`,
      date,
      time,
      category,
      title: finalTitle,
      content: content.trim() || '日常照護記錄',
      mood,
      milestoneTag: milestoneTag.trim() || undefined,
      photos: photosList.length > 0 ? photosList : undefined,
      author: author.trim() || undefined,
      metrics: Object.keys(metricsObj).length > 0 ? metricsObj : undefined,
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-xl w-full border border-[#D9D1C2] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <BookHeart className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2A2723]">
                記錄寶寶成長日常與日記
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                {babyProfile.name} 的專屬成長點滴
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          
          {/* Category Tabs */}
          <div>
            <label className="text-[#8C8475] block mb-1.5 font-medium">日記類型</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'daily', label: '📔 生活', icon: BookHeart },
                { id: 'feeding', label: '🍼 飲食', icon: Milk },
                { id: 'diaper', label: '🧷 尿布/排泄', icon: Droplets },
                { id: 'sleep', label: '💤 睡眠', icon: Moon },
                { id: 'milestone', label: '🌟 里程碑', icon: Award },
                { id: 'temperature', label: '🌡️ 體溫', icon: Thermometer },
                { id: 'io', label: '💧 Total I/O', icon: Activity },
                { id: 'medical', label: '🏥 用藥就診', icon: Plus },
              ].map((item) => {
                const Icon = item.icon;
                const isSel = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as DiaryCategory)}
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                      isSel
                        ? 'bg-[#2A2723] text-white shadow-xs'
                        : 'bg-white text-[#4A453E] border border-[#EBE7DF] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#8C8475] block mb-1">記錄日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D1CEC4] bg-white text-[#2A2723]"
                required
              />
            </div>
            <div>
              <label className="text-[#8C8475] block mb-1">記錄時間</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D1CEC4] bg-white text-[#2A2723]"
                required
              />
            </div>
          </div>

          {/* SPECIFIC FIELDS: FEEDING / INTAKE */}
          {(category === 'feeding' || category === 'io') && (
            <div className="p-3.5 bg-[#F2EDE4] rounded-2xl space-y-3 border border-[#D9D1C2]">
              <span className="font-bold text-[#2A2723] flex items-center gap-1.5">
                <Milk className="w-4 h-4 text-sky-700" />
                <span>Intake 攝入量記錄 (餵奶 / 副食品 / 水)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#6B6457] block mb-1">飲食方式</label>
                  <select
                    value={feedingType}
                    onChange={(e) => setFeedingType(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
                  >
                    <option value="formula">配方奶 (瓶餵)</option>
                    <option value="breast">母乳 (親餵/瓶餵)</option>
                    <option value="solid">副食品 / 粥品</option>
                    <option value="water">水 / 電解質水</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#6B6457] block mb-1">攝入份量 (ml)</label>
                  <input
                    type="number"
                    placeholder="如: 120"
                    value={feedingAmountMl}
                    onChange={(e) => setFeedingAmountMl(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white font-mono"
                  />
                </div>
              </div>

              {feedingType === 'breast' && (
                <div>
                  <label className="text-[#6B6457] block mb-1">親餵時間 (分鐘)</label>
                  <input
                    type="number"
                    placeholder="如: 20 (若親餵未量ml，將依分鐘估算)"
                    value={feedingDurationMins}
                    onChange={(e) => setFeedingDurationMins(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* SPECIFIC FIELDS: DIAPER / OUTPUT */}
          {(category === 'diaper' || category === 'io') && (
            <div className="p-3.5 bg-[#F2EDE4] rounded-2xl space-y-3 border border-[#D9D1C2]">
              <span className="font-bold text-[#2A2723] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-amber-700" />
                <span>Output 排泄量記錄 (尿布 / 尿量 / 大便 / 溢奶)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#6B6457] block mb-1">排泄性質</label>
                  <select
                    value={diaperType}
                    onChange={(e) => setDiaperType(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
                  >
                    <option value="wet">純排尿 (濕尿布)</option>
                    <option value="dirty">排便 (大便)</option>
                    <option value="both">尿尿 + 排便</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#6B6457] block mb-1">濕度/尿量評估</label>
                  <select
                    value={diaperWetnessLevel}
                    onChange={(e) => setDiaperWetnessLevel(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
                  >
                    <option value="light">輕微濕 (~30ml)</option>
                    <option value="medium">中度濕 (~60ml)</option>
                    <option value="heavy">沈重濕重尿布 (~100ml)</option>
                  </select>
                </div>
              </div>

              {/* Stool consistency & vomit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#6B6457] block mb-1">大便性狀 (Bristol)</label>
                  <select
                    value={stoolConsistency}
                    onChange={(e) => setStoolConsistency(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
                  >
                    <option value="soft">正常軟便 / 糊狀便</option>
                    <option value="watery">水便 (水瀉)</option>
                    <option value="loose">稀便</option>
                    <option value="formed">成形軟便</option>
                    <option value="hard">硬便 / 羊便便</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#6B6457] block mb-1">溢奶 / 嘔吐情形</label>
                  <select
                    value={vomitSeverity}
                    onChange={(e) => setVomitSeverity(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
                  >
                    <option value="none">無溢奶</option>
                    <option value="spit_up">微量溢奶 (~15ml)</option>
                    <option value="moderate">中度吐奶 (~40ml)</option>
                    <option value="projectile">噴射狀嘔吐 (~80ml)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Title & Content */}
          <div>
            <label className="text-[#8C8475] block mb-1">標題 / 摘要</label>
            <input
              type="text"
              placeholder="例：喝了 150ml 奶後安穩睡著、第一次長牙"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D1CEC4] bg-white text-[#2A2723]"
            />
          </div>

          <div>
            <label className="text-[#8C8475] block mb-1">詳細心得與紀錄</label>
            <textarea
              rows={3}
              placeholder="記錄寶寶的表情、喝奶作息與互動心得..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#D1CEC4] bg-white text-[#2A2723]"
            />
          </div>

          {/* Mood & Author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#8C8475] block mb-1">寶寶當下心情</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as BabyMood)}
                className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
              >
                {moodsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[#8C8475] block mb-1">記錄照護者</label>
              <input
                type="text"
                placeholder="媽媽 / 爸爸 / 褓母"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2 rounded-xl border border-[#D1CEC4] bg-white"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-[#EBE7DF] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#D1CEC4] text-[#4A453E] hover:bg-[#E6DFD1]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-white font-medium shadow-sm transition-all"
            >
              發佈並儲存日記
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
