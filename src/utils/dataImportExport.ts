import type {
  BabyProfile,
  GrowthRecord,
  DiaryEntry,
  VaccineRecord,
  MedicalVisit,
  StickyNote,
} from '../types';
import { initialVaccineSchedule } from '../data/vaccineScheduleData';

export interface ExportBackupData {
  babyProfile: any;
  growthRecords: any[];
  vaccineRecords: any[];
  diaryEntries: any[];
  medicalVisits: any[];
  stickyNotes: any[];
  syncInfo?: {
    syncCode?: string;
    lastSyncedAt?: string;
    version?: number;
    statusMessage?: string;
    deviceName?: string;
  };
}

export interface ParsedImportResult {
  success: boolean;
  error?: string;
  baby: BabyProfile;
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
  diaryEntries: DiaryEntry[];
  medicalVisits: MedicalVisit[];
  stickyNotes: StickyNote[];
  familyCode?: string;
  stats: {
    growthCount: number;
    diaryCount: number;
    vaccineCount: number;
    visitCount: number;
    stickyCount: number;
  };
}

/**
 * Generate full JSON export matching the BB-Note backup schema
 */
export function generateBackupJson(
  baby: BabyProfile,
  growthRecords: GrowthRecord[],
  diaryEntries: DiaryEntry[],
  vaccineRecords: VaccineRecord[],
  medicalVisits: MedicalVisit[],
  stickyNotes: StickyNote[],
  familyCode?: string
): string {
  const exportData: ExportBackupData = {
    babyProfile: {
      id: baby.id,
      name: baby.name,
      gender: baby.gender,
      birthday: baby.birthDate,
      birthDate: baby.birthDate,
      birthWeight: baby.birthWeight,
      birthLength: baby.birthLength,
      birthHeadCirc: baby.birthHeadCirc,
      bloodType: baby.bloodType,
      allergies: baby.allergies || ['NKA'],
      emergencyContact: baby.emergencyContact,
      notes: baby.notes,
      avatarUrl: baby.avatarUrl,
    },
    growthRecords: growthRecords.map((g) => ({
      id: g.id,
      date: g.date,
      ageMonths: g.ageMonths,
      ageDays: g.ageDays,
      weight: g.weight,
      length: g.length,
      headCirc: g.headCirc,
      doctorNote: g.doctorNote,
      measuredBy: g.measuredBy,
      createdAt: g.createdAt,
    })),
    vaccineRecords: vaccineRecords.map((v) => ({
      id: v.id,
      scheduleId: v.id,
      vaccineName: v.vaccineName,
      doseNumber: v.dose,
      dose: v.dose,
      targetAgeMonths: v.targetAgeMonths,
      targetAgeDescription: v.targetAgeDescription,
      scheduledDate: v.scheduledDate,
      isCompleted: v.isCompleted,
      completedDate: v.administeredDate,
      administeredDate: v.administeredDate,
      clinicName: v.clinicName,
      isOptional: v.isOptional,
    })),
    diaryEntries: diaryEntries.map((d) => {
      const parts = d.timestamp.split('T');
      const datePart = parts[0] || '';
      const timePart = parts[1] ? parts[1].slice(0, 5) : '12:00';

      return {
        id: d.id,
        date: datePart,
        time: timePart,
        timestamp: d.timestamp,
        category: d.type.startsWith('feed')
          ? 'feeding'
          : d.type.startsWith('diaper')
          ? 'diaper'
          : d.type,
        type: d.type,
        title: d.title || '日常紀錄',
        content: d.note || '',
        note: d.note || '',
        mood: d.mood || 'happy',
        author: d.loggedBy || '媽媽',
        metrics: {
          feedingAmountMl: d.amountMl,
          diaperColor: d.diaperColor,
          temperature: d.temperatureCelsius,
          durationMinutes: d.durationMinutes,
        },
      };
    }),
    medicalVisits: medicalVisits.map((m) => ({
      id: m.id,
      date: m.date,
      clinicName: m.clinic,
      clinic: m.clinic,
      doctorName: m.doctor,
      doctor: m.doctor,
      reason: m.reason,
      diagnosis: m.diagnosis,
      notes: m.doctorAdvice,
      doctorAdvice: m.doctorAdvice,
      temperatureAtVisit: m.temperature,
      weightAtVisit: m.weight,
      createdAt: m.createdAt,
    })),
    stickyNotes: stickyNotes || [],
    syncInfo: {
      syncCode: familyCode || baby.familyCode || 'BABY-5729',
      lastSyncedAt: new Date().toISOString(),
      version: 3,
      statusMessage: 'BB-Note 備份檔案',
      deviceName: '主要照護者裝置',
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Helper to match standard vaccine schedule properties
 */
function findStandardVaccineInfo(name: string, dose: number) {
  const normalized = name.toLowerCase();
  const matched = initialVaccineSchedule.find((std) => {
    const stdNorm = std.vaccineName.toLowerCase();
    if (std.dose === dose) {
      if (normalized.includes('b型肝炎') || normalized.includes('b肝') || normalized.includes('hepb')) {
        return stdNorm.includes('b型肝炎');
      }
      if (normalized.includes('卡介苗') || normalized.includes('bcg')) {
        return stdNorm.includes('卡介苗');
      }
      if (normalized.includes('五合一') || normalized.includes('dtap')) {
        return stdNorm.includes('五合一');
      }
      if (normalized.includes('肺炎鏈球菌') || normalized.includes('pcv13')) {
        return stdNorm.includes('肺炎鏈球菌');
      }
      if (normalized.includes('輪狀') || normalized.includes('rota')) {
        return stdNorm.includes('輪狀');
      }
      if (normalized.includes('流感') || normalized.includes('flu')) {
        return stdNorm.includes('流感');
      }
      if (normalized.includes('mmr') || normalized.includes('麻疹')) {
        return stdNorm.includes('mmr') || stdNorm.includes('麻疹');
      }
      if (normalized.includes('水痘') || normalized.includes('varicella')) {
        return stdNorm.includes('水痘');
      }
      if (normalized.includes('日本腦炎') || normalized.includes('je')) {
        return stdNorm.includes('日本腦炎');
      }
      if (normalized.includes('a型肝炎') || normalized.includes('a肝') || normalized.includes('hepa')) {
        return stdNorm.includes('a型肝炎');
      }
    }
    return false;
  });

  return matched;
}

/**
 * Parse any raw JSON string or object from user file / paste
 */
export function parseImportBackupJson(rawJson: string | object): ParsedImportResult {
  try {
    let parsed: any;
    if (typeof rawJson === 'string') {
      parsed = JSON.parse(rawJson.trim());
    } else {
      parsed = rawJson;
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        error: 'JSON 格式解析失敗：資料不是有效的物件結構。',
      } as any;
    }

    // 1. Baby Profile
    const rawBaby = parsed.babyProfile || parsed.baby || {};
    const babyId = rawBaby.id || `baby_${Date.now()}`;
    const birthDate = rawBaby.birthDate || rawBaby.birthday || '2025-07-24';

    let emergencyStr: string | undefined = undefined;
    if (typeof rawBaby.emergencyContact === 'string') {
      emergencyStr = rawBaby.emergencyContact;
    } else if (rawBaby.emergencyContact && typeof rawBaby.emergencyContact === 'object') {
      const { relationship, name, phone } = rawBaby.emergencyContact;
      emergencyStr = [relationship, name, phone].filter(Boolean).join(' ');
    }

    const baby: BabyProfile = {
      id: babyId,
      name: rawBaby.name || '寶寶',
      gender: rawBaby.gender === 'female' ? 'female' : 'male',
      birthDate: birthDate,
      birthWeight: Number(rawBaby.birthWeight) || 3.2,
      birthLength: Number(rawBaby.birthLength) || 50,
      birthHeadCirc: Number(rawBaby.birthHeadCirc) || 34,
      bloodType: rawBaby.bloodType || 'O+',
      allergies: Array.isArray(rawBaby.allergies) ? rawBaby.allergies : ['NKA'],
      emergencyContact: emergencyStr || '主要照護者',
      notes: rawBaby.notes || '',
      avatarUrl: rawBaby.avatarUrl,
      familyCode: parsed.syncInfo?.syncCode || rawBaby.familyCode || 'BABY-5729',
    };

    // 2. Growth Records
    const rawGrowth = Array.isArray(parsed.growthRecords) ? parsed.growthRecords : [];
    const growthRecords: GrowthRecord[] = rawGrowth.map((g: any, index: number) => ({
      id: g.id || `growth_${Date.now()}_${index}`,
      babyId: babyId,
      date: g.date || birthDate,
      ageMonths: Number(g.ageMonths) || 0,
      ageDays: Number(g.ageDays) || 0,
      weight: Number(g.weight) || 0,
      length: Number(g.length) || 0,
      headCirc: Number(g.headCirc) || 0,
      doctorNote: g.doctorNote || g.notes || '',
      measuredBy: g.measuredBy || '媽媽',
      createdAt: g.createdAt || new Date().toISOString(),
    }));

    // 3. Vaccine Records
    const rawVaccines = Array.isArray(parsed.vaccineRecords) ? parsed.vaccineRecords : [];
    let vaccineRecords: VaccineRecord[] = [];

    if (rawVaccines.length > 0) {
      vaccineRecords = rawVaccines.map((v: any, index: number) => {
        const dose = Number(v.doseNumber || v.dose || 1);
        const name = v.vaccineName || `疫苗 #${index + 1}`;
        const isDone = Boolean(v.isCompleted);
        const adminDate = v.completedDate || v.administeredDate;
        const stdInfo = findStandardVaccineInfo(name, dose);

        return {
          id: v.id || `vrec_${index + 1}`,
          babyId: babyId,
          vaccineName: name,
          dose: dose,
          targetAgeMonths: v.targetAgeMonths ?? stdInfo?.targetAgeMonths ?? 0,
          targetAgeDescription: v.targetAgeDescription || stdInfo?.targetAgeDescription || '兒科時程',
          isCompleted: isDone,
          scheduledDate: v.scheduledDate || stdInfo?.scheduledDate,
          administeredDate: isDone ? adminDate : undefined,
          clinicName: v.clinicName || (isDone ? '衛生所/兒科' : undefined),
          isOptional: Boolean(v.isOptional || stdInfo?.isOptional),
        };
      });
    } else {
      vaccineRecords = initialVaccineSchedule.map((s) => ({ ...s, babyId }));
    }

    // 4. Diary Entries
    const rawDiary = Array.isArray(parsed.diaryEntries) ? parsed.diaryEntries : [];
    const diaryEntries: DiaryEntry[] = rawDiary.map((d: any, index: number) => {
      // Determine timestamp
      let timestamp = d.timestamp;
      if (!timestamp && d.date) {
        const time = d.time ? `${d.time}:00` : '12:00:00';
        timestamp = `${d.date}T${time}.000Z`;
      }
      if (!timestamp) {
        timestamp = new Date().toISOString();
      }

      // Map type
      let type: DiaryEntry['type'] = 'feed_bottle';
      if (d.type) {
        type = d.type;
      } else if (d.category === 'feeding') {
        const fType = d.metrics?.feedingType;
        if (fType === 'breast') type = 'feed_breast';
        else if (fType === 'solid') type = 'feed_solid';
        else type = 'feed_bottle';
      } else if (d.category === 'diaper') {
        const dType = d.metrics?.diaperType;
        if (dType === 'dirty') type = 'diaper_dirty';
        else if (dType === 'both') type = 'diaper_both';
        else type = 'diaper_wet';
      } else if (d.category === 'sleep') {
        type = 'sleep';
      } else if (d.category === 'temperature') {
        type = 'temperature';
      } else if (d.category === 'medication') {
        type = 'medication';
      }

      return {
        id: d.id || `diary_${Date.now()}_${index}`,
        babyId: babyId,
        type,
        timestamp,
        title: d.title || '日常照護記錄',
        note: d.content || d.note || '',
        amountMl: d.metrics?.feedingAmountMl ?? d.amountMl,
        durationMinutes: d.durationMinutes ?? d.metrics?.durationMinutes ?? (type === 'sleep' ? 60 : undefined),
        temperatureCelsius: d.temperatureCelsius ?? d.metrics?.temperature,
        diaperColor: d.diaperColor ?? d.metrics?.stoolColor,
        mood: d.mood || 'happy',
        loggedBy: d.author || d.loggedBy || '媽媽',
        createdAt: d.createdAt || timestamp,
      };
    });

    // Sort diary by timestamp desc
    diaryEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 5. Medical Visits
    const rawVisits = Array.isArray(parsed.medicalVisits) ? parsed.medicalVisits : [];
    const medicalVisits: MedicalVisit[] = rawVisits.map((m: any, index: number) => ({
      id: m.id || `visit_${Date.now()}_${index}`,
      babyId: babyId,
      date: m.date || new Date().toISOString().split('T')[0],
      clinic: m.clinicName || m.clinic || '小兒科門診',
      doctor: m.doctorName || m.doctor || '',
      reason: m.reason || '就診評估',
      diagnosis: m.diagnosis || '',
      doctorAdvice: m.notes || m.doctorAdvice || '',
      temperature: m.temperatureAtVisit ?? m.temperature,
      weight: m.weightAtVisit ?? m.weight,
      createdAt: m.createdAt || new Date().toISOString(),
    }));

    // 6. Sticky Notes
    const rawSticky = Array.isArray(parsed.stickyNotes) ? parsed.stickyNotes : [];
    const stickyNotes: StickyNote[] = rawSticky.map((s: any, index: number) => ({
      id: s.id || `note_${Date.now()}_${index}`,
      babyId: babyId,
      content: s.content || '',
      author: s.author || '媽媽',
      color: s.color || 'amber',
      isPinned: Boolean(s.isPinned),
      isResolved: Boolean(s.isResolved),
      createdAt: s.createdAt || new Date().toISOString(),
      updatedAt: s.updatedAt,
    }));

    const familyCode = parsed.syncInfo?.syncCode || baby.familyCode || 'BABY-5729';

    return {
      success: true,
      baby,
      growthRecords,
      vaccineRecords,
      diaryEntries,
      medicalVisits,
      stickyNotes,
      familyCode,
      stats: {
        growthCount: growthRecords.length,
        diaryCount: diaryEntries.length,
        vaccineCount: vaccineRecords.length,
        visitCount: medicalVisits.length,
        stickyCount: stickyNotes.length,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: `檔案解析錯誤: ${err?.message || '格式無效'}`,
    } as any;
  }
}
