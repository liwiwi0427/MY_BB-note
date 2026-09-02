import React from 'react';
import { motion } from 'motion/react';
import {
  Baby,
  Edit3,
  Calendar,
  Scale,
  Ruler,
  Brain,
  FileSpreadsheet,
  StickyNote as StickyNoteIcon,
  ShieldAlert,
  FileJson,
  Copy,
  Check,
} from 'lucide-react';
import type { BabyProfile, GrowthRecord, VaccineRecord } from '../types';
import { calculateAge } from '../utils/dateUtils';
import { calculatePercentile } from '../data/whoGrowthData';
import { useToast } from '../context/ToastContext';

interface BabyHeaderProps {
  baby: BabyProfile;
  latestGrowthRecord?: GrowthRecord;
  vaccineRecords: VaccineRecord[];
  onOpenEditProfile: () => void;
  onOpenReportModal: () => void;
  onOpenBackupModal?: () => void;
  onNavigateToNotes?: () => void;
}

export const BabyHeader: React.FC<BabyHeaderProps> = ({
  baby,
  latestGrowthRecord,
  vaccineRecords,
  onOpenEditProfile,
  onOpenReportModal,
  onOpenBackupModal,
  onNavigateToNotes,
}) => {
  const { success } = useToast();
  const [copiedCode, setCopiedCode] = React.useState(false);
  const age = calculateAge(baby.birthDate);

  const weight = latestGrowthRecord ? latestGrowthRecord.weight : baby.birthWeight;
  const length = latestGrowthRecord ? latestGrowthRecord.length : baby.birthLength;
  const headCirc = latestGrowthRecord ? latestGrowthRecord.headCirc : baby.birthHeadCirc;

  const currentMonths = latestGrowthRecord ? latestGrowthRecord.ageMonths : age.months;
  const pWeight = calculatePercentile(weight, currentMonths, 'weight', baby.gender);
  const pLength = calculatePercentile(length, currentMonths, 'length', baby.gender);
  const pHead = calculatePercentile(headCirc, currentMonths, 'headCirc', baby.gender);

  const completedVaccines = vaccineRecords.filter((v) => v.isCompleted).length;
  const totalVaccines = vaccineRecords.length;
  const nextPendingVaccine = vaccineRecords.find((v) => !v.isCompleted);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!baby.familyCode) return;
    navigator.clipboard.writeText(baby.familyCode);
    setCopiedCode(true);
    success('已複製家庭房號', `房號：${baby.familyCode}，可直接傳給家人加入即時同步`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#F9F6F0] rounded-[32px] sm:rounded-[36px] border border-[#D9D1C2] p-5 sm:p-7 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-sm"
    >
      {/* Background Subtle Stamp */}
      <div className="absolute right-6 -bottom-6 opacity-5 select-none pointer-events-none text-9xl font-serif hidden sm:block">
        👶
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        {/* Baby Info Main Block */}
        <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative shrink-0 cursor-pointer"
            onClick={onOpenEditProfile}
            title="點擊編輯寶寶個人資料"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white border-2 border-[#EBE7DF] shadow-sm flex items-center justify-center text-3xl sm:text-4xl select-none">
              {baby.gender === 'male' ? '👶🏻' : '👶🏼'}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 text-[11px] font-sans font-bold px-2 py-0.5 rounded-full border shadow-xs ${
                baby.gender === 'male'
                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              {baby.gender === 'male' ? '男寶' : '女寶'}
            </span>
          </motion.div>

          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#2A2723] tracking-tight">
                {baby.name}
              </h1>
              {baby.bloodType && (
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#4A453E] border border-[#D9D1C2] shadow-2xs">
                  {baby.bloodType} 型
                </span>
              )}
              {baby.familyCode && (
                <button
                  onClick={handleCopyCode}
                  className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="點擊複製家庭同步房號"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>房號: {baby.familyCode}</span>
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-emerald-700" />}
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#6B6457] mt-2 flex-wrap gap-y-1">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-[#8C8475]" />
                <span className="font-mono font-medium">{baby.birthDate}</span>
              </span>
              <span className="text-[#D1CEC4]">•</span>
              <span className="font-bold text-[#2A2723] bg-[#EBE7DF]/90 px-2.5 py-0.5 rounded-lg border border-[#D9D1C2]">
                {age.formatted} (第 {age.totalDays} 天)
              </span>
            </div>

            {baby.allergies && baby.allergies.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-950 bg-amber-50/90 px-3 py-1 rounded-xl border border-amber-300 shadow-2xs inline-flex max-w-full">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="truncate font-medium">過敏提醒: {baby.allergies.join('、')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Growth Metric Badges & Action Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/90 p-3 rounded-2xl border border-[#EBE7DF] shadow-2xs">
            
            {/* Weight */}
            <div className="px-3 py-1.5 text-center">
              <div className="flex items-center justify-center space-x-1 text-[11px] text-[#8C8475]">
                <Scale className="w-3.5 h-3.5 text-[#8C8475]" />
                <span>最新體重</span>
              </div>
              <div className="font-mono font-bold text-base text-[#2A2723] mt-0.5">
                {weight} <span className="text-xs font-normal text-[#6B6457]">kg</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2EDE4] text-[#2A2723] font-bold inline-block mt-0.5">
                P{pWeight} 百分位
              </span>
            </div>

            {/* Length */}
            <div className="px-3 py-1.5 text-center border-l border-[#F2EDE4]">
              <div className="flex items-center justify-center space-x-1 text-[11px] text-[#8C8475]">
                <Ruler className="w-3.5 h-3.5 text-[#8C8475]" />
                <span>最新身長</span>
              </div>
              <div className="font-mono font-bold text-base text-[#2A2723] mt-0.5">
                {length} <span className="text-xs font-normal text-[#6B6457]">cm</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6EBE6] text-[#2D3B2D] font-bold inline-block mt-0.5">
                P{pLength} 百分位
              </span>
            </div>

            {/* Head Circ */}
            <div className="px-3 py-1.5 text-center border-t sm:border-t-0 sm:border-l border-[#F2EDE4]">
              <div className="flex items-center justify-center space-x-1 text-[11px] text-[#8C8475]">
                <Brain className="w-3.5 h-3.5 text-[#8C8475]" />
                <span>最新頭圍</span>
              </div>
              <div className="font-mono font-bold text-base text-[#2A2723] mt-0.5">
                {headCirc} <span className="text-xs font-normal text-[#6B6457]">cm</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6E9F2] text-[#2C3345] font-bold inline-block mt-0.5">
                P{pHead} 百分位
              </span>
            </div>

            {/* Vaccines */}
            <div className="px-3 py-1.5 text-center border-t sm:border-t-0 sm:border-l border-[#F2EDE4]">
              <div className="text-[11px] text-[#8C8475]">疫苗進度</div>
              <div className="font-mono font-bold text-base text-[#2A2723] mt-0.5">
                {completedVaccines}/{totalVaccines}
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-sans truncate block max-w-[90px] mx-auto mt-0.5" title={nextPendingVaccine ? `下劑預定: ${nextPendingVaccine.targetAgeDescription}` : '已完成目前常規'}>
                {nextPendingVaccine ? nextPendingVaccine.targetAgeDescription : '已全接種'}
              </span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {onOpenBackupModal && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenBackupModal}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] text-xs font-sans font-medium text-[#2A2723] shadow-2xs transition-colors cursor-pointer"
                title="匯入 JSON 檔案或匯出資料庫備份"
              >
                <FileJson className="w-4 h-4 text-amber-700" />
                <span>備份/匯入</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenReportModal}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] text-xs font-sans font-medium text-[#2A2723] shadow-2xs transition-colors cursor-pointer"
              title="匯出就醫與體檢 PDF 報告"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#6B6457]" />
              <span>就醫報告</span>
            </motion.button>

            {onNavigateToNotes && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNavigateToNotes}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] text-xs font-sans font-medium text-[#2A2723] shadow-2xs transition-colors cursor-pointer"
                title="查看交班便箋"
              >
                <StickyNoteIcon className="w-4 h-4 text-amber-700" />
                <span>交班便箋</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenEditProfile}
              className="p-2.5 rounded-2xl bg-[#2A2723] text-[#F9F6F0] hover:bg-[#4A453E] shadow-2xs transition-colors cursor-pointer"
              title="編輯寶寶資料"
            >
              <Edit3 className="w-4 h-4" strokeWidth={1.75} />
            </motion.button>
          </div>

        </div>

      </div>
    </motion.section>
  );
};
