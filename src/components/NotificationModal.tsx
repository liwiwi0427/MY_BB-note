import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Syringe,
  Milk,
  Droplets,
  Thermometer,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  ShieldCheck,
} from 'lucide-react';
import type { NotificationSettings } from '../types';
import type { AppNotification } from '../utils/notificationService';
import {
  requestBrowserNotificationPermission,
  getBrowserNotificationPermission,
  sendBrowserPushNotification,
  playNotificationChime,
} from '../utils/notificationService';
import { useToast } from '../context/ToastContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (settings: NotificationSettings) => void;
  activeNotifications: AppNotification[];
  onDismissNotification: (id: string) => void;
  onSelectNotificationTab: (tab: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  activeNotifications,
  onDismissNotification,
  onSelectNotificationTab,
}) => {
  const { success, warning } = useToast();
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setPermStatus(getBrowserNotificationPermission());
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setPermStatus(getBrowserNotificationPermission());
    if (granted) {
      setLocalSettings((prev) => ({ ...prev, enableBrowserPush: true }));
      sendBrowserPushNotification('🎉 BB-Note 推播通知啟用成功！', {
        body: '您將能即時接收台灣公費/自費疫苗到期提醒、定時喝奶及尿布檢查通知。',
      });
      success('推播權限已開啟 🔔', '瀏覽器已成功綁定系統通知');
    } else {
      warning('尚未取得權限', '請在瀏覽器網址列旁允許通知權限');
    }
  };

  const handleTestNotification = () => {
    setTestSent(true);
    if (localSettings.enableSound) {
      playNotificationChime();
    }
    const sent = sendBrowserPushNotification('🍼【測試推播】BB-Note 育兒通知測試', {
      body: '這是一則測試通知！寶寶的喝奶提醒與疾管署常規疫苗到期時，系統將自動即時推播。',
    });

    success('已發送測試推播 🚀', '請查看桌面右下角/手機通知欄');

    setTimeout(() => {
      setTestSent(false);
    }, 2500);

    if (!sent && permStatus !== 'granted') {
      handleRequestPermission();
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    success('推播設定已保存 ✨');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#EBE7DF] flex items-center justify-between bg-white/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2A2723]">
                智慧育兒推播與提醒中心
              </h2>
              <p className="text-xs text-[#8C8475] font-sans">
                管理瀏覽器系統推播、衛福部疫苗預約與定時照護通知
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EBE7DF] text-[#6B6457] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
          
          {/* Permission Status Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="text-sm font-bold text-[#2A2723]">瀏覽器系統推播權限</span>
                {permStatus === 'granted' ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" /> 已開啟
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {permStatus === 'denied' ? '已封鎖 (請至瀏覽器設定允許)' : '尚未授權'}
                  </span>
                )}
              </div>

              {permStatus !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-medium hover:bg-[#4A453E] shadow-2xs transition-all cursor-pointer"
                >
                  立即開啟授權
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] gap-2 flex-wrap">
              <p className="text-xs text-[#8C8475]">
                支援電腦桌面彈出通知與手機瀏覽器通知欄提醒
              </p>
              <button
                onClick={handleTestNotification}
                disabled={testSent}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 hover:bg-amber-100 text-xs font-medium transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-700" />
                <span>{testSent ? '推播已發送！' : '發送即時測試通知'}</span>
              </button>
            </div>
          </div>

          {/* Active Notifications Queue */}
          {activeNotifications.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#2A2723] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  當前進行中的智慧提醒 ({activeNotifications.length})
                </span>
              </div>

              <div className="space-y-2">
                {activeNotifications.map((noti) => (
                  <div
                    key={noti.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#8C8475] shadow-2xs flex items-start justify-between gap-3 transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF3EB] text-[#2A2723] flex items-center justify-center shrink-0 mt-0.5">
                        {noti.type === 'vaccine_due' ? (
                          <Syringe className="w-4 h-4 text-emerald-700" />
                        ) : noti.type === 'feed_reminder' ? (
                          <Milk className="w-4 h-4 text-amber-700" />
                        ) : noti.type === 'diaper_reminder' ? (
                          <Droplets className="w-4 h-4 text-sky-700" />
                        ) : (
                          <Thermometer className="w-4 h-4 text-rose-700" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-[#2A2723]">{noti.title}</span>
                          {noti.dueDate && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              {noti.dueDate}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B6457] mt-0.5 leading-relaxed">
                          {noti.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {noti.targetTab && (
                        <button
                          onClick={() => {
                            onSelectNotificationTab(noti.targetTab!);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#2A2723] text-[#F9F6F0] text-xs font-medium hover:bg-[#4A453E] cursor-pointer"
                        >
                          前往
                        </button>
                      )}
                      <button
                        onClick={() => onDismissNotification(noti.id)}
                        className="p-1 text-[#8C8475] hover:text-[#2A2723] rounded-lg cursor-pointer"
                        title="忽略"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Reminder Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-serif font-bold text-[#2A2723] uppercase tracking-wider">
              推播項目與定時間隔設定
            </h3>

            {/* Vaccine Reminders */}
            <div className="p-4 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Syringe className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#2A2723]">台灣疾管署公費與自費疫苗提醒</div>
                  <div className="text-xs text-[#8C8475]">時程到達前 30 天與到期當日自動發送通知</div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={localSettings.vaccineReminder}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, vaccineReminder: e.target.checked })
                }
                className="w-5 h-5 accent-[#2A2723] rounded cursor-pointer"
              />
            </div>

            {/* Feed Reminders & Interval */}
            <div className="p-4 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Milk className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#2A2723]">定時餵奶提醒</div>
                    <div className="text-xs text-[#8C8475]">距離上次瓶餵或親餵達設定間隔時主動提醒</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={localSettings.feedReminder}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, feedReminder: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#2A2723] rounded cursor-pointer"
                />
              </div>

              {localSettings.feedReminder && (
                <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs">
                  <span className="text-[#6B6457]">餵奶提醒間隔：</span>
                  <div className="flex items-center space-x-2">
                    {[2.5, 3.0, 3.5, 4.0].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() =>
                          setLocalSettings({ ...localSettings, feedIntervalHours: hrs })
                        }
                        className={`px-2.5 py-1 rounded-lg border font-mono font-medium transition-all cursor-pointer ${
                          localSettings.feedIntervalHours === hrs
                            ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#EBE7DF]'
                        }`}
                      >
                        {hrs} 小時
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Diaper Reminders & Interval */}
            <div className="p-4 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#2A2723]">定時更換尿布檢查</div>
                    <div className="text-xs text-[#8C8475]">定時提醒檢查尿布乾爽度，避免紅屁屁</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={localSettings.diaperReminder}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, diaperReminder: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#2A2723] rounded cursor-pointer"
                />
              </div>

              {localSettings.diaperReminder && (
                <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs">
                  <span className="text-[#6B6457]">檢查尿布間隔：</span>
                  <div className="flex items-center space-x-2">
                    {[2.0, 2.5, 3.0, 3.5].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() =>
                          setLocalSettings({ ...localSettings, diaperIntervalHours: hrs })
                        }
                        className={`px-2.5 py-1 rounded-lg border font-mono font-medium transition-all cursor-pointer ${
                          localSettings.diaperIntervalHours === hrs
                            ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                            : 'bg-white text-[#6B6457] border-[#D9D1C2] hover:bg-[#EBE7DF]'
                        }`}
                      >
                        {hrs} 小時
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fever Warning & Sound */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Thermometer className="w-4 h-4 text-rose-700" />
                  <div>
                    <div className="font-bold text-xs text-[#2A2723]">發燒追蹤警報</div>
                    <div className="text-[11px] text-[#8C8475]">≥38.0°C 時持續提醒</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.feverWarning}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, feverWarning: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#2A2723] rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EBE7DF] shadow-2xs flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {localSettings.enableSound ? (
                    <Volume2 className="w-4 h-4 text-purple-700" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#8C8475]" />
                  )}
                  <div>
                    <div className="font-bold text-xs text-[#2A2723]">育兒提示音效</div>
                    <div className="text-[11px] text-[#8C8475]">推播時播放溫和音效</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.enableSound}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setLocalSettings({ ...localSettings, enableSound: val });
                    if (val) playNotificationChime();
                  }}
                  className="w-4 h-4 accent-[#2A2723] rounded cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#EBE7DF] bg-white/80 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-[#D9D1C2] hover:bg-[#EBE7DF] text-xs font-sans font-medium text-[#6B6457] transition-all cursor-pointer"
          >
            取消
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] hover:bg-[#4A453E] text-xs font-sans font-medium shadow-md transition-all cursor-pointer"
          >
            儲存推播設定
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
};
