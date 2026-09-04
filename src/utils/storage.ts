import { AppDataStore, GrowthRecord } from '../types';
import { getInitialAppData } from '../data/defaultBabyData';
import { calculatePercentile } from '../data/whoGrowthData';
import { 
  pushBabyDataToFirebase, 
  pullBabyDataFromFirebase, 
  subscribeBabyDataFromFirebase,
  normalizeSyncCode 
} from './firebase';

const LOCAL_STORAGE_KEY = 'BABY_HEALTH_DIARY_APP_STATE_V2';

export function loadStoredAppData(): AppDataStore {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.babyProfile && parsed.growthRecords) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored baby app data:', err);
  }
  const initial = getInitialAppData();
  saveStoredAppData(initial);
  return initial;
}

export const loadAppData = loadStoredAppData;

export function saveStoredAppData(data: AppDataStore): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving app data to localStorage:', err);
  }
}

export const saveAppData = saveStoredAppData;

// Calculate baby age details from birthday string (YYYY-MM-DD)
export function getBabyAgeDetails(birthdayStr: string, targetDateStr?: string): {
  totalDays: number;
  totalWeeks: number;
  months: number;
  days: number;
  formattedText: string;
  shortLabel: string;
  exactMonthsFloat: number;
} {
  const birth = new Date(birthdayStr + 'T00:00:00');
  const now = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date();

  const diffTime = Math.max(0, now.getTime() - birth.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);

  // Month breakdown calculation
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth() + years * 12;
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) months = 0;
  if (days < 0) days = 0;

  const exactMonthsFloat = +(totalDays / 30.4375).toFixed(1);

  let formattedText = '';
  if (months === 0) {
    formattedText = `出生 ${totalDays} 天 (滿 ${totalWeeks} 週)`;
  } else {
    formattedText = `${months} 個月 ${days} 天 (出生 ${totalDays} 天)`;
  }

  const shortLabel = months === 0 ? `${totalDays}天` : `${months}M${days}D`;

  return {
    totalDays,
    totalWeeks,
    months,
    days,
    formattedText,
    shortLabel,
    exactMonthsFloat,
  };
}

// Recompute percentiles for a growth record
export function enrichGrowthRecordPercentiles(
  record: GrowthRecord,
  gender: 'male' | 'female'
): GrowthRecord {
  const pWeight = calculatePercentile(record.weight, record.ageMonths, 'weight', gender);
  const pLength = calculatePercentile(record.length, record.ageMonths, 'length', gender);
  const pHead = calculatePercentile(record.headCirc, record.ageMonths, 'headCirc', gender);
  const heightM = record.length / 100;
  const bmi = +(record.weight / (heightM * heightM)).toFixed(1);

  return {
    ...record,
    bmi,
    percentileWeight: pWeight,
    percentileLength: pLength,
    percentileHeadCirc: pHead,
  };
}

/**
 * Universal Push Backup
 * Attempts Firebase Firestore first, then falls back to Express API,
 * then relay/local storage.
 */
export async function pushCloudBackup(
  data: AppDataStore
): Promise<{ 
  success: boolean; 
  message: string; 
  updatedAt?: string; 
  lastSyncedAt?: string; 
  version?: number; 
  mode?: 'firebase' | 'server' | 'relay' | 'local';
  error?: string 
}> {
  const code = normalizeSyncCode(data.syncInfo.syncCode || 'BABY-DEFAULT');
  const timestamp = new Date().toISOString();
  const newVersion = (data.syncInfo.version || 1) + 1;

  // 1. Prioritize Firebase Firestore (Real cloud database)
  try {
    const fbRes = await pushBabyDataToFirebase(code, data, data.syncInfo.deviceName);
    if (fbRes.success) {
      return {
        success: true,
        message: '已成功透過 Firebase 雲端資料庫完成即時同步備份！',
        updatedAt: fbRes.updatedAt || timestamp,
        lastSyncedAt: fbRes.updatedAt || timestamp,
        version: fbRes.version || newVersion,
        mode: 'firebase',
      };
    }
  } catch (fbErr) {
    console.warn('Firebase sync failed, falling back to local/server endpoint...', fbErr);
  }

  // 2. Fallback to local Express server / Cloud Run container API
  try {
    const response = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncCode: code,
        babyData: data,
        deviceName: data.syncInfo.deviceName || '家長行動裝置',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: result.message || '雲端資料已成功同步備份！',
        updatedAt: result.updatedAt || timestamp,
        lastSyncedAt: result.lastSyncedAt || timestamp,
        version: result.version || newVersion,
        mode: 'server',
      };
    }
  } catch (serverErr) {
    console.warn('Local Express sync endpoint unavailable, attempting cloud relay fallback...', serverErr);
  }

  // 3. Fallback for Static GitHub Pages & Vercel deployments
  try {
    const relayPayload = {
      syncCode: code,
      updatedAt: timestamp,
      version: newVersion,
      babyData: data,
    };

    const fallbackResponse = await fetch(`https://api.restful-api.dev/objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `BABY_SYNC_${code}`,
        data: relayPayload,
      }),
    });

    if (fallbackResponse.ok) {
      return {
        success: true,
        message: '已透過雲端中繼備份成功！',
        updatedAt: timestamp,
        lastSyncedAt: timestamp,
        version: newVersion,
        mode: 'relay',
      };
    }
  } catch (relayErr) {
    console.warn('Relay sync failed:', relayErr);
  }

  // 4. If network is completely offline, save locally
  saveStoredAppData(data);
  return {
    success: true,
    message: '已儲存至本機快取備份（可使用一鍵速傳碼或 JSON 跨裝置同步）',
    updatedAt: timestamp,
    lastSyncedAt: timestamp,
    version: newVersion,
    mode: 'local',
  };
}

export const pushToCloud = pushCloudBackup;

/**
 * Universal Pull Backup
 * Attempts Firebase Firestore first, then falls back to Express API,
 * then relay/local storage.
 */
export async function pullCloudBackup(
  syncCode: string
): Promise<{ success: boolean; data?: AppDataStore; mode?: 'firebase' | 'server' | 'relay' | 'code'; error?: string }> {
  const code = normalizeSyncCode(syncCode);

  // 1. Prioritize Firebase Firestore
  try {
    const fbRes = await pullBabyDataFromFirebase(code);
    if (fbRes.success && fbRes.data) {
      return {
        success: true,
        data: fbRes.data,
        mode: 'firebase',
      };
    }
  } catch (fbErr) {
    console.warn('Firebase pull failed, falling back...', fbErr);
  }

  // 2. Try local Express server / Cloud Run container API
  try {
    const response = await fetch(`/api/sync/pull/${encodeURIComponent(code)}`);
    if (response.ok) {
      const result = await response.json();
      if (result.data) {
        return {
          success: true,
          data: result.data,
          mode: 'server',
        };
      }
    }
  } catch (serverErr) {
    console.warn('Local Express pull endpoint unavailable, attempting relay...', serverErr);
  }

  // 3. Try cloud relay fallback
  try {
    const relayResponse = await fetch(`https://api.restful-api.dev/objects?name=BABY_SYNC_${encodeURIComponent(code)}`);
    if (relayResponse.ok) {
      const results = await relayResponse.json();
      if (Array.isArray(results) && results.length > 0) {
        const latest = results[results.length - 1];
        if (latest?.data?.babyData) {
          return {
            success: true,
            data: latest.data.babyData,
            mode: 'relay',
          };
        }
      }
    }
  } catch (relayErr) {
    console.warn('Relay pull failed:', relayErr);
  }

  return {
    success: false,
    error: `找不到同步碼【${code}】的雲端資料。請確認家庭同步碼是否正確，或使用「一鍵速傳碼」同步。`,
  };
}

export const pullFromCloud = pullCloudBackup;

export { subscribeBabyDataFromFirebase };

/**
 * Zero-Server Instant Transfer Code Generator (100% Reliable for GitHub Pages & Vercel)
 * Encodes the entire dataset into a single portable string.
 */
export function exportDataAsTransferCode(data: AppDataStore): string {
  try {
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(jsonStr));
    return `BBH#${encoded}`;
  } catch (err) {
    console.error('Error generating transfer code:', err);
    return '';
  }
}

/**
 * Decode and restore from Instant Transfer Code
 */
export function importDataFromTransferCode(transferCode: string): AppDataStore | null {
  try {
    let clean = transferCode.trim();
    if (clean.startsWith('BBH#')) {
      clean = clean.slice(4);
    }
    const decodedJson = decodeURIComponent(atob(clean));
    const parsed = JSON.parse(decodedJson);
    if (parsed && parsed.babyProfile && parsed.growthRecords) {
      return parsed as AppDataStore;
    }
  } catch (err) {
    console.error('Error importing transfer code:', err);
  }
  return null;
}

// Export data as downloadable JSON file
export function exportDataAsJSON(data: AppDataStore): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `baby_health_passport_${data.babyProfile.name}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate random sync pairing code
export function generateRandomSyncCode(): string {
  const prefixes = ['BABY', 'CARE', 'SWEET', 'ANGEL', 'TANG', 'YOYO', 'LULU', 'KIDS'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
}
