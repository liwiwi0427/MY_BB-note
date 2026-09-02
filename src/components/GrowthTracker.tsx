import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Scale,
  Ruler,
  Brain,
  Info,
} from 'lucide-react';
import type { GrowthRecord, BabyProfile } from '../types';
import { whoBoysData, whoGirlsData, calculatePercentile } from '../data/whoGrowthData';

interface GrowthTrackerProps {
  growthRecords: GrowthRecord[];
  baby: BabyProfile;
  onAddRecord: () => void;
  onEditRecord?: (record: GrowthRecord) => void;
  onDeleteRecord: (id: string) => void;
}

type MetricType = 'weight' | 'length' | 'headCirc';

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({
  growthRecords,
  baby,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');

  const sortedRecords = [...growthRecords].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const whoDataset = baby.gender === 'male' ? whoBoysData : whoGirlsData;
  const whoMetricPoints = whoDataset[selectedMetric];

  // Merge WHO standard curve percentiles with baby's actual measured data
  const chartData = whoMetricPoints.map((wp) => {
    const matchedRecord = sortedRecords.find((r) => Math.round(r.ageMonths) === wp.month);
    return {
      month: `${wp.month}M`,
      monthNum: wp.month,
      P3: wp.p3,
      P15: wp.p15,
      P50: wp.p50,
      P85: wp.p85,
      P97: wp.p97,
      babyValue: matchedRecord ? matchedRecord[selectedMetric] : undefined,
      babyRecord: matchedRecord,
    };
  });

  // Also include any specific month records not falling strictly on WHO month ticks
  for (const r of sortedRecords) {
    const label = `${r.ageMonths}M`;
    const exists = chartData.some((cd) => cd.monthNum === r.ageMonths);
    if (!exists) {
      chartData.push({
        month: label,
        monthNum: r.ageMonths,
        P3: undefined as unknown as number,
        P15: undefined as unknown as number,
        P50: undefined as unknown as number,
        P85: undefined as unknown as number,
        P97: undefined as unknown as number,
        babyValue: r[selectedMetric],
        babyRecord: r,
      });
    }
  }

  chartData.sort((a, b) => a.monthNum - b.monthNum);

  const latestRecord = sortedRecords[sortedRecords.length - 1];
  const currentUnit = selectedMetric === 'weight' ? 'kg' : 'cm';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-serif font-bold text-[#2A2723]">
              WHO 國際標準兒童生長曲線追蹤
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBE7DF] text-[#6B6457] font-medium font-sans">
              0-24 個月
            </span>
          </div>
          <p className="text-xs text-[#6B6457] mt-1 font-sans">
            依據世界衛生組織 (WHO) {baby.gender === 'male' ? '男童' : '女童'} 發育標準百分位 P3 ~ P97 實時對照
          </p>
        </div>

        <button
          onClick={onAddRecord}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#2A2723] text-[#F9F6F0] hover:bg-[#4A453E] text-xs font-sans font-medium transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>記錄新數據</span>
        </button>
      </div>

      {/* Metric Switcher Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {(['weight', 'length', 'headCirc'] as MetricType[]).map((metric) => {
          const isSelected = selectedMetric === metric;
          const config = {
            weight: { title: '體重 (Weight)', enTitle: 'Weight', desc: 'Weight-for-age' },
            length: { title: '身長 (Length)', enTitle: 'Length', desc: 'Length-for-age' },
            headCirc: { title: '頭圍 (Head Circ)', enTitle: 'Head Circ', desc: 'Head-circ-for-age' },
          }[metric];

          const currentVal = latestRecord ? latestRecord[metric] : null;
          const pct = currentVal !== null && latestRecord
            ? calculatePercentile(currentVal, latestRecord.ageMonths, metric, baby.gender)
            : null;

          return (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`text-left p-3.5 sm:p-5 rounded-2xl sm:rounded-[28px] border transition-all duration-200 relative overflow-hidden active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723] shadow-md'
                  : 'bg-white text-[#2A2723] border-[#EBE7DF] hover:border-[#D1CEC4] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1 sm:mb-3">
                <span className={`text-[9px] sm:text-[10px] font-sans uppercase tracking-wider truncate ${isSelected ? 'text-[#A69D8D]' : 'text-[#8C8475]'}`}>
                  {config.enTitle}
                </span>
                {pct !== null && (
                  <span className={`text-[9px] sm:text-xs font-mono font-bold px-1.5 sm:px-2.5 py-0.2 sm:py-0.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-[#4A453E] text-[#D9D1C2]' : 'bg-[#F2EDE4] text-[#2A2723]'
                  }`}>
                    P{pct}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-lg font-serif font-bold mb-0.5 sm:mb-1 truncate">
                {config.title}
              </div>

              <div className="flex items-baseline gap-1 mt-1 sm:mt-2">
                <span className="text-lg sm:text-3xl font-serif font-bold tracking-tight font-mono">
                  {currentVal !== null ? currentVal : '--'}
                </span>
                <span className={`text-[10px] sm:text-xs font-sans ${isSelected ? 'text-[#D9D1C2]' : 'text-[#8C8475]'}`}>
                  {metric === 'weight' ? 'kg' : 'cm'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas Card */}
      <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white border border-[#EBE7DF] shadow-2xs">
              <TrendingUp className="w-4 h-4 text-[#2A2723]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#2A2723]">
                {selectedMetric === 'weight' ? '體重生長百分位曲線 (kg)' : selectedMetric === 'length' ? '身長百分位曲線 (cm)' : '頭圍百分位曲線 (cm)'}
              </h3>
              <p className="text-[11px] text-[#8C8475] font-sans">WHO 0-24 個月標準常態發育分佈</p>
            </div>
          </div>
          <div className="text-xs text-[#524C42] bg-white/80 px-3 py-1.5 rounded-xl border border-[#D9D1C2] font-sans flex items-center gap-1.5 shadow-2xs">
            <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>落在 P3~P97 區間皆屬健康發育範圍 (P50 為標準中位數)</span>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE7DF" vertical={false} />
              <XAxis dataKey="month" stroke="#8C8475" fontSize={12} tickLine={false} />
              <YAxis stroke="#8C8475" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2A2723',
                  borderColor: '#2A2723',
                  borderRadius: '16px',
                  color: '#F9F6F0',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }} />

              {/* WHO Percentiles Lines */}
              <Line type="monotone" dataKey="P97" stroke="#D9D1C2" strokeDasharray="4 4" dot={false} name="P97 (高標)" />
              <Line type="monotone" dataKey="P85" stroke="#C4B8A5" strokeDasharray="3 3" dot={false} name="P85" />
              <Line type="monotone" dataKey="P50" stroke="#8C8475" strokeWidth={1.75} dot={false} name="P50 (中位數)" />
              <Line type="monotone" dataKey="P15" stroke="#C4B8A5" strokeDasharray="3 3" dot={false} name="P15" />
              <Line type="monotone" dataKey="P3" stroke="#D9D1C2" strokeDasharray="4 4" dot={false} name="P3 (低標)" />

              {/* Baby Real Measured Curve */}
              <Line
                type="monotone"
                dataKey="babyValue"
                stroke="#2A2723"
                strokeWidth={3.5}
                dot={{ r: 6, fill: '#2A2723', stroke: '#F9F6F0', strokeWidth: 2.5 }}
                activeDot={{ r: 8 }}
                name={`${baby.name} 實際數值`}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Records Table & Cards */}
      <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#2A2723]">
            生長測量歷史紀錄 ({sortedRecords.length} 筆)
          </h3>
          <button
            onClick={onAddRecord}
            className="text-xs font-sans text-[#2A2723] underline hover:text-[#8C8475]"
          >
            + 新增測量
          </button>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {sortedRecords.map((r) => {
            const pWeight = calculatePercentile(r.weight, r.ageMonths, 'weight', baby.gender);
            const pLength = calculatePercentile(r.length, r.ageMonths, 'length', baby.gender);
            const pHead = calculatePercentile(r.headCirc, r.ageMonths, 'headCirc', baby.gender);

            return (
              <div key={r.id} className="p-4 rounded-2xl bg-white border border-[#EBE7DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#2A2723]">{r.date}</span>
                    <span className="ml-2 text-xs text-[#6B6457] font-sans">({r.ageMonths} 個月 / {r.ageDays} 天)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {onEditRecord && (
                      <button
                        onClick={() => onEditRecord(r)}
                        className="p-1.5 text-[#8C8475] hover:text-[#2A2723] rounded-lg"
                        title="修改"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-1.5 text-[#D1CEC4] hover:text-[#C4685D] rounded-lg"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-[#F9F6F0] p-2.5 rounded-xl border border-[#EBE7DF]">
                  <div>
                    <div className="text-[10px] text-[#8C8475]">體重</div>
                    <div className="text-sm font-mono font-bold text-[#2A2723]">{r.weight} kg</div>
                    <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-[#F2EDE4] font-bold">P{pWeight}</span>
                  </div>
                  <div className="border-x border-[#EBE7DF]">
                    <div className="text-[10px] text-[#8C8475]">身長</div>
                    <div className="text-sm font-mono font-bold text-[#2A2723]">{r.length} cm</div>
                    <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-[#E6EBE6] font-bold">P{pLength}</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8C8475]">頭圍</div>
                    <div className="text-sm font-mono font-bold text-[#2A2723]">{r.headCirc} cm</div>
                    <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-[#E6E9F2] font-bold">P{pHead}</span>
                  </div>
                </div>

                {r.doctorNote && (
                  <p className="text-[11px] text-[#6B6457] font-sans">
                    醫囑: {r.doctorNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EBE7DF] text-[#8C8475] font-sans uppercase tracking-wider text-[11px]">
                <th className="pb-3">測量日期</th>
                <th className="pb-3">月齡 / 天數</th>
                <th className="pb-3">體重 (kg)</th>
                <th className="pb-3">身長 (cm)</th>
                <th className="pb-3">頭圍 (cm)</th>
                <th className="pb-3">健檢醫囑 / 測量人員</th>
                <th className="pb-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE7DF]">
              {sortedRecords.map((r) => {
                const pWeight = calculatePercentile(r.weight, r.ageMonths, 'weight', baby.gender);
                const pLength = calculatePercentile(r.length, r.ageMonths, 'length', baby.gender);
                const pHead = calculatePercentile(r.headCirc, r.ageMonths, 'headCirc', baby.gender);

                return (
                  <tr key={r.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 font-mono font-medium text-[#2A2723]">{r.date}</td>
                    <td className="py-3 font-sans text-[#6B6457]">{r.ageMonths} 個月 ({r.ageDays} 天)</td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-[#2A2723]">{r.weight}</span>
                      <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F2EDE4] font-bold">P{pWeight}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-[#2A2723]">{r.length}</span>
                      <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E6EBE6] font-bold">P{pLength}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-bold text-[#2A2723]">{r.headCirc}</span>
                      <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E6E9F2] font-bold">P{pHead}</span>
                    </td>
                    <td className="py-3 text-[#6B6457] font-sans max-w-xs truncate">
                      {r.doctorNote || (r.measuredBy ? `由 ${r.measuredBy} 記錄` : '-')}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {onEditRecord && (
                          <button
                            onClick={() => onEditRecord(r)}
                            className="p-1.5 text-[#8C8475] hover:text-[#2A2723] rounded-lg"
                            title="修改"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteRecord(r.id)}
                          className="p-1.5 text-[#D1CEC4] hover:text-[#C4685D] rounded-lg"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
