// WHO Child Growth Standards (0 - 36 months)
// Source: World Health Organization (WHO) Child Growth Standards
// Percentiles: P3, P15, P50, P85, P97

export interface WHOGrowthPoint {
  month: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export interface WHOGrowthStandard {
  weight: WHOGrowthPoint[]; // in kg
  length: WHOGrowthPoint[]; // in cm
  headCirc: WHOGrowthPoint[]; // in cm
}

// BOYS WHO STANDARDS (0 - 36 Months)
export const WHO_BOYS_GROWTH: WHOGrowthStandard = {
  weight: [
    { month: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
    { month: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8 },
    { month: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.1 },
    { month: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
    { month: 4, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.8, p97: 8.7 },
    { month: 5, p3: 6.0, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.3 },
    { month: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
    { month: 7, p3: 6.7, p15: 7.4, p50: 8.3, p85: 9.2, p97: 10.3 },
    { month: 8, p3: 6.9, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.7 },
    { month: 9, p3: 7.1, p15: 7.9, p50: 8.9, p85: 9.9, p97: 11.0 },
    { month: 10, p3: 7.4, p15: 8.2, p50: 9.2, p85: 10.2, p97: 11.4 },
    { month: 11, p3: 7.6, p15: 8.4, p50: 9.4, p85: 10.5, p97: 11.7 },
    { month: 12, p3: 7.7, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
    { month: 15, p3: 8.3, p15: 9.2, p50: 10.3, p85: 11.5, p97: 12.8 },
    { month: 18, p3: 8.8, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.7 },
    { month: 21, p3: 9.2, p15: 10.2, p50: 11.5, p85: 12.9, p97: 14.5 },
    { month: 24, p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 },
    { month: 30, p3: 10.5, p15: 11.8, p50: 13.3, p85: 15.0, p97: 16.9 },
    { month: 36, p3: 11.3, p15: 12.7, p50: 14.3, p85: 16.2, p97: 18.3 },
  ],
  length: [
    { month: 0, p3: 46.1, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.7 },
    { month: 1, p3: 50.8, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.6 },
    { month: 2, p3: 54.4, p15: 56.4, p50: 58.4, p85: 60.4, p97: 62.4 },
    { month: 3, p3: 57.3, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.5 },
    { month: 4, p3: 59.7, p15: 61.8, p50: 63.9, p85: 66.0, p97: 68.0 },
    { month: 5, p3: 61.7, p15: 63.8, p50: 65.9, p85: 68.0, p97: 70.1 },
    { month: 6, p3: 63.3, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.9 },
    { month: 7, p3: 64.8, p15: 67.0, p50: 69.2, p85: 71.3, p97: 73.5 },
    { month: 8, p3: 66.2, p15: 68.4, p50: 70.6, p85: 72.8, p97: 75.0 },
    { month: 9, p3: 67.5, p15: 69.7, p50: 72.0, p85: 74.2, p97: 76.5 },
    { month: 10, p3: 68.7, p15: 71.0, p50: 73.3, p85: 75.6, p97: 77.9 },
    { month: 11, p3: 69.9, p15: 72.2, p50: 74.5, p85: 76.9, p97: 79.2 },
    { month: 12, p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
    { month: 15, p3: 74.1, p15: 76.6, p50: 79.1, p85: 81.7, p97: 84.2 },
    { month: 18, p3: 76.9, p15: 79.6, p50: 82.3, p85: 85.0, p97: 87.7 },
    { month: 21, p3: 79.4, p15: 82.2, p50: 85.1, p85: 88.0, p97: 90.9 },
    { month: 24, p3: 81.7, p15: 84.6, p50: 87.8, p85: 90.9, p97: 93.9 },
    { month: 30, p3: 86.0, p15: 89.2, p50: 92.4, p85: 95.9, p97: 99.3 },
    { month: 36, p3: 89.9, p15: 93.3, p50: 96.1, p85: 100.0, p97: 103.8 },
  ],
  headCirc: [
    { month: 0, p3: 32.1, p15: 33.3, p50: 34.5, p85: 35.7, p97: 36.9 },
    { month: 1, p3: 35.1, p15: 36.3, p50: 37.3, p85: 38.6, p97: 39.5 },
    { month: 2, p3: 36.9, p15: 38.0, p50: 39.1, p85: 40.3, p97: 41.3 },
    { month: 3, p3: 38.3, p15: 39.4, p50: 40.5, p85: 41.6, p97: 42.7 },
    { month: 4, p3: 39.4, p15: 40.5, p50: 41.6, p85: 42.8, p97: 43.8 },
    { month: 5, p3: 40.3, p15: 41.4, p50: 42.6, p85: 43.7, p97: 44.8 },
    { month: 6, p3: 41.0, p15: 42.2, p50: 43.3, p85: 44.5, p97: 45.6 },
    { month: 7, p3: 41.7, p15: 42.8, p50: 44.0, p85: 45.1, p97: 46.2 },
    { month: 8, p3: 42.2, p15: 43.3, p50: 44.5, p85: 45.7, p97: 46.8 },
    { month: 9, p3: 42.6, p15: 43.8, p50: 45.0, p85: 46.2, p97: 47.3 },
    { month: 10, p3: 43.0, p15: 44.2, p50: 45.4, p85: 46.6, p97: 47.8 },
    { month: 11, p3: 43.4, p15: 44.6, p50: 45.8, p85: 47.0, p97: 48.2 },
    { month: 12, p3: 43.7, p15: 44.9, p50: 46.1, p85: 47.3, p97: 48.5 },
    { month: 15, p3: 44.4, p15: 45.6, p50: 46.8, p85: 48.1, p97: 49.3 },
    { month: 18, p3: 45.0, p15: 46.2, p50: 47.4, p85: 48.7, p97: 49.9 },
    { month: 21, p3: 45.5, p15: 46.7, p50: 48.0, p85: 49.2, p97: 50.4 },
    { month: 24, p3: 46.0, p15: 47.2, p50: 48.4, p85: 49.7, p97: 51.0 },
    { month: 30, p3: 46.8, p15: 48.0, p50: 49.2, p85: 50.6, p97: 51.9 },
    { month: 36, p3: 47.4, p15: 48.6, p50: 49.8, p85: 51.2, p97: 52.6 },
  ],
};

// GIRLS WHO STANDARDS (0 - 36 Months)
export const WHO_GIRLS_GROWTH: WHOGrowthStandard = {
  weight: [
    { month: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
    { month: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5 },
    { month: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.6 },
    { month: 3, p3: 4.5, p15: 5.2, p50: 5.8, p85: 6.6, p97: 7.5 },
    { month: 4, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.3, p97: 8.2 },
    { month: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8 },
    { month: 6, p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.3 },
    { month: 7, p3: 6.0, p15: 6.8, p50: 7.6, p85: 8.6, p97: 9.8 },
    { month: 8, p3: 6.3, p15: 7.0, p50: 7.9, p85: 9.0, p97: 10.2 },
    { month: 9, p3: 6.5, p15: 7.3, p50: 8.2, p85: 9.3, p97: 10.5 },
    { month: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.6, p97: 10.9 },
    { month: 11, p3: 6.9, p15: 7.7, p50: 8.7, p85: 9.9, p97: 11.2 },
    { month: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.5 },
    { month: 15, p3: 7.6, p15: 8.5, p50: 9.6, p85: 10.8, p97: 12.3 },
    { month: 18, p3: 8.1, p15: 9.1, p50: 10.2, p85: 11.5, p97: 13.2 },
    { month: 21, p3: 8.6, p15: 9.6, p50: 10.9, p85: 12.3, p97: 14.0 },
    { month: 24, p3: 9.0, p15: 10.1, p50: 11.5, p85: 13.0, p97: 14.8 },
    { month: 30, p3: 10.0, p15: 11.2, p50: 12.7, p85: 14.4, p97: 16.5 },
    { month: 36, p3: 10.8, p15: 12.2, p50: 13.9, p85: 15.8, p97: 18.0 },
  ],
  length: [
    { month: 0, p3: 45.4, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.9 },
    { month: 1, p3: 49.8, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.6 },
    { month: 2, p3: 53.0, p15: 55.0, p50: 57.1, p85: 59.1, p97: 61.1 },
    { month: 3, p3: 55.6, p15: 57.7, p50: 59.8, p85: 61.9, p97: 64.0 },
    { month: 4, p3: 57.8, p15: 59.9, p50: 62.1, p85: 64.3, p97: 66.4 },
    { month: 5, p3: 59.6, p15: 61.8, p50: 64.0, p85: 66.2, p97: 68.5 },
    { month: 6, p3: 61.2, p15: 63.5, p50: 65.7, p85: 68.0, p97: 70.3 },
    { month: 7, p3: 62.7, p15: 65.0, p50: 67.3, p85: 69.6, p97: 71.9 },
    { month: 8, p3: 64.0, p15: 66.4, p50: 68.7, p85: 71.1, p97: 73.5 },
    { month: 9, p3: 65.3, p15: 67.7, p50: 70.1, p85: 72.6, p97: 75.0 },
    { month: 10, p3: 66.5, p15: 69.0, p50: 71.5, p85: 73.9, p97: 76.4 },
    { month: 11, p3: 67.7, p15: 70.3, p50: 72.8, p85: 75.3, p97: 77.8 },
    { month: 12, p3: 68.9, p15: 71.4, p50: 74.0, p85: 76.6, p97: 79.2 },
    { month: 15, p3: 72.0, p15: 74.7, p50: 77.5, p85: 80.2, p97: 83.0 },
    { month: 18, p3: 74.9, p15: 77.7, p50: 80.7, p85: 83.6, p97: 86.5 },
    { month: 21, p3: 77.5, p15: 80.4, p50: 83.6, p85: 86.6, p97: 89.8 },
    { month: 24, p3: 80.0, p15: 82.9, p50: 86.4, p85: 89.6, p97: 92.9 },
    { month: 30, p3: 84.4, p15: 87.7, p50: 91.2, p85: 94.7, p97: 98.3 },
    { month: 36, p3: 88.4, p15: 91.9, p50: 95.1, p85: 98.9, p97: 102.7 },
  ],
  headCirc: [
    { month: 0, p3: 31.5, p15: 32.7, p50: 33.9, p85: 35.1, p97: 36.2 },
    { month: 1, p3: 34.2, p15: 35.4, p50: 36.5, p85: 37.7, p97: 38.8 },
    { month: 2, p3: 35.8, p15: 37.0, p50: 38.3, p85: 39.5, p97: 40.5 },
    { month: 3, p3: 37.1, p15: 38.3, p50: 39.5, p85: 40.7, p97: 41.9 },
    { month: 4, p3: 38.2, p15: 39.3, p50: 40.6, p85: 41.8, p97: 42.9 },
    { month: 5, p3: 39.0, p15: 40.2, p50: 41.5, p85: 42.7, p97: 43.8 },
    { month: 6, p3: 39.7, p15: 40.9, p50: 42.2, p85: 43.4, p97: 44.6 },
    { month: 7, p3: 40.4, p15: 41.5, p50: 42.8, p85: 44.1, p97: 45.3 },
    { month: 8, p3: 40.9, p15: 42.0, p50: 43.4, p85: 44.7, p97: 45.9 },
    { month: 9, p3: 41.3, p15: 42.5, p50: 43.8, p85: 45.2, p97: 46.4 },
    { month: 10, p3: 41.7, p15: 42.9, p50: 44.2, p85: 45.6, p97: 46.8 },
    { month: 11, p3: 42.0, p15: 43.3, p50: 44.6, p85: 46.0, p97: 47.2 },
    { month: 12, p3: 42.4, p15: 43.6, p50: 44.9, p85: 46.3, p97: 47.6 },
    { month: 15, p3: 43.1, p15: 44.3, p50: 45.6, p85: 47.1, p97: 48.3 },
    { month: 18, p3: 43.7, p15: 45.0, p50: 46.2, p85: 47.7, p97: 49.0 },
    { month: 21, p3: 44.3, p15: 45.5, p50: 46.8, p85: 48.3, p97: 49.6 },
    { month: 24, p3: 44.8, p15: 46.0, p50: 47.2, p85: 48.8, p97: 50.1 },
    { month: 30, p3: 45.6, p15: 46.9, p50: 48.1, p85: 49.7, p97: 51.0 },
    { month: 36, p3: 46.3, p15: 47.5, p50: 48.7, p85: 50.4, p97: 51.8 },
  ],
};

// Interpolation function to get exact reference values at any floating month
export function getInterpolatedWHOPoints(
  data: WHOGrowthPoint[],
  month: number
): { p3: number; p15: number; p50: number; p85: number; p97: number } {
  if (month <= data[0].month) return data[0];
  if (month >= data[data.length - 1].month) return data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    const p1 = data[i];
    const p2 = data[i + 1];
    if (month >= p1.month && month <= p2.month) {
      const ratio = (month - p1.month) / (p2.month - p1.month);
      return {
        p3: +(p1.p3 + (p2.p3 - p1.p3) * ratio).toFixed(2),
        p15: +(p1.p15 + (p2.p15 - p1.p15) * ratio).toFixed(2),
        p50: +(p1.p50 + (p2.p50 - p1.p50) * ratio).toFixed(2),
        p85: +(p1.p85 + (p2.p85 - p1.p85) * ratio).toFixed(2),
        p97: +(p1.p97 + (p2.p97 - p1.p97) * ratio).toFixed(2),
      };
    }
  }
  return data[0];
}

// Calculate approximate percentile (0 - 100) based on measured value vs WHO curves
export function calculatePercentile(
  value: number,
  month: number,
  type: 'weight' | 'length' | 'headCirc',
  gender: 'male' | 'female'
): number {
  const dataset = (gender === 'female' ? WHO_GIRLS_GROWTH : WHO_BOYS_GROWTH)[type];
  const ref = getInterpolatedWHOPoints(dataset, month);

  if (value <= ref.p3) {
    const pct = Math.max(1, Math.round(3 * (value / ref.p3)));
    return pct;
  }
  if (value <= ref.p15) {
    const t = (value - ref.p3) / (ref.p15 - ref.p3);
    return Math.round(3 + t * 12);
  }
  if (value <= ref.p50) {
    const t = (value - ref.p15) / (ref.p50 - ref.p15);
    return Math.round(15 + t * 35);
  }
  if (value <= ref.p85) {
    const t = (value - ref.p50) / (ref.p85 - ref.p50);
    return Math.round(50 + t * 35);
  }
  if (value <= ref.p97) {
    const t紧 = (value - ref.p85) / (ref.p97 - ref.p85);
    return Math.round(85 + t紧 * 12);
  }
  // Above P97
  return Math.min(99, Math.round(97 + (value - ref.p97) * 2));
}

// Describe percentile zone in human friendly pediatric terms
export function getPercentileInterpretation(percentile: number): {
  zone: string;
  color: string;
  badgeClass: string;
  description: string;
} {
  if (percentile < 3) {
    return {
      zone: '小於 3%',
      color: '#E11D48',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      description: '生長落後於同齡標準，建議與小兒科醫師討論餵食與吸收狀況。',
    };
  }
  if (percentile <= 15) {
    return {
      zone: '3% ~ 15%',
      color: '#D97706',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      description: '偏瘦小但仍屬常態範圍，請持續留意奶量與體重漸進趨勢。',
    };
  }
  if (percentile <= 85) {
    return {
      zone: '15% ~ 85%',
      color: '#059669',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: '生長曲線標準平穩，各項發育良好，維持規律飲食與睡眠即可！',
    };
  }
  if (percentile <= 97) {
    return {
      zone: '85% ~ 97%',
      color: '#2563EB',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      description: '體格發育健壯優良，生長速度充足。',
    };
  }
  return {
    zone: '大於 97%',
    color: '#7C3AED',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    description: '生長指標高於平均，若身高體重同步發育通常為健康大寶寶，請配合健檢諮詢醫師。',
  };
}
