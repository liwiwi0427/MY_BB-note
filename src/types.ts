export type Gender = 'male' | 'female';

export interface BabyProfile {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthWeight: number; // in kg
  birthLength: number; // in cm
  birthHeadCirc: number; // in cm
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
  notes?: string;
  avatarUrl?: string;
  familyCode?: string;
}

export interface GrowthRecord {
  id: string;
  babyId: string;
  date: string; // YYYY-MM-DD
  ageMonths: number;
  ageDays: number;
  weight: number; // kg
  length: number; // cm
  headCirc: number; // cm
  doctorNote?: string;
  measuredBy?: string;
  createdAt: string;
}

export type DiaryType =
  | 'feed_bottle'
  | 'feed_breast'
  | 'feed_solid'
  | 'diaper_wet'
  | 'diaper_dirty'
  | 'diaper_both'
  | 'sleep'
  | 'temperature'
  | 'medication'
  | 'tummy_time'
  | 'milestone'
  | 'note';

export interface DiaryEntry {
  id: string;
  babyId: string;
  type: DiaryType;
  timestamp: string; // ISO string
  title?: string;
  amountMl?: number;
  durationMinutes?: number;
  temperatureCelsius?: number;
  diaperColor?: string;
  diaperWetness?: string; // e.g. '微濕', '適中正常', '沈重一大包'
  diaperStoolTexture?: string; // e.g. '糊狀軟便', '金黃母乳便', '水狀稀便', '偏硬'
  foodType?: string;
  medicineName?: string;
  dosage?: string;
  note?: string;
  mood?: 'happy' | 'calm' | 'fussy' | 'crying' | 'sleepy';
  loggedBy?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface VaccineRecord {
  id: string;
  babyId: string;
  vaccineName: string;
  dose: number;
  targetAgeMonths: number;
  targetAgeDescription: string;
  isCompleted: boolean;
  scheduledDate?: string;
  administeredDate?: string;
  clinicName?: string;
  batchNumber?: string;
  reactions?: string;
  isOptional?: boolean; // 自費疫苗
  category?: 'national_free' | 'recommended_paid' | 'seasonal'; // 疾管署公費 / 自費推薦 / 季節性
  preventDisease?: string; // 預防疾病說明
  precautions?: string; // 接種注意事項與衛教
}

export interface NotificationSettings {
  enableBrowserPush: boolean;
  enableSound: boolean;
  vaccineReminder: boolean;
  feedReminder: boolean;
  feedIntervalHours: number; // e.g. 3.5 hours
  diaperReminder: boolean;
  diaperIntervalHours: number; // e.g. 2.5 hours
  feverWarning: boolean;
  stickyNotesReminder: boolean;
}

export interface MedicalVisit {
  id: string;
  babyId: string;
  date: string; // YYYY-MM-DD
  clinic: string;
  doctor?: string;
  reason: string;
  diagnosis?: string;
  prescriptions?: string;
  doctorAdvice?: string;
  weight?: number;
  temperature?: number;
  followUpDate?: string;
  createdAt: string;
}

export interface StickyNote {
  id: string;
  babyId: string;
  content: string;
  author: string;
  color?: 'amber' | 'rose' | 'emerald' | 'sky' | 'purple';
  isPinned?: boolean;
  isResolved?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FamilyShareRoom {
  familyCode: string;
  babyId: string;
  babyName: string;
  updatedBy?: string;
  lastActive?: string;
  members?: {
    userId: string;
    name: string;
    role: 'parent' | 'caregiver' | 'doctor';
    joinedAt: string;
  }[];
  createdAt?: string;
}
