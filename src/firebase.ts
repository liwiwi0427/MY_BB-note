import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import type {
  BabyProfile,
  GrowthRecord,
  DiaryEntry,
  VaccineRecord,
  MedicalVisit,
  StickyNote,
  FamilyShareRoom,
} from './types';

import firebaseAppletConfig from '../firebase-applet-config.json';

// Firebase configuration initialized with project credentials
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use long-polling in iframe/restricted browser environments to prevent gRPC streaming dropouts
export const db = (() => {
  const dbId =
    firebaseAppletConfig.firestoreDatabaseId &&
    firebaseAppletConfig.firestoreDatabaseId !== '(default)'
      ? firebaseAppletConfig.firestoreDatabaseId
      : undefined;

  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
})();

export const auth = getAuth(app);

// Authentication helper
export const initAuth = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    // If already has currentUser
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (error) {
          console.warn('Anonymous auth sign-in notice:', error);
          resolve(null);
        }
      }
    });
  });
};

// 1. Baby Profile
export const syncBabyProfileToCloud = async (baby: BabyProfile): Promise<void> => {
  try {
    const babyRef = doc(db, 'babies', baby.id);
    await setDoc(babyRef, { ...baby, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error syncing baby profile to cloud:', err);
  }
};

export const listenToBabyProfile = (
  babyId: string,
  callback: (baby: BabyProfile | null) => void
): Unsubscribe => {
  const babyRef = doc(db, 'babies', babyId);
  return onSnapshot(
    babyRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as BabyProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('listenToBabyProfile snapshot error:', err);
    }
  );
};

// 2. Growth Records
export const saveGrowthRecordToCloud = async (record: GrowthRecord): Promise<void> => {
  try {
    const ref = doc(db, 'growth_records', record.id);
    await setDoc(ref, record, { merge: true });
  } catch (err) {
    console.error('Error saving growth record to cloud:', err);
  }
};

export const deleteGrowthRecordFromCloud = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'growth_records', id));
  } catch (err) {
    console.error('Error deleting growth record from cloud:', err);
  }
};

export const listenToGrowthRecords = (
  babyId: string,
  callback: (records: GrowthRecord[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'growth_records'), where('babyId', '==', babyId));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: GrowthRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as GrowthRecord);
      });
      // Sort by date ascending
      records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      callback(records);
    },
    (err) => {
      console.warn('listenToGrowthRecords error:', err);
    }
  );
};

// 3. Diary Entries
export const saveDiaryEntryToCloud = async (entry: DiaryEntry): Promise<void> => {
  try {
    const ref = doc(db, 'diary_entries', entry.id);
    await setDoc(ref, entry, { merge: true });
  } catch (err) {
    console.error('Error saving diary entry to cloud:', err);
  }
};

export const deleteDiaryEntryFromCloud = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'diary_entries', id));
  } catch (err) {
    console.error('Error deleting diary entry from cloud:', err);
  }
};

export const listenToDiaryEntries = (
  babyId: string,
  callback: (entries: DiaryEntry[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'diary_entries'), where('babyId', '==', babyId));
  return onSnapshot(
    q,
    (snapshot) => {
      const entries: DiaryEntry[] = [];
      snapshot.forEach((docSnap) => {
        entries.push(docSnap.data() as DiaryEntry);
      });
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(entries);
    },
    (err) => {
      console.warn('listenToDiaryEntries error:', err);
    }
  );
};

// 4. Vaccine Records
export const saveVaccineRecordToCloud = async (record: VaccineRecord): Promise<void> => {
  try {
    const ref = doc(db, 'vaccine_records', record.id);
    await setDoc(ref, record, { merge: true });
  } catch (err) {
    console.error('Error saving vaccine record to cloud:', err);
  }
};

export const listenToVaccineRecords = (
  babyId: string,
  callback: (records: VaccineRecord[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'vaccine_records'), where('babyId', '==', babyId));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: VaccineRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as VaccineRecord);
      });
      records.sort((a, b) => a.targetAgeMonths - b.targetAgeMonths);
      callback(records);
    },
    (err) => {
      console.warn('listenToVaccineRecords error:', err);
    }
  );
};

// 5. Medical Visits
export const saveMedicalVisitToCloud = async (visit: MedicalVisit): Promise<void> => {
  try {
    const ref = doc(db, 'medical_visits', visit.id);
    await setDoc(ref, visit, { merge: true });
  } catch (err) {
    console.error('Error saving medical visit to cloud:', err);
  }
};

export const deleteMedicalVisitFromCloud = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'medical_visits', id));
  } catch (err) {
    console.error('Error deleting medical visit from cloud:', err);
  }
};

export const listenToMedicalVisits = (
  babyId: string,
  callback: (visits: MedicalVisit[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'medical_visits'), where('babyId', '==', babyId));
  return onSnapshot(
    q,
    (snapshot) => {
      const visits: MedicalVisit[] = [];
      snapshot.forEach((docSnap) => {
        visits.push(docSnap.data() as MedicalVisit);
      });
      visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(visits);
    },
    (err) => {
      console.warn('listenToMedicalVisits error:', err);
    }
  );
};

// 6. Sticky Notes (Family handover)
export const saveStickyNoteToCloud = async (note: StickyNote): Promise<void> => {
  try {
    const ref = doc(db, 'sticky_notes', note.id);
    await setDoc(ref, note, { merge: true });
  } catch (err) {
    console.error('Error saving sticky note to cloud:', err);
  }
};

export const deleteStickyNoteFromCloud = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'sticky_notes', id));
  } catch (err) {
    console.error('Error deleting sticky note from cloud:', err);
  }
};

export const listenToStickyNotes = (
  babyId: string,
  callback: (notes: StickyNote[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'sticky_notes'), where('babyId', '==', babyId));
  return onSnapshot(
    q,
    (snapshot) => {
      const notes: StickyNote[] = [];
      snapshot.forEach((docSnap) => {
        notes.push(docSnap.data() as StickyNote);
      });
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(notes);
    },
    (err) => {
      console.warn('listenToStickyNotes error:', err);
    }
  );
};

// 7. Family Room Share Code
export const registerFamilyShareRoom = async (
  familyCode: string,
  babyId: string,
  babyName: string,
  memberName: string
): Promise<void> => {
  try {
    await initAuth();
    const cleanCode = familyCode.trim().toUpperCase();
    if (!cleanCode) return;

    const payload = {
      familyCode: cleanCode,
      babyId,
      babyName: babyName || '寶寶',
      updatedBy: memberName || '照護者',
      lastActive: new Date().toISOString(),
    };

    const roomRef = doc(db, 'family_rooms', cleanCode);
    await setDoc(roomRef, payload, { merge: true });

    // Also register sanitized code without symbols (e.g. BABY5729 for BABY-5729)
    const rawCode = cleanCode.replace(/[^A-Z0-9]/g, '');
    if (rawCode && rawCode !== cleanCode) {
      const altRef = doc(db, 'family_rooms', rawCode);
      await setDoc(altRef, { ...payload, familyCode: cleanCode }, { merge: true });
    }

    // Update baby document with familyCode
    const babyRef = doc(db, 'babies', babyId);
    await setDoc(babyRef, { familyCode: cleanCode, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('registerFamilyShareRoom notice:', err);
  }
};

export const joinFamilyByCode = async (
  code: string,
  memberName: string
): Promise<FamilyShareRoom | null> => {
  try {
    await initAuth();
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return null;

    const rawCode = cleanCode.replace(/[^A-Z0-9]/g, '');

    // 1. Direct doc lookup in family_rooms by exact code
    const roomRef1 = doc(db, 'family_rooms', cleanCode);
    const snap1 = await getDoc(roomRef1);
    if (snap1.exists()) {
      return snap1.data() as FamilyShareRoom;
    }

    // 2. Direct doc lookup in family_rooms by sanitized code
    if (rawCode && rawCode !== cleanCode) {
      const roomRef2 = doc(db, 'family_rooms', rawCode);
      const snap2 = await getDoc(roomRef2);
      if (snap2.exists()) {
        return snap2.data() as FamilyShareRoom;
      }
    }

    // 3. Query family_rooms where familyCode equals cleanCode or rawCode
    const qRoom = query(collection(db, 'family_rooms'), where('familyCode', '==', cleanCode));
    const snapQRoom = await getDocs(qRoom);
    if (!snapQRoom.empty) {
      return snapQRoom.docs[0].data() as FamilyShareRoom;
    }

    // 4. Query babies collection by familyCode directly
    const qBaby = query(collection(db, 'babies'), where('familyCode', '==', cleanCode));
    const snapQBaby = await getDocs(qBaby);
    if (!snapQBaby.empty) {
      const babyDoc = snapQBaby.docs[0].data() as BabyProfile;
      // Auto-heal the room document for next time
      const roomPayload: FamilyShareRoom = {
        familyCode: cleanCode,
        babyId: babyDoc.id,
        babyName: babyDoc.name,
        lastActive: new Date().toISOString(),
      };
      setDoc(doc(db, 'family_rooms', cleanCode), roomPayload, { merge: true }).catch(() => {});
      return roomPayload;
    }

    // 5. Query babies collection by sanitized familyCode
    if (rawCode && rawCode !== cleanCode) {
      const qBabyRaw = query(collection(db, 'babies'), where('familyCode', '==', rawCode));
      const snapQBabyRaw = await getDocs(qBabyRaw);
      if (!snapQBabyRaw.empty) {
        const babyDoc = snapQBabyRaw.docs[0].data() as BabyProfile;
        const roomPayload: FamilyShareRoom = {
          familyCode: cleanCode,
          babyId: babyDoc.id,
          babyName: babyDoc.name,
          lastActive: new Date().toISOString(),
        };
        setDoc(doc(db, 'family_rooms', cleanCode), roomPayload, { merge: true }).catch(() => {});
        return roomPayload;
      }
    }

    // 6. Direct lookup in babies by document ID (in case user pasted baby ID as code)
    const babyRef = doc(db, 'babies', cleanCode);
    const snapBaby = await getDoc(babyRef);
    if (snapBaby.exists()) {
      const babyDoc = snapBaby.data() as BabyProfile;
      return {
        familyCode: cleanCode,
        babyId: babyDoc.id,
        babyName: babyDoc.name,
        lastActive: new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    console.error('joinFamilyByCode error:', err);
    return null;
  }
};

// 8. Bulk Sync / Download
export const downloadAllCloudData = async (babyId: string) => {
  try {
    // 1. Baby
    const babySnap = await getDoc(doc(db, 'babies', babyId));
    const baby = babySnap.exists() ? (babySnap.data() as BabyProfile) : null;

    // 2. Growth
    const growthSnap = await getDocs(
      query(collection(db, 'growth_records'), where('babyId', '==', babyId))
    );
    const growthRecords: GrowthRecord[] = [];
    growthSnap.forEach((d) => growthRecords.push(d.data() as GrowthRecord));

    // 3. Diary
    const diarySnap = await getDocs(
      query(collection(db, 'diary_entries'), where('babyId', '==', babyId))
    );
    const diaryEntries: DiaryEntry[] = [];
    diarySnap.forEach((d) => diaryEntries.push(d.data() as DiaryEntry));

    // 4. Vaccines
    const vacSnap = await getDocs(
      query(collection(db, 'vaccine_records'), where('babyId', '==', babyId))
    );
    const vaccineRecords: VaccineRecord[] = [];
    vacSnap.forEach((d) => vaccineRecords.push(d.data() as VaccineRecord));

    // 5. Medical visits
    const medSnap = await getDocs(
      query(collection(db, 'medical_visits'), where('babyId', '==', babyId))
    );
    const medicalVisits: MedicalVisit[] = [];
    medSnap.forEach((d) => medicalVisits.push(d.data() as MedicalVisit));

    // 6. Sticky notes
    const noteSnap = await getDocs(
      query(collection(db, 'sticky_notes'), where('babyId', '==', babyId))
    );
    const stickyNotes: StickyNote[] = [];
    noteSnap.forEach((d) => stickyNotes.push(d.data() as StickyNote));

    return {
      baby,
      growthRecords,
      diaryEntries,
      vaccineRecords,
      medicalVisits,
      stickyNotes,
    };
  } catch (err) {
    console.error('downloadAllCloudData error:', err);
    return {
      baby: null,
      growthRecords: [],
      diaryEntries: [],
      vaccineRecords: [],
      medicalVisits: [],
      stickyNotes: [],
    };
  }
};

export const uploadAllLocalDataToCloud = async (
  baby: BabyProfile,
  growthRecords: GrowthRecord[],
  diaryEntries: DiaryEntry[],
  vaccineRecords: VaccineRecord[],
  medicalVisits: MedicalVisit[],
  stickyNotes: StickyNote[]
): Promise<void> => {
  await syncBabyProfileToCloud(baby);
  for (const g of growthRecords) await saveGrowthRecordToCloud(g);
  for (const d of diaryEntries) await saveDiaryEntryToCloud(d);
  for (const v of vaccineRecords) await saveVaccineRecordToCloud(v);
  for (const m of medicalVisits) await saveMedicalVisitToCloud(m);
  for (const s of stickyNotes) await saveStickyNoteToCloud(s);
};
