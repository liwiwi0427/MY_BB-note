export interface FoodAllergenItem {
  name: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high';
  tested: boolean;
  reactionNote?: string;
}

export const initialFoodAllergenList: FoodAllergenItem[] = [
  // 澱粉 / 穀物類
  { name: '十倍粥 / 白米湯', category: '全穀雜糧', riskLevel: 'low', tested: true },
  { name: '南瓜泥', category: '全穀雜糧', riskLevel: 'low', tested: true },
  { name: '地瓜泥 / 蕃薯泥', category: '全穀雜糧', riskLevel: 'low', tested: true },
  { name: '燕麥泥', category: '全穀雜糧', riskLevel: 'low', tested: false },
  { name: '馬鈴薯泥', category: '全穀雜糧', riskLevel: 'low', tested: false },

  // 蔬菜類
  { name: '紅蘿蔔泥', category: '蔬菜類', riskLevel: 'low', tested: true },
  { name: '高麗菜泥', category: '蔬菜類', riskLevel: 'low', tested: true },
  { name: '青花菜 / 綠花椰菜泥', category: '蔬菜類', riskLevel: 'low', tested: false },
  { name: '菠菜泥', category: '蔬菜類', riskLevel: 'low', tested: false },
  { name: '櫛瓜泥', category: '蔬菜類', riskLevel: 'low', tested: false },

  // 水果類
  { name: '蘋果泥 (蒸熟)', category: '水果類', riskLevel: 'low', tested: true },
  { name: '香蕉泥', category: '水果類', riskLevel: 'low', tested: true },
  { name: '酪梨泥', category: '水果類', riskLevel: 'low', tested: false },
  { name: '木瓜泥', category: '水果類', riskLevel: 'low', tested: false },
  { name: '草莓 / 奇異果', category: '水果類 (毛狀)', riskLevel: 'medium', tested: false },

  // 蛋白質與高敏測試
  { name: '熟蛋黃泥 (4-6M)', category: '蛋豆魚肉', riskLevel: 'medium', tested: true },
  { name: '全蛋 / 蛋白 (7-8M)', category: '高敏食材', riskLevel: 'high', tested: false },
  { name: '豆腐 / 豆漿', category: '蛋豆魚肉', riskLevel: 'medium', tested: false },
  { name: '雞肉泥', category: '蛋豆魚肉', riskLevel: 'low', tested: false },
  { name: '豬肉泥', category: '蛋豆魚肉', riskLevel: 'low', tested: false },
  { name: '白肉魚 (鱸魚/鯛魚)', category: '水產魚類', riskLevel: 'medium', tested: false },
  { name: '蝦 / 蟹 (水產甲殼)', category: '高敏食材', riskLevel: 'high', tested: false },
  { name: '花生醬 / 堅果粉', category: '高敏食材', riskLevel: 'high', tested: false },
];
