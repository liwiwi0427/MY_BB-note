import React, { useState, useEffect } from 'react';
import { FileHeart, Building2, Pill, Calendar, Plus, Trash2, Edit3 } from 'lucide-react';
import { MedicalVisit, Prescription } from '../types';

interface AddMedicalVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVisit?: MedicalVisit | null;
  onSave: (visit: MedicalVisit) => void;
}

export const AddMedicalVisitModal: React.FC<AddMedicalVisitModalProps> = ({
  isOpen,
  onClose,
  editingVisit,
  onSave,
}) => {
  const isEditing = Boolean(editingVisit);

  const [date, setDate] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [temperatureAtVisit, setTemperatureAtVisit] = useState<string>('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Prescription List State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('');
  const [newRxFreq, setNewRxFreq] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingVisit) {
      setDate(editingVisit.date || new Date().toISOString().split('T')[0]);
      setClinicName(editingVisit.clinicName || '');
      setDoctorName(editingVisit.doctorName || '');
      setReason(editingVisit.reason || '');
      setDiagnosis(editingVisit.diagnosis || '');
      setNotes(editingVisit.notes || '');
      setTemperatureAtVisit(editingVisit.temperatureAtVisit !== undefined ? String(editingVisit.temperatureAtVisit) : '');
      setNextFollowUpDate(editingVisit.nextFollowUpDate || '');
      setPrescriptions(editingVisit.prescriptions || []);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setClinicName('');
      setDoctorName('');
      setReason('');
      setDiagnosis('');
      setNotes('');
      setTemperatureAtVisit('');
      setNextFollowUpDate('');
      setPrescriptions([]);
    }
    setNewRxName('');
    setNewRxDosage('');
    setNewRxFreq('');
  }, [isOpen, editingVisit]);

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

    const visitToSave: MedicalVisit = {
      id: editingVisit ? editingVisit.id : `visit_${Date.now()}`,
      date,
      clinicName: clinicName.trim(),
      doctorName: doctorName.trim() || undefined,
      reason: reason.trim() || '常規回診健檢',
      diagnosis: diagnosis.trim(),
      notes: notes.trim() || undefined,
      temperatureAtVisit: parseFloat(temperatureAtVisit) || undefined,
      prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
    };

    onSave(visitToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-xl w-full border border-[#D9D1C2] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              {isEditing ? <Edit3 className="w-5 h-5" strokeWidth={1.5} /> : <FileHeart className="w-5 h-5" strokeWidth={1.5} />}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2A2723]">
                {isEditing ? '編輯兒科就醫與處方紀錄' : '新增兒科就醫與處方紀錄'}
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                完整存檔看診診所、醫師診斷、醫囑與處方藥品
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
          
          {/* Date & Temp Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
                就醫日期 *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs font-mono text-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
                診間測量體溫 (°C)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="如: 37.8"
                value={temperatureAtVisit}
                onChange={(e) => setTemperatureAtVisit(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs font-mono text-[#2A2723]"
              />
            </div>
          </div>

          {/* Clinic & Doctor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
                醫療院所名稱 *
              </label>
              <input
                type="text"
                required
                placeholder="如：台大兒童醫院、禾馨婦幼小兒科"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
                看診主治醫師
              </label>
              <input
                type="text"
                placeholder="如：陳醫師、林主任"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
              />
            </div>
          </div>

          {/* Reason & Diagnosis */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
              就醫主訴原因
            </label>
            <input
              type="text"
              placeholder="如：感冒流鼻水、發燒 38.5°C、4 個月健檢"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
              醫師臨床診斷 *
            </label>
            <input
              type="text"
              required
              placeholder="如：急性上呼吸道感染、腸胃炎、鵝口瘡"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] font-bold"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
              醫師交代與衛教囑咐
            </label>
            <textarea
              rows={2}
              placeholder="如：多喝水電解質，觀察是否有喘鳴或活力減退，3 天後無改善需回診"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
            />
          </div>

          {/* Prescriptions Section */}
          <div className="p-4 bg-white rounded-2xl border border-[#D9D1C2] space-y-3">
            <span className="block text-xs font-bold text-[#2A2723] flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[#8C8475]" />
              <span>開立處方藥品與用藥指南</span>
            </span>

            {/* Existing Prescriptions */}
            {prescriptions.length > 0 && (
              <div className="space-y-2">
                {prescriptions.map((rx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F9F6F0] rounded-xl border border-[#EBE7DF] text-xs">
                    <div>
                      <span className="font-bold text-[#2A2723]">{rx.name}</span>
                      <span className="text-[#6B6457] ml-2 font-mono">({rx.dosage} ｜ {rx.frequency})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRx(idx)}
                      className="text-[#C4685D] hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Rx Form */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <input
                type="text"
                placeholder="藥品名 (如: 安佳熱糖漿)"
                value={newRxName}
                onChange={(e) => setNewRxName(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-[#D1CEC4] text-xs"
              />
              <input
                type="text"
                placeholder="單次劑量 (如: 3.5ml)"
                value={newRxDosage}
                onChange={(e) => setNewRxDosage(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-[#D1CEC4] text-xs font-mono"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="頻率 (如: 發燒>38.5)"
                  value={newRxFreq}
                  onChange={(e) => setNewRxFreq(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-full border border-[#D1CEC4] text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddRx}
                  className="px-3 py-1.5 bg-[#2A2723] text-white rounded-full text-xs hover:bg-[#3D3833] shrink-0"
                >
                  新增
                </button>
              </div>
            </div>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1 font-medium">
              預約回診日期 (選填)
            </label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs font-mono text-[#2A2723]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs uppercase tracking-wider shadow-sm transition-all font-medium"
            >
              {isEditing ? '更新就診紀錄' : '儲存就診紀錄'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
