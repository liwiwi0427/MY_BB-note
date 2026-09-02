import React, { useState } from 'react';
import { Weight, Ruler, Brain, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { BabyProfile, GrowthRecord } from '../types';
import { calculatePercentile, getPercentileInterpretation } from '../data/whoGrowthData';

interface AddGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  onSave: (record: GrowthRecord) => void;
}

export const AddGrowthModal: React.FC<AddGrowthModalProps> = ({
  isOpen,
  onClose,
  babyProfile,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [weight, setWeight] = useState<string>('6.5');
  const [length, setLength] = useState<string>('63.0');
  const [headCirc, setHeadCirc] = useState<string>('41.5');
  const [doctorNote, setDoctorNote] = useState('');
  const [measuredBy, setMeasuredBy] = useState('媽媽');

  if (!isOpen) return null;

  // Calculate age at measurement date
  const birthTime = new Date(babyProfile.birthday).getTime();
  const measureTime = new Date(date).getTime();
  const diffDays = Math.max(0, Math.floor((measureTime - birthTime) / (1000 * 60 * 60 * 24)));
  const ageMonths = parseFloat((diffDays / 30.4375).toFixed(1));

  const numWeight = parseFloat(weight) || 0;
  const numLength = parseFloat(length) || 0;
  const numHead = parseFloat(headCirc) || 0;

  // Live Percentiles
  const pWeight = numWeight > 0 ? calculatePercentile(numWeight, ageMonths, 'weight', babyProfile.gender) : 50;
  const pLength = numLength > 0 ? calculatePercentile(numLength, ageMonths, 'length', babyProfile.gender) : 50;
  const pHead = numHead > 0 ? calculatePercentile(numHead, ageMonths, 'headCirc', babyProfile.gender) : 50;

  // BMI
  const lengthM = numLength / 100;
  const bmi = lengthM > 0 ? parseFloat((numWeight / (lengthM * lengthM)).toFixed(1)) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numWeight || !numLength || !numHead) return;

    const newRecord: GrowthRecord = {
      id: `growth_${Date.now()}`,
      date,
      ageMonths,
      ageDays: diffDays,
      weight: numWeight,
      length: numLength,
      headCirc: numHead,
      percentileWeight: pWeight,
      percentileLength: pLength,
      percentileHeadCirc: pHead,
      bmi,
      doctorNote: doctorNote.trim() || undefined,
      measuredBy: measuredBy.trim() || undefined,
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F9F6F0] rounded-[36px] p-7 sm:p-9 max-w-lg w-full border border-[#D9D1C2] shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <Weight className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif italic text-[#2A2723]">
                記錄最新生長發育數據
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                測量日期將自動計算對應月齡與 WHO 百分位
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-sans">
          
          {/* Date & Age Calculation Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                測量日期
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                推算月齡 / 天數
              </label>
              <div className="px-4 py-2.5 rounded-full bg-[#F2EDE4] border border-[#D9D1C2] text-[#2A2723] font-serif italic text-sm">
                滿 {ageMonths} 個月 ({diffDays} 天)
              </div>
            </div>
          </div>

          {/* Measurements Fields Grid with Live Percentile Preview */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Weight */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center">
                體重 (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="25"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white font-mono font-bold text-[#2A2723] text-center focus:border-[#2A2723]"
              />
              <div className="text-[10px] text-center font-mono font-bold text-[#2A2723] bg-[#F2EDE4] rounded-full py-0.5 border border-[#D9D1C2]">
                P{pWeight}
              </div>
            </div>

            {/* Length */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center">
                身長 (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="120"
                required
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white font-mono font-bold text-[#2A2723] text-center focus:border-[#2A2723]"
              />
              <div className="text-[10px] text-center font-mono font-bold text-[#3E4A3E] bg-[#E6EBE6] rounded-full py-0.5 border border-[#D5DDD5]">
                P{pLength}
              </div>
            </div>

            {/* Head */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center">
                頭圍 (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="25"
                max="60"
                required
                value={headCirc}
                onChange={(e) => setHeadCirc(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white font-mono font-bold text-[#2A2723] text-center focus:border-[#2A2723]"
              />
              <div className="text-[10px] text-center font-mono font-bold text-[#3A4050] bg-[#E6E9F2] rounded-full py-0.5 border border-[#D5D9E6]">
                P{pHead}
              </div>
            </div>

          </div>

          {/* Measured By & Doctor Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                記錄者 / 測量人
              </label>
              <input
                type="text"
                placeholder="媽媽 / 爸爸 / 兒科診所"
                value={measuredBy}
                onChange={(e) => setMeasuredBy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                BMI 指數
              </label>
              <div className="px-4 py-2.5 rounded-full bg-[#F2EDE4] text-[#2A2723] font-mono">
                {bmi ? `${bmi} kg/m²` : '--'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
              醫師評註或生長觀察心得 (選填)
            </label>
            <textarea
              rows={2}
              placeholder="例：健檢醫師表示生長曲線十分漂亮，活動力與眼神追視發展良好..."
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
              className="w-full px-4 py-3 rounded-[20px] border border-[#D1CEC4] bg-white text-[#2A2723] focus:border-[#2A2723]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs font-sans uppercase tracking-wider shadow-sm transition-all"
            >
              儲存生長數據
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
