import type {
  BabyProfile,
  GrowthRecord,
  DiaryEntry,
  VaccineRecord,
  MedicalVisit,
  StickyNote,
} from '../types';
import {
  defaultBabyProfile,
  defaultGrowthRecords,
  defaultDiaryEntries,
  defaultMedicalVisits,
  defaultStickyNotes,
  initialVaccineSchedule,
} from '../data/defaultBabyData';

const KEYS = {
  BABY: 'baby_health_profile',
  GROWTH: 'baby_growth_records',
  DIARY: 'baby_diary_entries',
  VACCINES: 'baby_vaccine_records',
  MEDICAL: 'baby_medical_visits',
  STICKY: 'baby_sticky_notes',
  FAMILY_CODE: 'baby_family_code',
  MEMBER_NAME: 'baby_member_name',
  INITIALIZED: 'baby_storage_initialized_v2',
  LAST_SAVED: 'baby_last_saved_timestamp',
  AUTO_BACKUP: 'baby_emergency_snapshot_backup',
};

export const localStorageService = {
  isInitialized: (): boolean => {
    return localStorage.getItem(KEYS.INITIALIZED) === 'true';
  },

  markInitialized: () => {
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
  },

  getLastSavedTime: (): string | null => {
    return localStorage.getItem(KEYS.LAST_SAVED);
  },

  getBabyProfile: (): BabyProfile => {
    try {
      const data = localStorage.getItem(KEYS.BABY);
      return data ? JSON.parse(data) : defaultBabyProfile;
    } catch {
      return defaultBabyProfile;
    }
  },
  saveBabyProfile: (baby: BabyProfile) => {
    try {
      localStorage.setItem(KEYS.BABY, JSON.stringify(baby));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
    } catch (e) {
      console.warn('localStorage saveBabyProfile error', e);
    }
  },

  getGrowthRecords: (): GrowthRecord[] => {
    try {
      const data = localStorage.getItem(KEYS.GROWTH);
      if (data !== null) {
        return JSON.parse(data);
      }
      return defaultGrowthRecords;
    } catch {
      return defaultGrowthRecords;
    }
  },
  saveGrowthRecords: (records: GrowthRecord[]) => {
    try {
      localStorage.setItem(KEYS.GROWTH, JSON.stringify(records));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
    } catch (e) {
      console.warn('localStorage saveGrowthRecords error', e);
    }
  },

  getDiaryEntries: (): DiaryEntry[] => {
    try {
      const data = localStorage.getItem(KEYS.DIARY);
      if (data !== null) {
        return JSON.parse(data);
      }
      return defaultDiaryEntries;
    } catch {
      return defaultDiaryEntries;
    }
  },
  saveDiaryEntries: (entries: DiaryEntry[]) => {
    try {
      localStorage.setItem(KEYS.DIARY, JSON.stringify(entries));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
    } catch (e) {
      console.warn('localStorage saveDiaryEntries error', e);
    }
  },

  getVaccineRecords: (): VaccineRecord[] => {
    try {
      const data = localStorage.getItem(KEYS.VACCINES);
      if (data !== null) {
        return JSON.parse(data);
      }
      return initialVaccineSchedule;
    } catch {
      return initialVaccineSchedule;
    }
  },
  saveVaccineRecords: (records: VaccineRecord[]) => {
    try {
      localStorage.setItem(KEYS.VACCINES, JSON.stringify(records));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
    } catch (e) {
      console.warn('localStorage saveVaccineRecords error', e);
    }
  },

  getMedicalVisits: (): MedicalVisit[] => {
    try {
      const data = localStorage.getItem(KEYS.MEDICAL);
      if (data !== null) {
        return JSON.parse(data);
      }
      return defaultMedicalVisits;
    } catch {
      return defaultMedicalVisits;
    }
  },
  saveMedicalVisits: (visits: MedicalVisit[]) => {
    try {
      localStorage.setItem(KEYS.MEDICAL, JSON.stringify(visits));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
    } catch (e) {
      console.warn('localStorage saveMedicalVisits error', e);
    }
  },

  getStickyNotes: (): StickyNote[] => {
    try {
      const data = localStorage.getItem(KEYS.STICKY);
      if (data !== null) {
        return JSON.parse(data);
      }
      return defaultStickyNotes;
    } catch {
      return defaultStickyNotes;
    }
  },
  saveStickyNotes: (notes: StickyNote[]) => {
    try {
      localStorage.setItem(KEYS.STICKY, JSON.stringify(notes));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
    } catch (e) {
      console.warn('localStorage saveStickyNotes error', e);
    }
  },

  getFamilyCode: (): string => {
    return localStorage.getItem(KEYS.FAMILY_CODE) || 'BABY888';
  },
  saveFamilyCode: (code: string) => {
    localStorage.setItem(KEYS.FAMILY_CODE, code);
  },

  getMemberName: (): string => {
    return localStorage.getItem(KEYS.MEMBER_NAME) || '媽媽';
  },
  saveMemberName: (name: string) => {
    localStorage.setItem(KEYS.MEMBER_NAME, name);
  },

  // Save emergency snapshot in case of cache wipe
  saveEmergencyBackup: (allData: {
    baby: BabyProfile;
    growthRecords: GrowthRecord[];
    diaryEntries: DiaryEntry[];
    vaccineRecords: VaccineRecord[];
    medicalVisits: MedicalVisit[];
    stickyNotes: StickyNote[];
    familyCode: string;
  }) => {
    try {
      localStorage.setItem(
        KEYS.AUTO_BACKUP,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          ...allData,
        })
      );
    } catch (e) {
      console.warn('Failed to save emergency backup snapshot:', e);
    }
  },
};
