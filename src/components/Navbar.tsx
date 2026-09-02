import React from 'react';
import {
  Baby,
  BookHeart,
  LineChart,
  Syringe,
  StickyNote as StickyNoteIcon,
  Sparkles,
  Cloud,
  RefreshCw,
  FileJson,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'diary' | 'growth' | 'vaccines' | 'notes' | 'toolbox';
  setActiveTab: (tab: 'diary' | 'growth' | 'vaccines' | 'notes' | 'toolbox') => void;
  isSyncing: boolean;
  onOpenSyncModal: () => void;
  onOpenBackupModal?: () => void;
  onOpenNotificationModal?: () => void;
  notificationCount?: number;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isSyncing,
  onOpenSyncModal,
  onOpenBackupModal,
  onOpenNotificationModal,
  notificationCount = 0,
  isOnline,
}) => {
  const navItems = [
    { id: 'diary', label: '日常紀錄與日記', icon: BookHeart },
    { id: 'growth', label: 'WHO 生長曲線', icon: LineChart },
    { id: 'vaccines', label: '疫苗與醫療護照', icon: Syringe },
    { id: 'notes', label: '交班便箋', icon: StickyNoteIcon },
    { id: 'toolbox', label: '育兒百寶箱', icon: Sparkles },
  ] as const;

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#EBE7DF] transition-shadow duration-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('diary')}
            title="返回 BB-Note 首頁"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Baby className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-lg tracking-tight text-[#2A2723] block leading-none">
                  BB-Note
                </span>
                <span className="hidden xl:inline text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PC 桌面增強版
                </span>
              </div>
              <span className="text-[10px] text-[#8C8475] tracking-wider uppercase font-mono block mt-0.5">
                Baby Health & Growth Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-[#EBE7DF]/80 p-1.5 rounded-full border border-[#D9D1C2] shadow-2xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-sans font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#2A2723] text-[#F9F6F0] shadow-sm scale-100'
                      : 'text-[#6B6457] hover:text-[#2A2723] hover:bg-[#F9F6F0]/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2 : 1.75} />
                  <span className="tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Cloud Sync Status & Action Button */}
          <div className="flex items-center space-x-2">
            {/* Notification Bell Button */}
            {onOpenNotificationModal && (
              <button
                onClick={onOpenNotificationModal}
                className="relative p-2 rounded-full text-xs font-sans border bg-white text-[#2A2723] border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] transition-all duration-200 shadow-2xs cursor-pointer"
                title="智慧推播與通知中心"
              >
                <Bell className="w-4 h-4 text-[#2A2723]" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F9F6F0] animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-sans border bg-white text-[#2A2723] border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475] transition-all duration-200 shadow-2xs cursor-pointer"
                title="JSON 檔案匯入與備份"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden lg:inline font-medium">備份/匯入</span>
              </button>
            )}

            <button
              onClick={onOpenSyncModal}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-full text-xs font-sans border transition-all duration-200 shadow-2xs cursor-pointer ${
                isOnline
                  ? 'bg-white text-[#2A2723] border-[#D9D1C2] hover:bg-[#EBE7DF] hover:border-[#8C8475]'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="點擊開啟 Firebase 即時雲端同步與家庭共育設定"
            >
              <div className="relative flex items-center justify-center">
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="hidden sm:inline font-medium">
                {isSyncing ? '同步中...' : '雲端同步'}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Floating Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-t border-[#EBE7DF] pb-safe shadow-lg">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const shortLabels: Record<string, string> = {
              diary: '日常',
              growth: '生長',
              vaccines: '醫療',
              notes: '便箋',
              toolbox: '百寶箱',
            };

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive ? 'text-[#2A2723] font-bold' : 'text-[#8C8475] hover:text-[#2A2723]'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#2A2723] text-[#F9F6F0]' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.75} />
                </div>
                <span className="text-[11px] tracking-tight">{shortLabels[item.id]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
