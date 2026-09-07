import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Plus, 
  Trash2,
  Stethoscope,
  X,
  Calendar,
  Eye,
  FileText,
  Activity,
  Droplets,
  Thermometer,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { BabyProfile, GrowthRecord, VaccineRecord, MedicalVisit, DiaryEntry } from '../types';
import { getBabyAgeDetails } from '../utils/storage';
import { calculateDailyIO, DailyIOSummary } from '../utils/ioCalculator';
import { exportIOAndVitalSignsXLSX, getDateRangeBounds } from '../utils/excelExporter';

interface PediatricReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  medicalVisits: MedicalVisit[];
  diaryEntries: DiaryEntry[];
}

export type IORangeDays = 7 | 21 | 30 | 90 | 180 | 1;

export const PediatricReportModal: React.FC<PediatricReportModalProps> = ({
  isOpen,
  onClose,
  babyProfile,
  growthRecords,
  vaccineRecords,
  medicalVisits,
  diaryEntries,
}) => {
  const [parentQuestions, setParentQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Range selection for I/O and Vital Signs (一週, 三週, 一個月, 三個月, 半年)
  const [selectedRangeDays, setSelectedRangeDays] = useState<IORangeDays>(7);
  
  // Toggle doctor-only print preview mode on screen
  const [isDoctorPreviewMode, setIsDoctorPreviewMode] = useState(false);

  const ageDetails = getBabyAgeDetails(babyProfile.birthday);
  const now = new Date();
  const printDate = now.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const printTime = now.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Calculate range bounds
  const rangeBounds = getDateRangeBounds(selectedRangeDays);

  // Latest baby weight for calculations
  const sortedGrowth = [...growthRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestGrowth = sortedGrowth[0] || null;
  const growthHistory = sortedGrowth.slice(0, 6);
  const babyWeightForIO = latestGrowth?.weight || babyProfile.birthWeight || 4.5;

  // Vaccines Status
  const completedVaccines = vaccineRecords.filter((v) => v.isCompleted);
  const pendingVaccines = vaccineRecords.filter((v) => !v.isCompleted);

  // Recent Medical Visits
  const recentVisits = [...medicalVisits]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Filter Vital Signs (Temperature & Meds) by Selected Range
  const rangeVitalSigns = diaryEntries
    .filter((e) => {
      const isTemp = e.metrics?.temperatureC !== undefined;
      if (!isTemp) return false;
      return e.date >= rangeBounds.startStr && e.date <= rangeBounds.endStr;
    })
    .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime());

  // Statistics for Vital Signs in range
  const vitalsStats = useMemo(() => {
    if (rangeVitalSigns.length === 0) return null;
    let maxTemp = 0;
    let feverCount = 0;
    let highFeverCount = 0;
    let medCount = 0;

    rangeVitalSigns.forEach((log) => {
      const t = log.metrics?.temperatureC || 0;
      if (t > maxTemp) maxTemp = t;
      if (t >= 38.0) feverCount++;
      if (t >= 38.5) highFeverCount++;
      if (log.metrics?.medicationTaken) medCount++;
    });

    return {
      count: rangeVitalSigns.length,
      maxTemp,
      feverCount,
      highFeverCount,
      medCount,
    };
  }, [rangeVitalSigns]);

  // Calculate Daily I/O for each day in range
  const rangeDailyIOList = useMemo(() => {
    const list: (DailyIOSummary & { date: string })[] = [];
    const cur = new Date(rangeBounds.startStr);
    const endD = new Date(rangeBounds.endStr);

    while (cur <= endD) {
      const dateStr = cur.toISOString().split('T')[0];
      const summary = calculateDailyIO(diaryEntries, dateStr, babyWeightForIO);
      // Only include days with recorded data or all days if 7 days or less
      if (summary.totalIntakeMl > 0 || summary.totalOutputMl > 0 || summary.totalDiaperCount > 0 || selectedRangeDays <= 7) {
        list.push({
          date: dateStr,
          ...summary,
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return list.reverse(); // Latest day first
  }, [diaryEntries, rangeBounds.startStr, rangeBounds.endStr, babyWeightForIO, selectedRangeDays]);

  // Aggregated I/O statistics across the selected range
  const rangeIOAggregates = useMemo(() => {
    const daysWithData = rangeDailyIOList.filter(
      (d) => d.totalIntakeMl > 0 || d.totalOutputMl > 0 || d.totalDiaperCount > 0
    );
    const count = daysWithData.length || 1;

    let sumIntake = 0;
    let sumFormula = 0;
    let sumBreast = 0;
    let sumWater = 0;
    let sumOutput = 0;
    let sumUrine = 0;
    let sumVomit = 0;
    let sumDiapers = 0;
    let sumHeavyDiapers = 0;
    let sumStool = 0;
    let sumHourlyRate = 0;
    let sumBalance = 0;

    daysWithData.forEach((d) => {
      sumIntake += d.totalIntakeMl;
      sumFormula += d.intakeBreakdown.formulaMilkMl;
      sumBreast += d.intakeBreakdown.breastMilkMl;
      sumWater += d.intakeBreakdown.waterMl;
      sumOutput += d.totalOutputMl;
      sumUrine += d.totalUrineMl;
      sumVomit += d.totalVomitMl;
      sumDiapers += d.totalDiaperCount;
      sumHeavyDiapers += d.heavyDiaperCount;
      sumStool += d.stoolCount;
      sumHourlyRate += d.urineHourlyRate;
      sumBalance += d.netFluidBalanceMl;
    });

    return {
      daysCount: count,
      avgDailyIntake: Math.round(sumIntake / count),
      avgDailyFormula: Math.round(sumFormula / count),
      avgDailyBreast: Math.round(sumBreast / count),
      avgDailyWater: Math.round(sumWater / count),
      avgDailyOutput: Math.round(sumOutput / count),
      avgDailyUrine: Math.round(sumUrine / count),
      avgDailyVomit: Math.round(sumVomit / count),
      avgDailyDiapers: Number((sumDiapers / count).toFixed(1)),
      avgDailyHeavyDiapers: Number((sumHeavyDiapers / count).toFixed(1)),
      avgDailyStool: Number((sumStool / count).toFixed(1)),
      avgHourlyRate: Number((sumHourlyRate / count).toFixed(2)),
      totalNetBalance: sumBalance,
      avgDailyBalance: Math.round(sumBalance / count),
    };
  }, [rangeDailyIOList]);

  // Handle Question Add/Remove
  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setParentQuestions([...parentQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setParentQuestions(parentQuestions.filter((_, i) => i !== index));
  };

  // Trigger Print (Only doctor's content will be printed)
  const handlePrint = () => {
    window.print();
  };

  // Export Excel specifically for I/O and Vital Signs for selected range
  const handleExportExcel = () => {
    exportIOAndVitalSignsXLSX(
      diaryEntries,
      babyProfile,
      growthRecords,
      selectedRangeDays,
      rangeBounds.label
    );
  };

  // Generate plain text report
  const generatePlainText = () => {
    const rangeLabel = rangeBounds.label;
    return `【兒科就診臨床評估與摘要報告 (含 I/O 與生命徵象)】
產出日期：${printDate} ${printTime}
監測評估區間：${rangeLabel} (${rangeBounds.startStr} ~ ${rangeBounds.endStr})

一、基本資料 (Patient Profile)
・寶寶姓名：${babyProfile.name}${babyProfile.nickname ? ` (${babyProfile.nickname})` : ''}
・性別：${babyProfile.gender === 'female' ? '女' : '男'} | 血型：${babyProfile.bloodType} 型
・出生日期：${babyProfile.birthday}${babyProfile.birthTime ? ` ${babyProfile.birthTime}` : ''} (妊娠週數 ${babyProfile.gestationalWeeks} 週)
・實足年齡：${ageDetails.formattedText} (共 ${ageDetails.days} 天)
・初生數據：體重 ${babyProfile.birthWeight > 0 ? `${babyProfile.birthWeight} kg` : '未填'} / 身長 ${babyProfile.birthLength > 0 ? `${babyProfile.birthLength} cm` : '未填'} / 頭圍 ${babyProfile.birthHeadCirc > 0 ? `${babyProfile.birthHeadCirc} cm` : '未填'}
・緊急聯絡：${babyProfile.emergencyContact?.name ? `${babyProfile.emergencyContact.name} (${babyProfile.emergencyContact.relationship}) ${babyProfile.emergencyContact.phone}` : '未設定'}
・主治院所：${babyProfile.hospital || '未填寫'}

二、過敏史與醫療警訊 (Clinical Alerts)
${babyProfile.allergies && babyProfile.allergies.length > 0 ? `・過敏紀錄：${babyProfile.allergies.join('、')}` : '・無已知藥物或食物過敏紀錄'}

三、最新生長數值 (WHO 標準)
・測量日期：${latestGrowth ? latestGrowth.date : babyProfile.birthday}
・體重：${latestGrowth ? `${latestGrowth.weight} kg (P${latestGrowth.percentileWeight})` : `${babyProfile.birthWeight} kg (基準)`}
・身高：${latestGrowth ? `${latestGrowth.length} cm (P${latestGrowth.percentileLength})` : `${babyProfile.birthLength} cm (基準)`}
・頭圍：${latestGrowth ? `${latestGrowth.headCirc} cm (P${latestGrowth.percentileHeadCirc})` : `${babyProfile.birthHeadCirc} cm (基準)`}

四、生命徵象 Vital Signs (體溫與發燒監測 - ${rangeLabel})
${rangeVitalSigns.length > 0 ? rangeVitalSigns.map(v => `・${v.date} ${v.time || ''}：${v.metrics?.temperatureC}°C ${v.metrics?.medicationTaken ? `(給予: ${v.metrics.medicationTaken})` : ''} - ${v.content || v.title}`).join('\n') : `在所選區間 (${rangeLabel}) 內無體溫異常紀錄`}

五、水分攝入與排泄 Total I/O 臨床數據 (${rangeLabel})
・每日平均攝入量：${rangeIOAggregates.avgDailyIntake} ml/day (奶量: ${rangeIOAggregates.avgDailyFormula + rangeIOAggregates.avgDailyBreast}ml, 水: ${rangeIOAggregates.avgDailyWater}ml)
・每日平均排出量：${rangeIOAggregates.avgDailyOutput} ml/day (估算尿量: ${rangeIOAggregates.avgDailyUrine}ml, 嘔吐: ${rangeIOAggregates.avgDailyVomit}ml)
・平均換尿布次數：${rangeIOAggregates.avgDailyDiapers} 片/day (濕重尿布: ${rangeIOAggregates.avgDailyHeavyDiapers} 片, 排便: ${rangeIOAggregates.avgDailyStool} 次)
・平均每小時排尿率：${rangeIOAggregates.avgHourlyRate} ml/kg/hr (臨床標準: > 1.0)
・累積水分平衡：${rangeIOAggregates.totalNetBalance > 0 ? `+${rangeIOAggregates.totalNetBalance}` : rangeIOAggregates.totalNetBalance} ml (平均 ${rangeIOAggregates.avgDailyBalance} ml/day)

六、疫苗接種摘要
・已完成 (${completedVaccines.length}劑)：${completedVaccines.length > 0 ? completedVaccines.map(v => `${v.vaccineName} (${v.completedDate || '已完成'})`).join('、') : '尚無'}
・待接種：${pendingVaccines.slice(0, 5).map(v => `${v.vaccineName} (預定 ${v.scheduledDate})`).join('、')}

七、近期門診紀錄與用藥
${recentVisits.length > 0 ? recentVisits.map(v => `・${v.date} ${v.clinicName} (${v.doctorName || '醫師'})
  主訴：${v.reason} | 診斷：${v.diagnosis}
  用藥：${v.prescriptions?.map(p => `${p.name} (${p.dosage}, ${p.frequency})`).join('; ') || '無開藥'}`).join('\n\n') : '無近期門診就診紀錄'}

八、家長看診提問
${parentQuestions.length > 0 ? parentQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') : '無特別提問'}
`;
  };

  const handleCopyText = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadText = () => {
    const text = generatePlainText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${babyProfile.name}_兒科就診摘要_${rangeBounds.label}_${printDate.replace(/\//g, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 overflow-y-auto print-modal-container">
      
      {/* Report Modal Outer Card */}
      <div className={`bg-white rounded-2xl max-w-4xl w-full border border-gray-300 shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col print:max-h-none print:my-0 print:border-none print:shadow-none print-paper-sheet ${
        isDoctorPreviewMode ? 'ring-4 ring-gray-900/10' : ''
      }`}>
        
        {/* Top Control & Range Selector Header (Strictly Hidden on Print) */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-col gap-3 shrink-0 no-print font-sans">
          
          {/* Row 1: Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shadow-xs">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    兒科就診健康與 I/O 摘要報告
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                    醫師標準版
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  預覽列印時僅保留就診內容，支援選擇 I/O 與 Vital Sign 範圍並一鍵列印或匯出
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Doctor Print View Toggle */}
              <button
                type="button"
                onClick={() => setIsDoctorPreviewMode(!isDoctorPreviewMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isDoctorPreviewMode
                    ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
                title="切換醫師純淨版列印預覽"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isDoctorPreviewMode ? '返回完整版' : '醫師純淨預覽'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                title="複製純文字"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? '已複製' : '複製文字'}</span>
              </button>

              {/* Export Excel (.xlsx) */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 transition-colors font-sans"
                title="將選定區間之 I/O 與生命徵象匯出為 Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold">匯出 Excel (.xlsx)</span>
              </button>

              {/* Download TXT */}
              <button
                type="button"
                onClick={handleDownloadText}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                title="下載 TXT 摘要檔案"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">下載 TXT</span>
              </button>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>列印 / 存為 PDF</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                aria-label="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 2: Range Selector for I/O & Vital Sign */}
          <div className="pt-2.5 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>選擇 I/O 與 Vital Sign 列印/匯出範圍：</span>
            </div>

            {/* Range Pills: 一週、三週、一個月、三個月、半年 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { days: 7 as IORangeDays, label: '一週 (7天)' },
                { days: 21 as IORangeDays, label: '三週 (21天)' },
                { days: 30 as IORangeDays, label: '一個月 (30天)' },
                { days: 90 as IORangeDays, label: '三個月 (90天)' },
                { days: 180 as IORangeDays, label: '半年 (180天)' },
                { days: 1 as IORangeDays, label: '當日 (24h)' },
              ].map((item) => {
                const isActive = selectedRangeDays === item.days;
                return (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setSelectedRangeDays(item.days)}
                    className={`px-2.5 py-1 rounded-full text-xs font-sans transition-all ${
                      isActive
                        ? 'bg-gray-900 text-white font-bold shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Range Indication */}
          <div className="text-[11px] text-gray-500 flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>當前評估範圍：<strong className="text-gray-800">{rangeBounds.label}</strong> ({rangeBounds.startStr} 至 {rangeBounds.endStr})</span>
            </span>
            <span className="text-emerald-700 font-medium">
              含 {rangeVitalSigns.length} 筆生命徵象 ｜ {rangeDailyIOList.length} 天 I/O 數據
            </span>
          </div>

        </div>

        {/* Scrollable Printable Report Sheet Body (This is the ONLY part printed!) */}
        <div 
          id="printable-doctor-report"
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-5 text-gray-900 bg-white print:p-0 print:space-y-4 print:overflow-visible text-sm font-sans"
        >
          
          {/* Document Title Header */}
          <div className="border-b-2 border-gray-900 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  兒童健康與臨床就診摘要報告
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 border border-gray-400 text-gray-800 rounded">
                  Clinical Summary
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Pediatric Health, Growth & Fluid Balance (Total I/O) Assessment
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-gray-600">
              <p>產出日期時間：<span className="font-mono font-medium text-gray-900">{printDate} {printTime}</span></p>
              <p>就診院所：<span className="font-medium text-gray-900">{babyProfile.hospital || '小兒科門診 / 健檢'}</span></p>
              <p className="font-medium text-gray-800">I/O 與 Vital Sign 範圍：<span className="font-bold underline">{rangeBounds.label}</span></p>
            </div>
          </div>

          {/* Section 1: Basic Profile Table */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-l-3 border-gray-900 pl-2">
              一、基本資料 (Patient Profile)
            </h2>
            <table className="w-full border border-gray-300 text-xs">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 w-24 border-r border-gray-300 text-gray-700">寶寶姓名</td>
                  <td className="p-2 border-r border-gray-300 font-bold text-gray-900">
                    {babyProfile.name} {babyProfile.nickname ? `(${babyProfile.nickname})` : ''}
                  </td>
                  <td className="bg-gray-100 font-semibold p-2 w-24 border-r border-gray-300 text-gray-700">性別 / 血型</td>
                  <td className="p-2 text-gray-900">
                    {babyProfile.gender === 'female' ? '女' : '男'} ｜ {babyProfile.bloodType} 型
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">出生日期</td>
                  <td className="p-2 border-r border-gray-300 font-mono text-gray-900">
                    {babyProfile.birthday} {babyProfile.birthTime || ''} (週數: {babyProfile.gestationalWeeks}週)
                  </td>
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">目前實足月齡</td>
                  <td className="p-2 font-bold text-gray-900">
                    {ageDetails.formattedText} (共 {ageDetails.days} 天)
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">初生基準</td>
                  <td className="p-2 border-r border-gray-300 font-mono text-gray-900" colSpan={3}>
                    體重 {babyProfile.birthWeight > 0 ? `${babyProfile.birthWeight} kg` : '未填寫'} ｜ 身長 {babyProfile.birthLength > 0 ? `${babyProfile.birthLength} cm` : '未填寫'} ｜ 頭圍 {babyProfile.birthHeadCirc > 0 ? `${babyProfile.birthHeadCirc} cm` : '未填寫'}
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">緊急聯絡人</td>
                  <td className="p-2 text-gray-900" colSpan={3}>
                    {babyProfile.emergencyContact?.name ? (
                      <span>{babyProfile.emergencyContact.name} ({babyProfile.emergencyContact.relationship}) ｜ 電話：<span className="font-mono">{babyProfile.emergencyContact.phone}</span></span>
                    ) : '未填寫'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Allergies & Alerts */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-l-3 border-gray-900 pl-2">
              二、過敏史與用藥警訊 (Allergies & Clinical Alerts)
            </h2>
            <div className="border border-gray-300 p-2.5 rounded bg-gray-50 text-xs">
              {babyProfile.allergies && babyProfile.allergies.length > 0 ? (
                <div className="text-red-700 font-semibold">
                  <span>⚠️ 已知過敏史 / 警訊：</span>
                  <span className="underline ml-1">{babyProfile.allergies.join('、')}</span>
                </div>
              ) : (
                <div className="text-gray-700">
                  無已知藥物過敏、食物過敏或蠶豆症 (G6PD) 特殊病史紀錄。
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Latest Growth Status */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-l-3 border-gray-900 pl-2">
              三、最新生長發育與 WHO 百分位評估 (Anthropometrics)
            </h2>
            <table className="w-full border border-gray-300 text-xs">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr className="border-b border-gray-300">
                  <th className="p-2 text-left border-r border-gray-300">項目</th>
                  <th className="p-2 text-left border-r border-gray-300">最新測量數值</th>
                  <th className="p-2 text-left border-r border-gray-300">WHO 兒童生長標準落點</th>
                  <th className="p-2 text-left">測量日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                <tr>
                  <td className="p-2 font-semibold border-r border-gray-300">體重 (Weight)</td>
                  <td className="p-2 font-mono font-bold border-r border-gray-300">
                    {latestGrowth ? `${latestGrowth.weight} kg` : `${babyProfile.birthWeight} kg`}
                  </td>
                  <td className="p-2 border-r border-gray-300">
                    {latestGrowth?.percentileWeight !== undefined ? `第 ${latestGrowth.percentileWeight} 百分位 (P${latestGrowth.percentileWeight})` : '初生基準'}
                  </td>
                  <td className="p-2 font-mono text-gray-600">
                    {latestGrowth ? latestGrowth.date : babyProfile.birthday}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-r border-gray-300">身高 (Length)</td>
                  <td className="p-2 font-mono font-bold border-r border-gray-300">
                    {latestGrowth ? `${latestGrowth.length} cm` : `${babyProfile.birthLength} cm`}
                  </td>
                  <td className="p-2 border-r border-gray-300">
                    {latestGrowth?.percentileLength !== undefined ? `第 ${latestGrowth.percentileLength} 百分位 (P${latestGrowth.percentileLength})` : '初生基準'}
                  </td>
                  <td className="p-2 font-mono text-gray-600">
                    {latestGrowth ? latestGrowth.date : babyProfile.birthday}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold border-r border-gray-300">頭圍 (Head Circumference)</td>
                  <td className="p-2 font-mono font-bold border-r border-gray-300">
                    {latestGrowth ? `${latestGrowth.headCirc} cm` : `${babyProfile.birthHeadCirc} cm`}
                  </td>
                  <td className="p-2 border-r border-gray-300">
                    {latestGrowth?.percentileHeadCirc !== undefined ? `第 ${latestGrowth.percentileHeadCirc} 百分位 (P${latestGrowth.percentileHeadCirc})` : '初生基準'}
                  </td>
                  <td className="p-2 font-mono text-gray-600">
                    {latestGrowth ? latestGrowth.date : babyProfile.birthday}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Dynamic Vital Signs within Selected Range (User Requested) */}
          <div className="print-avoid-break space-y-1.5">
            <div className="flex items-center justify-between border-l-3 border-gray-900 pl-2">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                四、生命徵象與體溫發燒監測 (Vital Signs - {rangeBounds.label})
              </h2>
              <span className="text-[11px] font-mono text-gray-500">
                區間範圍：{rangeBounds.startStr} ~ {rangeBounds.endStr}
              </span>
            </div>

            {/* Vital Signs Summary Stats */}
            {vitalsStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                <div>
                  <span className="text-gray-500">測量次數：</span>
                  <span className="font-bold font-mono text-gray-900">{vitalsStats.count} 次</span>
                </div>
                <div>
                  <span className="text-gray-500">期間最高溫：</span>
                  <span className={`font-bold font-mono ${vitalsStats.maxTemp >= 38.0 ? 'text-red-700' : 'text-gray-900'}`}>
                    {vitalsStats.maxTemp}°C
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">發燒次數 (≥38°C)：</span>
                  <span className={`font-bold font-mono ${vitalsStats.feverCount > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                    {vitalsStats.feverCount} 次
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">退燒用藥處置：</span>
                  <span className="font-bold font-mono text-gray-900">{vitalsStats.medCount} 次</span>
                </div>
              </div>
            )}

            {/* Vital Signs Logs Table */}
            {rangeVitalSigns.length > 0 ? (
              <table className="w-full border border-gray-300 text-xs">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr className="border-b border-gray-300">
                    <th className="p-1.5 text-left border-r border-gray-300 w-32">測量時間</th>
                    <th className="p-1.5 text-center border-r border-gray-300 w-24">測得體溫</th>
                    <th className="p-1.5 text-left border-r border-gray-300 w-36">臨床警示 / 給藥</th>
                    <th className="p-1.5 text-left">臨床觀察與伴隨症狀 (一字不漏)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {rangeVitalSigns.map((log) => {
                    const temp = log.metrics?.temperatureC ?? 0;
                    const isFever = temp >= 38.0;
                    const isHighFever = temp >= 38.5;

                    return (
                      <tr key={log.id}>
                        <td className="p-1.5 font-mono border-r border-gray-300">
                          {log.date} {log.time || ''}
                        </td>
                        <td className={`p-1.5 font-mono font-bold text-center border-r border-gray-300 ${
                          isHighFever ? 'text-red-700 bg-red-50' : isFever ? 'text-amber-700' : 'text-gray-900'
                        }`}>
                          {temp}°C
                        </td>
                        <td className="p-1.5 border-r border-gray-300">
                          {isHighFever && <span className="text-red-700 font-bold block">⚠️ 高燒 ≥38.5°C</span>}
                          {isFever && !isHighFever && <span className="text-amber-700 font-medium block">發燒 ≥38.0°C</span>}
                          {log.metrics?.medicationTaken && (
                            <span className="text-blue-800 font-medium">
                              藥物: {log.metrics.medicationTaken}
                            </span>
                          )}
                          {!isFever && !log.metrics?.medicationTaken && <span className="text-gray-500">體溫平穩</span>}
                        </td>
                        <td className="p-1.5 text-gray-800">
                          {log.content || log.title || '無特殊異常紀錄'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="border border-gray-300 p-2.5 rounded text-xs text-gray-500 bg-gray-50">
                在選定之監測區間 ({rangeBounds.label}：{rangeBounds.startStr} ~ {rangeBounds.endStr}) 內，無體溫異常或量測紀錄。
              </div>
            )}
          </div>

          {/* Section 5: Dynamic Total I/O Fluid Intake & Output (User Requested Range) */}
          <div className="print-avoid-break space-y-1.5">
            <div className="flex items-center justify-between border-l-3 border-gray-900 pl-2">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                五、水分攝入與排泄臨床數據 (Total I/O Balance - {rangeBounds.label})
              </h2>
              <span className="text-[11px] font-mono text-gray-500">
                基準體重: {babyWeightForIO} kg
              </span>
            </div>

            {/* Range Aggregates Table */}
            <table className="w-full border border-gray-300 text-xs">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 w-36 border-r border-gray-300 text-gray-700">
                    每日平均攝入量 (Intake)
                  </td>
                  <td className="p-2 border-r border-gray-300 font-mono font-bold text-gray-900">
                    {rangeIOAggregates.avgDailyIntake} ml/day
                    <span className="font-sans font-normal text-gray-500 text-[11px] block sm:inline sm:ml-1">
                      (奶量: {rangeIOAggregates.avgDailyFormula + rangeIOAggregates.avgDailyBreast}ml, 水: {rangeIOAggregates.avgDailyWater}ml)
                    </span>
                  </td>
                  <td className="bg-gray-100 font-semibold p-2 w-36 border-r border-gray-300 text-gray-700">
                    每日平均排出量 (Output)
                  </td>
                  <td className="p-2 font-mono font-bold text-gray-900">
                    {rangeIOAggregates.avgDailyOutput} ml/day
                    <span className="font-sans font-normal text-gray-500 text-[11px] block sm:inline sm:ml-1">
                      (估算尿量: {rangeIOAggregates.avgDailyUrine}ml, 嘔吐: {rangeIOAggregates.avgDailyVomit}ml)
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">
                    每日換尿布頻率
                  </td>
                  <td className="p-2 border-r border-gray-300 text-gray-900">
                    平均 <span className="font-mono font-bold">{rangeIOAggregates.avgDailyDiapers}</span> 片/day 
                    <span className="text-gray-500 text-[11px] ml-1">
                      (濕重: <span className="font-mono font-bold">{rangeIOAggregates.avgDailyHeavyDiapers}</span> 片, 排便: <span className="font-mono font-bold">{rangeIOAggregates.avgDailyStool}</span> 次)
                    </span>
                  </td>
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">
                    每小時排尿率指標
                  </td>
                  <td className="p-2 font-mono font-bold text-gray-900">
                    {rangeIOAggregates.avgHourlyRate} ml/kg/hr 
                    <span className="font-sans font-normal text-gray-500 text-[11px] ml-1">
                      (兒科標準: &gt; 1.0)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">
                    水分平衡與脫水狀態
                  </td>
                  <td className="p-2 text-gray-900" colSpan={3}>
                    每日平均淨平衡：
                    <span className="font-mono font-bold">
                      {rangeIOAggregates.avgDailyBalance > 0 ? `+${rangeIOAggregates.avgDailyBalance}` : rangeIOAggregates.avgDailyBalance} ml/day
                    </span>
                    <span className="mx-2 text-gray-400">｜</span>
                    評估結論：
                    <span className={`font-bold ${rangeIOAggregates.avgHourlyRate < 1.0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {rangeIOAggregates.avgHourlyRate < 0.8 ? '⚠️ 尿量偏低，請醫師評估脫水風險' : rangeIOAggregates.avgHourlyRate < 1.0 ? '排尿量近邊界值，需持續觀察' : '水分攝取與排泄功能良好'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Daily I/O Balance Trend Table (within range) */}
            {rangeDailyIOList.length > 0 && selectedRangeDays > 1 && (
              <div className="pt-1">
                <div className="text-[11px] font-semibold text-gray-700 mb-1">
                  區間逐日 I/O 水分平衡明細對照表：
                </div>
                <table className="w-full border border-gray-300 text-[11px]">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr className="border-b border-gray-300">
                      <th className="p-1 text-left border-r border-gray-300">日期</th>
                      <th className="p-1 text-right border-r border-gray-300">總攝入 (ml)</th>
                      <th className="p-1 text-right border-r border-gray-300">總排出 (ml)</th>
                      <th className="p-1 text-center border-r border-gray-300">換尿布 (片)</th>
                      <th className="p-1 text-center border-r border-gray-300">排尿率 (ml/kg/h)</th>
                      <th className="p-1 text-right border-r border-gray-300">淨平衡</th>
                      <th className="p-1 text-left">水分狀態評估</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {rangeDailyIOList.slice(0, 10).map((row) => (
                      <tr key={row.date}>
                        <td className="p-1 font-mono border-r border-gray-300">{row.date}</td>
                        <td className="p-1 text-right font-mono border-r border-gray-300 font-medium">{row.totalIntakeMl}</td>
                        <td className="p-1 text-right font-mono border-r border-gray-300">{row.totalOutputMl}</td>
                        <td className="p-1 text-center border-r border-gray-300">{row.totalDiaperCount}</td>
                        <td className="p-1 text-center font-mono border-r border-gray-300">{row.urineHourlyRate}</td>
                        <td className="p-1 text-right font-mono border-r border-gray-300 font-bold">
                          {row.netFluidBalanceMl > 0 ? `+${row.netFluidBalanceMl}` : row.netFluidBalanceMl}
                        </td>
                        <td className="p-1 text-gray-700">{row.hydrationStatusLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 6: Vaccines Status */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-l-3 border-gray-900 pl-2">
              六、疫苗接種歷程 (Immunization Status)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-gray-300 p-2 rounded">
                <div className="font-semibold text-gray-800 mb-1 pb-0.5 border-b border-gray-200">
                  已完成接種項目 ({completedVaccines.length} 劑)
                </div>
                {completedVaccines.length > 0 ? (
                  <ul className="space-y-0.5">
                    {completedVaccines.map((v) => (
                      <li key={v.id} className="flex justify-between text-gray-800 text-[11px]">
                        <span>・{v.vaccineName}</span>
                        <span className="font-mono text-gray-500">{v.completedDate || '已完成'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-[11px]">尚無已完成接種紀錄</p>
                )}
              </div>

              <div className="border border-gray-300 p-2 rounded">
                <div className="font-semibold text-gray-800 mb-1 pb-0.5 border-b border-gray-200">
                  近期預定接種項目
                </div>
                {pendingVaccines.length > 0 ? (
                  <ul className="space-y-0.5">
                    {pendingVaccines.slice(0, 4).map((v) => (
                      <li key={v.id} className="flex justify-between text-gray-800 text-[11px]">
                        <span>・{v.vaccineName}</span>
                        <span className="font-mono text-gray-500">預定: {v.scheduledDate}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-[11px]">目前階段疫苗已全數完成</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 7: Recent Medical Visits */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-l-3 border-gray-900 pl-2">
              七、近期兒科門診就診與處方紀錄 (Recent Medical Visits)
            </h2>
            {recentVisits.length > 0 ? (
              <table className="w-full border border-gray-300 text-xs">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr className="border-b border-gray-300">
                    <th className="p-1.5 text-left border-r border-gray-300 w-24">日期</th>
                    <th className="p-1.5 text-left border-r border-gray-300 w-32">院所 / 醫師</th>
                    <th className="p-1.5 text-left border-r border-gray-300">主訴與診斷</th>
                    <th className="p-1.5 text-left">開立處方藥物</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {recentVisits.map((visit) => (
                    <tr key={visit.id}>
                      <td className="p-1.5 font-mono border-r border-gray-300">{visit.date}</td>
                      <td className="p-1.5 border-r border-gray-300">
                        <div className="font-medium text-gray-900">{visit.clinicName}</div>
                        {visit.doctorName && <div className="text-gray-500 text-[11px]">{visit.doctorName}</div>}
                      </td>
                      <td className="p-1.5 border-r border-gray-300">
                        <div><strong className="text-gray-700">主訴：</strong>{visit.reason}</div>
                        <div><strong className="text-gray-700">診斷：</strong>{visit.diagnosis}</div>
                      </td>
                      <td className="p-1.5 text-gray-800">
                        {visit.prescriptions && visit.prescriptions.length > 0 ? (
                          visit.prescriptions.map((p, idx) => (
                            <div key={idx} className="text-[11px]">
                              ・{p.name} ({p.dosage}, {p.frequency})
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">無處方藥物</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="border border-gray-300 p-2 rounded text-xs text-gray-500">
                近期無特殊門診就診紀錄
              </div>
            )}
          </div>

          {/* Section 8: Parent's Questions for Doctor */}
          <div className="print-avoid-break space-y-2">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-l-3 border-gray-900 pl-2">
              八、家長本次看診提問與觀察 (Questions for Doctor)
            </h2>
            <div className="border border-gray-300 p-3 rounded space-y-2 text-xs">
              {parentQuestions.length > 0 ? (
                <ol className="list-decimal pl-4 space-y-1 text-gray-900 font-medium">
                  {parentQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start justify-between gap-2">
                      <span>{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-gray-400 hover:text-red-600 no-print p-0.5"
                        title="刪除問題"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 italic">尚未輸入提問事項</p>
              )}

              {/* Add Question Input (Strictly Hidden on Print) */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 no-print">
                <input
                  type="text"
                  placeholder="輸入看診想詢問醫師的問題 (例如: 排便狀況、紅疹、副食品、呼吸聲等)..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-600 font-sans"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs hover:bg-black flex items-center gap-1 shrink-0 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>加入問題</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 9: Doctor's Signature Block (For consultation) */}
          <div className="print-avoid-break pt-4 border-t border-gray-400 grid grid-cols-2 gap-6 text-xs text-gray-700">
            <div>
              <span className="block font-semibold mb-1">兒科醫師診斷簽章 / 醫療院所戳章：</span>
              <div className="h-10 border-b border-dashed border-gray-400" />
            </div>
            <div>
              <span className="block font-semibold mb-1">醫囑、治療計畫與回診建議：</span>
              <div className="h-10 border-b border-dashed border-gray-400" />
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden on Print) */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 no-print font-sans">
          <span className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-gray-400" />
            <span>提示：點擊「列印 / 存為 PDF」系統將僅輸出上方白色醫師醫療報告，去除所有操作介面與按鈕</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          >
            關閉視窗
          </button>
        </div>

      </div>
    </div>
  );
};
