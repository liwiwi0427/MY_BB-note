import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Baby, Calendar, User, Heart, AlertTriangle } from 'lucide-react';
import type { BabyProfile } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: BabyProfile;
  onSave: (updatedBaby: BabyProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  baby,
  onSave,
}) => {
  const [name, setName] = useState(baby.name);
  const [nickname, setNickname] = useState(baby.nickname || '');
  const [gender, setGender] = useState(baby.gender);
  const [birthDate, setBirthDate] = useState(baby.birthDate);
  const [birthWeight, setBirthWeight] = useState(baby.birthWeight);
  const [birthLength, setBirthLength] = useState(baby.birthLength);
  const [birthHeadCirc, setBirthHeadCirc] = useState(baby.birthHeadCirc);
  const [bloodType, setBloodType] = useState(baby.bloodType || 'A型 Rh+');
  const [allergiesText, setAllergiesText] = useState(baby.allergies?.join('、') || '');
  const [emergencyContact, setEmergencyContact] = useState(baby.emergencyContact || '');
  const [notes, setNotes] = useState(baby.notes || '');

  React.useEffect(() => {
    if (isOpen) {
      setName(baby.name);
      setNickname(baby.nickname || '');
      setGender(baby.gender);
      setBirthDate(baby.birthDate);
      setBirthWeight(baby.birthWeight);
      setBirthLength(baby.birthLength);
      setBirthHeadCirc(baby.birthHeadCirc);
      setBloodType(baby.bloodType || 'A型 Rh+');
      setAllergiesText(baby.allergies?.join('、') || '');
      setEmergencyContact(baby.emergencyContact || '');
      setNotes(baby.notes || '');
    }
  }, [baby, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BabyProfile = {
      ...baby,
      name: name.trim() || '寶寶',
      nickname: nickname.trim() || undefined,
      gender,
      birthDate,
      birthWeight: Number(birthWeight) || 3.2,
      birthLength: Number(birthLength) || 50,
      birthHeadCirc: Number(birthHeadCirc) || 34,
      bloodType: bloodType.trim(),
      allergies: allergiesText
        ? allergiesText.split(/[、,，\n]/).map((s) => s.trim()).filter(Boolean)
        : [],
      emergencyContact: emergencyContact.trim(),
      notes: notes.trim(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#F9F6F0] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2723] text-[#F9F6F0] flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2A2723]">
                編輯寶寶基本健康檔案
              </h3>
              <p className="text-xs text-[#8C8475] font-sans">
                更新出生基本數值與緊急聯絡醫療資訊
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C8475] hover:text-[#2A2723] rounded-xl hover:bg-[#EBE7DF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6457] font-medium mb-1">寶寶全名 / 姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：李元寶"
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-serif font-bold text-[#2A2723] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">
                可愛暱稱 / 乳名 (選填)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例如：小元寶 (Leo)"
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-medium text-[#2A2723] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#6B6457] font-medium mb-1">性別 (WHO標準)</label>
              <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-[#D9D1C2]">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    gender === 'male' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-[#8C8475]'
                  }`}
                >
                  👦🏻 男寶
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    gender === 'female' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-[#8C8475]'
                  }`}
                >
                  👧🏼 女寶
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">出生日期</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono text-[#2A2723] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">血型</label>
              <input
                type="text"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="例如: O型 Rh+"
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
              />
            </div>
          </div>

          {/* Birth baseline indicators */}
          <div className="p-4 bg-white rounded-2xl border border-[#EBE7DF] space-y-2">
            <span className="font-serif font-bold text-xs text-[#2A2723] block">
              出生時初始數值
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-[#6B6457] block mb-1">體重 (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2A2723]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#6B6457] block mb-1">身長 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={birthLength}
                  onChange={(e) => setBirthLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2A2723]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#6B6457] block mb-1">頭圍 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={birthHeadCirc}
                  onChange={(e) => setBirthHeadCirc(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2A2723]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">過敏史 (多項請用頓號或逗號分隔)</label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="例如: 盤尼西林、花生、特定奶粉蛋白質"
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">緊急聯絡人 / 小兒科醫師電話</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="例如: 媽媽 0912-345-678 / 台大急診 02-23123456"
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">特別照護叮嚀與備註</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 容易脹氣，餵奶後需直立拍嗝15分鐘以上..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#EBE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#D9D1C2] text-xs text-[#6B6457] hover:bg-[#EBE7DF] cursor-pointer"
            >
              取消
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-6 py-2 rounded-full bg-[#2A2723] text-[#F9F6F0] text-xs font-semibold hover:bg-[#4A453E] shadow-xs cursor-pointer"
            >
              儲存更新
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
