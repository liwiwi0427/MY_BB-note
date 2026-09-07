import * as XLSX from 'xlsx';
import { AppDataStore, BabyProfile, DiaryEntry, GrowthRecord, VaccineRecord, MedicalVisit } from '../types';
import { calculateDailyIO } from './ioCalculator';
import { getBabyAgeDetails } from './storage';

/**
 * Helper to trigger file download in browser from an XLSX workbook
 */
function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Filter entries between startDate and endDate (inclusive strings YYYY-MM-DD)
 */
export function filterEntriesByDateRange<T extends { date: string }>(
  items: T[],
  startDateStr: string,
  endDateStr: string
): T[] {
  return items.filter((item) => {
    return item.date >= startDateStr && item.date <= endDateStr;
  });
}

/**
 * Get date range bounds for standard preset periods (7 days, 21 days, 30 days, 90 days, 180 days, etc.)
 */
export function getDateRangeBounds(days: number): { startStr: string; endStr: string; label: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const toStr = (d: Date) => d.toISOString().split('T')[0];
  
  let label = `${days}天`;
  if (days === 7) label = '一週 (過去7天)';
  else if (days === 21) label = '三週 (過去21天)';
  else if (days === 30) label = '一個月 (過去30天)';
  else if (days === 90) label = '三個月 (過去90天)';
  else if (days === 180) label = '半年 (過去180天)';

  return {
    startStr: toStr(start),
    endStr: toStr(end),
    label,
  };
}

/**
 * Helper to auto-fit column widths in SheetJS
 */
function autoFitColumns(data: any[][], minWidth = 10, maxWidth = 60) {
  const colWidths: number[] = [];
  data.forEach((row) => {
    row.forEach((cell, colIdx) => {
      const valStr = cell !== undefined && cell !== null ? String(cell) : '';
      // Count Chinese characters as 2 units, ASCII as 1
      let len = 0;
      for (let i = 0; i < valStr.length; i++) {
        len += valStr.charCodeAt(i) > 255 ? 2 : 1;
      }
      colWidths[colIdx] = Math.max(colWidths[colIdx] || minWidth, Math.min(len + 2, maxWidth));
    });
  });
  return colWidths.map((w) => ({ wch: w }));
}

/**
 * =========================================================================
 * 1. 家庭群組月度紀錄匯出 (.xlsx) - 當月及過去1個月，或自訂月份
 *    所有記錄一字不漏地完整匯出！
 * =========================================================================
 */
export function exportFamilyMonthlyRecordsXLSX(
  appData: AppDataStore,
  options: {
    periodType: 'current_and_previous' | 'current_only' | 'all' | 'custom_month';
    customYearMonth?: string; // e.g. "2026-09"
    adminName?: string;
  }
) {
  const { babyProfile, diaryEntries, growthRecords, vaccineRecords, medicalVisits, syncInfo } = appData;
  const now = new Date();

  // Determine date bounds
  let startDateStr = '';
  let endDateStr = '';
  let rangeTitle = '';

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  if (options.periodType === 'current_and_previous') {
    // Current month and past 1 month
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    
    // First day of previous month
    startDateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`;
    // Last day of current month
    const lastDayCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
    endDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayCurrent).padStart(2, '0')}`;
    rangeTitle = `當月及過去1個月 (${startDateStr} ~ ${endDateStr})`;
  } else if (options.periodType === 'current_only') {
    startDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const lastDayCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
    endDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayCurrent).padStart(2, '0')}`;
    rangeTitle = `當月記錄 (${startDateStr} ~ ${endDateStr})`;
  } else if (options.periodType === 'custom_month' && options.customYearMonth) {
    const [y, m] = options.customYearMonth.split('-').map(Number);
    startDateStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    endDateStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    rangeTitle = `${options.customYearMonth} 月度記錄 (${startDateStr} ~ ${endDateStr})`;
  } else {
    // All history
    startDateStr = '2000-01-01';
    endDateStr = '2099-12-31';
    rangeTitle = '歷來全部完整歷史檔案';
  }

  // Filter items by selected period
  const filterByDate = <T extends { date: string }>(list: T[]) =>
    options.periodType === 'all'
      ? list
      : list.filter((item) => item.date >= startDateStr && item.date <= endDateStr);

  const targetDiary = filterByDate(diaryEntries);
  const targetGrowth = filterByDate(growthRecords);
  const targetVisits = filterByDate(medicalVisits);

  const workbook = XLSX.utils.book_new();

  // -------------------------------------------------------------------------
  // Sheet 1: 寶寶與家庭管理總覽 (Overview & Admin)
  // -------------------------------------------------------------------------
  const ageDetails = getBabyAgeDetails(babyProfile.birthday);
  const overviewData: any[][] = [
    ['【暖暖初生】家庭群組健康紀錄月度管理總覽檔案'],
    ['產出時間', now.toLocaleString('zh-TW', { hour12: false })],
    ['匯出記錄區間', rangeTitle],
    ['家庭群組同步碼', syncInfo.syncCode],
    ['群組管理員身分', options.adminName || '主要家庭管理員'],
    ['連線伺服器', 'Google Firebase Firestore (專案: 323118599069)'],
    [''],
    ['【寶寶基本生理資料】'],
    ['項目', '內容數值', '補充說明'],
    ['寶寶姓名', babyProfile.name, babyProfile.nickname ? `暱稱：${babyProfile.nickname}` : ''],
    ['性別', babyProfile.gender === 'female' ? '女' : '男', ''],
    ['出生日期時間', `${babyProfile.birthday} ${babyProfile.birthTime || ''}`, `妊娠週數：${babyProfile.gestationalWeeks} 週`],
    ['實足年齡', ageDetails.formattedText, `出生天數：${ageDetails.days} 天`],
    ['血型', `${babyProfile.bloodType} 型`, ''],
    ['初生體重 (kg)', babyProfile.birthWeight, ''],
    ['初生身長 (cm)', babyProfile.birthLength, ''],
    ['初生頭圍 (cm)', babyProfile.birthHeadCirc, ''],
    ['兒科主治醫師', babyProfile.pediatrician || '未指定', ''],
    ['醫療院所', babyProfile.hospital || '未填寫', ''],
    ['病歷號碼', babyProfile.medicalRecordNumber || '未填寫', ''],
    ['緊急聯絡人', babyProfile.emergencyContact?.name ? `${babyProfile.emergencyContact.name} (${babyProfile.emergencyContact.relationship})` : '未設定', babyProfile.emergencyContact?.phone || ''],
    ['已知過敏史與警訊', babyProfile.allergies && babyProfile.allergies.length > 0 ? babyProfile.allergies.join('、') : '無已知過敏紀錄', '重要臨床警示'],
    [''],
    ['【本期匯出記錄筆數統計】'],
    ['記錄類型', '區間筆數', '全體歷史總筆數'],
    ['成長日記與日常記錄', targetDiary.length, diaryEntries.length],
    ['I/O 水分與排泄歷程', targetDiary.filter(e => e.category === 'io' || e.category === 'feeding' || e.category === 'diaper' || e.metrics?.feedingAmountMl || e.metrics?.urineAmountMl).length, diaryEntries.filter(e => e.category === 'io' || e.category === 'feeding' || e.category === 'diaper' || e.metrics?.feedingAmountMl || e.metrics?.urineAmountMl).length],
    ['生命徵象 Vital Signs (體溫)', targetDiary.filter(e => e.metrics?.temperatureC !== undefined).length, diaryEntries.filter(e => e.metrics?.temperatureC !== undefined).length],
    ['WHO 生長發育測量記錄', targetGrowth.length, growthRecords.length],
    ['門診就醫與用藥處方', targetVisits.length, medicalVisits.length],
    ['疫苗接種總項目數', vaccineRecords.length, vaccineRecords.length],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  wsOverview['!cols'] = autoFitColumns(overviewData);
  XLSX.utils.book_append_sheet(workbook, wsOverview, '寶寶檔案與家庭概況');

  // -------------------------------------------------------------------------
  // Sheet 2: 成長日記與日常生活全紀錄 (一字不漏)
  // -------------------------------------------------------------------------
  const sortedDiary = [...targetDiary].sort(
    (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
  );

  const categoryLabels: Record<string, string> = {
    daily: '日常隨記',
    feeding: '飲食哺乳',
    sleep: '睡眠休息',
    diaper: '排泄尿布',
    temperature: '體溫發燒',
    medical: '門診就醫',
    milestone: '重要里程碑',
    io: 'Total I/O 監測',
  };

  const moodLabels: Record<string, string> = {
    happy: '開心滿足',
    calm: '平靜沉穩',
    playful: '活潑好動',
    sleepy: '愛睏想睡',
    fussy: '哭鬧躁動',
    curious: '好奇探索',
  };

  const diaryHeaders = [
    '紀錄序號',
    '紀錄日期',
    '紀錄時間',
    '分類類別',
    '寶寶心情狀態',
    '日記標題',
    '完整內文 (一字不漏)',
    '紀錄作者',
    '里程碑標記',
    '餵食種類',
    '攝入量(ml)',
    '尿布類型',
    '尿量(ml)',
    '測量體溫(°C)',
    '退燒或用藥',
    '睡眠時數(h)',
    '照片附件數',
  ];

  const diaryRows = sortedDiary.map((e, idx) => [
    idx + 1,
    e.date,
    e.time || '未註記',
    categoryLabels[e.category] || e.category,
    moodLabels[e.mood] || e.mood,
    e.title || '無標題',
    e.content || '', // 一字不漏完整內容
    e.author || '家人',
    e.milestoneTag || '',
    e.metrics?.feedingType || '',
    e.metrics?.feedingAmountMl ?? '',
    e.metrics?.diaperType || '',
    e.metrics?.urineAmountMl ?? '',
    e.metrics?.temperatureC ?? '',
    e.metrics?.medicationTaken || '',
    e.metrics?.sleepHours ?? '',
    e.photos?.length || 0,
  ]);

  const wsDiary = XLSX.utils.aoa_to_sheet([diaryHeaders, ...diaryRows]);
  wsDiary['!cols'] = autoFitColumns([diaryHeaders, ...diaryRows]);
  XLSX.utils.book_append_sheet(workbook, wsDiary, '日常成長日記(完整一字不漏)');

  // -------------------------------------------------------------------------
  // Sheet 3: Total I/O 水分與排泄專題歷程 (Intake & Output)
  // -------------------------------------------------------------------------
  const ioEntries = sortedDiary.filter(
    (e) =>
      e.category === 'io' ||
      e.category === 'feeding' ||
      e.category === 'diaper' ||
      e.metrics?.feedingAmountMl ||
      e.metrics?.waterAmountMl ||
      e.metrics?.urineAmountMl ||
      e.metrics?.diaperType ||
      e.metrics?.vomitMl
  );

  const ioHeaders = [
    '序號',
    '日期',
    '時間',
    'I/O 屬性',
    '事件標題',
    '攝入種類',
    '攝入量 (ml)',
    '親餵時長 (分)',
    '副食品詳細說明',
    '飲水量 (ml)',
    '尿布類型',
    '濕度等級',
    '估算/實測尿量 (ml)',
    '大便性狀',
    '大便顏色',
    '嘔吐量 (ml)',
    '嘔吐程度',
    '完整備註筆記 (一字不漏)',
    '紀錄者',
  ];

  const ioRows = ioEntries.map((e, idx) => {
    const isIntake = Boolean(e.metrics?.feedingAmountMl || e.metrics?.waterAmountMl || e.metrics?.feedingType);
    const isOutput = Boolean(e.metrics?.diaperType || e.metrics?.urineAmountMl || e.metrics?.vomitMl);
    const kind = isIntake && isOutput ? '攝入+排出' : isIntake ? 'Intake (攝入)' : isOutput ? 'Output (排出)' : 'I/O 常規';

    return [
      idx + 1,
      e.date,
      e.time || '12:00',
      kind,
      e.title,
      e.metrics?.feedingType || '',
      e.metrics?.feedingAmountMl ?? '',
      e.metrics?.feedingDurationMins ?? '',
      e.metrics?.solidFoodDetails || '',
      e.metrics?.waterAmountMl ?? '',
      e.metrics?.diaperType || '',
      e.metrics?.diaperWetnessLevel || '',
      e.metrics?.urineAmountMl ?? '',
      e.metrics?.stoolConsistency || '',
      e.metrics?.stoolColor || '',
      e.metrics?.vomitMl ?? '',
      e.metrics?.vomitSeverity || '',
      e.content || '',
      e.author || '家人',
    ];
  });

  const wsIO = XLSX.utils.aoa_to_sheet([ioHeaders, ...ioRows]);
  wsIO['!cols'] = autoFitColumns([ioHeaders, ...ioRows]);
  XLSX.utils.book_append_sheet(workbook, wsIO, 'Total IO水分與排泄明細');

  // -------------------------------------------------------------------------
  // Sheet 4: 生命徵象 Vital Signs (體溫與發燒照護)
  // -------------------------------------------------------------------------
  const vitalEntries = sortedDiary.filter((e) => e.metrics?.temperatureC !== undefined);
  const vitalHeaders = [
    '序號',
    '測量日期',
    '測量時間',
    '體溫數值 (°C)',
    '臨床警訊評估',
    '退燒與給藥處置',
    '伴隨症狀與觀察筆記 (一字不漏)',
    '記錄者',
  ];

  const vitalRows = vitalEntries.map((e, idx) => {
    const temp = e.metrics!.temperatureC!;
    let alert = '正常範圍';
    if (temp >= 38.5) alert = '⚠️ 高燒 (≥38.5°C) 需醫師診治';
    else if (temp >= 38.0) alert = '發燒 (≥38.0°C)';
    else if (temp >= 37.5) alert = '微熱 (37.5~37.9°C)';

    return [
      idx + 1,
      e.date,
      e.time || '12:00',
      temp,
      alert,
      e.metrics?.medicationTaken || '無用藥',
      e.content || e.title,
      e.author || '家人',
    ];
  });

  const wsVitals = XLSX.utils.aoa_to_sheet([vitalHeaders, ...vitalRows]);
  wsVitals['!cols'] = autoFitColumns([vitalHeaders, ...vitalRows]);
  XLSX.utils.book_append_sheet(workbook, wsVitals, '生命徵象與體溫監測');

  // -------------------------------------------------------------------------
  // Sheet 5: WHO 兒童生長發育歷史 (Growth Records)
  // -------------------------------------------------------------------------
  const sortedGrowth = [...targetGrowth].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const growthHeaders = [
    '測量序號',
    '測量日期',
    '寶寶月齡 (月)',
    '實足天數 (天)',
    '體重 (kg)',
    'WHO 體重百分位 (P)',
    '身長 (cm)',
    'WHO 身長百分位 (P)',
    '頭圍 (cm)',
    'WHO 頭圍百分位 (P)',
    'BMI 指數',
    '測量人員/院所',
    '醫師或家長備註說明 (一字不漏)',
  ];

  const growthRows = sortedGrowth.map((g, idx) => [
    idx + 1,
    g.date,
    g.ageMonths,
    g.ageDays || '',
    g.weight,
    g.percentileWeight !== undefined ? `P${g.percentileWeight}` : '',
    g.length,
    g.percentileLength !== undefined ? `P${g.percentileLength}` : '',
    g.headCirc,
    g.percentileHeadCirc !== undefined ? `P${g.percentileHeadCirc}` : '',
    g.bmi ? g.bmi.toFixed(1) : '',
    g.measuredBy || '',
    g.doctorNote || '',
  ]);

  const wsGrowth = XLSX.utils.aoa_to_sheet([growthHeaders, ...growthRows]);
  wsGrowth['!cols'] = autoFitColumns([growthHeaders, ...growthRows]);
  XLSX.utils.book_append_sheet(workbook, wsGrowth, 'WHO生長發育歷史');

  // -------------------------------------------------------------------------
  // Sheet 6: 疫苗接種完整時程 (Vaccine Records)
  // -------------------------------------------------------------------------
  const vaccineHeaders = [
    '項次',
    '疫苗名稱',
    '劑次',
    '預定接種日期',
    '完成接種日期',
    '接種狀態',
    '施打診所/醫院',
    '疫苗批號 (Lot No.)',
    '診治醫師',
    '接種後反應等級',
    '發燒體溫 (°C)',
    '副作用與觀察筆記 (一字不漏)',
    '下次預約回診日期',
  ];

  const vaccineRows = vaccineRecords.map((v, idx) => [
    idx + 1,
    v.vaccineName,
    `第 ${v.doseNumber} 劑`,
    v.scheduledDate,
    v.completedDate || '尚未接種',
    v.isCompleted ? '已完成接種' : '待接種排程中',
    v.clinicName || '',
    v.lotNumber || '',
    v.doctorName || '',
    v.reactionGrade || '無不良反應',
    v.feverTemp ?? '',
    v.reactionNotes || '',
    v.nextAppointmentDate || '',
  ]);

  const wsVaccines = XLSX.utils.aoa_to_sheet([vaccineHeaders, ...vaccineRows]);
  wsVaccines['!cols'] = autoFitColumns([vaccineHeaders, ...vaccineRows]);
  XLSX.utils.book_append_sheet(workbook, wsVaccines, '疫苗接種全歷程');

  // -------------------------------------------------------------------------
  // Sheet 7: 門診就診與處方用藥 (Medical Visits)
  // -------------------------------------------------------------------------
  const sortedVisits = [...targetVisits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const visitHeaders = [
    '就醫序號',
    '看診日期',
    '院所機構',
    '主治醫師',
    '看診主訴與求診原因',
    '醫師臨床診斷',
    '伴隨症狀清單',
    '門診量測體溫 (°C)',
    '開立處方藥物明細 (藥名 / 劑量 / 頻率 / 天數 / 服用方式)',
    '下次回診追蹤日期',
    '詳細醫囑與特別交代 (一字不漏)',
  ];

  const visitRows = sortedVisits.map((v, idx) => {
    const rxText = v.prescriptions && v.prescriptions.length > 0
      ? v.prescriptions.map((p, pIdx) => `${pIdx + 1}. ${p.name} (劑量:${p.dosage}, 頻率:${p.frequency}, ${p.days}天${p.instructions ? `, 備註:${p.instructions}` : ''})`).join('\n')
      : '無開藥';

    return [
      idx + 1,
      v.date,
      v.clinicName,
      v.doctorName || '',
      v.reason,
      v.diagnosis,
      v.symptoms?.join('、') || '',
      v.temperatureAtVisit ?? '',
      rxText,
      v.nextFollowUpDate || '',
      v.notes || '',
    ];
  });

  const wsVisits = XLSX.utils.aoa_to_sheet([visitHeaders, ...visitRows]);
  wsVisits['!cols'] = autoFitColumns([visitHeaders, ...visitRows]);
  XLSX.utils.book_append_sheet(workbook, wsVisits, '門診就醫與用藥處方');

  // Generate and download filename
  const sanitize = (s: string) => s.replace(/[\/\s:]/g, '_');
  const filename = `${sanitize(babyProfile.name)}_家庭群組月度紀錄_${sanitize(rangeTitle)}.xlsx`;
  downloadWorkbook(workbook, filename);
}

/**
 * =========================================================================
 * 2. 匯出指定區間的 I/O 與 Vital Sign 專屬 Excel (.xlsx)
 * =========================================================================
 */
export function exportIOAndVitalSignsXLSX(
  diaryEntries: DiaryEntry[],
  babyProfile: BabyProfile,
  growthRecords: GrowthRecord[],
  rangeDays: number,
  rangeLabel: string
) {
  const { startStr, endStr } = getDateRangeBounds(rangeDays);
  const now = new Date();

  // Filter entries
  const filteredEntries = diaryEntries.filter(
    (e) => e.date >= startStr && e.date <= endStr
  );

  // Latest baby weight for calculations
  const sortedGrowth = [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const babyWeight = sortedGrowth[0]?.weight || babyProfile.birthWeight || 4.5;

  const workbook = XLSX.utils.book_new();

  // Sheet 1: 每日 24h I/O 統計平衡彙總
  // Collect all unique dates in the range
  const datesInRange: string[] = [];
  const cur = new Date(startStr);
  const endD = new Date(endStr);
  while (cur <= endD) {
    datesInRange.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  datesInRange.reverse(); // Most recent first

  const dailySummaries = datesInRange.map((d) => {
    const summary = calculateDailyIO(diaryEntries, d, babyWeight);
    return {
      date: d,
      ...summary,
    };
  }).filter((s) => s.totalIntakeMl > 0 || s.totalOutputMl > 0 || s.totalDiaperCount > 0);

  const summaryHeaders = [
    '日期',
    '24h 總攝入 (ml)',
    '配方奶量 (ml)',
    '母乳量 (ml)',
    '飲水量 (ml)',
    '24h 總排出 (ml)',
    '估算尿量 (ml)',
    '嘔吐量 (ml)',
    '換尿布次數 (片)',
    '濕重尿布 (片)',
    '排便次數 (次)',
    '每小時排尿率 (ml/kg/hr)',
    '淨水分平衡 (ml)',
    '脫水與水分狀態評估',
  ];

  const summaryRows = dailySummaries.map((s) => [
    s.date,
    s.totalIntakeMl,
    s.intakeBreakdown.formulaMilkMl,
    s.intakeBreakdown.breastMilkMl,
    s.intakeBreakdown.waterMl,
    s.totalOutputMl,
    s.totalUrineMl,
    s.totalVomitMl,
    s.totalDiaperCount,
    s.heavyDiaperCount,
    s.stoolCount,
    s.urineHourlyRate,
    s.netFluidBalanceMl > 0 ? `+${s.netFluidBalanceMl}` : s.netFluidBalanceMl,
    s.hydrationStatusLabel,
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet([
    [`【${babyProfile.name}】Total I/O 每日水分與排泄統計彙總 (${rangeLabel})`],
    [`產出時間：${now.toLocaleString('zh-TW', { hour12: false })} ｜ 計算參考體重：${babyWeight} kg`],
    [''],
    summaryHeaders,
    ...summaryRows,
  ]);
  wsSummary['!cols'] = autoFitColumns([summaryHeaders, ...summaryRows]);
  XLSX.utils.book_append_sheet(workbook, wsSummary, '每日IO水分平衡彙總');

  // Sheet 2: 逐筆 I/O 詳細紀錄
  const ioEntries = filteredEntries.filter(
    (e) =>
      e.category === 'io' ||
      e.category === 'feeding' ||
      e.category === 'diaper' ||
      e.metrics?.feedingAmountMl ||
      e.metrics?.urineAmountMl
  ).sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());

  const ioHeaders = [
    '序號',
    '日期',
    '時間',
    '類型',
    '事件標題',
    '攝入種類',
    '攝入量 (ml)',
    '尿布狀況',
    '尿量 (ml)',
    '大便狀況',
    '嘔吐量 (ml)',
    '詳細備註說明 (一字不漏)',
    '記錄者',
  ];

  const ioRows = ioEntries.map((e, idx) => [
    idx + 1,
    e.date,
    e.time || '12:00',
    e.metrics?.feedingAmountMl ? '攝入 (Intake)' : '排出 (Output)',
    e.title,
    e.metrics?.feedingType || '',
    e.metrics?.feedingAmountMl ?? '',
    e.metrics?.diaperType || '',
    e.metrics?.urineAmountMl ?? '',
    e.metrics?.stoolConsistency ? `${e.metrics.stoolConsistency} (${e.metrics.stoolColor || ''})` : '',
    e.metrics?.vomitMl ?? '',
    e.content || '',
    e.author || '家人',
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([ioHeaders, ...ioRows]);
  wsDetail['!cols'] = autoFitColumns([ioHeaders, ...ioRows]);
  XLSX.utils.book_append_sheet(workbook, wsDetail, 'IO逐筆記錄明細');

  // Sheet 3: 生命徵象 Vital Signs (體溫與發燒紀錄)
  const vitalEntries = filteredEntries
    .filter((e) => e.metrics?.temperatureC !== undefined)
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());

  const vitalHeaders = [
    '序號',
    '測量日期',
    '測量時間',
    '體溫數值 (°C)',
    '臨床警訊判定',
    '退燒處方或用藥處置',
    '症狀與觀察紀錄 (一字不漏)',
    '記錄者',
  ];

  const vitalRows = vitalEntries.map((e, idx) => {
    const temp = e.metrics!.temperatureC!;
    let alert = '正常';
    if (temp >= 38.5) alert = '⚠️ 高燒 (≥38.5°C)';
    else if (temp >= 38.0) alert = '發燒 (≥38.0°C)';
    else if (temp >= 37.5) alert = '微熱 (37.5~37.9°C)';

    return [
      idx + 1,
      e.date,
      e.time || '12:00',
      temp,
      alert,
      e.metrics?.medicationTaken || '無給藥',
      e.content || e.title,
      e.author || '家人',
    ];
  });

  const wsVitals = XLSX.utils.aoa_to_sheet([vitalHeaders, ...vitalRows]);
  wsVitals['!cols'] = autoFitColumns([vitalHeaders, ...vitalRows]);
  XLSX.utils.book_append_sheet(workbook, wsVitals, '生命徵象與體溫明細');

  const sanitize = (s: string) => s.replace(/[\/\s:]/g, '_');
  const filename = `${sanitize(babyProfile.name)}_IO與生命徵象報表_${sanitize(rangeLabel)}.xlsx`;
  downloadWorkbook(workbook, filename);
}
