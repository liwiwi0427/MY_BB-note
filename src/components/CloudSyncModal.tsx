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
  Info,
  Radio,
  Zap,
  Flame
} from 'lucide-react';
import { AppDataStore } from '../types';
import { 
  exportDataAsJSON, 
  generateRandomSyncCode,
  exportDataAsTransferCode,
  importDataFromTransferCode
} from '../utils/storage';
import { FIREBASE_PROJECT_INFO, testFirebaseConnection } from '../utils/firebase';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppDataStore;
  onPushSync: () => Promise<void>;
  onPullSync: (syncCode: string) => Promise<boolean>;
  onRestoreFromFile: (data: AppDataStore) => void;
  onUpdateSyncCode: (newCode: string) => void;
  isLiveSyncing?: boolean;
  onToggleLiveSync?: (enabled: boolean) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  appData,
  onPushSync,
  onPullSync,
  onRestoreFromFile,
  onUpdateSyncCode,
  isLiveSyncing = true,
  onToggleLiveSync,
}) => {
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [inputTransferCode, setInputTransferCode] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTransferCode, setCopiedTransferCode] = useState(false);
  const [activeSyncTab, setActiveSyncTab] = useState<'firebase' | 'transfer' | 'file'>('firebase');
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
      setMessage({ type: 'success', text: '🔥 已成功將最新寶寶資料即時同步至 Firebase Firestore！' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Firebase 同步失敗，您可使用「速傳碼」或「JSON 備份」進行跨裝置同步' });
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
        setMessage({ type: 'success', text: `🎉 成功從 Firebase 載入家庭同步碼【${inputSyncCode.toUpperCase()}】的最新資料！` });
        setInputSyncCode('');
      } else {
        setMessage({ type: 'error', text: `找不到此同步碼的 Firebase 資料。請確認代碼是否輸入正確。` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '從 Firebase 下載備份失敗' });
    } finally {
      setIsPulling(false);
    }
  };

  const handleTestFirebase = async () => {
    setIsTesting(true);
    setMessage(null);
    try {
      const res = await testFirebaseConnection();
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ ${res.message}，專案代號 323118599069 通訊正常！` });
      } else {
        setMessage({ type: 'error', text: `❌ ${res.message}` });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: `連線診斷失敗: ${e.message}` });
    } finally {
      setIsTesting(false);
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
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 fill-white text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2A2723]">
                  Firebase 雲端即時同步
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  專案 {FIREBASE_PROJECT_INFO.projectNumber}
                </span>
              </div>
              <p className="text-xs text-[#8C8475] font-sans">
                Google Firebase Firestore 即時雙向多裝置雲端同步
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
            onClick={() => setActiveSyncTab('firebase')}
            className={`flex-1 py-1.5 rounded-full transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSyncTab === 'firebase'
                ? 'bg-[#2A2723] text-white shadow-xs'
                : 'text-[#6B6457] hover:text-[#2A2723]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase 同步</span>
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
            <span>一鍵速傳碼</span>
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

        {/* TAB 1: FIREBASE CLOUD SYNC */}
        {activeSyncTab === 'firebase' && (
          <div className="space-y-4 font-sans">
            
            {/* Live Status Card */}
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    Firebase Firestore 即時同步連線就緒
                  </span>
                </div>
                <button
                  onClick={handleTestFirebase}
                  disabled={isTesting}
                  className="text-[11px] font-medium text-amber-800 hover:text-amber-900 underline flex items-center gap-1 disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-600" />}
                  <span>連線診斷</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F9F6F0] p-2.5 rounded-xl border border-[#EBE7DF]">
                <div>
                  <span className="text-[#8C8475]">Firebase 專案：</span>
                  <span className="font-mono text-[#2A2723] font-medium ml-1">{FIREBASE_PROJECT_INFO.projectId}</span>
                </div>
                <div>
                  <span className="text-[#8C8475]">專案編號：</span>
                  <span className="font-mono text-[#2A2723] font-medium ml-1">{FIREBASE_PROJECT_INFO.projectNumber}</span>
                </div>
              </div>

              {/* Live sync auto-refresh note */}
              <div className="flex items-center justify-between pt-1 border-t border-[#F2EDE4]">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-medium text-[#4A453E]">即時雙向監聽 (Live Listener)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    {isLiveSyncing ? '即時同步中' : '手動同步'}
                  </span>
                  {onToggleLiveSync && (
                    <button
                      type="button"
                      onClick={() => onToggleLiveSync(!isLiveSyncing)}
                      className="text-[11px] text-[#8C8475] hover:text-[#2A2723] underline ml-1"
                    >
                      切換
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Family Sync Code Card */}
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
                  <span>{copiedCode ? '已複製' : '複製代碼'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C8475] font-sans">
                <span>上次同步：{appData.syncInfo.lastSyncedAt ? new Date(appData.syncInfo.lastSyncedAt).toLocaleString('zh-TW') : '尚未同步'}</span>
                <span className="font-mono text-[#2A2723] font-bold">版本 v{appData.syncInfo.version}</span>
              </div>

              <button
                onClick={handleManualPush}
                disabled={isPushing}
                className="w-full py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 font-medium"
              >
                {isPushing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <CloudCheck className="w-4 h-4 text-white" />
                )}
                <span>{isPushing ? '正在同步至 Firebase Firestore...' : '立即上傳備份至 Firebase 雲端'}</span>
              </button>
            </div>

            {/* Pull / Load from another phone */}
            <div className="p-4 bg-[#F2EDE4] border border-[#D9D1C2] rounded-[24px] space-y-2.5 font-sans">
              <div className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#8C8475]" />
                <span>在家人另一台手機輸入同步碼載入</span>
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

        {/* TAB 2: INSTANT TRANSFER CODE */}
        {activeSyncTab === 'transfer' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>一鍵跨裝置速傳碼 (免網路/離線備份)</span>
              </div>
              <p className="text-[#6B6457] leading-relaxed">
                將全部寶寶醫療數據打包為一串安全速傳字串，一鍵複製並傳送至 LINE 或其他通訊軟體貼上即可跨手機轉移。
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
            數據已由 Google Firebase Firestore 專屬專案 (323118599069) 提供安全雲端儲存。任一家長手機輸入家庭同步碼即可開啟雙向即時連線。
          </p>
        </div>

      </div>
    </div>
  );
};
