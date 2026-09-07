import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Key, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  Flame, 
  FileCheck, 
  UserCheck, 
  HardDrive,
  Info,
  Layers,
  Activity,
  Heart,
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import { AppDataStore } from '../types';
import { exportFamilyMonthlyRecordsXLSX } from '../utils/excelExporter';
import { FIREBASE_PROJECT_INFO } from '../utils/firebase';

interface FamilyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppDataStore;
  onOpenCloudSync: () => void;
}

export const FamilyGroupModal: React.FC<FamilyGroupModalProps> = ({
  isOpen,
  onClose,
  appData,
  onOpenCloudSync,
}) => {
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [selectedCustomMonth, setSelectedCustomMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const { babyProfile, diaryEntries, growthRecords, vaccineRecords, medicalVisits, syncInfo } = appData;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncInfo.syncCode);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2000);
  };

  // Trigger Monthly Excel export
  const handleExport = (periodType: 'current_and_previous' | 'current_only' | 'all' | 'custom_month') => {
    setIsExporting(true);
    setExportSuccessMsg(null);
    try {
      exportFamilyMonthlyRecordsXLSX(appData, {
        periodType,
        customYearMonth: periodType === 'custom_month' ? selectedCustomMonth : undefined,
        adminName: '家庭群組主要管理員',
      });
      const labels = {
        current_and_previous: '當月及過去 1 個月完整記錄',
        current_only: '當月完整記錄',
        all: '歷來所有完整歷史記錄',
        custom_month: `${selectedCustomMonth} 月度記錄`,
      };
      setExportSuccessMsg(`✅ 已成功產出並下載【${labels[periodType]}】.xlsx 試算表！包含全部欄位與備註，一字不漏。`);
    } catch (err: any) {
      alert(`匯出失敗：${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate quick stats for records
  const totalDiaryCount = diaryEntries.length;
  const totalIOCount = diaryEntries.filter(
    (e) =>
      e.category === 'io' ||
      e.category === 'feeding' ||
      e.category === 'diaper' ||
      e.metrics?.feedingAmountMl ||
      e.metrics?.urineAmountMl
  ).length;
  const totalVitalsCount = diaryEntries.filter((e) => e.metrics?.temperatureC !== undefined).length;
  const totalGrowthCount = growthRecords.length;
  const totalVisitsCount = medicalVisits.length;
  const totalVaccinesCount = vaccineRecords.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-2xl w-full border border-[#D9D1C2] shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-serif font-bold text-[#2A2723]">
                  家庭群組管理
                </h3>
                <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>管理員權限</span>
                </span>
              </div>
              <p className="text-xs text-[#8C8475] font-sans mt-0.5">
                {babyProfile.name} 的家庭守護成員管理與每月中樞備份導出
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success Banner */}
        {exportSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-[#E6EBE6] text-[#3E4A3E] border border-[#D5DDD5] text-xs font-sans flex items-center gap-2 animate-fadeIn">
            <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {/* SECTION 1: CORE EXPORT FEATURE - 當月及過去1個月 .xlsx 匯出 */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <FileSpreadsheet className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#2A2723]">
                  家庭月度全紀錄導出 (.xlsx 格式)
                </h4>
                <p className="text-[11px] text-[#8C8475] font-sans">
                  專為家庭群組管理員設計，完整排版、分頁分類、所有細節一字不漏
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
              Excel .xlsx
            </span>
          </div>

          {/* Golden Primary Export Button: 當月及過去1個月 */}
          <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#D9D1C2] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#2A2723]">
                    ⭐ 每月備份核心推薦：當月及過去 1 個月完整記錄
                  </span>
                  <span className="text-[10px] bg-[#2A2723] text-white px-2 py-0.2 rounded-full font-sans">
                    60天跨度
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6457] mt-1 leading-relaxed font-sans">
                  自動彙整最近兩個月的完整日常日記、Total I/O 攝入排出、生命徵象體溫、生長曲線、疫苗與門診用藥，無裁切或省略。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleExport('current_and_previous')}
              disabled={isExporting}
              className="w-full py-3 px-4 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs font-sans font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{isExporting ? '正在生成並排版 Excel 工作表...' : '立即輸出並下載：當月及過去 1 個月記錄 (.xlsx)'}</span>
            </button>
          </div>

          {/* Secondary Export Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-sans text-xs">
            
            {/* Option A: Current Month Only */}
            <button
              type="button"
              onClick={() => handleExport('current_only')}
              disabled={isExporting}
              className="p-3 rounded-2xl border border-[#EBE7DF] hover:border-[#D1CEC4] bg-[#FAF8F5] text-left transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-[#8C8475] mb-1.5">
                <Calendar className="w-3.5 h-3.5 group-hover:text-[#2A2723]" />
                <span className="text-[10px] font-mono text-[#8C8475]">本月</span>
              </div>
              <div>
                <div className="font-bold text-[#2A2723]">僅下載當月記錄</div>
                <div className="text-[10px] text-[#8C8475] mt-0.5">本月份最新紀錄彙整</div>
              </div>
            </button>

            {/* Option B: All History */}
            <button
              type="button"
              onClick={() => handleExport('all')}
              disabled={isExporting}
              className="p-3 rounded-2xl border border-[#EBE7DF] hover:border-[#D1CEC4] bg-[#FAF8F5] text-left transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-[#8C8475] mb-1.5">
                <HardDrive className="w-3.5 h-3.5 group-hover:text-[#2A2723]" />
                <span className="text-[10px] font-mono text-[#8C8475]">全集</span>
              </div>
              <div>
                <div className="font-bold text-[#2A2723]">下載歷來全部歷史</div>
                <div className="text-[10px] text-[#8C8475] mt-0.5">出生至今全部數據</div>
              </div>
            </button>

            {/* Option C: Custom Month */}
            <div className="p-3 rounded-2xl border border-[#EBE7DF] bg-[#FAF8F5] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#8C8475] mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <input
                  type="month"
                  value={selectedCustomMonth}
                  onChange={(e) => setSelectedCustomMonth(e.target.value)}
                  className="text-[10px] font-mono bg-white border border-[#D9D1C2] rounded px-1 text-[#2A2723] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleExport('custom_month')}
                disabled={isExporting}
                className="w-full mt-1 py-1 rounded-lg bg-white hover:bg-[#F2EDE4] border border-[#D9D1C2] font-bold text-[11px] text-[#2A2723] transition-colors"
              >
                下載指定月份
              </button>
            </div>

          </div>

          {/* Formatted worksheets breakdown list */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] space-y-2 text-[11px] font-sans">
            <div className="font-bold text-[#4A453E] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>專業排版與優化工作表清單 (7 個獨立工作表)：</span>
              </span>
              <span className="text-[#8C8475] text-[10px]">一字不漏完整收錄</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[#6B6457]">
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">1. 寶寶檔案與管理</span>
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">2. 日常成長日記 ({totalDiaryCount}篇)</span>
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">3. Total I/O 攝入排出 ({totalIOCount}筆)</span>
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">4. 生命徵象與體溫 ({totalVitalsCount}次)</span>
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">5. 生長發育測量 ({totalGrowthCount}筆)</span>
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">6. 疫苗時程 ({totalVaccinesCount}劑)</span>
              <span className="bg-white px-2 py-1 rounded border border-[#EBE7DF]">7. 門診與用藥 ({totalVisitsCount}筆)</span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200 font-medium">✓ 自動最適欄寬</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: FAMILY GROUP IDENTITY & CAREGIVERS */}
        <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-serif font-bold text-[#2A2723] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#8C8475]" />
              <span>家庭守護群組與照顧成員</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCloudSync();
              }}
              className="text-xs text-amber-800 hover:text-amber-900 underline font-medium flex items-center gap-1"
            >
              <span>雲端同步設定</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Family Group Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF] space-y-1">
              <span className="text-[#8C8475] text-[11px]">專屬家庭同步碼 (Sync Code)：</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-base font-bold text-[#2A2723]">{syncInfo.syncCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-white hover:bg-[#F2EDE4] border border-[#D9D1C2] rounded-full text-[11px] text-[#2A2723] transition-colors flex items-center gap-1"
                >
                  {copiedSyncCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#8C8475]" />}
                  <span>{copiedSyncCode ? '已複製' : '複製代碼'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#EBE7DF] space-y-1">
              <span className="text-[#8C8475] text-[11px]">雲端雙向狀態：</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-[#2A2723]">Firebase Firestore 已連線</span>
              </div>
              <p className="text-[10px] text-[#8C8475]">
                上次同步：{syncInfo.lastSyncedAt ? new Date(syncInfo.lastSyncedAt).toLocaleString('zh-TW') : '即時監聽中'}
              </p>
            </div>
          </div>

          {/* Caregivers Roster */}
          <div className="space-y-2 pt-1 font-sans">
            <span className="text-xs font-bold text-[#4A453E] block">群組成員與權限：</span>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2A2723] text-white flex items-center justify-center font-bold text-xs">
                    主
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2A2723] flex items-center gap-2">
                      <span>當前裝置 (家庭主要管理員)</span>
                      <span className="text-[10px] px-2 py-0.2 bg-amber-100 text-amber-900 rounded-full font-medium">
                        Administrator
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8C8475]">具備資料讀取、寫入、歷史月度 Excel 輸出與備份下載最高權限</div>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">線上運作中</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EBE7DF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EBE7DF] text-[#4A453E] flex items-center justify-center font-bold text-xs">
                    家
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2A2723] flex items-center gap-2">
                      <span>家庭成員與共同照顧者</span>
                      <span className="text-[10px] px-2 py-0.2 bg-gray-100 text-gray-700 rounded-full font-medium">
                        Caregivers
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8C8475]">在任一手機輸入同步碼【{syncInfo.syncCode}】即可加入同步紀錄</div>
                  </div>
                </div>
                <span className="text-[11px] text-[#8C8475]">雙向即時同步</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EBE7DF] text-xs font-sans">
          <span className="text-[#8C8475]">
            💡 提示：每月月初可定期點擊「下載當月及過去 1 個月記錄」進行電腦端離線存檔。
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-white font-medium transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
