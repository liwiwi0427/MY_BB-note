import type { DiaryEntry } from '../types';

export interface DailyIOSummary {
  date: string;
  totalMilkMl: number;
  breastFeedDurationMinutes: number;
  wetDiapersCount: number;
  dirtyDiapersCount: number;
  bothDiapersCount: number;
  totalSleepMinutes: number;
  highestTemp?: number;
  tempMeasurementsCount: number;
}

export function calculateDailyIO(entries: DiaryEntry[], targetDateStr?: string): DailyIOSummary {
  const targetDate = targetDateStr || new Date().toISOString().split('T')[0];

  const todayEntries = entries.filter((e) => {
    return e.timestamp.startsWith(targetDate);
  });

  let totalMilkMl = 0;
  let breastFeedDurationMinutes = 0;
  let wetDiapersCount = 0;
  let dirtyDiapersCount = 0;
  let bothDiapersCount = 0;
  let totalSleepMinutes = 0;
  let highestTemp: number | undefined = undefined;
  let tempMeasurementsCount = 0;

  for (const entry of todayEntries) {
    if (entry.type === 'feed_bottle' && entry.amountMl) {
      totalMilkMl += Number(entry.amountMl);
    } else if (entry.type === 'feed_breast' && entry.durationMinutes) {
      breastFeedDurationMinutes += Number(entry.durationMinutes);
    } else if (entry.type === 'feed_solid' && entry.amountMl) {
      totalMilkMl += Number(entry.amountMl);
    } else if (entry.type === 'diaper_wet') {
      wetDiapersCount += 1;
    } else if (entry.type === 'diaper_dirty') {
      dirtyDiapersCount += 1;
    } else if (entry.type === 'diaper_both') {
      bothDiapersCount += 1;
    } else if (entry.type === 'sleep' && entry.durationMinutes) {
      totalSleepMinutes += Number(entry.durationMinutes);
    } else if (entry.type === 'temperature' && entry.temperatureCelsius) {
      tempMeasurementsCount += 1;
      const t = Number(entry.temperatureCelsius);
      if (highestTemp === undefined || t > highestTemp) {
        highestTemp = t;
      }
    }
  }

  return {
    date: targetDate,
    totalMilkMl,
    breastFeedDurationMinutes,
    wetDiapersCount,
    dirtyDiapersCount,
    bothDiapersCount,
    totalSleepMinutes,
    highestTemp,
    tempMeasurementsCount,
  };
}
