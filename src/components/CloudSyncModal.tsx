import React, { useState } from 'react';
import {
  Cloud,
  Users,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Info,
  X,
  FileJson,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import type { BabyProfile } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: BabyProfile;
  familyCode: string;
  memberName: string;
  onSaveConfig: (familyCode: string, memberName: string) => void;
  onJoinFamily: (code: string) => Promise<boolean>;
  onForceSync: () => Promise<void>;
  onOpenBackupModal?: () => void;
  isSyncing: boolean;
  isOnline: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  baby,
  familyCode,
  memberName,
  onSaveConfig,
  onJoinFamily,
  onForceSync,
  onOpenBackupModal,
  isSyncing,
  isOnline,
}) => {
  if (!isOpen) return null;

  const [codeVal, setCodeVal] = useState(familyCode || 'BABY-5729');
  const [nameVal, setMemberName] = useState(memberName || '爸爸');
  const [joinInputCode, setJoinInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Keep state synced with props when modal opens or props change
  React.useEffect(() => {
    if (familyCode) setCodeVal(familyCode);
    if (memberName) setMemberName(memberName);
  }, [familyCode, memberName, isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `BABY-${randomNum}`;
    setCodeVal(newCode);
    onSaveConfig(newCode, nameVal.trim());
    setMsg({ text: `已為您生成並啟用全新家庭代碼【${newCode}】！`, type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeVal.toUpperCase().trim();
    if (!clean) return;
    onSaveConfig(clean, nameVal.trim());
    setMsg({ text: `已更新共育設定與家庭代碼【${clean}】！`, type: 'success' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinInputCode.toUpperCase().trim();
    if (!clean) return;

    setIsJoining(true);
    setMsg(null);
    try {
      const ok = await onJoinFamily(clean);
      if (ok) {
        setMsg({ text: `🎉 成功加入家庭共育房間【${clean}】！已完成雙向雲端同步。`, type: 'success' });
        setJoinInputCode('');
      } else {
        setMsg({
          text: `查無代碼【${clean}】的寶寶檔案。請確認主要照護者已開啟連線或代碼輸入是否正確。`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setMsg({ text: `連線發生錯誤: ${err?.message || '未知原因'}`, type: 'error' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#F9F6F0] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <Cloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                Firebase 雲端與家庭多人即時同步
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                {isOnline ? '🟢 已連線至雲端 Firestore 資料庫' : '🟡 離線暫存模式中'}
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

        {/* Feedback message */}
        {msg && (
          <div
            className={`p-3 rounded-2xl text-xs font-sans border ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Share Family Room Code Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE7DF] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#2A2723] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              當前寶寶家庭邀請代碼 (Family Code)
            </span>
            <span className="text-[10px] text-[#8C8475] font-sans">雙親/長輩共用</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] px-4 py-2.5 rounded-xl font-mono font-bold text-base text-[#2A2723] tracking-wider text-center select-all">
              {codeVal}
            </div>
            <button
              type="button"
              onClick={handleGenerateNewCode}
              className="px-3 py-2.5 bg-white border border-[#D9D1C2] text-[#2A2723] rounded-xl text-xs font-sans font-medium hover:bg-[#EBE7DF] transition-colors shrink-0"
              title="重新生成一組全新家庭邀請碼"
            >
              <RefreshCw className="w-4 h-4 text-[#6B6457]" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center space-x-1 px-4 py-2.5 bg-[#2A2723] text-[#F9F6F0] rounded-xl text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已複製' : '複製代碼'}</span>
            </button>
          </div>

          <p className="text-[11px] text-[#6B6457] font-sans leading-relaxed">
            其他照護者（如爸爸、月嫂、爺爺奶奶）在手機開啟本 App 並於下方輸入此代碼，即可隨時跨裝置即時讀寫同一個寶寶的健康日記！
          </p>
        </div>

        {/* Join Other Room by Code */}
        <form onSubmit={handleJoin} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE7DF] space-y-3">
          <span className="text-xs font-serif font-bold text-[#2A2723] block">
            加入現有家庭共享房間
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={joinInputCode}
              onChange={(e) => setJoinInputCode(e.target.value)}
              placeholder="輸入 6-8 位家庭邀請碼"
              className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] px-3.5 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none uppercase"
            />
            <button
              type="submit"
              disabled={isJoining}
              className="px-4 py-2 bg-[#2A2723] text-[#F9F6F0] rounded-xl text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors disabled:opacity-50 shrink-0"
            >
              {isJoining ? '配對中...' : '配對加入'}
            </button>
          </div>
        </form>

        {/* Sync Settings */}
        <form onSubmit={handleSave} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE7DF] space-y-3">
          <span className="text-xs font-serif font-bold text-[#2A2723] block">
            本機照護者身分設定
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#8C8475] block mb-1">您的稱呼 / 暱稱</label>
              <input
                type="text"
                value={nameVal}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-[#D9D1C2] px-3 py-1.5 rounded-xl text-xs font-sans"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8C8475] block mb-1">家庭代碼自訂</label>
              <input
                type="text"
                value={codeVal}
                onChange={(e) => setCodeVal(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-[#D9D1C2] px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onForceSync}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-sans bg-[#F2EDE4] hover:bg-[#EBE7DF] text-[#2A2723] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '立即完整同步'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors"
            >
              儲存設定
            </button>
          </div>
        </form>

        {/* Offline File Backup & JSON Import Card */}
        {onOpenBackupModal && (
          <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-4 flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <FileJson className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif font-bold text-xs text-amber-950">
                  JSON 檔案匯入與本機備份
                </div>
                <div className="text-[10px] text-amber-900/80 font-sans">
                  支援上傳或貼上 .json 備份檔，一鍵還原寶寶健康檔案
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenBackupModal();
              }}
              className="px-3 py-1.5 bg-[#2A2723] text-[#F9F6F0] rounded-xl text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors shrink-0"
            >
              前往匯入
            </button>
          </div>
        )}

        {/* Modal footer close */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#EBE7DF] hover:bg-[#D9D1C2] text-[#2A2723] text-xs font-sans font-medium transition-colors"
          >
            完成並返回
          </button>
        </div>

      </div>
    </div>
  );
};
