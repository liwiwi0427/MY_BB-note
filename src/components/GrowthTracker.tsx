import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Weight, 
  Ruler, 
  Brain, 
  Plus, 
  Trash2, 
  Calendar, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import { BabyProfile, GrowthRecord } from '../types';
import { 
  WHO_BOYS_GROWTH, 
  WHO_GIRLS_GROWTH, 
  getPercentileInterpretation,
  calculatePercentile,
  WHOGrowthPoint
} from '../data/whoGrowthData';

interface GrowthTrackerProps {
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  onAddRecord: () => void;
  onDeleteRecord: (id: string) => void;
}

type MetricType = 'weight' | 'length' | 'headCirc';

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({
  babyProfile,
  growthRecords,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(babyProfile.gender);
  const [hoveredPoint, setHoveredPoint] = useState<GrowthRecord | null>(null);

  // Sorted historical records
  const sortedRecords = useMemo(() => {
    return [...growthRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [growthRecords]);

  const latestRecord = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1] : null;

  // Selected WHO Dataset
  const whoData = (selectedGender === 'female' ? WHO_GIRLS_GROWTH : WHO_BOYS_GROWTH)[selectedMetric];

  // Graph dimension bounds
  const maxMonth = 24; // Show 0 - 24 months
  const filteredWHO = whoData.filter((p) => p.month <= maxMonth);

  const metricConfig = {
    weight: {
      label: '體重曲線 (Weight-for-age)',
      unit: 'kg',
      minY: 1.5,
      maxY: 16.5,
      stepY: 2,
      icon: Weight,
      color: '#2A2723',
      strokeColor: '#6B6457',
      babyStroke: '#2A2723',
    },
    length: {
      label: '身長/身高曲線 (Length-for-age)',
      unit: 'cm',
      minY: 40,
      maxY: 95,
      stepY: 10,
      icon: Ruler,
      color: '#3E4A3E',
      strokeColor: '#5C6B5C',
      babyStroke: '#3E4A3E',
    },
    headCirc: {
      label: '頭圍曲線 (Head Circumference)',
      unit: 'cm',
      minY: 30,
      maxY: 52,
      stepY: 4,
      icon: Brain,
      color: '#3A4050',
      strokeColor: '#555C6E',
      babyStroke: '#3A4050',
    },
  }[selectedMetric];

  // SVG Chart Geometry
  const width = 800;
  const height = 420;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (month: number) => {
    return padding.left + (month / maxMonth) * plotWidth;
  };

  const scaleY = (val: number) => {
    const clamped = Math.max(metricConfig.minY, Math.min(metricConfig.maxY, val));
    const ratio = (clamped - metricConfig.minY) / (metricConfig.maxY - metricConfig.minY);
    return height - padding.bottom - ratio * plotHeight;
  };

  // Generate SVG path for a percentile curve
  const generatePath = (key: keyof WHOGrowthPoint) => {
    return filteredWHO
      .map((p, idx) => {
        const x = scaleX(p.month);
        const y = scaleY(p[key] as number);
        return idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  };

  // Generate SVG closed area between two percentiles
  const generateArea = (bottomKey: keyof WHOGrowthPoint, topKey: keyof WHOGrowthPoint) => {
    const forward = filteredWHO.map((p) => `${scaleX(p.month)},${scaleY(p[topKey] as number)}`);
    const backward = [...filteredWHO]
      .reverse()
      .map((p) => `${scaleX(p.month)},${scaleY(p[bottomKey] as number)}`);
    return `M ${forward.join(' L ')} L ${backward.join(' L ')} Z`;
  };

  // Generate path for baby actual measurements
  const babyPath = useMemo(() => {
    if (sortedRecords.length === 0) return '';
    return sortedRecords
      .map((r, idx) => {
        const val = r[selectedMetric];
        const x = scaleX(r.ageMonths);
        const y = scaleY(val);
        return idx === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  }, [sortedRecords, selectedMetric]);

  const latestVal = latestRecord ? latestRecord[selectedMetric] : null;
  const latestPct = latestRecord
    ? calculatePercentile(latestRecord[selectedMetric], latestRecord.ageMonths, selectedMetric, selectedGender)
    : null;
  const latestInterp = latestPct !== null ? getPercentileInterpretation(latestPct) : null;

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Control Panel */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8C8475] block mb-1">
            WHO Child Growth Standards (0-24 Months)
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2A2723]">
            世界衛生組織 兒童生長曲線追蹤
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6457] mt-1 font-sans">
            對照 WHO 官方標準發育百分位常模（P3、P15、P50、P85、P97），即時掌握成長發育軌跡
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Gender Standard Toggle */}
          <div className="flex items-center bg-[#F2EDE4] p-1 rounded-full text-xs font-sans uppercase tracking-wider border border-[#EBE7DF]">
            <button
              onClick={() => setSelectedGender('female')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                selectedGender === 'female'
                  ? 'bg-[#2A2723] text-[#F9F6F0] shadow-xs font-bold'
                  : 'text-[#6B6457] hover:text-[#2A2723]'
              }`}
            >
              🌸 女寶常模
            </button>
            <button
              onClick={() => setSelectedGender('male')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                selectedGender === 'male'
                  ? 'bg-[#2A2723] text-[#F9F6F0] shadow-xs font-bold'
                  : 'text-[#6B6457] hover:text-[#2A2723]'
              }`}
            >
              ⭐ 男寶常模
            </button>
          </div>

          {/* Add Measurement Button */}
          <button
            id="add-growth-record-btn"
            onClick={onAddRecord}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider bg-[#2A2723] text-[#F9F6F0] hover:bg-[#3D3833] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>記錄新數據</span>
          </button>
        </div>
      </div>

      {/* Metric Tabs Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['weight', 'length', 'headCirc'] as MetricType[]).map((metric) => {
          const isSelected = selectedMetric === metric;
          const config = {
            weight: { title: '體重 (Weight)', desc: 'Weight-for-age', tint: 'bg-[#F9F6F0]' },
            length: { title: '身長 (Length)', desc: 'Length-for-age', tint: 'bg-[#E6EBE6]' },
            headCirc: { title: '頭圍 (Head Circumference)', desc: 'Head-circ-for-age', tint: 'bg-[#E6E9F2]' },
          }[metric];

          const currentVal = latestRecord ? latestRecord[metric] : null;
          const currentUnit = metric === 'weight' ? 'kg' : 'cm';
          const pct = currentVal && latestRecord
            ? calculatePercentile(currentVal, latestRecord.ageMonths, metric, selectedGender)
            : null;

          return (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`text-left p-5 rounded-[28px] border transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723] shadow-md scale-[1.01]'
                  : 'bg-white text-[#2A2723] border-[#EBE7DF] hover:border-[#D1CEC4] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-sans uppercase tracking-widest ${isSelected ? 'text-[#A69D8D]' : 'text-[#8C8475]'}`}>
                  {config.desc}
                </span>
                {pct !== null && (
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#4A453E] text-[#D9D1C2]' : 'bg-[#F2EDE4] text-[#2A2723]'
                  }`}>
                    WHO P{pct}
                  </span>
                )}
              </div>

              <div className="text-lg font-serif font-bold mb-1">
                {config.title}
              </div>

              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl sm:text-3xl font-serif font-bold tracking-tight font-mono">
                  {currentVal !== null ? currentVal : '--'}
                </span>
                <span className={`text-xs font-sans ${isSelected ? 'text-[#D9D1C2]' : 'text-[#8C8475]'}`}>
                  {currentUnit}
                </span>
                {latestRecord && (
                  <span className={`text-[11px] font-mono ml-auto ${isSelected ? 'text-[#A69D8D]' : 'text-[#8C8475]'}`}>
                    {latestRecord.date}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main SVG Interactive WHO Growth Chart Canvas */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs">
        
        {/* Chart Header & Percentile Legend */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#F2EDE4]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#F2EDE4] flex items-center justify-center text-[#2A2723]">
              <metricConfig.icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2A2723]">
                {metricConfig.label}
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                實線為標準 P50 中位線，淡色區間為 P15~P85 與 P3~P97 正常發育範圍
              </p>
            </div>
          </div>

          {/* Artistic Percentile Legend */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs font-sans text-[#6B6457]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2A2723]" />
              <span className="font-bold text-[#2A2723]">寶寶實測點</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#2A2723]" />
              <span>50% 中位數</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#D9D1C2]/60 border border-[#B8AC98]" />
              <span>15% ~ 85% 核心區間</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#EBE7DF]/60 border border-[#D1CEC4]" />
              <span>3% ~ 97% 正常邊界</span>
            </div>
          </div>
        </div>

        {/* Scalable SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[650px] font-sans select-none"
          >
            <defs>
              <linearGradient id="p3p97ArtGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EBE7DF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F9F6F0" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="p15p85ArtGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9D1C2" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#EBE7DF" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines (Horizontal Y-Axis) */}
            {Array.from({ length: Math.floor((metricConfig.maxY - metricConfig.minY) / metricConfig.stepY) + 1 }).map((_, i) => {
              const yVal = metricConfig.minY + i * metricConfig.stepY;
              const y = scaleY(yVal);
              return (
                <g key={yVal}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#F2EDE4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-[#8C8475]"
                  >
                    {yVal}
                  </text>
                </g>
              );
            })}

            {/* Background Grid Lines (Vertical X-Axis / Months) */}
            {Array.from({ length: 13 }).map((_, i) => {
              const month = i * 2; // 0, 2, 4, 6... 24
              const x = scaleX(month);
              return (
                <g key={month}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="#F2EDE4"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-[11px] font-mono fill-[#8C8475]"
                  >
                    {month}m
                  </text>
                </g>
              );
            })}

            {/* Axis Labels */}
            <text
              x={width / 2}
              y={height - 10}
              textAnchor="middle"
              className="text-[11px] fill-[#8C8475] font-sans uppercase tracking-widest"
            >
              年齡 / 月齡 (Months)
            </text>
            <text
              x={20}
              y={padding.top - 10}
              textAnchor="start"
              className="text-[11px] fill-[#8C8475] font-sans uppercase tracking-widest"
            >
              {metricConfig.unit}
            </text>

            {/* WHO Percentile Envelope Bands (P3 ~ P97) */}
            <path d={generateArea('p3', 'p97')} fill="url(#p3p97ArtGradient)" />
            {/* WHO Percentile Envelope Bands (P15 ~ P85) */}
            <path d={generateArea('p15', 'p85')} fill="url(#p15p85ArtGradient)" />

            {/* Percentile Stroke Lines */}
            <path d={generatePath('p97')} fill="none" stroke="#D1CEC4" strokeWidth="1" strokeDasharray="3 3" />
            <path d={generatePath('p85')} fill="none" stroke="#B8AC98" strokeWidth="1.2" />
            <path d={generatePath('p50')} fill="none" stroke="#2A2723" strokeWidth="1.8" />
            <path d={generatePath('p15')} fill="none" stroke="#B8AC98" strokeWidth="1.2" />
            <path d={generatePath('p3')} fill="none" stroke="#D1CEC4" strokeWidth="1" strokeDasharray="3 3" />

            {/* Line Labels at the right edge of curves */}
            {filteredWHO.length > 0 && (() => {
              const last = filteredWHO[filteredWHO.length - 1];
              const xPos = scaleX(last.month) + 6;
              return (
                <g className="text-[9px] font-mono fill-[#8C8475]">
                  <text x={xPos} y={scaleY(last.p97) + 3}>97%</text>
                  <text x={xPos} y={scaleY(last.p85) + 3}>85%</text>
                  <text x={xPos} y={scaleY(last.p50) + 3} fill="#2A2723" fontWeight="bold">50%</text>
                  <text x={xPos} y={scaleY(last.p15) + 3}>15%</text>
                  <text x={xPos} y={scaleY(last.p3) + 3}>3%</text>
                </g>
              );
            })()}

            {/* Baby Trajectory Line (Deep Charcoal Artistic Stroke) */}
            {babyPath && (
              <path
                d={babyPath}
                fill="none"
                stroke="#2A2723"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Baby Trajectory Points */}
            {sortedRecords.map((record) => {
              const val = record[selectedMetric];
              const cx = scaleX(record.ageMonths);
              const cy = scaleY(val);
              const isHovered = hoveredPoint?.id === record.id;

              return (
                <g 
                  key={record.id} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(record)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setHoveredPoint(record)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 8 : 5.5}
                    fill="#2A2723"
                    stroke="#F9F6F0"
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />
                  {/* Point Label */}
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    className="text-[11px] font-mono font-bold fill-[#2A2723]"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected / Hovered Point Detail Callout */}
        {hoveredPoint && (
          <div className="mt-6 p-5 bg-[#F2EDE4] border border-[#D9D1C2] rounded-[24px] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center font-mono font-bold text-sm">
                P{calculatePercentile(hoveredPoint[selectedMetric], hoveredPoint.ageMonths, selectedMetric, selectedGender)}
              </div>
              <div>
                <div className="text-base font-serif font-bold text-[#2A2723]">
                  {hoveredPoint.date} (滿 {hoveredPoint.ageMonths} 個月 / 出生 {hoveredPoint.ageDays} 天)
                </div>
                <div className="text-xs text-[#6B6457] flex items-center gap-3 mt-1 font-sans">
                  <span>實測值：<strong className="font-mono text-[#2A2723]">{hoveredPoint[selectedMetric]} {metricConfig.unit}</strong></span>
                  <span>測量人：{hoveredPoint.measuredBy || '家長'}</span>
                  {hoveredPoint.doctorNote && <span>備註：{hoveredPoint.doctorNote}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={() => setHoveredPoint(null)}
              className="text-xs font-sans uppercase tracking-wider text-[#8C8475] hover:text-[#2A2723] px-3 py-1.5 rounded-full border border-[#D1CEC4]"
            >
              關閉
            </button>
          </div>
        )}

        {/* Pediatric Status Interpretation Box */}
        {latestRecord && latestInterp && (
          <div className="mt-6 p-6 rounded-[28px] bg-[#F9F6F0] border border-[#EBE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#2A2723] text-[#F9F6F0] mt-0.5 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-serif font-bold text-[#2A2723]">
                    最新測量評估 ({latestRecord.date}):
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-[#D9D1C2] text-[#2A2723]">
                    百分位 {latestInterp.zone} (P{latestPct})
                  </span>
                </div>
                <p className="text-xs text-[#6B6457] mt-1.5 font-sans leading-relaxed">
                  {latestInterp.description}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Historical Measurements Table */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EBE7DF]">
          <h3 className="text-xl font-serif font-bold text-[#2A2723] flex items-center gap-2">
            <span>歷史生長數據清單</span>
            <span className="text-xs font-mono text-[#8C8475]">({sortedRecords.length} 筆)</span>
          </h3>
          <button
            onClick={onAddRecord}
            className="text-xs font-sans uppercase tracking-wider text-[#2A2723] hover:text-[#4A453E] flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F2EDE4] border border-[#D9D1C2]"
          >
            <Plus className="w-3.5 h-3.5" />
            新增記錄
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#EBE7DF] text-[#8C8475] font-sans uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">測量日期</th>
                <th className="pb-3 px-3">月齡 / 天數</th>
                <th className="pb-3 px-3">體重 (kg)</th>
                <th className="pb-3 px-3">身長 (cm)</th>
                <th className="pb-3 px-3">頭圍 (cm)</th>
                <th className="pb-3 px-3">BMI</th>
                <th className="pb-3 px-3">備註與測量人</th>
                <th className="pb-3 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8C8475] font-sans">
                    <p className="text-sm">尚無生長測量數據</p>
                    <p className="text-xs text-[#A69D8D] mt-1">點擊右上角「新增記錄」開始追蹤寶寶的身長、體重與頭圍生長曲線</p>
                  </td>
                </tr>
              ) : (
                sortedRecords.map((r) => {
                const pWeight = calculatePercentile(r.weight, r.ageMonths, 'weight', selectedGender);
                const pLength = calculatePercentile(r.length, r.ageMonths, 'length', selectedGender);
                const pHead = calculatePercentile(r.headCirc, r.ageMonths, 'headCirc', selectedGender);

                return (
                  <tr key={r.id} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="py-4 px-3 font-mono font-medium text-[#2A2723]">
                      {r.date}
                    </td>
                    <td className="py-4 px-3 text-[#6B6457] font-sans">
                      {r.ageMonths} 個月 ({r.ageDays} 天)
                    </td>
                    <td className="py-4 px-3 font-mono text-[#2A2723]">
                      {r.weight}
                      <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F2EDE4] text-[#2A2723] font-bold">
                        P{pWeight}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-[#2A2723]">
                      {r.length}
                      <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E6EBE6] text-[#3E4A3E] font-bold">
                        P{pLength}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-[#2A2723]">
                      {r.headCirc}
                      <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E6E9F2] text-[#3A4050] font-bold">
                        P{pHead}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-[#6B6457] font-mono">
                      {r.bmi || '--'}
                    </td>
                    <td className="py-4 px-3 text-[#8C8475] max-w-xs truncate font-sans">
                      {r.doctorNote || (r.measuredBy ? `由 ${r.measuredBy} 記錄` : '居家測量')}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => onDeleteRecord(r.id)}
                        className="p-1.5 text-[#D1CEC4] hover:text-[#C4685D] rounded-full hover:bg-[#F2E6E6] transition-colors"
                        title="刪除此筆記錄"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
