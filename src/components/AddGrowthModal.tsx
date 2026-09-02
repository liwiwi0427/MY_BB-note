import React, { useState } from 'react';
import { X, TrendingUp, Scale, Ruler, Brain, Calendar } from 'lucide-react';
import type { GrowthRecord, BabyProfile } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface AddGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: BabyProfile;
  onSave: (record: Partial<GrowthRecord>) => void;
  editingRecord?: GrowthRecord | null;
}

export const AddGrowthModal: React.FC<AddGrowthModalProps> = ({
  isOpen,
  onClose,
  baby,
  onSave,
  editingRecord,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(editingRecord ? editingRecord.date : todayStr);
  const [weight, setWeight] = useState<number | ''>(editingRecord ? editingRecord.weight : 4.5);
  const [length, setLength] = useState<number | ''>(editingRecord ? editingRecord.length : 55.0);
  const [headCirc, setHeadCirc] = useState<number | ''>(editingRecord ? editingRecord.headCirc : 37.0);
  const [doctorNote, setDoctorNote] = useState(editingRecord?.doctorNote || '');
  const [measuredBy, setMeasuredBy] = useState(editingRecord?.measuredBy || '小兒科門診 / 家中');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageInfo = calculateAge(baby.birthDate, date);

    onSave({
      date,
      ageMonths: ageInfo.months,
      ageDays: ageInfo.totalDays,
      weight: Number(weight) || 0,
      length: Number(length) || 0,
      headCirc: Number(headCirc) || 0,
      doctorNote: doctorNote.trim(),
      measuredBy: measuredBy.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#F9F6F0] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                {editingRecord ? '編輯生長發育測量紀錄' : '記錄寶寶最新生長數值'}
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                體重、身長、頭圍實時對照 WHO 百分位標準
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C8475] hover:text-[#2A2723] rounded-xl hover:bg-[#EBE7DF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6457] font-medium mb-1">測量日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono text-[#2A2723] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">測量單位 / 地點</label>
              <input
                type="text"
                value={measuredBy}
                onChange={(e) => setMeasuredBy(e.target.value)}
                placeholder="例如: 台大小兒科 / 家用嬰兒秤"
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
              />
            </div>
          </div>

          {/* Three measurement numbers */}
          <div className="p-4 bg-white rounded-2xl border border-[#EBE7DF] space-y-3">
            <span className="font-serif font-bold text-xs text-[#2A2723] block">
              輸入三大生理發育指標
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-amber-900 font-bold block mb-1">
                  體重 (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || '')}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723]"
                />
              </div>

              <div>
                <label className="text-[11px] text-teal-900 font-bold block mb-1">
                  身長 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={length}
                  onChange={(e) => setLength(parseFloat(e.target.value) || '')}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723]"
                />
              </div>

              <div>
                <label className="text-[11px] text-indigo-900 font-bold block mb-1">
                  頭圍 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={headCirc}
                  onChange={(e) => setHeadCirc(parseFloat(e.target.value) || '')}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#2A2723]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">醫師評估健檢備註</label>
            <textarea
              rows={2}
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
              placeholder="生長百分位良好、脖子有力、追視靈活..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl p-3 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EBE7DF] text-[#6B6457] text-xs font-medium hover:bg-[#D9D1C2] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-medium hover:bg-[#4A453E] transition-colors shadow-xs"
            >
              {editingRecord ? '儲存修改' : '儲存測量數據'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
