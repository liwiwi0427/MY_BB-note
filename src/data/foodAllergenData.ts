export type FoodCategory = 'grains' | 'vegetables' | 'fruits' | 'proteins' | 'allergens';

export type FoodTrialStatus = 'untried' | 'trying' | 'passed' | 'allergic';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  recommendedAgeMonths: number; // e.g. 4, 6, 8
  allergenRisk: 'low' | 'medium' | 'high';
  prepTips: string;
  nutrition: string;
}

export const FOOD_DATABASE: FoodItem[] = [
  // 穀物根莖類
  {
    id: 'food_10x_porridge',
    name: '十倍粥 / 米湯',
    category: 'grains',
    recommendedAgeMonths: 4,
    allergenRisk: 'low',
    prepTips: '白米與水以 1:10 比例慢火熬煮並過篩攪打成滑順乳狀。',
    nutrition: '溫和好消化，作為副食品第一口的最佳啟蒙食材。',
  },
  {
    id: 'food_sweet_potato',
    name: '地瓜泥',
    category: 'grains',
    recommendedAgeMonths: 4,
    allergenRisk: 'low',
    prepTips: '蒸熟後壓成泥狀，可加少量母乳或開水調稀。',
    nutrition: '富含膳食纖維、胡蘿蔔素，天然甜味接受度高。',
  },
  {
    id: 'food_pumpkin',
    name: '南瓜泥',
    category: 'grains',
    recommendedAgeMonths: 4,
    allergenRisk: 'low',
    prepTips: '去皮去籽蒸透後壓泥，口感細緻滑順。',
    nutrition: '維生素 A、C 與鋅，保護呼吸道與消化道黏膜。',
  },
  {
    id: 'food_oatmeal',
    name: '嬰兒燕麥糊',
    category: 'grains',
    recommendedAgeMonths: 6,
    allergenRisk: 'low',
    prepTips: '使用無添加天然純燕麥片煮軟後打碎。',
    nutrition: '富含水溶性膳食纖維與維生素 B 群，有助排便順暢。',
  },
  {
    id: 'food_potato',
    name: '馬鈴薯泥',
    category: 'grains',
    recommendedAgeMonths: 5,
    allergenRisk: 'low',
    prepTips: '洗淨去芽眼，蒸熟壓成細泥混合米湯。',
    nutrition: '提供優質碳水化合物與鉀離子，溫和飽足。',
  },

  // 蔬菜類
  {
    id: 'food_carrot',
    name: '紅蘿蔔泥',
    category: 'vegetables',
    recommendedAgeMonths: 4,
    allergenRisk: 'low',
    prepTips: '切小塊蒸軟攪打，初次少量嘗試。',
    nutrition: '豐富 β-胡蘿蔔素，促進視力發展。',
  },
  {
    id: 'food_broccoli',
    name: '綠花椰菜泥',
    category: 'vegetables',
    recommendedAgeMonths: 5,
    allergenRisk: 'low',
    prepTips: '只取嫩花苞部分汆燙後攪打，莖部較硬可稍後嘗試。',
    nutrition: '豐富葉酸、維生素 C 與多酚抗氧化物。',
  },
  {
    id: 'food_cabbage',
    name: '高麗菜泥',
    category: 'vegetables',
    recommendedAgeMonths: 4,
    allergenRisk: 'low',
    prepTips: '洗淨煮軟打成菜泥，微甜多汁。',
    nutrition: '維生素 U 保護胃黏膜，清甜好消化。',
  },
  {
    id: 'food_spinach',
    name: '菠菜泥',
    category: 'vegetables',
    recommendedAgeMonths: 5,
    allergenRisk: 'low',
    prepTips: '汆燙去除草酸澀味後，加水打成細泥。',
    nutrition: '豐富鐵質與葉黃素，助益造血機能。',
  },
  {
    id: 'food_zucchini',
    name: '節瓜泥',
    category: 'vegetables',
    recommendedAgeMonths: 5,
    allergenRisk: 'low',
    prepTips: '去皮蒸熟壓泥，水分飽滿甘甜。',
    nutrition: '低熱量、低致敏、豐富維生素 A。',
  },

  // 水果類
  {
    id: 'food_apple',
    name: '蘋果泥',
    category: 'fruits',
    recommendedAgeMonths: 4,
    allergenRisk: 'low',
    prepTips: '磨泥器現磨現吃，或可微波/蒸熱以防氧化變黑。',
    nutrition: '果膠有助整腸，酸甜開胃。',
  },
  {
    id: 'food_banana',
    name: '香蕉泥',
    category: 'fruits',
    recommendedAgeMonths: 5,
    allergenRisk: 'low',
    prepTips: '選熟透有黑斑的香蕉，用叉子壓成細泥。',
    nutrition: '豐富鉀離子與色胺酸，幫助心情平穩與好眠。',
  },
  {
    id: 'food_avocado',
    name: '酪梨泥',
    category: 'fruits',
    recommendedAgeMonths: 6,
    allergenRisk: 'low',
    prepTips: '熟成後直接挖取壓泥，口感如天然奶油。',
    nutrition: '優質單元不飽和脂肪酸與維生素 E，促進大腦發育。',
  },
  {
    id: 'food_pear',
    name: '水梨泥',
    category: 'fruits',
    recommendedAgeMonths: 5,
    allergenRisk: 'low',
    prepTips: '去皮磨成泥汁，汁多清潤。',
    nutrition: '水分高、生津潤喉，適合天氣乾燥時補充。',
  },

  // 蛋白質與肉類
  {
    id: 'food_egg_yolk',
    name: '熟蛋黃 (初試)',
    category: 'proteins',
    recommendedAgeMonths: 5,
    allergenRisk: 'medium',
    prepTips: '水煮蛋全熟（煮沸後12分鐘），取 1/8 顆蛋黃混入米湯。',
    nutrition: '卵磷脂、鐵質與膽鹼，是嬰兒腦神經發育關鍵。',
  },
  {
    id: 'food_tofu',
    name: '嫩豆腐 / 蒸板豆腐',
    category: 'proteins',
    recommendedAgeMonths: 6,
    allergenRisk: 'medium',
    prepTips: '充分加熱蒸熟後壓成碎泥，觀察有無大豆過敏。',
    nutrition: '植物性優質蛋白質與鈣質，質地細嫩。',
  },
  {
    id: 'food_chicken',
    name: '雞肉泥 (雞里肌)',
    category: 'proteins',
    recommendedAgeMonths: 6,
    allergenRisk: 'low',
    prepTips: '去筋蒸熟後，加高湯或蔬菜泥攪打成細緻肉泥。',
    nutrition: '脂肪低、易消化，提供優質蛋白質與鐵鋅。',
  },
  {
    id: 'food_salmon',
    name: '鮭魚肉泥',
    category: 'proteins',
    recommendedAgeMonths: 7,
    allergenRisk: 'medium',
    prepTips: '徹底剔除細刺，清蒸熟透後壓碎。',
    nutrition: '豐富 DHA、EPA 與優質 Omega-3 脂肪酸。',
  },
  {
    id: 'food_sea_bass',
    name: '白肉魚 (鱸魚/鯛魚)',
    category: 'proteins',
    recommendedAgeMonths: 6,
    allergenRisk: 'medium',
    prepTips: '嚴格挑刺，蒸熟後搗成碎末混入粥中。',
    nutrition: '肉質細嫩好吸收，低脂高蛋白。',
  },

  // 常見過敏原與進階食材
  {
    id: 'food_egg_white',
    name: '全蛋 / 蛋白',
    category: 'allergens',
    recommendedAgeMonths: 6,
    allergenRisk: 'high',
    prepTips: '蛋黃過關後再嘗試全熟蛋白，初次少量米粒大小觀察。',
    nutrition: '完全蛋白質來源，及早小量接觸有助建立免疫耐受性。',
  },
  {
    id: 'food_peanut_butter',
    name: '無糖純花生醬 (稀釋)',
    category: 'allergens',
    recommendedAgeMonths: 6,
    allergenRisk: 'high',
    prepTips: '取無糖無鹽純花生醬微量（約筷子尖），溫水或米湯調稀。切勿給整顆堅果。',
    nutrition: '兒科醫學會建議 6-11 個月及早微量引入以降低未來過敏率。',
  },
  {
    id: 'food_sesame',
    name: '純黑白芝麻粉',
    category: 'allergens',
    recommendedAgeMonths: 7,
    allergenRisk: 'high',
    prepTips: '選無糖細磨純芝麻粉，微量撒入粥中。',
    nutrition: '高鈣、高鐵與天然抗氧化芝麻素。',
  },
  {
    id: 'food_wheat_noodle',
    name: '寶寶無鹽小麥麵',
    category: 'allergens',
    recommendedAgeMonths: 6,
    allergenRisk: 'high',
    prepTips: '煮至極爛剪成小段，觀察小麥麩質耐受度。',
    nutrition: '練習咀嚼與吞嚥能力，增加副食品多樣性。',
  },
  {
    id: 'food_plain_yogurt',
    name: '無糖全脂原味優格',
    category: 'allergens',
    recommendedAgeMonths: 8,
    allergenRisk: 'high',
    prepTips: '選無添加糖之天然全脂優格，退冰至室溫常溫再吃。',
    nutrition: '提供活性益生菌、乳清蛋白與高生物利用率鈣質。',
  },
];
