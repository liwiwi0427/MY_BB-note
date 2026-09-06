import React from 'react';
import { 
  BookHeart, 
  Droplets,
  TrendingUp, 
  Syringe, 
  Stethoscope, 
  Sparkles,
  Baby
} from 'lucide-react';

export type TabType = 'diary' | 'io' | 'growth' | 'vaccines' | 'medical' | 'tools';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  syncCode?: string;
  onOpenCloudSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: {
    id: TabType;
    label: string;
    shortLabel: string;
    enLabel: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    activeColor: string;
    iconTint: string;
    activeIconTint: string;
    pillBg: string;
  }[] = [
    { 
      id: 'diary', 
      label: '成長日記', 
      shortLabel: '日記', 
      enLabel: 'Journal', 
      icon: BookHeart,
      activeColor: 'bg-[#2A2723] text-[#F9F6F0]',
      iconTint: 'text-rose-500',
      activeIconTint: 'text-rose-300',
      pillBg: 'bg-rose-50/80 text-rose-700 border-rose-200'
    },
    { 
      id: 'io', 
      label: 'I/O 監測', 
      shortLabel: 'I/O', 
      enLabel: 'Intake/Output', 
      icon: Droplets,
      activeColor: 'bg-[#2A2723] text-[#F9F6F0]',
      iconTint: 'text-sky-500',
      activeIconTint: 'text-sky-300',
      pillBg: 'bg-sky-50/80 text-sky-700 border-sky-200'
    },
    { 
      id: 'growth', 
      label: '生長發育', 
      shortLabel: '生長', 
      enLabel: 'WHO Growth', 
      icon: TrendingUp,
      activeColor: 'bg-[#2A2723] text-[#F9F6F0]',
      iconTint: 'text-emerald-500',
      activeIconTint: 'text-emerald-300',
      pillBg: 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
    },
    { 
      id: 'vaccines', 
      label: '疫苗時程', 
      shortLabel: '疫苗', 
      enLabel: 'Vaccines', 
      icon: Syringe,
      activeColor: 'bg-[#2A2723] text-[#F9F6F0]',
      iconTint: 'text-amber-500',
      activeIconTint: 'text-amber-300',
      pillBg: 'bg-amber-50/80 text-amber-700 border-amber-200'
    },
    { 
      id: 'medical', 
      label: '就診護照', 
      shortLabel: '護照', 
      enLabel: 'Passport', 
      icon: Stethoscope,
      activeColor: 'bg-[#2A2723] text-[#F9F6F0]',
      iconTint: 'text-indigo-500',
      activeIconTint: 'text-indigo-300',
      pillBg: 'bg-indigo-50/80 text-indigo-700 border-indigo-200'
    },
    { 
      id: 'tools', 
      label: '育兒工具', 
      shortLabel: '工具', 
      enLabel: 'Tools', 
      icon: Sparkles,
      activeColor: 'bg-[#2A2723] text-[#F9F6F0]',
      iconTint: 'text-purple-500',
      activeIconTint: 'text-purple-300',
      pillBg: 'bg-purple-50/80 text-purple-700 border-purple-200'
    },
  ];

  return (
    <>
      {/* Top Header Navigation (Clean, sync badge hidden as requested) */}
      <header className="sticky top-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#EBE7DF]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & Title */}
            <div 
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0" 
              onClick={() => onSelectTab('diary')}
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center border border-[#4A453E] shadow-xs group-hover:scale-105 transition-transform duration-300">
                <Baby className="w-5 h-5 text-[#FFE0B2]" strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-[#2A2723]">
                    暖暖初生
                  </h1>
                  <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-widest text-[#8C8475] bg-[#F2EDE4] px-2 py-0.5 rounded-full border border-[#D9D1C2]">
                    Baby Care
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#8C8475] font-sans hidden sm:block">
                  新生兒健康記錄・WHO 生長曲線・育兒科學小工具
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex items-center space-x-1.5 bg-[#F2EDE4] p-1.5 rounded-full border border-[#EBE7DF] shadow-2xs">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-tab-${item.id}`}
                      onClick={() => onSelectTab(item.id)}
                      className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-sans tracking-wide transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs scale-[1.02]'
                          : 'text-[#6B6457] hover:text-[#2A2723] hover:bg-[#E6DFD1]/70'
                      }`}
                    >
                      {/* Icon container with distinct thematic accent */}
                      <span className={`p-1 rounded-full flex items-center justify-center transition-colors ${
                        isActive 
                          ? 'bg-white/10' 
                          : 'bg-white/60 group-hover:bg-white shadow-2xs'
                      }`}>
                        <Icon 
                          className={`w-3.5 h-3.5 ${isActive ? item.activeIconTint : item.iconTint}`} 
                          strokeWidth={isActive ? 2.2 : 1.8} 
                        />
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* Mobile Horizontal Top Quick Pills Bar (Swipeable on screens < md) */}
          <div className="md:hidden flex items-center gap-1.5 py-2 px-0.5 border-t border-[#EBE7DF] overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`top-mobile-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all duration-200 shrink-0 border ${
                    isActive
                      ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723] font-bold shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#6B6457] border-[#EBE7DF] hover:bg-[#F2EDE4]'
                  }`}
                >
                  <Icon 
                    className={`w-3.5 h-3.5 ${isActive ? item.activeIconTint : item.iconTint}`} 
                    strokeWidth={isActive ? 2.2 : 1.8} 
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Mobile Ergonomic Fixed Bottom Navigation Bar */}
      <nav 
        aria-label="手機端底部快速導航"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F9F6F0]/95 backdrop-blur-md border-t border-[#EBE7DF] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={`bottom-${item.id}`}
              id={`bottom-nav-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all relative ${
                isActive ? 'text-[#2A2723]' : 'text-[#8C8475] active:scale-95'
              }`}
            >
              {/* Icon Container with clear, high-contrast visual tile */}
              <div className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
                isActive 
                  ? 'bg-[#2A2723] shadow-xs scale-110' 
                  : 'bg-[#EFEAE1] hover:bg-[#E6DFD1]'
              }`}>
                <Icon 
                  className={`w-4 h-4 ${isActive ? item.activeIconTint : item.iconTint}`} 
                  strokeWidth={isActive ? 2.2 : 1.8} 
                />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${
                isActive ? 'font-bold text-[#2A2723]' : 'font-medium text-[#7A7367]'
              }`}>
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
