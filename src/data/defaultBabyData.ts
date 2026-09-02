import { AppDataStore, BabyProfile, GrowthRecord, VaccineRecord, DiaryEntry, MedicalVisit } from '../types';
import { NATIONAL_VACCINE_SCHEDULE } from './vaccineScheduleData';

export const INITIAL_BABY_PROFILE: BabyProfile = {
  id: 'baby_primary',
  name: '寶寶',
  nickname: '',
  gender: 'female',
  birthday: new Date().toISOString().split('T')[0],
  birthTime: '',
  birthWeight: 0,
  birthLength: 0,
  birthHeadCirc: 0,
  gestationalWeeks: 40,
  bloodType: 'O+',
  pediatrician: '',
  hospital: '',
  medicalRecordNumber: '',
  allergies: [],
  emergencyContact: {
    name: '',
    relationship: '主要照護者',
    phone: '',
  },
  avatarUrl: '',
  themeColor: 'rose',
};

export const INITIAL_GROWTH_RECORDS: GrowthRecord[] = [];

// Initialize vaccine records linked to national schedule without mock completion
export function generateInitialVaccineRecords(bDate: Date): VaccineRecord[] {
  return NATIONAL_VACCINE_SCHEDULE.map((item) => {
    const scheduledTime = new Date(bDate.getTime() + item.targetAgeMonths * 30.4375 * 24 * 60 * 60 * 1000);
    const scheduledDate = scheduledTime.toISOString().split('T')[0];

    return {
      id: `vrec_${item.id}`,
      scheduleId: item.id,
      vaccineName: item.name,
      doseNumber: item.doseNumber,
      scheduledDate,
      isCompleted: false,
    };
  });
}

export const INITIAL_DIARY_ENTRIES: DiaryEntry[] = [];

export const INITIAL_MEDICAL_VISITS: MedicalVisit[] = [];

export function getInitialAppData(): AppDataStore {
  const birthDate = new Date();
  return {
    babyProfile: {
      ...INITIAL_BABY_PROFILE,
      birthday: birthDate.toISOString().split('T')[0],
    },
    growthRecords: INITIAL_GROWTH_RECORDS,
    vaccineRecords: generateInitialVaccineRecords(birthDate),
    diaryEntries: INITIAL_DIARY_ENTRIES,
    medicalVisits: INITIAL_MEDICAL_VISITS,
    syncInfo: {
      syncCode: 'BABY-' + Math.floor(1000 + Math.random() * 9000),
      lastSyncedAt: new Date().toISOString(),
      version: 1,
      isSyncing: false,
      statusMessage: '雲端同步備份就緒',
      deviceName: '主要照護者裝置',
    },
  };
}
