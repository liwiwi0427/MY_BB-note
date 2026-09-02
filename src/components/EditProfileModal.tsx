import React, { useState } from 'react';
import { Baby, Heart, ShieldAlert, Phone, Building2, User, Sparkles } from 'lucide-react';
import { BabyProfile, BloodType } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyProfile: BabyProfile;
  onSave: (updatedProfile: BabyProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  babyProfile,
  onSave,
}) => {
  const [name, setName] = useState(babyProfile.name);
  const [nickname, setNickname] = useState(babyProfile.nickname || '');
  const [gender, setGender] = useState<'male' | 'female'>(babyProfile.gender);
  const [birthday, setBirthday] = useState(babyProfile.birthday);
  const [birthTime, setBirthTime] = useState(babyProfile.birthTime || '');
  const [gestationalWeeks, setGestationalWeeks] = useState<string>(babyProfile.gestationalWeeks ? babyProfile.gestationalWeeks.toString() : '40');
  const [birthWeight, setBirthWeight] = useState<string>(babyProfile.birthWeight > 0 ? babyProfile.birthWeight.toString() : '');
  const [birthLength, setBirthLength] = useState<string>(babyProfile.birthLength > 0 ? babyProfile.birthLength.toString() : '');
  const [birthHeadCirc, setBirthHeadCirc] = useState<string>(babyProfile.birthHeadCirc > 0 ? babyProfile.birthHeadCirc.toString() : '');
  const [bloodType, setBloodType] = useState<BloodType>(babyProfile.bloodType);
  const [hospital, setHospital] = useState(babyProfile.hospital || '');
  const [pediatrician, setPediatrician] = useState(babyProfile.pediatrician || '');
  const [avatarUrl, setAvatarUrl] = useState(babyProfile.avatarUrl || '');
  const [allergiesStr, setAllergiesStr] = useState(babyProfile.allergies?.join(', ') || '');
  const [contactName, setContactName] = useState(babyProfile.emergencyContact?.name || '');
  const [contactPhone, setContactPhone] = useState(babyProfile.emergencyContact?.phone || '');
  const [contactRelation, setContactRelation] = useState(babyProfile.emergencyContact?.relationship || '主要照護者');

  if (!isOpen) return null;

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allergies = allergiesStr
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: BabyProfile = {
      ...babyProfile,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      gender,
      birthday,
      birthTime: birthTime.trim() || undefined,
      gestationalWeeks: parseFloat(gestationalWeeks) || 39,
      birthWeight: parseFloat(birthWeight) || 3.2,
      birthLength: parseFloat(birthLength) || 50,
      birthHeadCirc: parseFloat(birthHeadCirc) || 34,
      bloodType,
      hospital: hospital.trim() || undefined,
      pediatrician: pediatrician.trim() || undefined,
      avatarUrl: avatarUrl.trim() || sampleAvatars[0],
      allergies: allergies.length > 0 ? allergies : undefined,
      emergencyContact: {
        name: contactName.trim(),
        phone: contactPhone.trim(),
        relationship: contactRelation.trim(),
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A2723]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F9F6F0] rounded-[36px] p-7 sm:p-9 max-w-xl w-full border border-[#D9D1C2] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE7DF]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <Baby className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif italic text-[#2A2723]">
                編輯寶寶個人健康檔案
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                維護出生數據、血型、過敏史與緊急聯絡人
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#4A453E] hover:bg-[#E6DFD1] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm font-sans">
          
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-2">
              寶寶大頭貼
            </label>
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-[#D9D1C2] p-1 bg-white shrink-0">
                <img
                  src={avatarUrl || sampleAvatars[0]}
                  alt="預覽"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {sampleAvatars.map((url, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatarUrl(url)}
                      className="w-8 h-8 rounded-full overflow-hidden border border-[#D9D1C2] hover:scale-105 transition-transform"
                    >
                      <img src={url} alt="範例" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="自訂圖片網址 (URL)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
                />
              </div>
            </div>
          </div>

          {/* Name & Nickname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
                寶寶全名
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-sm font-serif italic text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
                親暱稱呼 (乳名)
              </label>
              <input
                type="text"
                placeholder="如：糖糖、小湯圓"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723] focus:border-[#2A2723]"
              />
            </div>
          </div>

          {/* Gender & Blood Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
                生理性別
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2 rounded-full font-bold text-xs border uppercase tracking-wider ${
                    gender === 'female'
                      ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                      : 'bg-[#F2EDE4] border-[#D9D1C2] text-[#6B6457]'
                  }`}
                >
                  🌸 女寶
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2 rounded-full font-bold text-xs border uppercase tracking-wider ${
                    gender === 'male'
                      ? 'bg-[#2A2723] text-[#F9F6F0] border-[#2A2723]'
                      : 'bg-[#F2EDE4] border-[#D9D1C2] text-[#6B6457]'
                  }`}
                >
                  ⭐ 男寶
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6B6457] mb-1">
                血型
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value as BloodType)}
                className="w-full px-4 py-2 rounded-full border border-[#D1CEC4] bg-white text-[#2A2723] text-xs font-bold"
              >
                <option value="A">A 型</option>
                <option value="B">B 型</option>
                <option value="O">O 型</option>
                <option value="AB">AB 型</option>
                <option value="Unknown">尚待檢驗</option>
              </select>
            </div>
          </div>

          {/* Birthday & Gestational Weeks */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                出生日期
              </label>
              <input
                type="date"
                required
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                出生時間
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs text-[#2A2723]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6B6457] mb-1">
                妊娠週數 (週)
              </label>
              <input
                type="number"
                step="0.1"
                value={gestationalWeeks}
                onChange={(e) => setGestationalWeeks(e.target.value)}
                className="w-full px-3 py-2 rounded-full border border-[#D1CEC4] bg-white text-xs font-mono text-[#2A2723]"
              />
            </div>
          </div>

          {/* Birth Metrics */}
          <div className="p-4 bg-white rounded-[24px] border border-[#D9D1C2]">
            <span className="block text-xs uppercase tracking-wider font-bold text-[#2A2723] mb-2.5">
              出生初生數值 (Birth Baseline)
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C8475] mb-1">體重 (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-full border border-[#D1CEC4] bg-[#F9F6F0] text-xs font-mono text-center font-bold text-[#2A2723]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C8475] mb-1">身長 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={birthLength}
                  onChange={(e) => setBirthLength(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-full border border-[#D1CEC4] bg-[#F9F6F0] text-xs font-mono text-center font-bold text-[#2A2723]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#8C8475] mb-1">頭圍 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={birthHeadCirc}
                  onChange={(e) => setBirthHeadCirc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-full border border-[#D1CEC4] bg-[#F9F6F0] text-xs font-mono text-center font-bold text-[#2A2723]"
                />
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#6B3E3E] mb-1">
              過敏史或藥物敏感警訊 (用逗號隔開)
            </label>
            <input
              type="text"
              placeholder="如：蠶豆症 (G6PD)、盤尼西林過敏、牛乳蛋白敏感"
              value={allergiesStr}
              onChange={(e) => setAllergiesStr(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full border border-[#E0D0D0] bg-[#F2E6E6] text-xs text-[#6B3E3E]"
            />
          </div>

          {/* Emergency Contact */}
          <div className="p-4 bg-[#E6EBE6] rounded-[24px] border border-[#D5DDD5] space-y-2.5">
            <span className="block text-xs uppercase tracking-wider font-bold text-[#3E4A3E]">
              緊急聯絡人資訊
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="聯絡人姓名 (如: 唐媽媽)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-full border border-[#D5DDD5] bg-white text-xs text-[#2A2723]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="電話 (如: 0912-345-678)"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-full border border-[#D5DDD5] bg-white text-xs font-mono text-[#2A2723]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="關係 (如: 母親)"
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-full border border-[#D5DDD5] bg-white text-xs text-[#2A2723]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider text-[#6B6457] hover:bg-[#F2EDE4]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#2A2723] hover:bg-[#3D3833] text-[#F9F6F0] text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              儲存檔案
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
