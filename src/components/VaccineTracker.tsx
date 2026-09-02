import React, { useState } from 'react';
import { 
  Syringe, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  Thermometer, 
  ChevronDown, 
  ChevronUp, 
  Info,
  ShieldCheck,
  ShieldAlert,
  BellRing,
  Sparkles,
  ArrowRight,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BabyProfile, VaccineRecord } from '../types';
import { NATIONAL_VACCINE_SCHEDULE as VACCINE_SCHEDULE } from '../data/vaccineScheduleData';

interface VaccineTrackerProps {
  babyProfile: BabyProfile;
  vaccineRecords: VaccineRecord[];
  onToggleComplete: (record: VaccineRecord) => void;
  onUpdateRecord: (record: VaccineRecord) => void;
}

export const VaccineTracker: React.FC<VaccineTrackerProps> = ({
  babyProfile,
  vaccineRecords,
  onToggleComplete,
  onUpdateRecord,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [editingRecord, setEditingRecord] = useState<VaccineRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group vaccines by timeline stage
  const ageStages = [
    { title: '出生時 (At Birth)', maxMonth: 0 },
    { title: '滿 1 個月 (1 Month)', maxMonth: 1 },
    { title: '滿 2 個月 (2 Months)', maxMonth: 2 },
    { title: '滿 4 個月 (4 Months)', maxMonth: 4 },
    { title: '滿 5 個月 (5 Months)', maxMonth: 5 },
    { title: '滿 6 個月 (6 Months)', maxMonth: 6 },
    { title: '滿 12 個月 / 1 歲 (12 Months)', maxMonth: 12 },
    { title: '滿 15 ~ 18 個月 (15-18 Months)', maxMonth: 18 },
    { title: '滿 2 ~ 5 歲 (2-5 Years)', maxMonth: 60 },
  ];

  const now = new Date();

  // Map schedule items with records
  const enrichedList = VACCINE_SCHEDULE.map((item) => {
    const record = vaccineRecords.find((r) => r.vaccineId === item.id) || {
      id: `vac-${item.id}`,
      vaccineId: item.id,
      vaccineName: item.name,
      doseNumber: item.doseNumber,
      scheduledDate: new Date(new Date(babyProfile.birthday).getTime() + item.targetAgeMonths * 30.4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isCompleted: false,
    };

    const scheduledDateObj = new Date(record.scheduledDate);
    const diffDays = Math.ceil((scheduledDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      scheduleItem: item,
      record,
      diffDays,
    };
  });

  const totalCount = enrichedList.length;
  const completedCount = enrichedList.filter((i) => i.record.isCompleted).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Priority Due Soon / Overdue items for the Top Reminder Card
  const pendingItems = enrichedList.filter((i) => !i.record.isCompleted);
  const overdueItems = pendingItems.filter((i) => i.diffDays <= 0);
  const dueSoonItems = pendingItems.filter((i) => i.diffDays > 0 && i.diffDays <= 45);
  const prioritizedReminders = [...overdueItems, ...dueSoonItems].sort((a, b) => a.diffDays - b.diffDays);
  const nextFutureItem = pendingItems.find((i) => i.diffDays > 45);

  const filteredList = enrichedList.filter((item) => {
    if (filter === 'completed') return item.record.isCompleted;
    if (filter === 'upcoming') return !item.record.isCompleted;
    return true;
  });

  const handleToggle = (record: VaccineRecord) => {
    const isNowDone = !record.isCompleted;
    const updated: VaccineRecord = {
      ...record,
      isCompleted: isNowDone,
      completedDate: isNowDone ? (record.completedDate || new Date().toISOString().split('T')[0]) : undefined,
    };

    if (isNowDone) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#2A2723', '#D9D1C2', '#C7BBA8', '#A69D8D'],
        });
      } catch (e) {
        // ignore
      }
    }
    onToggleComplete(updated);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      onUpdateRecord(editingRecord);
      setEditingRecord(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header & Progress */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8C8475] block mb-1">
              CDC Immunization Schedule & Tracker
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2A2723]">
              台灣兒童公費與常規預防接種時程
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6457] mt-1 font-sans">
              依據衛生福利部疾管署標準時程推算，智能倒數提醒守護寶寶建立完整免疫力
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-[#2A2723] text-[#F9F6F0] rounded-[24px] p-5 border border-[#4A453E] min-w-[220px]">
            <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-widest text-[#A69D8D] mb-2">
              <span>接種完成率</span>
              <span className="font-mono text-[#D9D1C2] font-bold">{completedCount}/{totalCount} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-[#4A453E] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#D9D1C2] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#F2EDE4] flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all ${
              filter === 'all'
                ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
                : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
            }`}
          >
            全部項目 ({totalCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all ${
              filter === 'upcoming'
                ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
                : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
            }`}
          >
            待施打提醒 ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider transition-all ${
              filter === 'completed'
                ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
                : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
            }`}
          >
            已完成接種 ({completedCount})
          </button>
        </div>
      </div>

      {/* FEATURE: 即將到期的接種提醒卡片 (Upcoming / Overdue Priority Reminder Banner) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#2A2723]" />
            <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-[#6B6457] font-bold">
              即將到期與近期應施打接種提醒 (Priority Vaccine Alerts)
            </h3>
          </div>
          {prioritizedReminders.length > 0 && (
            <span className="text-[11px] font-mono text-[#8C8475]">
              近期需關注：<strong className="text-[#2A2723]">{prioritizedReminders.length}</strong> 項
            </span>
          )}
        </div>

        {prioritizedReminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prioritizedReminders.map(({ scheduleItem, record, diffDays }) => {
              const isOverdue = diffDays <= 0;
              const overdueDays = Math.abs(diffDays);

              return (
                <div
                  key={scheduleItem.id}
                  className={`rounded-[28px] p-5 sm:p-6 border transition-all relative overflow-hidden ${
                    isOverdue
                      ? 'bg-[#FDF7F7] border-[#E8D1D1] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#D9D1C2] shadow-xs'
                  }`}
                >
                  {/* Top Priority Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold px-3 py-1 rounded-full bg-[#8C4A4A] text-[#F9F6F0]">
                          <AlertTriangle className="w-3 h-3" />
                          已達月齡・已可施打 {overdueDays > 0 ? `(已逾期 ${overdueDays} 天)` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold px-3 py-1 rounded-full bg-[#2A2723] text-[#F9F6F0]">
                          <Clock className="w-3 h-3 text-[#D9D1C2]" />
                          即將到期・剩餘 {diffDays} 天
                        </span>
                      )}

                      {scheduleItem.isMandatory ? (
                        <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBE7DF] text-[#4A453E] font-medium">
                          常規公費
                        </span>
                      ) : (
                        <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAE6F2] text-[#423854] font-medium">
                          建議自費
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#4A453E] border border-[#EBE7DF]">
                      {scheduleItem.code}
                    </span>
                  </div>

                  {/* Vaccine Title and Schedule */}
                  <div className="space-y-1.5 mb-4">
                    <h4 className="text-lg font-serif font-bold text-[#2A2723]">
                      {scheduleItem.name}
                    </h4>
                    <p className="text-xs text-[#6B6457] font-sans line-clamp-1">
                      <strong className="text-[#2A2723]">預防：</strong>{scheduleItem.diseasePrevented}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#8C8475] pt-1 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#A69D8D]" strokeWidth={1.5} />
                        建議：{scheduleItem.targetAgeLabel}
                      </span>
                      <span className="flex items-center gap-1 font-medium font-mono text-[#2A2723]">
                        <Clock className="w-3.5 h-3.5 text-[#8C8475]" strokeWidth={1.5} />
                        預定日期：{record.scheduledDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#EBE7DF] gap-2">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-xs font-sans text-[#6B6457] hover:text-[#2A2723] flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-white/80 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>填寫接種院所/批號</span>
                    </button>

                    <button
                      onClick={() => handleToggle(record)}
                      className="text-xs font-sans font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] hover:bg-[#3D3833] flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D9D1C2]" />
                      <span>標記已施打</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#E6EBE6]/60 rounded-[28px] p-6 border border-[#D5DDD5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#3E4A3E] text-[#F9F6F0] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-[#2A2723]">
                  現階段公費與常規疫苗皆已如期完成！
                </h4>
                <p className="text-xs text-[#5C6B5C] font-sans">
                  {nextFutureItem 
                    ? `下一劑為【${nextFutureItem.scheduleItem.name}】，預計於 ${nextFutureItem.record.scheduledDate} (${nextFutureItem.scheduleItem.targetAgeLabel}) 施打。`
                    : '目前所有疫苗皆已完成接種，建立完整防護保護力。'}
                </p>
              </div>
            </div>
            {nextFutureItem && (
              <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-white text-[#3E4A3E] border border-[#D5DDD5]">
                倒數 {nextFutureItem.diffDays} 天
              </span>
            )}
          </div>
        )}
      </div>

      {/* Vaccine Timeline Stage Groups */}
      <div className="space-y-8">
        {ageStages.map((stage, sIdx) => {
          const prevMax = sIdx === 0 ? -1 : ageStages[sIdx - 1].maxMonth;
          const stageItems = filteredList.filter(
            (i) => i.scheduleItem.targetAgeMonths > prevMax && i.scheduleItem.targetAgeMonths <= stage.maxMonth
          );

          if (stageItems.length === 0) return null;

          return (
            <div key={stage.title} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2 h-2 rounded-full bg-[#2A2723]" />
                <h3 className="text-xs font-sans uppercase tracking-[0.2em] text-[#8C8475] font-bold">
                  {stage.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {stageItems.map(({ scheduleItem, record, diffDays }) => {
                  const isExpanded = expandedId === scheduleItem.id;
                  const isDone = record.isCompleted;

                  return (
                    <div
                      key={scheduleItem.id}
                      className={`bg-white rounded-[28px] p-5 sm:p-6 border transition-all duration-300 ${
                        isDone
                          ? 'border-[#D5DDD5] bg-[#E6EBE6]/30'
                          : diffDays <= 0
                          ? 'border-[#E0D0D0] bg-[#F2E6E6]/30'
                          : diffDays <= 30
                          ? 'border-[#D9D1C2] ring-1 ring-[#D9D1C2]'
                          : 'border-[#EBE7DF] hover:border-[#D1CEC4]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Left: Checkbox and Vaccine Name */}
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => handleToggle(record)}
                            className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isDone
                                ? 'text-[#F9F6F0] bg-[#2A2723]'
                                : 'text-[#8C8475] bg-[#F2EDE4] hover:bg-[#D9D1C2]'
                            }`}
                            title={isDone ? '標記為未完成' : '標記為已完成施打'}
                          >
                            <CheckCircle2 className={`w-5 h-5 ${isDone ? 'stroke-white' : 'stroke-[#8C8475]'}`} />
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={`text-lg font-serif font-semibold ${isDone ? 'text-[#8C8475] line-through' : 'text-[#2A2723]'}`}>
                                {scheduleItem.name}
                              </h4>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F2EDE4] text-[#4A453E] border border-[#EBE7DF]">
                                {scheduleItem.code}
                              </span>
                              {scheduleItem.isMandatory ? (
                                <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D9D1C2] text-[#2A2723] font-bold">
                                  常規公費
                                </span>
                              ) : (
                                <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAE6F2] text-[#423854] font-bold">
                                  建議自費
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-[#8C8475] mt-1.5 flex-wrap font-sans">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#A69D8D]" strokeWidth={1.5} />
                                建議：{scheduleItem.targetAgeLabel}
                              </span>
                              <span className="flex items-center gap-1 text-[#2A2723] font-medium font-mono">
                                <Clock className="w-3.5 h-3.5 text-[#8C8475]" strokeWidth={1.5} />
                                預定：{record.scheduledDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Status Pill & Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                          {isDone ? (
                            <span className="text-xs font-sans uppercase tracking-wider text-[#3E4A3E] bg-[#E6EBE6] border border-[#D5DDD5] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              已於 {record.completedDate || record.scheduledDate} 接種
                            </span>
                          ) : diffDays <= 0 ? (
                            <span className="text-xs font-sans uppercase tracking-wider text-[#6B3E3E] bg-[#F2E6E6] border border-[#E0D0D0] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              已可施打 (逾期 {Math.abs(diffDays)} 天)
                            </span>
                          ) : (
                            <span className="text-xs font-sans uppercase tracking-wider text-[#2A2723] bg-[#F2EDE4] border border-[#D9D1C2] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5 text-[#8C8475]" />
                              倒數 {diffDays} 天
                            </span>
                          )}

                          {/* Edit Details Button */}
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="text-xs font-sans uppercase tracking-wider px-3.5 py-1.5 rounded-full text-[#4A453E] bg-[#F9F6F0] border border-[#D1CEC4] hover:bg-[#F2EDE4] transition-colors"
                          >
                            {isDone ? '編輯細節' : '記錄補全'}
                          </button>

                          {/* Expand details toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : scheduleItem.id)}
                            className="p-1.5 rounded-full text-[#8C8475] hover:text-[#2A2723]"
                            title="查看疫苗醫學資訊"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                      </div>

                      {/* Completed Details Sub-Bar */}
                      {isDone && (record.clinicName || record.reactionNotes || record.lotNumber) && (
                        <div className="mt-4 pt-3.5 border-t border-[#D5DDD5] text-xs text-[#6B6457] flex items-center gap-4 flex-wrap font-sans">
                          {record.clinicName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-[#8C8475]" />
                              院所：<strong className="text-[#2A2723]">{record.clinicName}</strong>
                            </span>
                          )}
                          {record.lotNumber && (
                            <span>批號：<code className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-full border border-[#D1CEC4]">{record.lotNumber}</code></span>
                          )}
                          {record.feverTemp && (
                            <span className="flex items-center gap-1 font-medium text-[#6B3E3E]">
                              <Thermometer className="w-3.5 h-3.5 text-[#8C5D5D]" />
                              接種後體溫：{record.feverTemp}°C
                            </span>
                          )}
                          {record.reactionNotes && (
                            <span className="text-[#8C8475] truncate max-w-md">
                              備註：{record.reactionNotes}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expandable Medical Description & Precautions Drawer */}
                      {isExpanded && (
                        <div className="mt-4 pt-3.5 border-t border-[#F2EDE4] text-xs space-y-2 bg-[#F9F6F0] p-4 rounded-[20px] font-sans">
                          <div>
                            <strong className="text-[#2A2723]">預防疾病：</strong>
                            <span className="text-[#4A453E] ml-1">{scheduleItem.diseasePrevented}</span>
                          </div>
                          <div>
                            <strong className="text-[#2A2723]">疫苗說明：</strong>
                            <span className="text-[#6B6457] ml-1">{scheduleItem.description}</span>
                          </div>
                          <div>
                            <strong className="text-[#2A2723]">注意事項與副作用：</strong>
                            <span className="text-[#6B6457] ml-1">{scheduleItem.precautions}</span>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Vaccine Record Details Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#F9F6F0] rounded-[36px] p-7 max-w-lg w-full border border-[#D9D1C2] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
              <h3 className="text-xl font-serif font-bold text-[#2A2723] flex items-center gap-2">
                <Syringe className="w-5 h-5 text-[#8C8475]" strokeWidth={1.5} />
                <span>編輯接種記錄：{editingRecord.vaccineName}</span>
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4 text-xs sm:text-sm font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                    完成施打日期
                  </label>
                  <input
                    type="date"
                    value={editingRecord.completedDate || editingRecord.scheduledDate}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        completedDate: e.target.value,
                        isCompleted: true,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white focus:outline-hidden focus:border-[#2A2723] text-[#2A2723]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                    施打醫療院所 / 診所
                  </label>
                  <input
                    type="text"
                    placeholder="如：禾馨婦幼診所"
                    value={editingRecord.clinicName || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, clinicName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white focus:outline-hidden focus:border-[#2A2723] text-[#2A2723]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                    疫苗批號 (Lot No.)
                  </label>
                  <input
                    type="text"
                    placeholder="如：LOT-2026-9812"
                    value={editingRecord.lotNumber || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, lotNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white focus:outline-hidden focus:border-[#2A2723] font-mono text-[#2A2723]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                    接種後體溫 (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="如：37.2"
                    value={editingRecord.feverTemp || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, feverTemp: parseFloat(e.target.value) || undefined })}
                    className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white focus:outline-hidden focus:border-[#2A2723] text-[#2A2723]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#6B6457] mb-1.5">
                  施打後身體反應與備註
                </label>
                <textarea
                  rows={2}
                  placeholder="如：注射處輕微泛紅、稍有哭鬧討抱，隔天恢復正常食慾..."
                  value={editingRecord.reactionNotes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, reactionNotes: e.target.value })}
                  className="w-full px-4 py-3 rounded-[20px] border border-[#D1CEC4] bg-white focus:outline-hidden focus:border-[#2A2723] text-[#2A2723]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs font-sans uppercase tracking-wider shadow-sm"
                >
                  儲存接種記錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
