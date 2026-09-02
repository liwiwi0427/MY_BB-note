import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  DownloadCloud,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  X,
  FileText,
  Calendar,
  Syringe,
  BookHeart,
  LineChart,
  Stethoscope,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type {
  BabyProfile,
  GrowthRecord,
  DiaryEntry,
  VaccineRecord,
  MedicalVisit,
  StickyNote,
} from '../types';
import {
  generateBackupJson,
  parseImportBackupJson,
  type ParsedImportResult,
} from '../utils/dataImportExport';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: BabyProfile;
  growthRecords: GrowthRecord[];
  diaryEntries: DiaryEntry[];
  vaccineRecords: VaccineRecord[];
  medicalVisits: MedicalVisit[];
  stickyNotes: StickyNote[];
  familyCode: string;
  onImportData: (imported: ParsedImportResult) => Promise<void>;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  baby,
  growthRecords,
  diaryEntries,
  vaccineRecords,
  medicalVisits,
  stickyNotes,
  familyCode,
  onImportData,
}) => {
  const [activeMode, setActiveMode] = useState<'import' | 'export'>('import');
  const [jsonText, setJsonText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setJsonText('');
      setParsedPreview(null);
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Parse whenever jsonText changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    if (!val.trim()) {
      setParsedPreview(null);
      setStatusMsg(null);
      return;
    }
    const res = parseImportBackupJson(val);
    if (res.success) {
      setParsedPreview(res);
      setStatusMsg(null);
    } else {
      setParsedPreview(null);
      setStatusMsg({ text: res.error || '無法識別的 JSON 格式', type: 'error' });
    }
  };

  // Handle file select
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setStatusMsg({ text: '請選擇 .json 格式的檔案！', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
      const res = parseImportBackupJson(content);
      if (res.success) {
        setParsedPreview(res);
        setStatusMsg({
          text: `已成功讀取檔案【${file.name}】，請檢視下方預覽後點選確認匯入！`,
          type: 'success',
        });
      } else {
        setParsedPreview(null);
        setStatusMsg({ text: res.error || '檔案內容非有效 JSON', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedPreview) return;
    setIsProcessing(true);
    try {
      await onImportData(parsedPreview);
      setStatusMsg({
        text: `🎉 成功匯入【${parsedPreview.baby.name}】的健康資料庫！包含 ${parsedPreview.stats.diaryCount} 筆日記、${parsedPreview.stats.growthCount} 筆生長紀錄。`,
        type: 'success',
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ text: `匯入失敗: ${err?.message || '未知錯誤'}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Export actions
  const exportString = generateBackupJson(
    baby,
    growthRecords,
    diaryEntries,
    vaccineRecords,
    medicalVisits,
    stickyNotes,
    familyCode
  );

  const handleDownloadBackup = () => {
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = baby.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') || 'baby';
    a.href = url;
    a.download = `BB-Note-Backup-${safeName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportString);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#F9F6F0] w-full max-w-xl rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-5 sm:p-7 space-y-5 animate-fadeIn max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center shadow-xs">
              <FileJson className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                資料備份與 JSON 匯入 / 匯出
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                支援完整歷史數據封裝、跨裝置離線備份與一鍵還原
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

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#EBE7DF] border border-[#D9D1C2]">
          <button
            onClick={() => {
              setActiveMode('import');
              setStatusMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-sans font-medium flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'import'
                ? 'bg-[#2A2723] text-[#F9F6F0] shadow-xs'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>匯入 JSON 檔案</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('export');
              setStatusMsg(null);
            }}
            className={`py-2 rounded-xl text-xs font-sans font-medium flex items-center justify-center space-x-2 transition-all ${
              activeMode === 'export'
                ? 'bg-[#2A2723] text-[#F9F6F0] shadow-xs'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>匯出 / 備份 JSON</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-sans border leading-relaxed flex items-start space-x-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : 'bg-rose-50 text-rose-950 border-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            )}
            <div>{statusMsg.text}</div>
          </div>
        )}

        {/* MODE 1: IMPORT */}
        {activeMode === 'import' && (
          <div className="space-y-4">
            
            {/* File Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#2A2723] bg-[#EBE7DF]'
                  : 'border-[#D9D1C2] bg-white hover:bg-[#F9F6F0]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F2EDE4] text-[#2A2723] flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-amber-700" />
              </div>
              <div className="text-xs font-serif font-bold text-[#2A2723]">
                點擊選擇或拖曳 JSON 檔案至此
              </div>
              <p className="text-[11px] text-[#8C8475] font-sans mt-1">
                支援 BB-Note 格式或包含 babyProfile / growthRecords / diaryEntries 之備份檔
              </p>
            </div>

            {/* Paste JSON Raw Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-[#2A2723] flex items-center justify-between">
                <span>或直接在此貼上 JSON 程式碼文字：</span>
                {jsonText && (
                  <button
                    onClick={() => {
                      setJsonText('');
                      setParsedPreview(null);
                      setStatusMsg(null);
                    }}
                    className="text-[11px] text-rose-700 hover:underline font-sans"
                  >
                    清空內容
                  </button>
                )}
              </label>
              <textarea
                rows={4}
                value={jsonText}
                onChange={handleTextChange}
                placeholder="貼上完整 JSON 格式文字..."
                className="w-full bg-white border border-[#D9D1C2] rounded-2xl p-3 text-xs font-mono text-[#2A2723] focus:outline-none placeholder:text-[#A69D8D]"
              />
            </div>

            {/* Parsed Structure Preview Summary */}
            {parsedPreview && (
              <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-950">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span className="font-serif font-bold text-sm">解析成功！準備匯入摘要</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-900 font-bold">
                    {parsedPreview.baby.gender === 'male' ? '男寶' : '女寶'}
                  </span>
                </div>

                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-sm">{parsedPreview.baby.name}</span>
                    <span className="text-[11px] font-normal text-emerald-800">
                      (生日: {parsedPreview.baby.birthDate} • 出生 {parsedPreview.baby.birthWeight}kg / {parsedPreview.baby.birthLength}cm)
                    </span>
                  </div>
                  {parsedPreview.baby.allergies && parsedPreview.baby.allergies.length > 0 && (
                    <div className="text-[11px] text-emerald-800">
                      過敏註記: {parsedPreview.baby.allergies.join('、')}
                    </div>
                  )}
                </div>

                {/* Grid of parsed records count */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-emerald-200">
                    <div className="text-[10px] text-emerald-800">日常照護日記</div>
                    <div className="font-mono font-bold text-emerald-950 text-sm mt-0.5">
                      {parsedPreview.stats.diaryCount} <span className="text-[10px] font-normal">筆</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-emerald-200">
                    <div className="text-[10px] text-emerald-800">生長曲線紀錄</div>
                    <div className="font-mono font-bold text-emerald-950 text-sm mt-0.5">
                      {parsedPreview.stats.growthCount} <span className="text-[10px] font-normal">筆</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-emerald-200">
                    <div className="text-[10px] text-emerald-800">疫苗施打紀錄</div>
                    <div className="font-mono font-bold text-emerald-950 text-sm mt-0.5">
                      {parsedPreview.stats.vaccineCount} <span className="text-[10px] font-normal">筆</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-emerald-200">
                    <div className="text-[10px] text-emerald-800">就醫體檢門診</div>
                    <div className="font-mono font-bold text-emerald-950 text-sm mt-0.5">
                      {parsedPreview.stats.visitCount} <span className="text-[10px] font-normal">筆</span>
                    </div>
                  </div>
                </div>

                {/* Import Action Button */}
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isProcessing}
                  className="w-full py-3 bg-[#2A2723] hover:bg-[#4A453E] text-[#F9F6F0] rounded-xl text-xs font-sans font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isProcessing ? '資料庫寫入同步中...' : '確認覆蓋並匯入至 BB-Note'}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* MODE 2: EXPORT */}
        {activeMode === 'export' && (
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-[#EBE7DF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-xs text-[#2A2723] block">
                    當前寶寶健康資料庫統計
                  </span>
                  <span className="text-[11px] text-[#8C8475]">
                    {baby.name} (生日: {baby.birthDate})
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {familyCode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-[#F9F6F0]">
                  <div className="text-[10px] text-[#8C8475]">日記紀錄</div>
                  <div className="font-mono font-bold text-[#2A2723]">{diaryEntries.length} 筆</div>
                </div>
                <div className="p-2 rounded-xl bg-[#F9F6F0]">
                  <div className="text-[10px] text-[#8C8475]">生長數據</div>
                  <div className="font-mono font-bold text-[#2A2723]">{growthRecords.length} 筆</div>
                </div>
                <div className="p-2 rounded-xl bg-[#F9F6F0]">
                  <div className="text-[10px] text-[#8C8475]">門診就醫</div>
                  <div className="font-mono font-bold text-[#2A2723]">{medicalVisits.length} 筆</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleDownloadBackup}
                  className="flex-1 py-2.5 bg-[#2A2723] hover:bg-[#4A453E] text-[#F9F6F0] rounded-xl text-xs font-sans font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                >
                  <DownloadCloud className="w-4 h-4 text-emerald-400" />
                  <span>下載備份檔案 (.json)</span>
                </button>

                <button
                  onClick={handleCopyJson}
                  className="px-4 py-2.5 bg-white border border-[#D9D1C2] hover:bg-[#EBE7DF] text-[#2A2723] rounded-xl text-xs font-sans font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? '已複製' : '複製文字'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#8C8475] block font-sans">JSON 備份文字預覽：</span>
              <pre className="bg-white border border-[#EBE7DF] rounded-2xl p-3 text-[10px] font-mono text-[#6B6457] max-h-36 overflow-y-auto whitespace-pre-wrap select-all">
                {exportString}
              </pre>
            </div>

          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#EBE7DF] hover:bg-[#D9D1C2] text-[#2A2723] text-xs font-sans font-medium transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
