import React, { useState } from 'react';
import { motion } from 'motion/react';
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

  if (!isOpen) return null;

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
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#F9F6F0] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
      >
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
            className="p-2 text-[#8C8475] hover:text-[#2A2723] rounded-xl hover:bg-[#EBE7DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {msg && (
          <div
            className={`p-3 rounded-2xl text-xs font-sans border ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : 'bg-rose-50 text-rose-950 border-rose-300'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Section 1: Your Current Family Share Code */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#2A2723] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              目前寶寶專屬家庭代碼
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
              即時雙向連線
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] px-3.5 py-2.5 rounded-xl font-mono text-base font-bold text-[#2A2723] tracking-widest text-center select-all">
              {codeVal}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="px-3.5 py-2.5 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已複製' : '複製代碼'}</span>
            </motion.button>
          </div>

          <p className="text-xs text-[#6B6457] leading-relaxed">
            把這組代碼分享給配偶、月嫂或長輩，對方在手機或電腦開啟 BB-Note 輸入此代碼，即可零時差同步紀錄！
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#EBE7DF]">
            <span className="text-xs text-[#8C8475]">更換或建立新房間？</span>
            <button
              onClick={handleGenerateNewCode}
              className="text-xs text-blue-700 hover:underline font-medium cursor-pointer"
            >
              重新隨機生成代碼
            </button>
          </div>
        </div>

        {/* Section 2: Join another family */}
        <form onSubmit={handleJoin} className="bg-white p-5 rounded-2xl border border-[#EBE7DF] space-y-3.5">
          <span className="font-serif font-bold text-sm text-[#2A2723] block">
            加入家人建立的寶寶共育房間
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="輸入家人分享的代碼 (如 BABY-1234)"
              value={joinInputCode}
              onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
              className="flex-1 bg-[#F9F6F0] border border-[#D9D1C2] px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-[#2A2723] focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isJoining || !joinInputCode.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-sans font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
            >
              {isJoining ? '連線中...' : '加入房間'}
            </motion.button>
          </div>
        </form>

        {/* Section 3: Identity & Force Sync */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#EBE7DF]">
            <label className="text-[11px] text-[#8C8475] block mb-1">我的記錄身分</label>
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setMemberName(e.target.value)}
              onBlur={() => onSaveConfig(codeVal, nameVal.trim())}
              placeholder="爸爸 / 媽媽"
              className="w-full bg-[#F9F6F0] border border-[#D9D1C2] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#2A2723]"
            />
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#EBE7DF] flex flex-col justify-between">
            <span className="text-[11px] text-[#8C8475]">立即雙向刷新</span>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onForceSync}
              disabled={isSyncing}
              className="w-full mt-1 py-1.5 bg-[#EBE7DF] hover:bg-[#D9D1C2] text-[#2A2723] rounded-lg text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-700' : ''}`} />
              <span>{isSyncing ? '同步中' : '強制同步'}</span>
            </motion.button>
          </div>
        </div>

        {/* Backup Modal Shortcut */}
        {onOpenBackupModal && (
          <div className="bg-amber-50/80 border border-amber-300 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileJson className="w-4 h-4 text-amber-700" />
              <span className="text-xs text-amber-950 font-medium">需要手動匯出或匯入 JSON 備份檔？</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenBackupModal();
              }}
              className="text-xs text-amber-900 font-bold underline hover:text-amber-950 cursor-pointer"
            >
              開啟備份中心 ➜
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
};
