import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Syringe,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileHeart,
  Plus,
  Trash2,
  Building,
  User,
  ShieldCheck,
  Info,
  Sparkles,
  RefreshCw,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
} from 'lucide-react';
import type { VaccineRecord, MedicalVisit, BabyProfile } from '../types';
import { formatDate } from '../utils/dateUtils';
import { MedicalPassport } from './MedicalPassport';
import { generateTaiwanFullVaccineSchedule } from '../data/vaccineScheduleData';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

const triggerCelebration = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#D4AF37', '#87A96B', '#E5A9A9', '#709775', '#A9CCE3'],
    });
  } catch (e) {
    console.debug('Confetti animation:', e);
  }
};

interface VaccineTrackerProps {
  vaccineRecords: VaccineRecord[];
  medicalVisits: MedicalVisit[];
  baby: BabyProfile;
  onToggleVaccine: (record: VaccineRecord) => void;
  onUpdateVaccine?: (record: VaccineRecord) => void;
  onResetSchedule?: (newSchedule: VaccineRecord[]) => void;
  onAddMedicalVisit: () => void;
  onDeleteMedicalVisit: (id: string) => void;
  onOpenReportModal: () => void;
}

export const VaccineTracker: React.FC<VaccineTrackerProps> = ({
  vaccineRecords,
  medicalVisits,
  baby,
  onToggleVaccine,
  onUpdateVaccine,
  onResetSchedule,
  onAddMedicalVisit,
  onDeleteMedicalVisit,
  onOpenReportModal,
}) => {
  const { success, celebrate } = useToast();
  const [subTab, setSubTab] = useState<'schedule' | 'clinic'>('schedule');
  const [filterCategory, setFilterCategory] = useState<'all' | 'free' | 'paid' | 'pending' | 'completed'>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<'all' | 'infant' | 'toddler' | 'preschool'>('all');
  
  // Selected vaccine for details/editing modal
  const [editingVaccine, setEditingVaccine] = useState<VaccineRecord | null>(null);
  const [inspectVaccine, setInspectVaccine] = useState<VaccineRecord | null>(null);

  // Edit form state
  const [formDate, setFormDate] = useState('');
  const [formClinic, setFormClinic] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formReactions, setFormReactions] = useState('');

  const completedCount = vaccineRecords.filter((v) => v.isCompleted).length;
  const totalCount = vaccineRecords.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  const freeCount = vaccineRecords.filter((v) => !v.isOptional);
  const freeCompleted = freeCount.filter((v) => v.isCompleted).length;
  const freePercent = Math.round((freeCompleted / (freeCount.length || 1)) * 100);

  const paidCount = vaccineRecords.filter((v) => v.isOptional);
  const paidCompleted = paidCount.filter((v) => v.isCompleted).length;
  const paidPercent = paidCount.length > 0 ? Math.round((paidCompleted / paidCount.length) * 100) : 0;

  // Filter logic
  const filteredRecords = vaccineRecords.filter((vac) => {
    // Category filter
    if (filterCategory === 'free' && vac.isOptional) return false;
    if (filterCategory === 'paid' && !vac.isOptional) return false;
    if (filterCategory === 'pending' && vac.isCompleted) return false;
    if (filterCategory === 'completed' && !vac.isCompleted) return false;

    // Age group filter
    if (ageGroupFilter === 'infant' && vac.targetAgeMonths > 7) return false; // 0-7 months
    if (ageGroupFilter === 'toddler' && (vac.targetAgeMonths < 12 || vac.targetAgeMonths > 27)) return false; // 1-2.5 years
    if (ageGroupFilter === 'preschool' && vac.targetAgeMonths < 36) return false; // 3-6 years

    return true;
  });

  const handleToggle = (vac: VaccineRecord) => {
    const nextState = !vac.isCompleted;
    onToggleVaccine(vac);
    if (nextState) {
      triggerCelebration();
      celebrate('已成功標記接種完成 🎉', `${vac.vaccineName} (${vac.targetAgeDescription}) 防護已建立！`);
    } else {
      success('已更新為待接種狀態', vac.vaccineName);
    }
  };

  const handleOpenEdit = (vac: VaccineRecord) => {
    setEditingVaccine(vac);
    setFormDate(vac.administeredDate || new Date().toISOString().split('T')[0]);
    setFormClinic(vac.clinicName || '兒科小兒專科門診');
    setFormBatch(vac.batchNumber || '');
    setFormReactions(vac.reactions || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVaccine || !onUpdateVaccine) return;

    const updated: VaccineRecord = {
      ...editingVaccine,
      isCompleted: true,
      administeredDate: formDate,
      clinicName: formClinic,
      batchNumber: formBatch,
      reactions: formReactions,
    };
    onUpdateVaccine(updated);
    setEditingVaccine(null);
    triggerCelebration();
    celebrate('疫苗登記已成功保存 ✨', `${updated.vaccineName} (${formDate})`);
  };

  const handleRecalculateSchedule = () => {
    if (window.confirm(`確定要依據 ${baby.name} 的出生年月日（${baby.birthDate}）自動重新精準排定衛福部疾管署全套疫苗時程嗎？（已勾選完成之紀錄將自動予以保留）`)) {
      const newFull = generateTaiwanFullVaccineSchedule(baby.id, baby.birthDate);
      // Preserve completion status from existing
      const merged = newFull.map((newVac) => {
        const existing = vaccineRecords.find(
          (ex) => ex.vaccineName === newVac.vaccineName && ex.dose === newVac.dose
        );
        if (existing && existing.isCompleted) {
          return {
            ...newVac,
            isCompleted: true,
            administeredDate: existing.administeredDate,
            clinicName: existing.clinicName,
            batchNumber: existing.batchNumber,
            reactions: existing.reactions,
          };
        }
        return newVac;
      });

      if (onResetSchedule) {
        onResetSchedule(merged);
        success('疫苗時程已自動校準', `已依出生日 ${baby.birthDate} 精準推算預定施打日`);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Subtab navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-1.5 bg-[#EBE7DF]/80 p-1.5 rounded-full border border-[#D9D1C2] shadow-2xs relative">
          <button
            onClick={() => setSubTab('schedule')}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer select-none z-10 ${
              subTab === 'schedule'
                ? 'text-[#F9F6F0]'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            {subTab === 'schedule' && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute inset-0 bg-[#2A2723] rounded-full shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center space-x-2">
              <Syringe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">台灣衛福部公費與自費疫苗 ({completedCount}/{totalCount})</span>
            </span>
          </button>

          <button
            onClick={() => setSubTab('clinic')}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer select-none z-10 ${
              subTab === 'clinic'
                ? 'text-[#F9F6F0]'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            {subTab === 'clinic' && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute inset-0 bg-[#2A2723] rounded-full shadow-xs"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center space-x-2">
              <FileHeart className="w-3.5 h-3.5 text-rose-400" />
              <span>兒科就醫護照與處方紀錄 ({medicalVisits.length})</span>
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onResetSchedule && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRecalculateSchedule}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] text-xs font-sans font-medium text-[#2A2723] shadow-2xs transition-colors cursor-pointer"
              title="依寶寶出生日期自動校準疾管署時程"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
              <span>自動重推時程</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenReportModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white border border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] text-xs font-sans font-medium text-[#2A2723] shadow-2xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>匯出就醫與體檢報告</span>
          </motion.button>
        </div>
      </div>

      {subTab === 'schedule' ? (
        <div className="space-y-5">
          
          {/* Progress Header Card with Dual Stats */}
          <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-base sm:text-lg text-[#2A2723]">
                    台灣疾管署 (Taiwan CDC) 幼兒預防接種防護進度
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                    總防護率 {progressPercent}%
                  </span>
                </div>
                <p className="text-xs text-[#6B6457] mt-1 font-sans">
                  包含 0~6 歲全面公費常規疫苗、卡介苗、流感疫苗與兒科醫學會推薦之輪狀病毒、腸病毒71型及水痘追加劑
                </p>
              </div>

              {/* Progress Counters */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-white/90 p-3 rounded-2xl border border-[#EBE7DF] shadow-2xs text-center min-w-[120px]">
                  <div className="text-[11px] text-[#8C8475] font-sans font-medium">🏛️ 疾管署公費</div>
                  <div className="text-sm font-bold font-mono text-emerald-800 mt-0.5">
                    {freeCompleted}/{freeCount.length} 劑 ({freePercent}%)
                  </div>
                </div>
                <div className="bg-white/90 p-3 rounded-2xl border border-[#EBE7DF] shadow-2xs text-center min-w-[120px]">
                  <div className="text-[11px] text-[#8C8475] font-sans font-medium">💎 自費重點推薦</div>
                  <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">
                    {paidCompleted}/{paidCount.length} 劑 ({paidPercent}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar with smooth transition */}
            <div className="w-full h-3.5 bg-[#EBE7DF] rounded-full overflow-hidden p-0.5 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-700 via-teal-700 to-[#2A2723] rounded-full shadow-xs"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F9F6F0] p-3 rounded-2xl border border-[#D9D1C2] shadow-2xs">
            
            {/* Category Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              {[
                { id: 'all', label: `全部 (${totalCount})` },
                { id: 'free', label: `🏛️ 公費常規 (${freeCount.length})` },
                { id: 'paid', label: `💎 自費推薦 (${paidCount.length})` },
                { id: 'pending', label: `⏳ 待接種 (${totalCount - completedCount})` },
                { id: 'completed', label: `✓ 已完成 (${completedCount})` },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans whitespace-nowrap transition-colors cursor-pointer select-none ${
                    filterCategory === c.id
                      ? 'bg-[#2A2723] text-[#F9F6F0] font-semibold shadow-xs'
                      : 'text-[#6B6457] hover:text-[#2A2723] hover:bg-white/60'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Age Group Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto border-t sm:border-t-0 sm:border-l border-[#D9D1C2] pt-2 sm:pt-0 sm:pl-3">
              {[
                { id: 'all', label: '所有月齡' },
                { id: 'infant', label: '0~6個月' },
                { id: 'toddler', label: '1~2.5歲' },
                { id: 'preschool', label: '3~6歲入學' },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAgeGroupFilter(a.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans whitespace-nowrap transition-colors cursor-pointer select-none ${
                    ageGroupFilter === a.id
                      ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                      : 'text-[#6B6457] hover:text-[#2A2723]'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

          </div>

          {/* Vaccine Cards Grid with Motion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredRecords.map((vac) => (
                <motion.div
                  key={vac.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                  className={`p-5 rounded-[26px] border transition-colors flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-sm ${
                    vac.isCompleted
                      ? 'bg-[#F9F6F0] border-[#D9D1C2]'
                      : 'bg-white border-[#EBE7DF] hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-2.5">
                    
                    {/* Card Header & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                            vac.isCompleted
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : vac.isOptional
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-[#F2EDE4] text-[#2A2723] border border-[#D9D1C2]'
                          }`}
                        >
                          <Syringe className="w-5 h-5" />
                        </motion.div>

                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span
                              onClick={() => setInspectVaccine(vac)}
                              className="font-serif font-bold text-sm sm:text-base text-[#2A2723] hover:text-amber-800 cursor-pointer underline-offset-2 hover:underline"
                              title="點擊查看疾管署衛教資訊"
                            >
                              {vac.vaccineName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                            <span
                              className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md border ${
                                vac.isOptional
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : vac.category === 'seasonal'
                                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              }`}
                            >
                              {vac.isOptional ? '💎 自費推薦' : vac.category === 'seasonal' ? '🍂 季節公費' : '🏛️ 疾管署公費'}
                            </span>

                            <span className="text-xs font-mono font-medium text-[#6B6457] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#8C8475]" />
                              {vac.targetAgeDescription}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Button */}
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setInspectVaccine(vac)}
                        className="p-1.5 text-[#8C8475] hover:text-[#2A2723] hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
                        title="查看衛教說明"
                      >
                        <Info className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Disease prevention summary */}
                    {vac.preventDisease && (
                      <p className="text-xs text-[#524C42] bg-white/70 p-2.5 rounded-xl border border-[#EBE7DF] leading-relaxed font-sans">
                        <span className="font-semibold text-[#2A2723]">預防疾病：</span>
                        {vac.preventDisease}
                      </p>
                    )}

                    {/* Completion records */}
                    {vac.isCompleted && vac.administeredDate && (
                      <div className="text-xs text-emerald-900 bg-emerald-50/90 border border-emerald-200 p-2.5 rounded-xl font-mono flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold">✓ 接種日：{vac.administeredDate}</span>
                        {vac.clinicName && <span className="text-[11px] font-sans">({vac.clinicName})</span>}
                        {vac.batchNumber && <span className="text-[10px] text-[#6B6457]">批號:{vac.batchNumber}</span>}
                      </div>
                    )}

                    {/* Scheduled Due date when pending */}
                    {!vac.isCompleted && vac.scheduledDate && (
                      <div className="text-xs text-[#6B6457] flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          預定施打日：{vac.scheduledDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EBE7DF]/80">
                    <button
                      onClick={() => handleOpenEdit(vac)}
                      className="text-xs font-sans text-[#6B6457] hover:text-[#2A2723] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{vac.isCompleted ? '修改紀錄/批號' : '詳細填報登記'}</span>
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggle(vac)}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-sans font-medium transition-colors shadow-2xs cursor-pointer ${
                        vac.isCompleted
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-[#2A2723] text-[#F9F6F0] hover:bg-[#4A453E]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{vac.isCompleted ? '已接種完成' : '標記完成'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      ) : (
        <MedicalPassport
          medicalVisits={medicalVisits}
          onAddVisit={onAddMedicalVisit}
          onDeleteVisit={onDeleteMedicalVisit}
        />
      )}

      {/* Inspect Vaccine Details Modal with AnimatePresence */}
      <AnimatePresence>
        {inspectVaccine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] max-w-lg w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-[#EBE7DF] pb-3">
                <div>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {inspectVaccine.isOptional ? '💎 自費重點推薦' : '🏛️ 衛福部疾管署公費常規'}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#2A2723] mt-1.5">
                    {inspectVaccine.vaccineName}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectVaccine(null)}
                  className="p-1.5 text-[#6B6457] hover:text-[#2A2723] rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-[#2A2723] font-sans">
                <div className="bg-white p-3.5 rounded-2xl border border-[#EBE7DF]">
                  <span className="font-bold text-[#8C8475] block mb-1">⏱️ 建議接種時程</span>
                  <p className="font-mono text-sm font-semibold">{inspectVaccine.targetAgeDescription}</p>
                  {inspectVaccine.scheduledDate && (
                    <p className="text-[11px] text-[#6B6457] mt-1">
                      系統根據出生日期推算預定日：{inspectVaccine.scheduledDate}
                    </p>
                  )}
                </div>

                {inspectVaccine.preventDisease && (
                  <div className="bg-white p-3.5 rounded-2xl border border-[#EBE7DF]">
                    <span className="font-bold text-[#8C8475] block mb-1">🛡️ 預防疾病保護範圍</span>
                    <p className="leading-relaxed">{inspectVaccine.preventDisease}</p>
                  </div>
                )}

                {inspectVaccine.precautions && (
                  <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-300 text-amber-950">
                    <span className="font-bold text-amber-900 block mb-1">⚠️ 衛教注意事項與常見副作用處置</span>
                    <p className="leading-relaxed">{inspectVaccine.precautions}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setInspectVaccine(null)}
                  className="px-5 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-medium cursor-pointer"
                >
                  了解並關閉
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit / Detailed Log Vaccine Modal with AnimatePresence */}
      <AnimatePresence>
        {editingVaccine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] max-w-md w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2A2723]">
                    填報疫苗接種紀錄
                  </h3>
                  <p className="text-xs text-[#8C8475]">{editingVaccine.vaccineName}</p>
                </div>
                <button
                  onClick={() => setEditingVaccine(null)}
                  className="p-1.5 text-[#6B6457] hover:text-[#2A2723] rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#2A2723] mb-1">實際接種日期 *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D9D1C2] focus:outline-none focus:ring-2 focus:ring-[#2A2723]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2A2723] mb-1">接種醫療院所 / 衛生所</label>
                  <input
                    type="text"
                    placeholder="例如：台大兒科門診 / 仁愛衛生所"
                    value={formClinic}
                    onChange={(e) => setFormClinic(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D9D1C2] focus:outline-none focus:ring-2 focus:ring-[#2A2723]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2A2723] mb-1">疫苗廠牌 / 批號 (選填)</label>
                  <input
                    type="text"
                    placeholder="例如：GSK / 批號 AB12345"
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D9D1C2] focus:outline-none focus:ring-2 focus:ring-[#2A2723]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2A2723] mb-1">接種後反應 / 醫囑備註 (選填)</label>
                  <textarea
                    rows={2}
                    placeholder="例如：注射部位微紅腫，冰敷後改善；無發燒。"
                    value={formReactions}
                    onChange={(e) => setFormReactions(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D9D1C2] focus:outline-none focus:ring-2 focus:ring-[#2A2723]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-[#EBE7DF]">
                  <button
                    type="button"
                    onClick={() => setEditingVaccine(null)}
                    className="px-4 py-2 rounded-full border border-[#D9D1C2] hover:bg-[#EBE7DF] text-xs text-[#6B6457] cursor-pointer"
                  >
                    取消
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-medium shadow-md cursor-pointer"
                  >
                    儲存登記
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
