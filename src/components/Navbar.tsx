import React from 'react';
import { 
  BookHeart, 
  TrendingUp, 
  Syringe, 
  FileHeart, 
  Sparkles,
  Baby
} from 'lucide-react';

export type TabType = 'diary' | 'growth' | 'vaccines' | 'medical' | 'tools';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: { id: TabType; label: string; enLabel: string; icon: any; badge: string | null }[] = [
    { id: 'diary', label: '成長日常', enLabel: 'Journal', icon: BookHeart, badge: null },
    { id: 'growth', label: '生長曲線', enLabel: 'WHO Growth', icon: TrendingUp, badge: 'WHO' },
    { id: 'vaccines', label: '疫苗時程', enLabel: 'Vaccines', icon: Syringe, badge: null },
    { id: 'medical', label: '醫療護照', enLabel: 'Passport', icon: FileHeart, badge: null },
    { id: 'tools', label: '育兒工具箱', enLabel: 'Toolbox', icon: Sparkles, badge: '實用' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#EBE7DF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & App Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => onSelectTab('diary')}
          >
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center border border-[#4A453E] shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Baby className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#2A2723]">
                  暖暖初生
                </h1>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C8475] bg-[#F2EDE4] px-2 py-0.5 rounded-full border border-[#D9D1C2]">
                  Health & Diary
                </span>
              </div>
              <p className="text-xs text-[#8C8475] font-sans hidden sm:block">
                新生兒健康記錄・WHO 生長曲線・育兒科學小工具
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-[#F2EDE4] p-1.5 rounded-full border border-[#EBE7DF]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-[#2A2723] text-[#F9F6F0] shadow-sm scale-[1.02]'
                      : 'text-[#6B6457] hover:text-[#2A2723] hover:bg-[#E6DFD1]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9D1C2]' : 'text-[#8C8475]'}`} strokeWidth={1.75} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#D9D1C2] text-[#2A2723]' : 'bg-[#D9D1C2]/60 text-[#4A453E]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-[#EBE7DF] overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center py-1.5 px-2.5 rounded-2xl text-xs transition-all shrink-0 ${
                  isActive
                    ? 'text-[#F9F6F0] bg-[#2A2723]'
                    : 'text-[#8C8475] hover:text-[#2A2723]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#D9D1C2]' : 'text-[#8C8475]'}`} strokeWidth={1.5} />
                <span className="text-[10px] tracking-wider whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
