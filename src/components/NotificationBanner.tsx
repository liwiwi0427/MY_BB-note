import React from 'react';
import { Bell, Syringe, Milk, Droplets, Thermometer, X, ChevronRight, Sparkles } from 'lucide-react';
import type { AppNotification } from '../utils/notificationService';

interface NotificationBannerProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onActionClick: (notification: AppNotification) => void;
  onOpenNotificationModal?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notifications,
  onDismiss,
  onActionClick,
  onOpenNotificationModal,
}) => {
  if (!notifications || notifications.length === 0) return null;

  const currentNoti = notifications[0];

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'vaccine_due':
        return <Syringe className="w-4 h-4 text-emerald-300" />;
      case 'feed_reminder':
        return <Milk className="w-4 h-4 text-amber-300" />;
      case 'diaper_reminder':
        return <Droplets className="w-4 h-4 text-sky-300" />;
      case 'fever_alert':
        return <Thermometer className="w-4 h-4 text-rose-300" />;
      default:
        return <Bell className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="bg-[#FAF3EB] border border-[#E8D9C8] rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center space-x-3 overflow-hidden flex-1 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center shrink-0 shadow-2xs">
          {getIcon(currentNoti.type)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-serif font-bold text-xs sm:text-sm text-[#2A2723] truncate">
              {currentNoti.title}
            </span>
            {currentNoti.dueDate && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold shrink-0">
                {currentNoti.dueDate}
              </span>
            )}
            {notifications.length > 1 && (
              <span
                onClick={onOpenNotificationModal}
                className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#EBE7DF] text-[#6B6457] hover:bg-[#D9D1C2] cursor-pointer transition-colors"
                title="點擊查看全部提醒"
              >
                +還有 {notifications.length - 1} 則提醒
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-[#6B6457] truncate mt-0.5 font-sans">
            {currentNoti.message}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
        <button
          onClick={() => onActionClick(currentNoti)}
          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors shadow-2xs cursor-pointer"
        >
          <span>{currentNoti.type === 'vaccine_due' ? '查看疫苗時程' : '前往查看'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {onOpenNotificationModal && (
          <button
            onClick={onOpenNotificationModal}
            className="p-1.5 text-[#6B6457] hover:text-[#2A2723] hover:bg-[#EBE7DF] rounded-xl transition-colors cursor-pointer"
            title="推播設定"
          >
            <Bell className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onDismiss(currentNoti.id)}
          className="p-1.5 text-[#8C8475] hover:text-[#2A2723] hover:bg-[#EBE7DF] rounded-xl transition-colors cursor-pointer"
          title="關閉此提醒"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
