export interface WhoPoint {
  month: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export interface WhoStandardData {
  weight: WhoPoint[];
  length: WhoPoint[];
  headCirc: WhoPoint[];
}

export const whoBoysData: WhoStandardData = {
  weight: [
    { month: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
    { month: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8 },
    { month: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.1 },
    { month: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
    { month: 4, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.8, p97: 8.7 },
    { month: 5, p3: 6.0, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.3 },
    { month: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
    { month: 8, p3: 7.0, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.5 },
    { month: 10, p3: 7.5, p15: 8.2, p50: 9.2, p85: 10.2, p97: 11.2 },
    { month: 12, p3: 7.8, p15: 8.6, p50: 9.6, p85: 10.8, p97: 11.8 },
    { month: 18, p3: 8.8, p15: 9.7, p50: 10.9, p85: 12.2, p97: 13.5 },
    { month: 24, p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.6, p97: 15.3 },
  ],
  length: [
    { month: 0, p3: 46.3, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.4 },
    { month: 1, p3: 51.1, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.4 },
    { month: 2, p3: 54.7, p15: 56.4, p50: 58.4, p85: 60.4, p97: 62.2 },
    { month: 3, p3: 57.6, p15: 59.4, p50: 61.4, p85: 63.5, p97: 65.3 },
    { month: 4, p3: 60.0, p15: 61.8, p50: 63.9, p85: 66.0, p97: 67.8 },
    { month: 5, p3: 61.9, p15: 63.8, p50: 65.9, p85: 68.0, p97: 69.9 },
    { month: 6, p3: 63.6, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.6 },
    { month: 8, p3: 66.5, p15: 68.5, p50: 70.6, p85: 72.8, p97: 74.7 },
    { month: 10, p3: 69.0, p15: 71.0, p50: 73.3, p85: 75.6, p97: 77.6 },
    { month: 12, p3: 71.0, p15: 73.1, p50: 75.7, p85: 78.1, p97: 80.2 },
    { month: 18, p3: 76.9, p15: 79.2, p50: 82.3, p85: 85.0, p97: 87.7 },
    { month: 24, p3: 81.7, p15: 84.4, p50: 87.8, p85: 90.9, p97: 93.9 },
  ],
  headCirc: [
    { month: 0, p3: 32.1, p15: 33.2, p50: 34.5, p85: 35.7, p97: 36.9 },
    { month: 1, p3: 35.1, p15: 36.1, p50: 37.3, p85: 38.6, p97: 39.7 },
    { month: 2, p3: 37.0, p15: 38.0, p50: 39.3, p85: 40.5, p97: 41.6 },
    { month: 3, p3: 38.3, p15: 39.4, p50: 40.7, p85: 41.9, p97: 43.1 },
    { month: 4, p3: 39.4, p15: 40.5, p50: 41.8, p85: 43.0, p97: 44.1 },
    { month: 5, p3: 40.3, p15: 41.3, p50: 42.6, p85: 43.9, p97: 45.0 },
    { month: 6, p3: 41.0, p15: 42.0, p50: 43.3, p85: 44.6, p97: 45.8 },
    { month: 8, p3: 42.0, p15: 43.1, p50: 44.5, p85: 45.8, p97: 47.0 },
    { month: 10, p3: 42.9, p15: 43.9, p50: 45.3, p85: 46.7, p97: 47.9 },
    { month: 12, p3: 43.5, p15: 44.6, p50: 46.1, p85: 47.5, p97: 48.6 },
    { month: 18, p3: 44.7, p15: 45.8, p50: 47.4, p85: 48.8, p97: 50.0 },
    { month: 24, p3: 45.5, p15: 46.8, p50: 48.3, p85: 49.8, p97: 51.0 },
  ],
};

export const whoGirlsData: WhoStandardData = {
  weight: [
    { month: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
    { month: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.8, p97: 5.5 },
    { month: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.6 },
    { month: 3, p3: 4.5, p15: 5.2, p50: 5.8, p85: 6.6, p97: 7.5 },
    { month: 4, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.3, p97: 8.2 },
    { month: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.8 },
    { month: 6, p3: 5.7, p15: 6.5, p50: 7.3, p85: 8.2, p97: 9.3 },
    { month: 8, p3: 6.3, p15: 7.0, p50: 7.9, p85: 9.0, p97: 10.0 },
    { month: 10, p3: 6.7, p15: 7.5, p50: 8.5, p85: 9.6, p97: 10.7 },
    { month: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.3 },
    { month: 18, p3: 8.1, p15: 9.0, p50: 10.2, p85: 11.6, p97: 13.0 },
    { month: 24, p3: 9.0, p15: 10.1, p50: 11.5, p85: 13.0, p97: 14.8 },
  ],
  length: [
    { month: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
    { month: 1, p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.4 },
    { month: 2, p3: 53.2, p15: 55.0, p50: 57.1, p85: 59.1, p97: 60.9 },
    { month: 3, p3: 55.8, p15: 57.7, p50: 59.8, p85: 61.9, p97: 63.8 },
    { month: 4, p3: 58.0, p15: 59.9, p50: 62.1, p85: 64.3, p97: 66.2 },
    { month: 5, p3: 59.9, p15: 61.8, p50: 64.0, p85: 66.2, p97: 68.2 },
    { month: 6, p3: 61.5, p15: 63.5, p50: 65.7, p85: 68.0, p97: 70.0 },
    { month: 8, p3: 64.3, p15: 66.4, p50: 68.7, p85: 71.0, p97: 73.2 },
    { month: 10, p3: 66.8, p15: 69.0, p50: 71.5, p85: 73.9, p97: 76.1 },
    { month: 12, p3: 68.9, p15: 71.4, p50: 74.0, p85: 76.6, p97: 78.9 },
    { month: 18, p3: 74.9, p15: 77.5, p50: 80.7, p85: 83.6, p97: 86.5 },
    { month: 24, p3: 80.0, p15: 82.9, p50: 86.4, p85: 89.6, p97: 92.9 },
  ],
  headCirc: [
    { month: 0, p3: 31.7, p15: 32.7, p50: 33.9, p85: 35.1, p97: 36.1 },
    { month: 1, p3: 34.3, p15: 35.3, p50: 36.5, p85: 37.6, p97: 38.8 },
    { month: 2, p3: 36.0, p15: 37.0, p50: 38.3, p85: 39.5, p97: 40.6 },
    { month: 3, p3: 37.2, p15: 38.3, p50: 39.5, p85: 40.8, p97: 41.9 },
    { month: 4, p3: 38.3, p15: 39.3, p50: 40.6, p85: 41.9, p97: 43.0 },
    { month: 5, p3: 39.1, p15: 40.2, p50: 41.5, p85: 42.7, p97: 43.8 },
    { month: 6, p3: 39.8, p15: 40.9, p50: 42.2, p85: 43.5, p97: 44.6 },
    { month: 8, p3: 40.9, p15: 41.9, p50: 43.4, p85: 44.7, p97: 45.8 },
    { month: 10, p3: 41.7, p15: 42.8, p50: 44.2, p85: 45.6, p97: 46.8 },
    { month: 12, p3: 42.4, p15: 43.5, p50: 44.9, p85: 46.4, p97: 47.6 },
    { month: 18, p3: 43.7, p15: 44.8, p50: 46.2, p85: 47.7, p97: 48.9 },
    { month: 24, p3: 44.6, p15: 45.7, p50: 47.2, p85: 48.7, p97: 50.0 },
  ],
};

export function calculatePercentile(
  value: number,
  ageMonths: number,
  metric: 'weight' | 'length' | 'headCirc',
  gender: 'male' | 'female'
): number {
  const dataset = gender === 'male' ? whoBoysData[metric] : whoGirlsData[metric];
  
  // Find nearest WHO month
  let closest = dataset[0];
  let minDiff = Math.abs(dataset[0].month - ageMonths);
  for (const pt of dataset) {
    const diff = Math.abs(pt.month - ageMonths);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pt;
    }
  }

  if (value < closest.p3) return 1;
  if (value < closest.p15) return 8;
  if (value < closest.p50) return 30;
  if (value === closest.p50) return 50;
  if (value < closest.p85) return 70;
  if (value < closest.p97) return 90;
  return 99;
}
