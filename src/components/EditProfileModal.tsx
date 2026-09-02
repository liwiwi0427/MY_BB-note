import React, { useState } from 'react';
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
  if (!isOpen) return null;

  const [name, setName] = useState(baby.name);
  const [gender, setGender] = useState(baby.gender);
  const [birthDate, setBirthDate] = useState(baby.birthDate);
  const [birthWeight, setBirthWeight] = useState(baby.birthWeight);
  const [birthLength, setBirthLength] = useState(baby.birthLength);
  const [birthHeadCirc, setBirthHeadCirc] = useState(baby.birthHeadCirc);
  const [bloodType, setBloodType] = useState(baby.bloodType || 'A型 Rh+');
  const [allergiesText, setAllergiesText] = useState(baby.allergies?.join('、') || '');
  const [emergencyContact, setEmergencyContact] = useState(baby.emergencyContact || '');
  const [notes, setNotes] = useState(baby.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BabyProfile = {
      ...baby,
      name: name.trim() || '寶寶',
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
      <div className="bg-[#F9F6F0] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] border border-[#D9D1C2] shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
        
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
            className="p-2 text-[#8C8475] hover:text-[#2A2723] rounded-xl hover:bg-[#EBE7DF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#6B6457] font-medium mb-1">寶寶姓名 / 暱稱</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-sm font-serif font-bold text-[#2A2723] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#6B6457] font-medium mb-1">性別 (影響WHO發育標準)</label>
              <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-[#D9D1C2]">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    gender === 'male' ? 'bg-sky-100 text-sky-900 font-bold' : 'text-[#8C8475]'
                  }`}
                >
                  👦🏻 男寶
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    gender === 'female' ? 'bg-rose-100 text-rose-900 font-bold' : 'text-[#8C8475]'
                  }`}
                >
                  👧🏼 女寶
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                placeholder="例如: A型 Rh+"
                className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
              />
            </div>
          </div>

          {/* Birth baseline metrics */}
          <div className="p-3 bg-white rounded-2xl border border-[#EBE7DF] space-y-2">
            <span className="font-serif font-bold text-xs text-[#2A2723] block">
              出生基準測量數值 (Day 0)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-[#8C8475] block">出生體重 (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8C8475] block">出生身長 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={birthLength}
                  onChange={(e) => setBirthLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8C8475] block">出生頭圍 (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={birthHeadCirc}
                  onChange={(e) => setBirthHeadCirc(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F9F6F0] border border-[#D9D1C2] rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">過敏史 / 飲食禁忌 (用頓號分隔)</label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="無已知過敏、蛋白過敏、蠶豆症 G6PD 等"
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">緊急聯絡人與電話</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="爸爸 (0912-345-678)"
              className="w-full bg-white border border-[#D9D1C2] rounded-xl px-3 py-2 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#6B6457] font-medium mb-1">健康備註與提醒</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="出生醫院、小兒科主治醫師、平時作息注意事項..."
              className="w-full bg-white border border-[#D9D1C2] rounded-xl p-3 text-xs text-[#2A2723] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EBE7DF] text-[#6B6457] text-xs font-medium hover:bg-[#D9D1C2] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-medium hover:bg-[#4A453E] transition-colors shadow-xs"
            >
              儲存檔案
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
