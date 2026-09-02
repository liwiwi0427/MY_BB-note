import React, { useState } from 'react';
import { FileHeart, Building2, Pill, Calendar, Plus, Trash2 } from 'lucide-react';
import { MedicalVisit, Prescription } from '../types';

interface AddMedicalVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: MedicalVisit) => void;
}

export const AddMedicalVisitModal: React.FC<AddMedicalVisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [clinicName, setClinicName] = useState('禾馨婦幼小兒科診所');
  const [doctorName, setDoctorName] = useState('林主治醫師');
  const [reason, setReason] = useState('4 個月常規發展健檢與感冒');
  const [diagnosis, setDiagnosis] = useState('輕微急性上呼吸道感染 (感冒)，喉嚨無化膿');
  const [notes, setNotes] = useState('多補充水分與電解質，觀察是否有呼吸急促或活動力下降情況。');
  const [temperatureAtVisit, setTemperatureAtVisit] = useState<string>('37.8');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Prescription List State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      name: '安佳熱糖漿 (Acetaminophen)',
      dosage: '3.5 ml',
      frequency: '發燒 > 38.5°C 且間隔 4~6 小時',
      days: 3,
      instructions: '解熱鎮痛，退燒後即停用',
    },
    {
      name: '息咳寧感冒糖漿',
      dosage: '2.5 ml',
      frequency: '每日三次 (早、中、晚飯後)',
      days: 3,
      instructions: '緩解咳嗽流鼻水',
    },
  ]);

  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('');
  const [newRxFreq, setNewRxFreq] = useState('');

  if (!isOpen) return null;

  const handleAddRx = () => {
    if (newRxName.trim()) {
      setPrescriptions([
        ...prescriptions,
        {
          name: newRxName.trim(),
          dosage: newRxDosage.trim() || '依醫囑',
          frequency: newRxFreq.trim() || '每日三次',
          days: 3,
        },
      ]);
      setNewRxName('');
      setNewRxDosage('');
      setNewRxFreq('');
    }
  };

  const handleRemoveRx = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !diagnosis.trim()) return;

    const newVisit: MedicalVisit = {
      id: `visit_${Date.now()}`,
      date,
      clinicName: clinicName.trim(),
      doctorName: doctorName.trim() || undefined,
      reason: reason.trim(),
      diagnosis: diagnosis.trim(),
      notes: notes.trim() || undefined,
      temperatureAtVisit: parseFloat(temperatureAtVisit) || undefined,
      prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
    };

    onSave(newVisit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F9F6F0] rounded-[36px] p-7 sm:p-9 max-w-xl w-full border border-[#D9D1C2] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <FileHeart className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif italic text-[#2A2723]">
                新增兒科就醫與處方紀錄
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                完整存檔看診原因、醫生囑咐與給藥劑量
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
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                就診日期
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                診間測量體溫 (°C)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="如：37.8"
                value={temperatureAtVisit}
                onChange={(e) => setTemperatureAtVisit(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs font-mono text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                醫療院所 / 診所
              </label>
              <input
                type="text"
                required
                placeholder="如：台大小兒部 / 禾馨婦幼"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                主治醫師姓名
              </label>
              <input
                type="text"
                placeholder="如：林醫師"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
              就診原因與主要主訴
            </label>
            <input
              type="text"
              required
              placeholder="如：連續發燒兩天、咳嗽流鼻涕、食慾下降"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
              醫師臨床診斷結果
            </label>
            <input
              type="text"
              required
              placeholder="如：急性上呼吸道感染 / 輕微中耳炎"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-xs font-serif italic text-base text-[#2A2723] focus:border-[#2A2723]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
              衛教照護重點與叮嚀
            </label>
            <textarea
              rows={2}
              placeholder="如：注意精神活動力，若持續發燒超過3天或呼吸急促需立即急診..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-[20px] border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
            />
          </div>

          {/* Prescriptions Section */}
          <div className="p-4 bg-white rounded-[24px] border border-[#D9D1C2] space-y-2.5">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider font-bold text-[#2A2723]">
              <span className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-[#8C8475]" />
                <span>開立處方藥物明細 ({prescriptions.length})</span>
              </span>
            </div>

            {/* List */}
            <div className="space-y-1.5">
              {prescriptions.map((rx, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#F9F6F0] p-2.5 rounded-[14px] border border-[#EBE7DF] text-xs">
                  <div>
                    <span className="font-bold text-[#2A2723]">{rx.name}</span>
                    <span className="text-[#6B6457] ml-2">({rx.dosage} ｜ {rx.frequency})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRx(idx)}
                    className="p-1 text-[#8C8475] hover:text-[#6B3E3E]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add mini form */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="藥物名稱 (如: 息咳寧)"
                value={newRxName}
                onChange={(e) => setNewRxName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-full border border-[#D1CEC4] bg-[#F9F6F0] text-xs text-[#2A2723]"
              />
              <input
                type="text"
                placeholder="劑量 (如: 2.5ml)"
                value={newRxDosage}
                onChange={(e) => setNewRxDosage(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-full border border-[#D1CEC4] bg-[#F9F6F0] text-xs text-[#2A2723]"
              />
              <button
                type="button"
                onClick={handleAddRx}
                className="px-4 py-1.5 bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] uppercase tracking-wider rounded-full text-xs font-medium"
              >
                + 加入
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
              預約回診日期 (選填)
            </label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              儲存看診紀錄
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
