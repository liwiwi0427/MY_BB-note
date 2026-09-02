export type Gender = 'male' | 'female';
export type BloodType = 'A' | 'B' | 'O' | 'AB' | 'Unknown' | string;

export interface BabyProfile {
  id: string;
  name: string;
  nickname: string;
  gender: Gender;
  birthday: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  birthWeight: number; // kg
  birthLength: number; // cm
  birthHeadCirc: number; // cm
  gestationalWeeks: number; // e.g. 39
  bloodType: BloodType; // 'A' | 'B' | 'O' | 'AB'
  pediatrician?: string;
  hospital?: string;
  medicalRecordNumber?: string;
  allergies?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  avatarUrl: string;
  themeColor?: string; // 'amber' | 'rose' | 'sky' | 'emerald'
}

export interface GrowthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  ageMonths: number; // calculated e.g. 4.2
  ageDays: number; // e.g. 126
  weight: number; // kg
  length: number; // cm
  headCirc: number; // cm
  bmi?: number; // weight / (length/100)^2
  percentileWeight?: number; // 0 - 100
  percentileLength?: number;
  percentileHeadCirc?: number;
  doctorNote?: string;
  measuredBy?: string; // e.g. 媽媽, 禾馨小兒科
  photoUrl?: string;
}

export interface VaccineScheduleItem {
  id: string;
  name: string;
  code: string;
  targetAgeMonths: number;
  targetAgeLabel: string;
  isMandatory: boolean;
  doseNumber: number;
  totalDoses: number;
  description: string;
  diseasePrevented: string;
  precautions: string;
  category: 'routine' | 'optional' | 'booster';
}

export interface VaccineRecord {
  id: string;
  scheduleId: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: string;
  completedDate?: string;
  isCompleted: boolean;
  clinicName?: string;
  lotNumber?: string;
  doctorName?: string;
  reactionGrade?: 'none' | 'mild' | 'moderate' | 'severe';
  feverTemp?: number;
  reactionNotes?: string;
  sideEffects?: string[];
  nextAppointmentDate?: string;
}

export type DiaryCategory = 'milestone' | 'daily' | 'feeding' | 'sleep' | 'diaper' | 'temperature' | 'medical' | 'io';
export type BabyMood = 'happy' | 'calm' | 'playful' | 'sleepy' | 'fussy' | 'curious';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  content: string;
  category: DiaryCategory;
  mood: BabyMood;
  photos?: string[];
  milestoneTag?: string; // e.g. "第一次翻身", "第一次長牙", "睡過夜"
  metrics?: {
    // Intake (輸入)
    feedingType?: 'breast' | 'formula' | 'mixed' | 'solid' | 'water' | 'medication' | 'other';
    feedingAmountMl?: number;
    feedingDurationMins?: number;
    solidFoodDetails?: string;
    waterAmountMl?: number;
    // Output (輸出)
    diaperType?: 'wet' | 'dirty' | 'both' | 'clean';
    diaperWetnessLevel?: 'light' | 'medium' | 'heavy' | 'measured';
    urineAmountMl?: number;
    stoolConsistency?: 'watery' | 'loose' | 'soft' | 'formed' | 'hard';
    stoolColor?: 'yellow' | 'green' | 'brown' | 'white_clay' | 'red_bloody' | 'black' | string;
    vomitMl?: number;
    vomitSeverity?: 'spit_up' | 'moderate' | 'projectile';
    // Routine
    sleepHours?: number;
    sleepType?: 'night' | 'nap';
    temperatureC?: number;
    medicationTaken?: string;
  };
  author?: string; // e.g. 媽媽, 爸爸
}

export interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
  days: number;
  instructions?: string;
}

export interface MedicalVisit {
  id: string;
  date: string;
  clinicName: string;
  doctorName?: string;
  reason: string;
  diagnosis: string;
  symptoms?: string[];
  prescriptions?: Prescription[];
  temperatureAtVisit?: number;
  nextFollowUpDate?: string;
  notes?: string;
  attachments?: string[];
}

export interface CloudSyncInfo {
  syncCode: string;
  lastSyncedAt: string | null;
  version: number;
  isSyncing: boolean;
  statusMessage: string;
  deviceName: string;
}

export interface AppDataStore {
  babyProfile: BabyProfile;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  diaryEntries: DiaryEntry[];
  medicalVisits: MedicalVisit[];
  syncInfo: CloudSyncInfo;
}
