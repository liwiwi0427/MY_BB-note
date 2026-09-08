import React, { useState, useEffect, useMemo } from 'react';
import { Weight, Ruler, Brain, Calendar, User, FileText, CheckCircle2, Edit3, AlertCircle, Sparkles } from 'lucide-react';
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
  const [formError, setFormError] = useState<string | null>(null);

  // Helper to parse numbers safely (supports comma or dot, and detects grams)
  const parseMeasure = (val: string): { value: number; isGramsConverted: boolean } => {
    if (!val || typeof val !== 'string') return { value: 0, isGramsConverted: false };
    const cleaned = val.replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || parsed <= 0) return { value: 0, isGramsConverted: false };

    // If weight is entered in grams (e.g., 3200g, 4500g)
    if (parsed > 100) {
      return { value: parseFloat((parsed / 1000).toFixed(2)), isGramsConverted: true };
    }
    return { value: parsed, isGramsConverted: false };
  };

  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);
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

  // Calculate age at measurement date safely
  const birthTime = babyProfile.birthday ? new Date(babyProfile.birthday).getTime() : Date.now();
  const measureTime = new Date(date || new Date().toISOString().split('T')[0]).getTime();
  const diffDays = Math.max(0, Math.floor((measureTime - birthTime) / (1000 * 60 * 60 * 24)));
  const ageMonths = parseFloat((diffDays / 30.4375).toFixed(1));

  const parsedWeightInfo = parseMeasure(weight);
  const numWeight = parsedWeightInfo.value;
  const numLength = parseMeasure(length).value;
  const numHead = parseMeasure(headCirc).value;

  // Live Percentiles
  const pWeight = numWeight > 0 ? calculatePercentile(numWeight, ageMonths, 'weight', babyProfile.gender) : null;
  const pLength = numLength > 0 ? calculatePercentile(numLength, ageMonths, 'length', babyProfile.gender) : null;
  const pHead = numHead > 0 ? calculatePercentile(numHead, ageMonths, 'headCirc', babyProfile.gender) : null;

  // Live BMI
  const lengthM = numLength / 100;
  const bmi = lengthM > 0 && numWeight > 0 ? parseFloat((numWeight / (lengthM * lengthM)).toFixed(1)) : undefined;

  // Quick fill birth baseline values
  const handleFillBirthValues = () => {
    if (babyProfile.birthWeight > 0) setWeight(String(babyProfile.birthWeight));
    if (babyProfile.birthLength > 0) setLength(String(babyProfile.birthLength));
    if (babyProfile.birthHeadCirc > 0) setHeadCirc(String(babyProfile.birthHeadCirc));
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation: at least one measurement is required
    if (numWeight <= 0 && numLength <= 0 && numHead <= 0) {
      setFormError('請至少填寫一項生長數值（體重、身長或頭圍）！');
      return;
    }

    // Determine final values with friendly fallbacks
    let finalWeight = numWeight;
    if (finalWeight <= 0) {
      finalWeight = editingRecord?.weight || (babyProfile.birthWeight > 0 ? babyProfile.birthWeight : 3.5);
    }

    let finalLength = numLength;
    if (finalLength <= 0) {
      finalLength = editingRecord?.length || (babyProfile.birthLength > 0 ? babyProfile.birthLength : 50);
    }

    let finalHead = numHead;
    if (finalHead <= 0) {
      finalHead = editingRecord?.headCirc || (babyProfile.birthHeadCirc > 0 ? babyProfile.birthHeadCirc : 34);
    }

    const calcLengthM = finalLength / 100;
    const finalBmi = calcLengthM > 0 ? parseFloat((finalWeight / (calcLengthM * calcLengthM)).toFixed(1)) : undefined;

    const calcPWeight = calculatePercentile(finalWeight, ageMonths, 'weight', babyProfile.gender);
    const calcPLength = calculatePercentile(finalLength, ageMonths, 'length', babyProfile.gender);
    const calcPHead = calculatePercentile(finalHead, ageMonths, 'headCirc', babyProfile.gender);

    const recordToSave: GrowthRecord = {
      id: editingRecord ? editingRecord.id : `growth_${Date.now()}`,
      date: date || new Date().toISOString().split('T')[0],
      ageMonths,
      ageDays: diffDays,
      weight: finalWeight,
      length: finalLength,
      headCirc: finalHead,
      percentileWeight: calcPWeight,
      percentileLength: calcPLength,
      percentileHeadCirc: calcPHead,
      bmi: finalBmi,
      doctorNote: doctorNote.trim() || undefined,
      measuredBy: measuredBy.trim() || undefined,
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-lg w-full border border-[#D9D1C2] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center shrink-0">
              {isEditing ? <Edit3 className="w-5 h-5" strokeWidth={1.5} /> : <Weight className="w-5 h-5" strokeWidth={1.5} />}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
                {isEditing ? '編輯生長發育數據' : '輸入生長發育數據'}
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                支援體重、身長、頭圍輸入，自動換算 WHO 兒童生長曲線常模
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F2EDE4] text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center font-bold transition-colors cursor-pointer"
            aria-label="關閉視窗"
          >
            ✕
          </button>
        </div>

        {/* Error Alert Banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Grams converted helper notice */}
        {parsedWeightInfo.isGramsConverted && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>貼心提示：偵測到公克數值，系統已自動換算為 <strong>{parsedWeightInfo.value} kg</strong></span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-sans">
          
          {/* Date & Age Calculation Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5 font-medium">
                測量日期 *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-[#2A2723] font-mono text-xs focus:outline-hidden focus:border-[#2A2723]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5 font-medium">
                推算月齡 / 天數
              </label>
              <div className="px-4 py-2.5 rounded-full bg-[#F2EDE4] border border-[#D9D1C2] text-[#2A2723] font-serif text-xs sm:text-sm flex items-center justify-between">
                <span>滿 <strong className="font-mono">{ageMonths}</strong> 個月</span>
                <span className="text-xs text-[#8C8475]">({diffDays} 天)</span>
              </div>
            </div>
          </div>

          {/* Measurements Fields Grid with Live Percentile Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-sans uppercase tracking-wider text-[#6B6457] font-medium">
                生長測量數值（至少填寫一項）
              </span>
              <button
                type="button"
                onClick={handleFillBirthValues}
                className="text-[11px] text-[#8C8475] hover:text-[#2A2723] underline font-sans"
              >
                帶入出生數值
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              
              {/* Weight */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center font-medium">
                  體重 (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="如: 6.5"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full text-center px-2 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white text-base font-mono font-bold text-[#2A2723] focus:outline-hidden focus:border-[#2A2723] shadow-2xs"
                />
                <div className="text-center text-[10px] font-mono font-medium text-[#4A453E] bg-[#EBE7DF] py-1 rounded-full">
                  {pWeight !== null ? `P${pWeight}` : (babyProfile.birthWeight > 0 ? `初生: ${babyProfile.birthWeight}` : '選填')}
                </div>
              </div>

              {/* Length */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center font-medium">
                  身長 (cm)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="如: 62.0"
                  value={length}
                  onChange={(e) => {
                    setLength(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full text-center px-2 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white text-base font-mono font-bold text-[#2A2723] focus:outline-hidden focus:border-[#2A2723] shadow-2xs"
                />
                <div className="text-center text-[10px] font-mono font-medium text-[#4A453E] bg-[#EBE7DF] py-1 rounded-full">
                  {pLength !== null ? `P${pLength}` : (babyProfile.birthLength > 0 ? `初生: ${babyProfile.birthLength}` : '選填')}
                </div>
              </div>

              {/* Head Circumference */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-sans uppercase tracking-wider text-[#6B6457] text-center font-medium">
                  頭圍 (cm)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="如: 40.5"
                  value={headCirc}
                  onChange={(e) => {
                    setHeadCirc(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full text-center px-2 py-2.5 rounded-2xl border border-[#D1CEC4] bg-white text-base font-mono font-bold text-[#2A2723] focus:outline-hidden focus:border-[#2A2723] shadow-2xs"
                />
                <div className="text-center text-[10px] font-mono font-medium text-[#4A453E] bg-[#EBE7DF] py-1 rounded-full">
                  {pHead !== null ? `P${pHead}` : (babyProfile.birthHeadCirc > 0 ? `初生: ${babyProfile.birthHeadCirc}` : '選填')}
                </div>
              </div>

            </div>
          </div>

          {/* Real-time Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#EBE7DF] space-y-1 text-xs">
            <div className="text-[#6B6457] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2A2723]" />
              <span>即時 WHO 生長指標評估：</span>
            </div>
            <div className="text-[#2A2723] leading-relaxed">
              體重：<strong>{pWeight !== null ? `P${pWeight} (${getPercentileInterpretation(pWeight).zone})` : '未輸入'}</strong> ｜ 
              身長：<strong>{pLength !== null ? `P${pLength} (${getPercentileInterpretation(pLength).zone})` : '未輸入'}</strong> ｜ 
              頭圍：<strong>{pHead !== null ? `P${pHead} (${getPercentileInterpretation(pHead).zone})` : '未輸入'}</strong>
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
              placeholder="例如：媽媽、爸爸、禾馨小兒科、台大醫院健檢"
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
              placeholder="例如：生長百分位維持在 P50 水準，翻身穩健，醫師建議每日副食品兩餐..."
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#D1CEC4] bg-white text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4] transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs font-sans uppercase tracking-wider shadow-sm transition-all font-medium cursor-pointer active:scale-95"
            >
              {isEditing ? '更新並儲存數據' : '確定儲存生長記錄'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
