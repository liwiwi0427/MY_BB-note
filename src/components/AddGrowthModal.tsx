import React, { useState, useEffect } from 'react';
import { Weight, Ruler, Brain, Calendar, User, FileText, CheckCircle2, Edit3 } from 'lucide-react';
import { BabyProfile, GrowthRecord } from '../types';
import { calculatePercentile, getPercentileInterpretation } from '../data/whoGrowthData';

interface AddGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  editingRecord?: GrowthRecord | null;
  onSave: (record: GrowthRecord) => void;
}

export const AddGrowthModal: React.FC<AddGrowthModalProps> = ({
  isOpen,
  onClose,
  babyProfile,
  editingRecord,
  onSave,
}) => {
  const isEditing = Boolean(editingRecord);

  const [date, setDate] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [headCirc, setHeadCirc] = useState<string>('');
  const [doctorNote, setDoctorNote] = useState('');
  const [measuredBy, setMeasuredBy] = useState('媽媽');

  useEffect(() => {
    if (!isOpen) return;

    if (editingRecord) {
      setDate(editingRecord.date || new Date().toISOString().split('T')[0]);
      setWeight(editingRecord.weight ? String(editingRecord.weight) : '');
      setLength(editingRecord.length ? String(editingRecord.length) : '');
      setHeadCirc(editingRecord.headCirc ? String(editingRecord.headCirc) : '');
      setDoctorNote(editingRecord.doctorNote || '');
      setMeasuredBy(editingRecord.measuredBy || '媽媽');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setWeight('');
      setLength('');
      setHeadCirc('');
      setDoctorNote('');
      setMeasuredBy('媽媽');
    }
  }, [isOpen, editingRecord]);

  if (!isOpen) return null;

  // Calculate age at measurement date
  const birthTime = new Date(babyProfile.birthday).getTime();
  const measureTime = new Date(date || new Date().toISOString().split('T')[0]).getTime();
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

    const recordToSave: GrowthRecord = {
      id: editingRecord ? editingRecord.id : `growth_${Date.now()}`,
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

    onSave(recordToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-lg w-full border border-[#D9D1C2] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              {isEditing ? <Edit3 className="w-5 h-5" strokeWidth={1.5} /> : <Weight className="w-5 h-5" strokeWidth={1.5} />}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
                {isEditing ? '編輯生長發育數據' : '記錄最新生長發育數據'}
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                測量日期將自動計算對應月齡與 WHO 生長曲線百分位
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
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5 font-medium">
                測量日期 *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-[#2A2723] font-mono text-xs focus:outline-hidden focus:border-[#2A2723]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5 font-medium">
                推算月齡 / 天數
              </label>
              <div className="px-4 py-2.5 rounded-full bg-[#F2EDE4] border border-[#D9D1C2] text-[#2A2723] font-serif text-sm">
                滿 {ageMonths} 個月 ({diffDays} 天)
              </div>
            </div>
          </div>

          {/* Measurements Fields Grid with Live Percentile Preview */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Weight */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center font-medium">
                體重 (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="30"
                required
                placeholder="如: 6.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full text-center px-2 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white text-base font-mono font-bold text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
              />
              <div className="text-center text-[10px] font-mono font-medium text-[#4A453E] bg-[#EBE7DF] py-1 rounded-full">
                P{pWeight}
              </div>
            </div>

            {/* Length */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center font-medium">
                身長 (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="130"
                required
                placeholder="如: 63.5"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full text-center px-2 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white text-base font-mono font-bold text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
              />
              <div className="text-center text-[10px] font-mono font-medium text-[#4A453E] bg-[#EBE7DF] py-1 rounded-full">
                P{pLength}
              </div>
            </div>

            {/* Head Circumference */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center font-medium">
                頭圍 (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="60"
                required
                placeholder="如: 41.5"
                value={headCirc}
                onChange={(e) => setHeadCirc(e.target.value)}
                className="w-full text-center px-2 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white text-base font-mono font-bold text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
              />
              <div className="text-center text-[10px] font-mono font-medium text-[#4A453E] bg-[#EBE7DF] py-1 rounded-full">
                P{pHead}
              </div>
            </div>

          </div>

          {/* Real-time Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#EBE7DF] space-y-1 text-xs">
            <div className="text-[#6B6457] font-medium">即時 WHO 生長指標評估：</div>
            <div className="text-[#2A2723] leading-relaxed">
              體重落在 <strong>{getPercentileInterpretation(pWeight)}</strong> ｜ 
              身長落在 <strong>{getPercentileInterpretation(pLength)}</strong> ｜ 
              頭圍落在 <strong>{getPercentileInterpretation(pHead)}</strong>
              {bmi && <span className="ml-2 font-mono text-[#8C8475]">(BMI: {bmi})</span>}
            </div>
          </div>

          {/* Measured By */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5 font-medium">
              測量者或院所單位
            </label>
            <input
              type="text"
              placeholder="例如：禾馨小兒科護理師、台大醫院健檢、媽媽居家測量"
              value={measuredBy}
              onChange={(e) => setMeasuredBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
            />
          </div>

          {/* Doctor Note */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5 font-medium">
              醫師囑咐 / 生長評估備註
            </label>
            <textarea
              rows={2}
              placeholder="例如：發展里程碑正常，翻身穩定；醫生建議副食品每日增加一餐..."
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#D1CEC4] bg-white text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs font-sans uppercase tracking-wider shadow-sm transition-all font-medium"
            >
              {isEditing ? '更新並儲存數據' : '確定儲存成長記錄'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
