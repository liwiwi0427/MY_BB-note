import type { VaccineRecord } from '../types';

/**
 * 衛生福利部疾病管制署 (Taiwan CDC) 兒童常規與推薦預防接種時程定義
 */
export interface TaiwanVaccineTemplate {
  templateId: string;
  vaccineName: string;
  dose: number;
  targetAgeMonths: number;
  targetAgeDescription: string;
  isOptional: boolean;
  category: 'national_free' | 'recommended_paid' | 'seasonal';
  preventDisease: string;
  precautions: string;
}

export const TAIWAN_CDC_VACCINE_TEMPLATES: TaiwanVaccineTemplate[] = [
  // 出生 24 小時內
  {
    templateId: 'tw-hepb-1',
    vaccineName: 'B型肝炎疫苗 (HepB 第 1 劑)',
    dose: 1,
    targetAgeMonths: 0,
    targetAgeDescription: '出生 24 小時內儘速接種',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防B型肝炎病毒感染、慢性帶原、猛爆性肝炎、肝硬化及肝癌。',
    precautions: '出生體重達 2000 公克以上之健康新生兒應於 24 小時內儘速接種。母親若為 e 抗原陽性帶原者，需同時於 24 小時內注射 B 型肝炎免疫球蛋白 (HBIG)。',
  },
  // 滿 1 個月
  {
    templateId: 'tw-hepb-2',
    vaccineName: 'B型肝炎疫苗 (HepB 第 2 劑)',
    dose: 2,
    targetAgeMonths: 1,
    targetAgeDescription: '出生滿 1 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '延續第 1 劑保護力，建立抗體基底。',
    precautions: '接種部位為大腿前外側。少數嬰兒注射部位可能有紅腫疼痛，通常 2-3 天內自然消退。',
  },
  // 滿 2 個月
  {
    templateId: 'tw-dtap-1',
    vaccineName: '五合一疫苗 (DTaP-Hib-IPV 第 1 劑)',
    dose: 1,
    targetAgeMonths: 2,
    targetAgeDescription: '出生滿 2 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防白喉、破傷風、非細胞性百日咳、b型嗜血桿菌引起之侵襲性感染及小兒麻痺症。',
    precautions: '接種後可能出現輕微發燒（<38.5°C）或注射部位硬塊紅腫，可遵醫囑冰敷或使用溫和退燒藥物。',
  },
  {
    templateId: 'tw-pcv13-1',
    vaccineName: '13價結合型肺炎鏈球菌疫苗 (PCV13 第 1 劑)',
    dose: 1,
    targetAgeMonths: 2,
    targetAgeDescription: '出生滿 2 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防 13 種血清型肺炎鏈球菌引起之嚴重肺炎、化膿性腦膜炎、敗血症及急性中耳炎。',
    precautions: '可與五合一疫苗同時於不同大腿部位分開接種。',
  },
  {
    templateId: 'tw-rota-1',
    vaccineName: '口服輪狀病毒疫苗 (Rotavirus 自費第 1 劑)',
    dose: 1,
    targetAgeMonths: 2,
    targetAgeDescription: '出生滿 2 個月 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '預防嬰幼兒輪狀病毒引起的嚴重急性腸胃炎、脫水、嘔吐及住院風險。',
    precautions: '採口服滴劑。建議餵食前或後 30 分鐘避免大量喝奶以防溢吐。若吐出無需補服，可依後續時程繼續完成後續劑次。',
  },
  {
    templateId: 'tw-ev71-1',
    vaccineName: '腸病毒71型疫苗 (EV71 自費第 1 劑)',
    dose: 1,
    targetAgeMonths: 2,
    targetAgeDescription: '出生滿 2 個月至 6 歲 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '預防腸病毒71型感染所引起之重症腦幹腦炎、脊髓灰質炎樣麻痺、心肺衰竭及致命後遺症。',
    precautions: '2 個月以上嬰幼兒即可開始評估接種。一般需接種 2 劑，兩劑間隔至少 28 天。',
  },
  {
    templateId: 'tw-menb-1',
    vaccineName: 'B型流行性腦脊髓膜炎疫苗 (MenB 自費第 1 劑)',
    dose: 1,
    targetAgeMonths: 2,
    targetAgeDescription: '出生滿 2 個月 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '預防 B 群腦膜炎雙球菌引起的猛爆性流行性腦脊髓膜炎及嚴重菌血症。',
    precautions: '接種後發燒機率稍高，可於接種後依兒科醫師建議預防性給予退燒藥。',
  },
  // 滿 4 個月
  {
    templateId: 'tw-dtap-2',
    vaccineName: '五合一疫苗 (DTaP-Hib-IPV 第 2 劑)',
    dose: 2,
    targetAgeMonths: 4,
    targetAgeDescription: '出生滿 4 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '持續提升白喉、破傷風、百日咳、b型嗜血桿菌及小兒麻痺之保護抗體效價。',
    precautions: '與第 1 劑間隔需滿 2 個月。注射後多觀察活動力與體溫。',
  },
  {
    templateId: 'tw-pcv13-2',
    vaccineName: '13價結合型肺炎鏈球菌疫苗 (PCV13 第 2 劑)',
    dose: 2,
    targetAgeMonths: 4,
    targetAgeDescription: '出生滿 4 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '鞏固嬰兒期肺炎鏈球菌免疫記憶。',
    precautions: '可與五合一第二劑同時施打於不同肢體部位。',
  },
  {
    templateId: 'tw-rota-2',
    vaccineName: '口服輪狀病毒疫苗 (Rotavirus 自費第 2 劑)',
    dose: 2,
    targetAgeMonths: 4,
    targetAgeDescription: '出生滿 4 個月 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '完成二劑型輪狀病毒完整免疫保護力。',
    precautions: '兩劑間隔至少需 4 週。',
  },
  {
    templateId: 'tw-ev71-2',
    vaccineName: '腸病毒71型疫苗 (EV71 自費第 2 劑)',
    dose: 2,
    targetAgeMonths: 4,
    targetAgeDescription: '出生滿 4 個月 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '完成腸病毒71型基礎免疫，抗體保護率達 96% 以上。',
    precautions: '與第 1 劑間隔滿 28 天以上。',
  },
  {
    templateId: 'tw-menb-2',
    vaccineName: 'B型流行性腦脊髓膜炎疫苗 (MenB 自費第 2 劑)',
    dose: 2,
    targetAgeMonths: 4,
    targetAgeDescription: '出生滿 4 個月 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '鞏固 B 群腦脊髓膜炎保護力。',
    precautions: '與第 1 劑間隔滿 2 個月。',
  },
  // 滿 5 個月
  {
    templateId: 'tw-bcg-1',
    vaccineName: '卡介苗 (BCG 第 1 劑)',
    dose: 1,
    targetAgeMonths: 5,
    targetAgeDescription: '出生滿 5-8 個月 (建議5個月)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防結核菌感染引發之結核性腦膜炎及全身散播性粟粒性結核病。',
    precautions: '左上臂皮內注射。注射後 1-2 週局部可能紅腫微突起，4-6 週可能化膿結痂，請保持乾爽清潔，切勿刻意擠壓或塗抹藥膏，結痂脫落後會留下小疤痕。',
  },
  // 滿 6 個月
  {
    templateId: 'tw-dtap-3',
    vaccineName: '五合一疫苗 (DTaP-Hib-IPV 第 3 劑)',
    dose: 3,
    targetAgeMonths: 6,
    targetAgeDescription: '出生滿 6 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '完成嬰兒期五合一基礎接種 3 劑療程。',
    precautions: '與第 2 劑間隔需滿 2 個月。',
  },
  {
    templateId: 'tw-hepb-3',
    vaccineName: 'B型肝炎疫苗 (HepB 第 3 劑)',
    dose: 3,
    targetAgeMonths: 6,
    targetAgeDescription: '出生滿 6 個月',
    isOptional: false,
    category: 'national_free',
    preventDisease: '完成 B 型肝炎 3 劑完整免疫，建立終身抗體記憶。',
    precautions: '與第 2 劑間隔至少滿 2 個月，與第 1 劑間隔至少滿 4 個月。',
  },
  {
    templateId: 'tw-flu-1',
    vaccineName: '季節性流感疫苗 (Influenza 第 1 劑)',
    dose: 1,
    targetAgeMonths: 6,
    targetAgeDescription: '出生滿 6 個月以上 (每年10月公費開打)',
    isOptional: false,
    category: 'seasonal',
    preventDisease: '預防季節性 A 型與 B 型流感病毒及其引起的嚴重支氣管炎、肺炎併發症。',
    precautions: '未滿 9 歲初次接種流感疫苗之幼兒，需接種 2 劑，兩劑需間隔 4 週以上。',
  },
  {
    templateId: 'tw-rota-3',
    vaccineName: '口服輪狀病毒疫苗 (3劑型者自費第 3 劑)',
    dose: 3,
    targetAgeMonths: 6,
    targetAgeDescription: '出生滿 6 個月 (自費推薦)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '若選用 Rotateq 3劑型者，於 6 個月大口服第 3 劑完成全套防護。',
    precautions: '最晚需在出生滿 8 個月 (32週) 前完成全部劑次。',
  },
  // 滿 7 個月
  {
    templateId: 'tw-flu-2',
    vaccineName: '季節性流感疫苗 (Influenza 第 2 劑 / 初次追加)',
    dose: 2,
    targetAgeMonths: 7,
    targetAgeDescription: '初次接種流感滿 4 週後 (滿 7 個月)',
    isOptional: false,
    category: 'seasonal',
    preventDisease: '完成幼兒初次流感 2 劑基礎免疫。',
    precautions: '與第 1 劑需間隔滿 4 週 (28天) 以上。',
  },
  // 滿 12 個月 (1 歲)
  {
    templateId: 'tw-mmr-1',
    vaccineName: '麻疹腮腺炎德國麻疹混合疫苗 (MMR 第 1 劑)',
    dose: 1,
    targetAgeMonths: 12,
    targetAgeDescription: '出生滿 12 個月 (1歲)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防麻疹、流行性腮腺炎及德國麻疹感染。',
    precautions: '活性減毒疫苗。接種後 5-12 天內，約 5-10% 幼兒可能有短暫輕微發燒或疹子，多喝水休息即可。',
  },
  {
    templateId: 'tw-varicella-1',
    vaccineName: '水痘疫苗 (Varicella 第 1 劑)',
    dose: 1,
    targetAgeMonths: 12,
    targetAgeDescription: '出生滿 12 個月 (1歲)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防感染水痘及其繼發性蜂窩性組織炎、肺炎、小腦炎等嚴重併發症。',
    precautions: '可與 MMR 疫苗同時不同部位分開接種，或間隔至少 28 天以上。',
  },
  {
    templateId: 'tw-pcv13-3',
    vaccineName: '13價結合型肺炎鏈球菌疫苗 (PCV13 第 3 劑 / 追加)',
    dose: 3,
    targetAgeMonths: 12,
    targetAgeDescription: '出生滿 12-15 個月 (公費追加)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '完成幼兒肺炎鏈球菌 2+1 公費常規追加劑，防護力大幅延長。',
    precautions: '與第 2 劑需間隔滿 6 個月以上。',
  },
  {
    templateId: 'tw-hepa-1',
    vaccineName: 'A型肝炎疫苗 (HepA 第 1 劑)',
    dose: 1,
    targetAgeMonths: 12,
    targetAgeDescription: '出生滿 12 個月 (全面公費)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防經糞口飲食傳播之 A 型肝炎病毒引起的急性肝炎、黃疸及猛爆性肝炎。',
    precautions: '疾管署自 2018 年起全面納入滿 1 歲幼兒公費常規接種。',
  },
  // 滿 15 個月 (1 歲 3 個月)
  {
    templateId: 'tw-je-1',
    vaccineName: '活性減毒日本腦炎疫苗 (JE-LAV 第 1 劑)',
    dose: 1,
    targetAgeMonths: 15,
    targetAgeDescription: '出生滿 15 個月 (1歲3個月)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '預防經三斑家蚊叮咬傳播之日本腦炎病毒引起之腦膜炎、永久神經後遺症及死亡。',
    precautions: '採活性減毒疫苗，總共需接種 2 劑。如與 MMR、水痘疫苗不同天施打，需間隔至少 28 天。',
  },
  // 滿 18 個月 (1 歲半)
  {
    templateId: 'tw-dtap-4',
    vaccineName: '五合一疫苗 (DTaP-Hib-IPV 第 4 劑 / 追加)',
    dose: 4,
    targetAgeMonths: 18,
    targetAgeDescription: '出生滿 18 個月 (1歲半追加)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '五合一追加劑，鞏固學齡前白喉、百日咳、破傷風及小兒麻痺免疫抗體。',
    precautions: '與第 3 劑需間隔至少滿 6 個月。',
  },
  {
    templateId: 'tw-hepa-2',
    vaccineName: 'A型肝炎疫苗 (HepA 第 2 劑 / 追加)',
    dose: 2,
    targetAgeMonths: 18,
    targetAgeDescription: '滿 18 個月 (與第1劑間隔6-12個月)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '完成 A 型肝炎完整 2 劑接種，獲得超過 20 年甚至終身保護力。',
    precautions: '與第 1 劑間隔至少需滿 6 個月。',
  },
  // 滿 27 個月 (2 歲 3 個月)
  {
    templateId: 'tw-je-2',
    vaccineName: '活性減毒日本腦炎疫苗 (JE-LAV 第 2 劑 / 追加)',
    dose: 2,
    targetAgeMonths: 27,
    targetAgeDescription: '滿 2 歲 3 個月 (與第1劑間隔12個月)',
    isOptional: false,
    category: 'national_free',
    preventDisease: '完成活性減毒日本腦炎全療程，建立長效鞏固免疫。',
    precautions: '與第 1 劑需間隔滿 12 個月。',
  },
  // 滿 5 歲至入國小前 (6 歲)
  {
    templateId: 'tw-dtap-ipv-school',
    vaccineName: '四合一疫苗 (DTaP-IPV 國小入學前追加)',
    dose: 1,
    targetAgeMonths: 60,
    targetAgeDescription: '滿 5 歲至入小學前',
    isOptional: false,
    category: 'national_free',
    preventDisease: '提升學齡期白喉、破傷風、非細胞性百日咳及不活化小兒麻痺之抗體濃度。',
    precautions: '國小入學前必備接種項目。接種後需妥善保管兒童健康手冊以備入學查核。',
  },
  {
    templateId: 'tw-mmr-2',
    vaccineName: '麻疹腮腺炎德國麻疹混合疫苗 (MMR 第 2 劑)',
    dose: 2,
    targetAgeMonths: 60,
    targetAgeDescription: '滿 5 歲至入小學前',
    isOptional: false,
    category: 'national_free',
    preventDisease: '提升麻疹與德國麻疹整體族群群體免疫率達 99% 以上。',
    precautions: '國小入學前必備接種項目。',
  },
  {
    templateId: 'tw-varicella-2',
    vaccineName: '水痘疫苗 (Varicella 自費第 2 劑 / 兒科醫學會推薦)',
    dose: 2,
    targetAgeMonths: 60,
    targetAgeDescription: '滿 4-6 歲入學前 (自費推薦追加)',
    isOptional: true,
    category: 'recommended_paid',
    preventDisease: '預防水痘突破性感染（Breakthrough Varicella），防止國小校園群聚感染。',
    precautions: '台灣兒科醫學會與美國 CDC 強烈建議於 4-6 歲追加第 2 劑水痘疫苗，保護力由 85% 提升至 98% 以上。',
  },
];

/**
 * 根據寶寶出生日期，自動精準推算所有台灣疾管署時程之預定日期 (YYYY-MM-DD)
 */
export function generateTaiwanFullVaccineSchedule(babyId: string, birthDateStr: string): VaccineRecord[] {
  const birth = new Date(birthDateStr);
  const isValidDate = !isNaN(birth.getTime());
  const baseDate = isValidDate ? birth : new Date();

  return TAIWAN_CDC_VACCINE_TEMPLATES.map((tmpl, idx) => {
    // 計算預定日期: baseDate + targetAgeMonths
    const targetDate = new Date(baseDate);
    targetDate.setMonth(targetDate.getMonth() + tmpl.targetAgeMonths);
    const scheduledDate = targetDate.toISOString().split('T')[0];

    return {
      id: `tw-vac-${babyId}-${tmpl.templateId}-${idx}`,
      babyId,
      vaccineName: tmpl.vaccineName,
      dose: tmpl.dose,
      targetAgeMonths: tmpl.targetAgeMonths,
      targetAgeDescription: tmpl.targetAgeDescription,
      isCompleted: false,
      scheduledDate,
      isOptional: tmpl.isOptional,
      category: tmpl.category,
      preventDisease: tmpl.preventDisease,
      precautions: tmpl.precautions,
    };
  });
}

// 預設初始時程資料 (搭配 2026-03-15 出生之示範寶寶)
export const initialVaccineSchedule: VaccineRecord[] = generateTaiwanFullVaccineSchedule('baby-default-1', '2026-03-15').map((v, i) => {
  // 示範前幾劑已於台大與李小兒科完成
  if (i === 0) {
    return { ...v, isCompleted: true, administeredDate: '2026-03-15', clinicName: '台大婦幼小兒科' };
  }
  if (i === 1) {
    return { ...v, isCompleted: true, administeredDate: '2026-04-16', clinicName: '台大婦幼小兒科' };
  }
  if (i === 2 || i === 3 || i === 4) {
    return { ...v, isCompleted: true, administeredDate: '2026-05-15', clinicName: '李小兒科門診' };
  }
  if (i === 7 || i === 8 || i === 9) {
    return { ...v, isCompleted: true, administeredDate: '2026-07-18', clinicName: '李小兒科門診' };
  }
  return v;
});
