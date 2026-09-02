import React from 'react';
import { motion } from 'motion/react';
import { X, Download, FileSpreadsheet, Baby, ShieldCheck, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BabyProfile, GrowthRecord, MedicalVisit, VaccineRecord } from '../types';
import { calculateAge, formatDate } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

interface PediatricReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: BabyProfile;
  growthRecords: GrowthRecord[];
  medicalVisits: MedicalVisit[];
  vaccineRecords: VaccineRecord[];
}

export const PediatricReportModal: React.FC<PediatricReportModalProps> = ({
  isOpen,
  onClose,
  baby,
  growthRecords,
  medicalVisits,
  vaccineRecords,
}) => {
  const { success, warning } = useToast();
  if (!isOpen) return null;

  const age = calculateAge(baby.birthDate);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Title
      doc.setFontSize(18);
      doc.text('Baby Health & Pediatric Clinical Passport', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Export Date: ${new Date().toLocaleDateString('zh-TW')} | System: Baby Care Hub`, 14, 26);

      // Baby Basic Info Table
      autoTable(doc, {
        startY: 32,
        head: [['Baby Name', 'Gender', 'Birth Date', 'Age', 'Blood Type', 'Emergency Contact']],
        body: [[
          baby.name,
          baby.gender === 'male' ? 'Boy (Male)' : 'Girl (Female)',
          baby.birthDate,
          `${age.formatted} (${age.totalDays} Days)`,
          baby.bloodType || 'N/A',
          baby.emergencyContact || 'N/A',
        ]],
        theme: 'grid',
        headStyles: { fillColor: [42, 39, 35] },
      });

      // Growth Records Table
      const finalY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 50;
      doc.setFontSize(14);
      doc.setTextColor(42, 39, 35);
      doc.text('1. Growth History (WHO Standards)', 14, finalY1 + 10);

      const growthRows = growthRecords.map((r) => [
        r.date,
        `${r.ageMonths}M (${r.ageDays}d)`,
        `${r.weight} kg`,
        `${r.length} cm`,
        `${r.headCirc} cm`,
        r.doctorNote || '-',
      ]);

      autoTable(doc, {
        startY: finalY1 + 14,
        head: [['Date', 'Age', 'Weight', 'Length', 'Head Circ', 'Doctor Note']],
        body: growthRows.length > 0 ? growthRows : [['No data recorded', '-', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [74, 69, 62] },
      });

      // Pediatric Visits Table
      const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.setTextColor(42, 39, 35);
      doc.text('2. Pediatric Clinic & Prescription Records', 14, finalY2 + 10);

      const medicalRows = medicalVisits.map((m) => [
        m.date,
        `${m.clinic} (${m.doctor || 'MD'})`,
        m.reason,
        m.diagnosis || '-',
        m.prescriptions || '-',
      ]);

      autoTable(doc, {
        startY: finalY2 + 14,
        head: [['Date', 'Clinic / Doctor', 'Chief Complaint', 'Diagnosis', 'Prescription / Dosage']],
        body: medicalRows.length > 0 ? medicalRows : [['No medical records', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [74, 69, 62] },
      });

      doc.save(`Baby_Health_Passport_${baby.name}_${new Date().toISOString().split('T')[0]}.pdf`);
      success('PDF 就醫報告匯出成功 📄', `已下載寶寶專屬兒科健康護照`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      warning('匯出失敗', '生成 PDF 時發生錯誤');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#F9F6F0] w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                兒科就診就醫報告與病歷護照 (PDF)
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                就診時可直接出示給小兒科醫師，或一鍵匯出 PDF 檔案
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C8475] hover:text-[#2A2723] rounded-xl hover:bg-[#EBE7DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview Box */}
        <div className="bg-white rounded-2xl border border-[#EBE7DF] p-5 space-y-4 text-xs font-sans">
          
          <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
            <div>
              <span className="font-serif font-bold text-base text-[#2A2723] block">
                {baby.name} 的兒科門診摘要
              </span>
              <span className="text-[#8C8475] text-[11px]">
                性別: {baby.gender === 'male' ? '男寶' : '女寶'} | 目前年齡: {age.formatted} ({age.totalDays}天) | 血型: {baby.bloodType || '未註記'}
              </span>
            </div>
            <span className="text-[11px] bg-[#FAF3EB] text-[#2A2723] px-2.5 py-1 rounded-full border border-[#D9D1C2] font-medium">
              WHO標準對照
            </span>
          </div>

          {/* Key summaries */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EBE7DF]">
              <span className="text-[11px] text-[#8C8475] block">累積生長記錄</span>
              <span className="font-serif font-bold text-base text-[#2A2723]">{growthRecords.length} 筆</span>
            </div>
            <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EBE7DF]">
              <span className="text-[11px] text-[#8C8475] block">門診就醫次數</span>
              <span className="font-serif font-bold text-base text-[#2A2723]">{medicalVisits.length} 次</span>
            </div>
            <div className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EBE7DF]">
              <span className="text-[11px] text-[#8C8475] block">已完成疫苗</span>
              <span className="font-serif font-bold text-base text-emerald-700">
                {vaccineRecords.filter((v) => v.isCompleted).length} 劑
              </span>
            </div>
          </div>

          {/* Growth Summary List */}
          <div>
            <span className="font-bold text-xs text-[#2A2723] block mb-1.5">最近一次生長數值：</span>
            {growthRecords.length > 0 ? (
              <div className="bg-[#FAF3EB] p-3 rounded-xl border border-[#EBE7DF] flex items-center justify-around font-mono">
                <div>體重: <span className="font-bold text-[#2A2723]">{growthRecords[growthRecords.length - 1].weight} kg</span></div>
                <div>身長: <span className="font-bold text-[#2A2723]">{growthRecords[growthRecords.length - 1].length} cm</span></div>
                <div>頭圍: <span className="font-bold text-[#2A2723]">{growthRecords[growthRecords.length - 1].headCirc} cm</span></div>
              </div>
            ) : (
              <p className="text-xs text-[#8C8475]">尚未記錄生長數值</p>
            )}
          </div>

          {/* Recent Medical Visits List */}
          <div>
            <span className="font-bold text-xs text-[#2A2723] block mb-1.5">最近看診紀錄：</span>
            {medicalVisits.length > 0 ? (
              <div className="space-y-2">
                {medicalVisits.slice(-2).reverse().map((m) => (
                  <div key={m.id} className="p-2.5 bg-[#FAF3EB] rounded-xl border border-[#EBE7DF] text-xs">
                    <div className="flex justify-between font-bold text-[#2A2723]">
                      <span>{m.date} - {m.clinic} ({m.doctor})</span>
                      <span className="text-rose-700">{m.reason}</span>
                    </div>
                    {m.diagnosis && <p className="text-[#6B6457] mt-1">診斷: {m.diagnosis}</p>}
                    {m.prescriptions && <p className="text-[#6B6457]">用藥: {m.prescriptions}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8C8475]">尚未有門診就診紀錄</p>
            )}
          </div>

        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#EBE7DF]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#D9D1C2] text-xs text-[#6B6457] hover:bg-[#EBE7DF] cursor-pointer"
          >
            關閉
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportPDF}
            className="px-6 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-semibold hover:bg-[#4A453E] shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>匯出 A4 兒科護照 PDF</span>
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
};
