import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  Download, 
  Upload, 
  Key, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  FileCode,
  HardDrive,
  Share2,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { AppDataStore } from '../types';
import { 
  exportDataAsJSON, 
  generateRandomSyncCode,
  exportDataAsTransferCode,
  importDataFromTransferCode
} from '../utils/storage';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppDataStore;
  onPushSync: () => Promise<void>;
  onPullSync: (syncCode: string) => Promise<boolean>;
  onRestoreFromFile: (data: AppDataStore) => void;
  onUpdateSyncCode: (newCode: string) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  appData,
  onPushSync,
  onPullSync,
  onRestoreFromFile,
  onUpdateSyncCode,
}) => {
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [inputTransferCode, setInputTransferCode] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTransferCode, setCopiedTransferCode] = useState(false);
  const [activeSyncTab, setActiveSyncTab] = useState<'cloud' | 'transfer' | 'file'>('cloud');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentCode = appData.syncInfo.syncCode;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyTransferCode = () => {
    const transferCode = exportDataAsTransferCode(appData);
    if (transferCode) {
      navigator.clipboard.writeText(transferCode);
      setCopiedTransferCode(true);
      setTimeout(() => setCopiedTransferCode(false), 2500);
    }
  };

  const handleManualPush = async () => {
    setIsPushing(true);
    setMessage(null);
    try {
      await onPushSync();
      setMessage({ type: 'success', text: '已成功將最新寶寶資料同步備份至雲端！(支援 GitHub & Vercel)' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '雲端同步失敗，您可使用「速傳碼」或「JSON匯出」進行跨裝置同步' });
    } finally {
      setIsPushing(false);
    }
  };

  const handleManualPull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSyncCode.trim()) return;

    setIsPulling(true);
    setMessage(null);
    try {
      const ok = await onPullSync(inputSyncCode.trim());
      if (ok) {
        setMessage({ type: 'success', text: `成功從同步碼 ${inputSyncCode.toUpperCase()} 載入最新資料！` });
        setInputSyncCode('');
      } else {
        setMessage({ type: 'error', text: '找不到此同步碼的雲端資料。若於 GitHub/Vercel 部署，請使用「一鍵速傳碼」同步！' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '下載雲端備份失敗' });
    } finally {
      setIsPulling(false);
    }
  };

  const handleImportTransferCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTransferCode.trim()) return;

    const imported = importDataFromTransferCode(inputTransferCode.trim());
    if (imported) {
      onRestoreFromFile(imported);
      setMessage({ type: 'success', text: '🎉 成功載入跨裝置速傳資料！已同步更新全站記錄。' });
      setInputTransferCode('');
    } else {
      setMessage({ type: 'error', text: '速傳碼格式不正確，請確認已複製完整代碼。' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.babyProfile && parsed.growthRecords) {
          onRestoreFromFile(parsed);
          setMessage({ type: 'success', text: '已成功從備份檔還原全部記錄！' });
        } else {
          setMessage({ type: 'error', text: '檔案格式不符合寶寶健康護照規範' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: '無法讀取此 JSON 檔案' });
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateNewCode = () => {
    const newCode = generateRandomSyncCode();
    onUpdateSyncCode(newCode);
    setMessage({ type: 'success', text: `已產生新家庭同步碼：${newCode}` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F9F6F0] rounded-[36px] p-6 sm:p-8 max-w-xl w-full border border-[#D9D1C2] shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <Cloud className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2A2723]">
                跨裝置同步與資料備份
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                支援 GitHub Pages、Vercel 靜態站點與多手機無縫共享
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

        {/* Sync Mode Navigation Tabs */}
        <div className="flex items-center bg-[#EBE7DF]/70 p-1 rounded-full text-xs font-medium font-sans">
          <button
            type="button"
            onClick={() => setActiveSyncTab('cloud')}
            className={`flex-1 py-1.5 rounded-full transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSyncTab === 'cloud'
                ? 'bg-[#2A2723] text-white shadow-xs'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>家庭同步碼</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSyncTab('transfer')}
            className={`flex-1 py-1.5 rounded-full transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSyncTab === 'transfer'
                ? 'bg-[#2A2723] text-white shadow-xs'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span>一鍵速傳碼 (推薦)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSyncTab('file')}
            className={`flex-1 py-1.5 rounded-full transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSyncTab === 'file'
                ? 'bg-[#2A2723] text-white shadow-xs'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>JSON 檔案</span>
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-sans flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-[#E6EBE6] text-[#3E4A3E] border border-[#D5DDD5]'
                : 'bg-[#F2E6E6] text-[#6B3E3E] border border-[#E0D0D0]'
            }`}
          >
            {message.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 text-[#5A6D5A] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#8C5D5D] shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* TAB 1: CLOUD SYNC */}
        {activeSyncTab === 'cloud' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-5 space-y-3.5">
              <div className="flex items-center justify-between font-sans">
                <span className="text-xs font-bold text-[#6B6457] flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#8C8475]" />
                  <span>您的專屬家庭同步碼</span>
                </span>
                <button
                  onClick={handleGenerateNewCode}
                  className="text-[11px] font-medium text-[#8C8475] hover:text-[#2A2723] underline"
                >
                  換一組代碼
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#F9F6F0] font-mono text-xl font-bold text-[#2A2723] px-4 py-2.5 rounded-full border border-[#D9D1C2] tracking-wider text-center select-all">
                  {currentCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] font-sans rounded-full text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#D9D1C2]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '已複製' : '複製'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C8475] font-sans">
                <span>上次同步：{appData.syncInfo.lastSyncedAt ? new Date(appData.syncInfo.lastSyncedAt).toLocaleString('zh-TW') : '尚未同步'}</span>
                <span className="font-mono text-[#2A2723] font-bold">v{appData.syncInfo.version}</span>
              </div>

              <button
                onClick={handleManualPush}
                disabled={isPushing}
                className="w-full py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] font-sans text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isPushing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D9D1C2]" />
                ) : (
                  <CloudCheck className="w-4 h-4 text-[#D9D1C2]" />
                )}
                <span>{isPushing ? '正在同步至雲端中繼...' : '立即上傳備份至雲端'}</span>
              </button>
            </div>

            {/* Pull / Load from another phone */}
            <div className="p-4 bg-[#F2EDE4] border border-[#D9D1C2] rounded-[24px] space-y-2.5 font-sans">
              <div className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#8C8475]" />
                <span>在另一台裝置輸入同步碼載入</span>
              </div>

              <form onSubmit={handleManualPull} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="輸入同步碼 (如：BABY-8888)"
                  value={inputSyncCode}
                  onChange={(e) => setInputSyncCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-full border border-[#D1CEC4] bg-white font-mono text-xs uppercase text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
                />
                <button
                  type="submit"
                  disabled={isPulling || !inputSyncCode.trim()}
                  className="px-4 py-2 bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] rounded-full text-xs font-sans transition-colors disabled:opacity-40"
                >
                  {isPulling ? '載入中...' : '下載同步'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: INSTANT TRANSFER CODE (100% RELIABLE FOR GITHUB PAGES & VERCEL) */}
        {activeSyncTab === 'transfer' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>一鍵跨裝置速傳碼 (免伺服器，100% 穩定)</span>
              </div>
              <p className="text-[#6B6457] leading-relaxed">
                特別為 <strong>GitHub Pages、Vercel 靜態部署與離線環境</strong> 設計！將全部寶寶醫療數據打包為一串安全速傳字串，一鍵複製並傳送至 LINE 或其他手機貼上即可。
              </p>

              <button
                type="button"
                onClick={handleCopyTransferCode}
                className="w-full py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {copiedTransferCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTransferCode ? '🎉 已複製速傳碼至剪貼簿！' : '複製我的寶寶速傳碼 (傳給另一半)'}</span>
              </button>
            </div>

            {/* Paste Transfer Code */}
            <form onSubmit={handleImportTransferCode} className="p-4 bg-[#F2EDE4] border border-[#D9D1C2] rounded-[24px] space-y-2.5">
              <div className="font-bold text-[#4A453E] flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-emerald-700" />
                <span>貼上速傳碼載入資料</span>
              </div>
              <textarea
                rows={2}
                placeholder="在此貼上另一台裝置傳送的 BBH#... 速傳碼"
                value={inputTransferCode}
                onChange={(e) => setInputTransferCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1CEC4] bg-white font-mono text-[11px] text-[#2A2723] focus:outline-hidden focus:border-[#2A2723]"
              />
              <button
                type="submit"
                disabled={!inputTransferCode.trim()}
                className="w-full py-2 bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] rounded-full text-xs font-medium transition-colors disabled:opacity-40"
              >
                解析並同步載入資料
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: FILE EXPORT & RESTORE */}
        {activeSyncTab === 'file' && (
          <div className="grid grid-cols-2 gap-3 pt-1 font-sans">
            <button
              onClick={() => exportDataAsJSON(appData)}
              className="p-4 rounded-[22px] border border-[#EBE7DF] hover:border-[#D1CEC4] bg-white text-left transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <Download className="w-4 h-4 text-[#8C8475]" />
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F2EDE4] text-[#4A453E] rounded-full">JSON</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#2A2723]">
                  匯出備份檔案
                </div>
                <p className="text-[10px] text-[#8C8475] mt-0.5">
                  下載檔案至本機永存
                </p>
              </div>
            </button>

            <label className="p-4 rounded-[22px] border border-[#EBE7DF] hover:border-[#D1CEC4] bg-white text-left transition-all flex flex-col justify-between cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Upload className="w-4 h-4 text-[#8C8475]" />
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F2EDE4] text-[#4A453E] rounded-full">還原</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#2A2723]">
                  從檔案還原
                </div>
                <p className="text-[10px] text-[#8C8475] mt-0.5">
                  上傳先前 JSON 檔
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Info footer */}
        <div className="p-3 rounded-2xl bg-white border border-[#EBE7DF] text-[11px] text-[#8C8475] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#8C8475] shrink-0 mt-0.5" />
          <p>
            所有醫療數據均採用客戶端加密儲存，隱私不外洩。無論是 GitHub Pages、Vercel 或是手機瀏覽器，均可隨時透過速傳碼或雲端中繼進行無縫轉移。
          </p>
        </div>

      </div>
    </div>
  );
};
