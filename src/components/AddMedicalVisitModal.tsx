import React, { useState } from 'react';
import { X, FileHeart, Building, User, Calendar, Pill } from 'lucide-react';
import type { MedicalVisit } from '../types';

interface AddMedicalVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: Partial<MedicalVisit>) => void;
}

export const AddMedicalVisitModal: React.FC<AddMedicalVisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [clinic, setClinic] = useState('台大婦幼小兒科');
  const [doctor, setDoctor] = useState('李醫師');
  const [reason, setReason] = useState('常規健檢 / 輕微流鼻涕');
  const [diagnosis, setDiagnosis] = useState('');
  const [temperature, setTemperature] = useState<number | ''>(36.8);
  const [weight, setWeight] = useState<number | ''>('');
  const [prescriptions, setPrescriptions] = useState('');
  const [doctorAdvice, setDoctorAdvice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      clinic: clinic.trim(),
      doctor: doctor.trim(),
      reason: reason.trim(),
      diagnosis: diagnosis.trim(),
      temperature: temperature ? Number(temperature) : undefined,
      weight: weight ? Number(weight) : undefined,
      prescriptions: prescriptions.trim(),
      doctorAdvice: doctorAdvice.trim(),
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
              <FileHeart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                記錄兒科就醫與門診病歷
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                記錄看診原因、醫師診斷、用藥劑量與回診時間
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
              <label className="block text-[#6B6457] font-medium mb-1">看診日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono text-[#2A2723]"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">就診醫院 / 診所</label>
              <input
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6457] font-medium mb-1">主治醫師</label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723]"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">就診主訴 / 症狀</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="感冒、發燒、打預防針、便秘..."
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">診斷結論與說明</label>
            <textarea
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="急性上呼吸道感染，喉嚨微紅，肺部呼吸音清澈..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl p-3 text-xs text-[#2A2723]"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">開立處方藥物與服用方法</label>
            <textarea
              rows={2}
              value={prescriptions}
              onChange={(e) => setPrescriptions(e.target.value)}
              placeholder="希普利敏 2.5ml 每日 3 次、安佳熱發燒 38.5°C 以上間隔 4 小時 3ml..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl p-3 text-xs text-[#2A2723]"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">醫師叮嚀與居家護理</label>
            <input
              type="text"
              value={doctorAdvice}
              onChange={(e) => setDoctorAdvice(e.target.value)}
              placeholder="多補充水分水分、注意是否有喘鳴聲..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723]"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EBE7DF] text-[#6B6457] text-xs font-medium hover:bg-[#D9D1C2]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-medium hover:bg-[#4A453E]"
            >
              儲存看診紀錄
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
