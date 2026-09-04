import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { AppDataStore } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

// Get Firestore Instance with databaseId support
let firestoreDb: Firestore | null = null;
export function getFirebaseDb(): Firestore {
  if (!firestoreDb) {
    const app = getFirebaseApp();
    const dbId = firebaseConfig.firestoreDatabaseId;
    try {
      if (dbId && dbId !== '(default)' && dbId.trim() !== '') {
        firestoreDb = getFirestore(app, dbId);
      } else {
        firestoreDb = getFirestore(app);
      }
    } catch (err) {
      console.warn('Named Firestore initialization failed, falling back to default:', err);
      firestoreDb = getFirestore(app);
    }
  }
  return firestoreDb;
}

export const FIREBASE_PROJECT_INFO = {
  projectId: firebaseConfig.projectId,
  projectNumber: firebaseConfig.messagingSenderId || '323118599069',
  appId: firebaseConfig.appId,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
  authDomain: firebaseConfig.authDomain,
};

/**
 * Format and sanitize data for Firestore (removes undefined fields)
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Normalize sync code (trim and uppercase, e.g. BABY-8888)
 */
export function normalizeSyncCode(code: string): string {
  return (code || 'BABY-DEFAULT').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Push baby data to Firebase Firestore
 */
export async function pushBabyDataToFirebase(
  syncCode: string,
  data: AppDataStore,
  deviceName?: string
): Promise<{ success: boolean; updatedAt: string; version: number; error?: string }> {
  try {
    const db = getFirebaseDb();
    const cleanCode = normalizeSyncCode(syncCode);
    const timestamp = new Date().toISOString();
    const newVersion = (data.syncInfo.version || 0) + 1;

    const payload = sanitizeForFirestore({
      syncCode: cleanCode,
      babyProfile: data.babyProfile,
      growthRecords: data.growthRecords || [],
      vaccineRecords: data.vaccineRecords || [],
      diaryEntries: data.diaryEntries || [],
      medicalVisits: data.medicalVisits || [],
      version: newVersion,
      updatedAt: timestamp,
      updatedByDevice: deviceName || data.syncInfo.deviceName || '家長行動裝置',
    });

    const docRef = doc(db, 'baby_records', cleanCode);
    await setDoc(docRef, payload, { merge: true });

    return {
      success: true,
      updatedAt: timestamp,
      version: newVersion,
    };
  } catch (err: any) {
    console.error('Firebase push error:', err);
    return {
      success: false,
      updatedAt: '',
      version: data.syncInfo.version || 1,
      error: err?.message || 'Firebase 同步失敗',
    };
  }
}

/**
 * Pull baby data from Firebase Firestore
 */
export async function pullBabyDataFromFirebase(
  syncCode: string
): Promise<{ success: boolean; data?: AppDataStore; updatedAt?: string; error?: string }> {
  try {
    const db = getFirebaseDb();
    const cleanCode = normalizeSyncCode(syncCode);
    const docRef = doc(db, 'baby_records', cleanCode);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return {
        success: false,
        error: `找不到同步碼【${cleanCode}】的 Firebase 雲端紀錄，請確認代碼是否輸入正確。`,
      };
    }

    const docData = snap.data();
    if (!docData || !docData.babyProfile) {
      return {
        success: false,
        error: '雲端資料結構不符合寶寶日記格式',
      };
    }

    const reconstructed: AppDataStore = {
      babyProfile: docData.babyProfile,
      growthRecords: docData.growthRecords || [],
      vaccineRecords: docData.vaccineRecords || [],
      diaryEntries: docData.diaryEntries || [],
      medicalVisits: docData.medicalVisits || [],
      syncInfo: {
        syncCode: cleanCode,
        lastSyncedAt: docData.updatedAt || new Date().toISOString(),
        version: docData.version || 1,
        isSyncing: false,
        statusMessage: '已從 Firebase 同步最新資料',
        deviceName: docData.updatedByDevice || '雲端備份',
        firebaseConnected: true,
        liveSyncEnabled: true,
      },
    };

    return {
      success: true,
      data: reconstructed,
      updatedAt: docData.updatedAt,
    };
  } catch (err: any) {
    console.error('Firebase pull error:', err);
    return {
      success: false,
      error: err?.message || '從 Firebase 載入雲端資料失敗',
    };
  }
}

/**
 * Subscribe to real-time changes in Firebase Firestore
 */
export function subscribeBabyDataFromFirebase(
  syncCode: string,
  onUpdate: (data: AppDataStore, meta: { updatedAt: string; version: number; deviceName?: string }) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const cleanCode = normalizeSyncCode(syncCode);
  const docRef = doc(db, 'baby_records', cleanCode);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        if (docData && docData.babyProfile) {
          const reconstructed: AppDataStore = {
            babyProfile: docData.babyProfile,
            growthRecords: docData.growthRecords || [],
            vaccineRecords: docData.vaccineRecords || [],
            diaryEntries: docData.diaryEntries || [],
            medicalVisits: docData.medicalVisits || [],
            syncInfo: {
              syncCode: cleanCode,
              lastSyncedAt: docData.updatedAt || new Date().toISOString(),
              version: docData.version || 1,
              isSyncing: false,
              statusMessage: '即時同步更新中',
              deviceName: docData.updatedByDevice || '其他裝置',
              firebaseConnected: true,
              liveSyncEnabled: true,
            },
          };
          onUpdate(reconstructed, {
            updatedAt: docData.updatedAt || new Date().toISOString(),
            version: docData.version || 1,
            deviceName: docData.updatedByDevice,
          });
        }
      }
    },
    (err) => {
      console.warn('Firebase real-time sync listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Quick diagnostic test for Firebase connection
 */
export async function testFirebaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const db = getFirebaseDb();
    // Read health or try dummy doc
    const pingRef = doc(db, 'baby_records', '_health_ping');
    await setDoc(pingRef, { ping: true, timestamp: new Date().toISOString() }, { merge: true });
    return { ok: true, message: `Firebase 連線成功 (專案: ${firebaseConfig.projectId})` };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Firebase 連線失敗' };
  }
}
