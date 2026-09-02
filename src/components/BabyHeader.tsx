import React from 'react';
import { 
  Baby, 
  FileText, 
  Weight, 
  Ruler, 
  Brain, 
  Syringe, 
  Edit3, 
  Calendar, 
  Heart,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { BabyProfile, GrowthRecord, VaccineRecord } from '../types';
import { getBabyAgeDetails } from '../utils/storage';
import { getPercentileInterpretation } from '../data/whoGrowthData';

interface BabyHeaderProps {
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  onEditProfile: () => void;
  onOpenPediatricReport: () => void;
  onOpenGrowthTracker: () => void;
  onOpenVaccineTracker: () => void;
}

export const BabyHeader: React.FC<BabyHeaderProps> = ({
  babyProfile,
  growthRecords,
  vaccineRecords,
  onEditProfile,
  onOpenPediatricReport,
  onOpenGrowthTracker,
  onOpenVaccineTracker,
}) => {
  const ageDetails = getBabyAgeDetails(babyProfile.birthday);

  // Latest growth record
  const latestGrowth = growthRecords.length > 0 
    ? [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Next upcoming vaccine
  const nowTime = new Date().getTime();
  const upcomingVaccines = vaccineRecords
    .filter((v) => !v.isCompleted)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  
  const nextVaccine = upcomingVaccines[0];
  let daysUntilVaccine = 0;
  if (nextVaccine) {
    const diff = new Date(nextVaccine.scheduledDate).getTime() - nowTime;
    daysUntilVaccine = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const weightInterp = latestGrowth?.percentileWeight !== undefined
    ? getPercentileInterpretation(latestGrowth.percentileWeight)
    : null;

  return (
    <section className="bg-white border border-[#EBE7DF] rounded-[36px] p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
      {/* Editorial Decorative Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none font-serif text-9xl">
        Baby
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[#EBE7DF]">
          
          {/* Baby Info Main Block */}
          <div className="flex items-start sm:items-center space-x-5">
            <div 
              className="relative group cursor-pointer" 
              onClick={onEditProfile} 
              title="點擊更換大頭貼或編輯資料"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#D9D1C2] p-1 bg-[#F9F6F0] shadow-sm">
                <div className="w-full h-full rounded-full overflow-hidden">
                  {babyProfile.avatarUrl ? (
                    <img
                      src={babyProfile.avatarUrl}
                      alt={babyProfile.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F2EDE4] text-[#2A2723]">
                      <Baby className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </div>
              <button 
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#2A2723] text-[#F9F6F0] shadow-sm hover:bg-[#4A453E] transition-colors border border-white"
                title="編輯檔案"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#2A2723]">
                  {babyProfile.name}
                </h1>
                {babyProfile.nickname && (
                  <span className="text-sm font-serif font-medium text-[#6B6457] bg-[#F2EDE4] px-3 py-1 rounded-full border border-[#D9D1C2]">
                    「{babyProfile.nickname}」
                  </span>
                )}
                <span className="text-xs font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F2E6E6] text-[#6B3E3E] border border-[#E0D0D0]">
                  {babyProfile.bloodType} 型
                </span>
                <span className="text-xs font-sans tracking-wide px-2.5 py-0.5 rounded-full bg-[#F2EDE4] text-[#6B6457] border border-[#EBE7DF]">
                  妊娠 {babyProfile.gestationalWeeks} 週
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-[#8C8475] mt-2 flex-wrap font-sans">
                <span className="flex items-center gap-1.5 text-[#6B6457]">
                  <Calendar className="w-3.5 h-3.5 text-[#A69D8D]" strokeWidth={1.75} />
                  出生日期：<span className="font-mono text-[#2A2723]">{babyProfile.birthday}</span>{babyProfile.birthTime ? ` (${babyProfile.birthTime})` : ''}
                </span>
                <span className="text-[#D1CEC4]">•</span>
                <span className="flex items-center gap-1.5 text-[#2A2723] font-medium">
                  <Heart className="w-3.5 h-3.5 text-[#C4685D] fill-[#C4685D]" strokeWidth={1.5} />
                  目前月齡：<span className="font-serif font-bold text-base text-[#2A2723]">{ageDetails.formattedText}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start lg:self-end">
            <button
              onClick={onOpenPediatricReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider bg-[#2A2723] text-[#F9F6F0] hover:bg-[#3D3833] shadow-sm transition-all active:scale-95"
              title="產生兒科就診專用 PDF 報告"
            >
              <FileText className="w-3.5 h-3.5 text-[#D9D1C2]" strokeWidth={1.75} />
              <span>匯出就醫報告</span>
            </button>

            <button
              onClick={onEditProfile}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-sans tracking-wider bg-[#F9F6F0] text-[#4A453E] border border-[#D1CEC4] hover:bg-[#F2EDE4] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#8C8475]" />
              <span>檔案設定</span>
            </button>
          </div>
        </div>

        {/* Artistic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* Weight Card (Warm Ivory Art Card) */}
          <div 
            onClick={onOpenGrowthTracker}
            className="bg-[#F9F6F0] p-5 rounded-[28px] border border-[#EBE7DF] hover:border-[#D1CEC4] shadow-xs hover:scale-[1.01] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#8C8475] text-[11px] font-sans uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1.5 text-[#4A453E] font-medium">
                <Weight className="w-3.5 h-3.5 text-[#8C8475]" strokeWidth={1.75} />
                最新體重
              </span>
              {latestGrowth?.percentileWeight !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6DFD1] text-[#2A2723] font-bold">
                  P{latestGrowth.percentileWeight}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-serif font-bold text-[#2A2723] group-hover:translate-x-0.5 transition-transform font-mono">
                {latestGrowth ? latestGrowth.weight : (babyProfile.birthWeight > 0 ? babyProfile.birthWeight : '--')}
              </span>
              <span className="text-xs font-sans text-[#8C8475]">kg</span>
            </div>
            <p className="text-[11px] text-[#A69D8D] font-sans">
              初生基準: <span className="font-mono text-[#6B6457]">{babyProfile.birthWeight > 0 ? `${babyProfile.birthWeight} kg` : '未設定'}</span>
            </p>
          </div>

          {/* Length Card (Sage Artistic Tint) */}
          <div 
            onClick={onOpenGrowthTracker}
            className="bg-[#E6EBE6] p-5 rounded-[28px] border border-[#D5DDD5] hover:border-[#C4CCC4] shadow-xs hover:scale-[1.01] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#5C6B5C] text-[11px] font-sans uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1.5 font-medium text-[#3E4A3E]">
                <Ruler className="w-3.5 h-3.5 text-[#5C6B5C]" strokeWidth={1.75} />
                最新身長
              </span>
              {latestGrowth?.percentileLength !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 text-[#3E4A3E] font-bold border border-[#C4CCC4]">
                  P{latestGrowth.percentileLength}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-serif font-bold text-[#2A2723] group-hover:translate-x-0.5 transition-transform font-mono">
                {latestGrowth ? latestGrowth.length : (babyProfile.birthLength > 0 ? babyProfile.birthLength : '--')}
              </span>
              <span className="text-xs font-sans text-[#5C6B5C]">cm</span>
            </div>
            <p className="text-[11px] text-[#6E7D6E] font-sans">
              初生基準: <span className="font-mono text-[#3E4A3E]">{babyProfile.birthLength > 0 ? `${babyProfile.birthLength} cm` : '未設定'}</span>
            </p>
          </div>

          {/* Head Circ Card (Periwinkle Slate Artistic Tint) */}
          <div 
            onClick={onOpenGrowthTracker}
            className="bg-[#E6E9F2] p-5 rounded-[28px] border border-[#D5D9E6] hover:border-[#C2C7DA] shadow-xs hover:scale-[1.01] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#555C6E] text-[11px] font-sans uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1.5 font-medium text-[#3A4050]">
                <Brain className="w-3.5 h-3.5 text-[#555C6E]" strokeWidth={1.75} />
                最新頭圍
              </span>
              {latestGrowth?.percentileHeadCirc !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 text-[#3A4050] font-bold border border-[#C2C7DA]">
                  P{latestGrowth.percentileHeadCirc}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-3xl font-serif font-bold text-[#2A2723] group-hover:translate-x-0.5 transition-transform font-mono">
                {latestGrowth ? latestGrowth.headCirc : (babyProfile.birthHeadCirc > 0 ? babyProfile.birthHeadCirc : '--')}
              </span>
              <span className="text-xs font-sans text-[#555C6E]">cm</span>
            </div>
            <p className="text-[11px] text-[#6E758A] font-sans">
              初生基準: <span className="font-mono text-[#3A4050]">{babyProfile.birthHeadCirc > 0 ? `${babyProfile.birthHeadCirc} cm` : '未設定'}</span>
            </p>
          </div>

          {/* Upcoming Vaccine Alert Card (Charcoal Artistic Hero Card) */}
          <div 
            onClick={onOpenVaccineTracker}
            className="bg-[#2A2723] text-[#F9F6F0] p-5 rounded-[28px] border border-[#4A453E] hover:border-[#6B6457] shadow-sm hover:scale-[1.01] transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-[#A69D8D] text-[11px] font-sans uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1.5 text-[#D9D1C2] font-medium">
                <Syringe className="w-3.5 h-3.5 text-[#D9D1C2]" strokeWidth={1.75} />
                疫苗接種提醒
              </span>
              {daysUntilVaccine <= 0 ? (
                <span className="text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F2E6E6] text-[#2A2723] font-bold">
                  應施打
                </span>
              ) : (
                <span className="text-[10px] font-sans uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D9D1C2] text-[#2A2723] font-bold">
                  剩餘 {daysUntilVaccine} 天
                </span>
              )}
            </div>
            {nextVaccine ? (
              <div className="my-1">
                <p className="text-base font-serif font-bold text-[#F9F6F0] truncate">
                  {nextVaccine.vaccineName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#A69D8D] font-sans mt-0.5">
                  <Clock className="w-3 h-3 text-[#A69D8D]" strokeWidth={1.5} />
                  <span className="font-mono text-[11px]">{nextVaccine.scheduledDate}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#D9D1C2] font-sans my-2">常規疫苗皆已完成！</div>
            )}
            <p className="text-[10px] font-sans uppercase tracking-wider text-[#8C8475] group-hover:text-[#D9D1C2] transition-colors">
              點擊查看時程表 →
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
