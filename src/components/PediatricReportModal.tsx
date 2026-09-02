import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Plus, 
  Trash2,
  Stethoscope,
  X
} from 'lucide-react';
import { BabyProfile, GrowthRecord, VaccineRecord, MedicalVisit, DiaryEntry } from '../types';
import { getBabyAgeDetails } from '../utils/storage';
import { calculateDailyIO } from '../utils/ioCalculator';

interface PediatricReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  medicalVisits: MedicalVisit[];
  diaryEntries: DiaryEntry[];
}

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

  if (!isOpen) return null;

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

  // Sort growth records from latest to oldest
  const sortedGrowth = [...growthRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestGrowth = sortedGrowth[0] || null;
  const growthHistory = sortedGrowth.slice(0, 6);

  // Vaccines Status
  const completedVaccines = vaccineRecords.filter((v) => v.isCompleted);
  const pendingVaccines = vaccineRecords.filter((v) => !v.isCompleted);

  // Recent Medical Visits
  const recentVisits = [...medicalVisits]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Recent Temperature logs
  const recentTempLogs = diaryEntries
    .filter((e) => e.metrics?.temperatureC !== undefined)
    .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime())
    .slice(0, 6);

  // 24h Total I/O summary
  const todayStr = new Date().toISOString().split('T')[0];
  const babyWeightForIO = latestGrowth?.weight || babyProfile.birthWeight || 4.5;
  const todayIO = calculateDailyIO(diaryEntries, todayStr, babyWeightForIO);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setParentQuestions([...parentQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setParentQuestions(parentQuestions.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePlainText = () => {
    return `【寶寶健康與成長摘要報告】
產出日期：${printDate} ${printTime}

一、基本資料
・寶寶姓名：${babyProfile.name}${babyProfile.nickname ? ` (${babyProfile.nickname})` : ''}
・性別：${babyProfile.gender === 'female' ? '女' : '男'} | 血型：${babyProfile.bloodType} 型
・出生日期：${babyProfile.birthday}${babyProfile.birthTime ? ` ${babyProfile.birthTime}` : ''} (妊娠週數 ${babyProfile.gestationalWeeks} 週)
・實足年齡：${ageDetails.formattedText} (共 ${ageDetails.days} 天)
・初生數據：體重 ${babyProfile.birthWeight > 0 ? `${babyProfile.birthWeight} kg` : '未填'} / 身長 ${babyProfile.birthLength > 0 ? `${babyProfile.birthLength} cm` : '未填'} / 頭圍 ${babyProfile.birthHeadCirc > 0 ? `${babyProfile.birthHeadCirc} cm` : '未填'}
・緊急聯絡：${babyProfile.emergencyContact?.name ? `${babyProfile.emergencyContact.name} (${babyProfile.emergencyContact.relationship}) ${babyProfile.emergencyContact.phone}` : '未設定'}
・主治院所：${babyProfile.hospital || '未填寫'}

二、過敏史與醫療警訊
${babyProfile.allergies && babyProfile.allergies.length > 0 ? `・過敏紀錄：${babyProfile.allergies.join('、')}` : '・無已知藥物或食物過敏紀錄'}

三、最新生長數值 (WHO 標準)
・測量日期：${latestGrowth ? latestGrowth.date : babyProfile.birthday}
・體重：${latestGrowth ? `${latestGrowth.weight} kg (P${latestGrowth.percentileWeight})` : `${babyProfile.birthWeight} kg (基準)`}
・身高：${latestGrowth ? `${latestGrowth.length} cm (P${latestGrowth.percentileLength})` : `${babyProfile.birthLength} cm (基準)`}
・頭圍：${latestGrowth ? `${latestGrowth.headCirc} cm (P${latestGrowth.percentileHeadCirc})` : `${babyProfile.birthHeadCirc} cm (基準)`}

四、近期生長測量紀錄
${growthHistory.length > 0 ? growthHistory.map(g => `・${g.date} (${g.ageMonths}月齡)：體重 ${g.weight}kg (P${g.percentileWeight}), 身高 ${g.length}cm (P${g.percentileLength}), 頭圍 ${g.headCirc}cm (P${g.percentileHeadCirc})`).join('\n') : '尚無歷史生長測量紀錄'}

五、疫苗接種摘要
・已完成 (${completedVaccines.length}劑)：${completedVaccines.length > 0 ? completedVaccines.map(v => `${v.vaccineName} (${v.completedDate || '已完成'})`).join('、') : '尚無'}
・待接種：${pendingVaccines.slice(0, 5).map(v => `${v.vaccineName} (預定 ${v.scheduledDate})`).join('、')}

六、近期門診紀錄與用藥
${recentVisits.length > 0 ? recentVisits.map(v => `・${v.date} ${v.clinicName} (${v.doctorName || '醫師'})
  主訴：${v.reason} | 診斷：${v.diagnosis}
  用藥：${v.prescriptions?.map(p => `${p.name} (${p.dosage}, ${p.frequency})`).join('; ') || '無開藥'}`).join('\n\n') : '無近期門診就診紀錄'}

七、家長提問備忘
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
    link.download = `${babyProfile.name}_健康摘要_${printDate.replace(/\//g, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGrowthCSV = () => {
    const header = '測量日期,月齡(月),體重(kg),體重百分位(P),身長(cm),身長百分位(P),頭圍(cm),頭圍百分位(P),備註\n';
    const rows = sortedGrowth.map(g => 
      `"${g.date}",${g.ageMonths},${g.weight},${g.percentileWeight},${g.length},${g.percentileLength},${g.headCirc},${g.percentileHeadCirc},"${(g.note || '').replace(/"/g, '""')}"`
    ).join('\n');
    const csvContent = '\uFEFF' + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${babyProfile.name}_生長紀錄_${printDate.replace(/\//g, '')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 overflow-y-auto print-modal-container">
      
      {/* Report Modal Outer Card */}
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-gray-300 shadow-xl overflow-hidden my-4 max-h-[92vh] flex flex-col print:max-h-none print:my-0 print:border-none print:shadow-none print-paper-sheet">
        
        {/* Top Action Header (Hidden on Print) */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                就診健康與成長摘要報告
              </h3>
              <p className="text-xs text-gray-500">
                清晰標準排版，供醫師問診、健康檢查或自行留存閱讀
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
              title="複製純文字至剪貼簿"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製文字' : '複製文字'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
              title="下載文字檔案 (.txt)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載 TXT</span>
            </button>

            {sortedGrowth.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadGrowthCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
                title="匯出生長紀錄為 CSV 試算表"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>匯出 CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-black flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 存為 PDF</span>
            </button>

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

        {/* Scrollable Printable Report Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-gray-900 bg-white print:p-0 print:space-y-5 print:overflow-visible text-sm font-sans">
          
          {/* Document Title Header */}
          <div className="border-b-2 border-gray-800 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                兒童健康與成長就診摘要報告
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Pediatric Health & Growth Summary Report
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-gray-600">
              <p>產出日期：<span className="font-mono font-medium text-gray-900">{printDate} {printTime}</span></p>
              <p>醫療院所：<span className="font-medium text-gray-900">{babyProfile.hospital || '一般就醫'}</span></p>
            </div>
          </div>

          {/* Section 1: Basic Profile Table */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
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
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">目前月齡</td>
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
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
              二、過敏史與用藥警訊 (Allergies & Clinical Alerts)
            </h2>
            <div className="border border-gray-300 p-2.5 rounded bg-gray-50 text-xs">
              {babyProfile.allergies && babyProfile.allergies.length > 0 ? (
                <div className="text-red-700 font-semibold">
                  <span>⚠️ 已知過敏史：</span>
                  <span className="underline">{babyProfile.allergies.join('、')}</span>
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
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
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

          {/* Section 4: Growth History Table (if any) */}
          {growthHistory.length > 0 && (
            <div className="print-avoid-break space-y-1.5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
                四、歷史生長測量紀錄 (Growth History)
              </h2>
              <table className="w-full border border-gray-300 text-xs">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr className="border-b border-gray-300">
                    <th className="p-1.5 text-left border-r border-gray-300">日期</th>
                    <th className="p-1.5 text-left border-r border-gray-300">月齡</th>
                    <th className="p-1.5 text-right border-r border-gray-300">體重 (kg)</th>
                    <th className="p-1.5 text-right border-r border-gray-300">身高 (cm)</th>
                    <th className="p-1.5 text-right border-r border-gray-300">頭圍 (cm)</th>
                    <th className="p-1.5 text-left">備註</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {growthHistory.map((g) => (
                    <tr key={g.id}>
                      <td className="p-1.5 font-mono border-r border-gray-300">{g.date}</td>
                      <td className="p-1.5 border-r border-gray-300">{g.ageMonths} 個月</td>
                      <td className="p-1.5 text-right font-mono font-medium border-r border-gray-300">{g.weight} (P{g.percentileWeight})</td>
                      <td className="p-1.5 text-right font-mono border-r border-gray-300">{g.length} (P{g.percentileLength})</td>
                      <td className="p-1.5 text-right font-mono border-r border-gray-300">{g.headCirc} (P{g.percentileHeadCirc})</td>
                      <td className="p-1.5 text-gray-600">{g.note || '成長穩定'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 5: Vaccine Tracker Summary */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
              五、疫苗接種紀錄 (Immunization Records)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-gray-300 p-2.5 rounded">
                <div className="font-semibold text-gray-800 mb-1 pb-1 border-b border-gray-200">
                  已完成接種項目 ({completedVaccines.length} 劑)
                </div>
                {completedVaccines.length > 0 ? (
                  <ul className="space-y-1">
                    {completedVaccines.map((v) => (
                      <li key={v.id} className="flex justify-between text-gray-800">
                        <span>・{v.vaccineName}</span>
                        <span className="font-mono text-gray-500">{v.completedDate || '已完成'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">尚無已完成接種紀錄</p>
                )}
              </div>

              <div className="border border-gray-300 p-2.5 rounded">
                <div className="font-semibold text-gray-800 mb-1 pb-1 border-b border-gray-200">
                  近期預定接種項目
                </div>
                {pendingVaccines.length > 0 ? (
                  <ul className="space-y-1">
                    {pendingVaccines.slice(0, 5).map((v) => (
                      <li key={v.id} className="flex justify-between text-gray-800">
                        <span>・{v.vaccineName}</span>
                        <span className="font-mono text-gray-500">預定: {v.scheduledDate}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">目前階段疫苗已全數完成</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Recent Medical Visits */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
              六、近期兒科門診就診與處方紀錄 (Recent Medical Visits)
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
              <div className="border border-gray-300 p-2.5 rounded text-xs text-gray-500">
                近期無特殊門診就診紀錄
              </div>
            )}
          </div>

          {/* Section 7: Temperature Logs (if any) */}
          {recentTempLogs.length > 0 && (
            <div className="print-avoid-break space-y-1.5">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
                七、近期體溫監測摘要 (Recent Temperature Logs)
              </h2>
              <table className="w-full border border-gray-300 text-xs">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr className="border-b border-gray-300">
                    <th className="p-1.5 text-left border-r border-gray-300">測量日期時間</th>
                    <th className="p-1.5 text-center border-r border-gray-300">測得體溫</th>
                    <th className="p-1.5 text-left">備註與退燒用藥</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {recentTempLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-1.5 font-mono border-r border-gray-300">{log.date} {log.time || ''}</td>
                      <td className={`p-1.5 font-mono font-bold text-center border-r border-gray-300 ${(log.metrics?.temperatureC ?? 0) >= 38.0 ? 'text-red-700' : 'text-gray-900'}`}>
                        {log.metrics?.temperatureC}°C
                      </td>
                      <td className="p-1.5 text-gray-700">
                        {log.metrics?.medicationGiven ? `給予退燒藥物: ${log.metrics.medicationGiven}` : log.notes || '體溫正常'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 8: 24h Total I/O Fluid Intake & Output Summary */}
          <div className="print-avoid-break space-y-1.5">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
              八、24小時水分攝入與排泄輸出狀況 (Total I/O Fluid Balance)
            </h2>
            <table className="w-full border border-gray-300 text-xs">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 w-32 border-r border-gray-300 text-gray-700">總攝入量 (Intake)</td>
                  <td className="p-2 border-r border-gray-300 font-mono font-bold text-gray-900">
                    {todayIO.totalIntakeMl} ml <span className="font-sans font-normal text-gray-500 text-[11px]">(奶量: {todayIO.intakeBreakdown.formulaMilkMl + todayIO.intakeBreakdown.breastMilkMl}ml, 水: {todayIO.intakeBreakdown.waterMl}ml)</span>
                  </td>
                  <td className="bg-gray-100 font-semibold p-2 w-32 border-r border-gray-300 text-gray-700">總排出量 (Output)</td>
                  <td className="p-2 font-mono font-bold text-gray-900">
                    {todayIO.totalOutputMl} ml <span className="font-sans font-normal text-gray-500 text-[11px]">(尿量估算: {todayIO.totalUrineMl}ml, 嘔吐: {todayIO.totalVomitMl}ml)</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">換尿布次數</td>
                  <td className="p-2 border-r border-gray-300 text-gray-900">
                    共 <span className="font-mono font-bold">{todayIO.totalDiaperCount}</span> 片 (濕重尿布: <span className="font-mono font-bold">{todayIO.heavyDiaperCount}</span> 片, 大便: <span className="font-mono font-bold">{todayIO.stoolCount}</span> 次)
                  </td>
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">每小時排尿率</td>
                  <td className="p-2 font-mono font-bold text-gray-900">
                    {todayIO.urineHourlyRate} ml/kg/hr <span className="font-sans font-normal text-gray-500 text-[11px]">(標準: &gt; 1.0)</span>
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-100 font-semibold p-2 border-r border-gray-300 text-gray-700">水分平衡與狀態</td>
                  <td className="p-2 text-gray-900" colSpan={3}>
                    淨水分平衡: <span className="font-mono font-bold">{todayIO.netFluidBalanceMl > 0 ? `+${todayIO.netFluidBalanceMl}` : todayIO.netFluidBalanceMl} ml</span> ｜ 評估結果：<span className="font-bold">{todayIO.hydrationStatusLabel}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 9: Parent's Questions */}
          <div className="print-avoid-break space-y-2">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-l-3 border-gray-800 pl-2">
              九、家長本次看診提問與觀察 (Questions for Doctor)
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

              {/* Add Question Input (Hidden on Print) */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 no-print">
                <input
                  type="text"
                  placeholder="輸入看診想詢問醫師的問題 (例如: 排便狀況、皮膚紅疹、副食品添加等)..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-500"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs hover:bg-gray-900 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>加入</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 9: Doctor's Signature Block (For print/consultation) */}
          <div className="print-avoid-break pt-4 border-t border-gray-300 grid grid-cols-2 gap-6 text-xs text-gray-700">
            <div>
              <span className="block font-semibold mb-1">兒科醫師診斷簽章 / 院所戳章：</span>
              <div className="h-10 border-b border-dashed border-gray-400" />
            </div>
            <div>
              <span className="block font-semibold mb-1">醫囑與回診建議：</span>
              <div className="h-10 border-b border-dashed border-gray-400" />
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden on Print) */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 no-print">
          <span>提示：點擊「列印 / 存為 PDF」可直接預覽標準 A4 格式並儲存為 PDF 檔案</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
