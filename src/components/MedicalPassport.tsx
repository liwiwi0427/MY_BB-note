import React from 'react';
import {
  FileHeart,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  Stethoscope,
  Pill,
} from 'lucide-react';
import type { MedicalVisit } from '../types';

interface MedicalPassportProps {
  medicalVisits: MedicalVisit[];
  onAddVisit: () => void;
  onDeleteVisit: (id: string) => void;
}

export const MedicalPassport: React.FC<MedicalPassportProps> = ({
  medicalVisits,
  onAddVisit,
  onDeleteVisit,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-base text-[#2A2723]">
            兒科看診、急診與用藥處方歷史
          </h3>
          <p className="text-xs text-[#6B6457] mt-1 font-sans">
            記錄每次就診診斷、開立藥品、服藥劑量與回診叮嚀
          </p>
        </div>

        <button
          onClick={onAddVisit}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#2A2723] text-[#F9F6F0] text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>記錄看診</span>
        </button>
      </div>

      {medicalVisits.length === 0 ? (
        <div className="bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-8 text-center text-[#8C8475] font-sans">
          <FileHeart className="w-8 h-8 mx-auto mb-2 text-[#D1CEC4]" />
          <p className="text-sm">尚無兒科就診紀錄</p>
          <p className="text-xs text-[#A69D8D] mt-1">點擊上方「記錄看診」填寫就醫病歷與開藥狀況</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medicalVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-[#F9F6F0] rounded-[24px] border border-[#D9D1C2] p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="font-serif font-bold text-base text-[#2A2723]">
                    {visit.reason}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#EBE7DF] text-[#2A2723] font-bold">
                    {visit.date}
                  </span>
                  <span className="text-xs font-sans text-[#6B6457] flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    {visit.clinic}
                  </span>
                  {visit.doctor && (
                    <span className="text-xs font-sans text-[#8C8475]">
                      ({visit.doctor})
                    </span>
                  )}
                </div>

                {visit.diagnosis && (
                  <div className="text-xs font-sans text-[#2A2723] bg-white p-3 rounded-xl border border-[#EBE7DF]">
                    <div className="font-bold text-[#6B6457] mb-1 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-700" />
                      診斷結論與檢查結果
                    </div>
                    {visit.diagnosis}
                  </div>
                )}

                {visit.prescriptions && (
                  <div className="text-xs font-sans text-[#2A2723] bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                    <div className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-amber-700" />
                      開立藥品及服用指示
                    </div>
                    {visit.prescriptions}
                  </div>
                )}

                {visit.doctorAdvice && (
                  <p className="text-xs text-[#6B6457] font-sans">
                    💡 醫生叮嚀: {visit.doctorAdvice}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end shrink-0">
                <button
                  onClick={() => onDeleteVisit(visit.id)}
                  className="p-2 text-[#D1CEC4] hover:text-[#C4685D] rounded-xl hover:bg-[#F2E6E6] transition-colors"
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
