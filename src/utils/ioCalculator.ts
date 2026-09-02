import { DiaryEntry } from '../types';

export interface DailyIOSummary {
  date: string;
  totalIntakeMl: number;
  totalUrineMl: number;
  totalVomitMl: number;
  totalOutputMl: number;
  netFluidBalanceMl: number; // Intake - Output
  targetIntakeMinMl: number;
  targetIntakeMaxMl: number;
  intakePercentage: number;
  urineHourlyRate: number; // ml / kg / hr
  totalDiaperCount: number;
  heavyDiaperCount: number;
  stoolCount: number;
  vomitCount: number;
  feedingsCount: number;
  hydrationStatus: 'optimal' | 'adequate' | 'warning' | 'alert';
  hydrationStatusLabel: string;
  hydrationStatusColor: string;
  timeBlocks: {
    nightDawn: { label: string; intake: number; output: number; count: number };
    morning: { label: string; intake: number; output: number; count: number };
    afternoon: { label: string; intake: number; output: number; count: number };
    evening: { label: string; intake: number; output: number; count: number };
  };
  intakeBreakdown: {
    breastMilkMl: number;
    formulaMilkMl: number;
    waterMl: number;
    solidFoodMl: number;
  };
}

/**
 * Estimate urine volume from wetness level or diaper type
 */
export function estimateUrineMl(level?: string, diaperType?: string, directUrineMl?: number): number {
  if (typeof directUrineMl === 'number' && directUrineMl > 0) return directUrineMl;
  if (level === 'light') return 30;
  if (level === 'medium') return 60;
  if (level === 'heavy') return 100;
  if (diaperType === 'wet' || diaperType === 'both') return 60;
  return 0;
}

/**
 * Estimate vomit/spit-up volume
 */
export function estimateVomitMl(severity?: string, directVomitMl?: number): number {
  if (typeof directVomitMl === 'number' && directVomitMl > 0) return directVomitMl;
  if (severity === 'spit_up') return 15;
  if (severity === 'moderate') return 40;
  if (severity === 'projectile') return 80;
  return 0;
}

/**
 * Calculate full 24-Hour Total I/O for a given date
 */
export function calculateDailyIO(
  entries: DiaryEntry[],
  targetDateStr: string,
  babyWeightKg: number = 4.5
): DailyIOSummary {
  const dayEntries = entries.filter((e) => e.date === targetDateStr);
  const weight = Math.max(1.5, Math.min(25, babyWeightKg || 4.5));

  let totalIntakeMl = 0;
  let totalUrineMl = 0;
  let totalVomitMl = 0;
  let totalDiaperCount = 0;
  let heavyDiaperCount = 0;
  let stoolCount = 0;
  let vomitCount = 0;
  let feedingsCount = 0;

  let breastMilkMl = 0;
  let formulaMilkMl = 0;
  let waterMl = 0;
  let solidFoodMl = 0;

  const timeBlocks = {
    nightDawn: { label: '夜間清晨 (00:00-06:00)', intake: 0, output: 0, count: 0 },
    morning: { label: '上午時段 (06:00-12:00)', intake: 0, output: 0, count: 0 },
    afternoon: { label: '下午時段 (12:00-18:00)', intake: 0, output: 0, count: 0 },
    evening: { label: '晚間時段 (18:00-24:00)', intake: 0, output: 0, count: 0 },
  };

  const getTimeBlockKey = (timeStr: string): keyof typeof timeBlocks => {
    const hour = parseInt((timeStr || '12:00').split(':')[0], 10) || 12;
    if (hour < 6) return 'nightDawn';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  dayEntries.forEach((entry) => {
    const blockKey = getTimeBlockKey(entry.time);
    let entryIntake = 0;
    let entryOutput = 0;

    // Intake calculation
    if (entry.category === 'feeding' || entry.category === 'io' || entry.metrics?.feedingAmountMl || entry.metrics?.waterAmountMl) {
      const feedingMl = entry.metrics?.feedingAmountMl || 0;
      const duration = entry.metrics?.feedingDurationMins || 0;
      const water = entry.metrics?.waterAmountMl || 0;
      const type = entry.metrics?.feedingType;

      let calculatedFeeding = feedingMl;
      // If direct breastfeeding without ml, estimate roughly 3.5ml / min
      if (type === 'breast' && calculatedFeeding === 0 && duration > 0) {
        calculatedFeeding = Math.round(duration * 3.5);
      }

      if (type === 'formula') formulaMilkMl += calculatedFeeding;
      else if (type === 'breast') breastMilkMl += calculatedFeeding;
      else if (type === 'solid') solidFoodMl += calculatedFeeding;
      else formulaMilkMl += calculatedFeeding;

      waterMl += water;
      entryIntake += calculatedFeeding + water;
      if (calculatedFeeding > 0 || duration > 0) feedingsCount += 1;
    }

    // Output calculation
    if (entry.category === 'diaper' || entry.category === 'io' || entry.metrics?.diaperType || entry.metrics?.vomitSeverity || entry.metrics?.vomitMl) {
      const diaperType = entry.metrics?.diaperType;
      const wetness = entry.metrics?.diaperWetnessLevel;
      const urineMl = estimateUrineMl(wetness, diaperType, entry.metrics?.urineAmountMl);
      const vomitMl = estimateVomitMl(entry.metrics?.vomitSeverity, entry.metrics?.vomitMl);

      if (diaperType === 'wet' || diaperType === 'both' || (urineMl > 0 && diaperType !== 'clean')) {
        totalUrineMl += urineMl;
        totalDiaperCount += 1;
        if (wetness === 'heavy' || wetness === 'medium' || urineMl >= 50) {
          heavyDiaperCount += 1;
        }
      }

      if (diaperType === 'dirty' || diaperType === 'both' || entry.metrics?.stoolConsistency) {
        stoolCount += 1;
        if (diaperType === 'dirty') totalDiaperCount += 1;
      }

      if (vomitMl > 0 || entry.metrics?.vomitSeverity) {
        totalVomitMl += vomitMl;
        vomitCount += 1;
      }

      entryOutput += urineMl + vomitMl;
    }

    totalIntakeMl += entryIntake;
    timeBlocks[blockKey].intake += entryIntake;
    timeBlocks[blockKey].output += entryOutput;
    timeBlocks[blockKey].count += 1;
  });

  const totalOutputMl = totalUrineMl + totalVomitMl;
  const netFluidBalanceMl = totalIntakeMl - totalOutputMl;

  // Daily target requirement (120 ~ 150 ml/kg/day)
  const targetIntakeMinMl = Math.round(weight * 120);
  const targetIntakeMaxMl = Math.round(weight * 150);
  const intakePercentage = Math.min(200, Math.round((totalIntakeMl / (targetIntakeMinMl || 1)) * 100));

  // Urine Hourly Rate: ml / kg / hr
  const urineHourlyRate = parseFloat((totalUrineMl / weight / 24).toFixed(2));

  // Hydration status logic
  let hydrationStatus: 'optimal' | 'adequate' | 'warning' | 'alert' = 'adequate';
  let hydrationStatusLabel = '水分與排泄正常維持';
  let hydrationStatusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (totalIntakeMl >= targetIntakeMinMl && urineHourlyRate >= 1.5 && (heavyDiaperCount >= 5 || totalDiaperCount >= 6)) {
    hydrationStatus = 'optimal';
    hydrationStatusLabel = '水分代謝極佳・充足達標';
    hydrationStatusColor = 'text-emerald-800 bg-emerald-100/70 border-emerald-300';
  } else if (urineHourlyRate >= 1.0 && (heavyDiaperCount >= 4 || totalDiaperCount >= 4)) {
    hydrationStatus = 'adequate';
    hydrationStatusLabel = '水分平衡正常・排尿維持良好';
    hydrationStatusColor = 'text-blue-800 bg-blue-50 border-blue-200';
  } else if (urineHourlyRate >= 0.5 || totalDiaperCount >= 3) {
    hydrationStatus = 'warning';
    hydrationStatusLabel = '尿量偏低・建議加強水分/奶量補充';
    hydrationStatusColor = 'text-amber-800 bg-amber-50 border-amber-300';
  } else {
    hydrationStatus = 'alert';
    hydrationStatusLabel = '排尿量明顯不足 (寡尿)・請注意脫水徵兆';
    hydrationStatusColor = 'text-rose-800 bg-rose-50 border-rose-300';
  }

  return {
    date: targetDateStr,
    totalIntakeMl,
    totalUrineMl,
    totalVomitMl,
    totalOutputMl,
    netFluidBalanceMl,
    targetIntakeMinMl,
    targetIntakeMaxMl,
    intakePercentage,
    urineHourlyRate,
    totalDiaperCount,
    heavyDiaperCount,
    stoolCount,
    vomitCount,
    feedingsCount,
    hydrationStatus,
    hydrationStatusLabel,
    hydrationStatusColor,
    timeBlocks,
    intakeBreakdown: {
      breastMilkMl,
      formulaMilkMl,
      waterMl,
      solidFoodMl,
    },
  };
}
