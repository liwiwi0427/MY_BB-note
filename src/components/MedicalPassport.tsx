import React, { useState } from 'react';
import { 
  FileHeart, 
  ShieldAlert, 
  Phone, 
  Building2, 
  Pill, 
  Plus, 
  Calendar, 
  Thermometer, 
  Trash2, 
  Printer, 
  Download, 
  FileText,
  AlertTriangle,
  Heart,
  Baby,
  Activity
} from 'lucide-react';
import { BabyProfile, MedicalVisit, DiaryEntry } from '../types';
import { getBabyAgeDetails } from '../utils/storage';

interface MedicalPassportProps {
  babyProfile: BabyProfile;
  medicalVisits: MedicalVisit[];
  diaryEntries: DiaryEntry[];
  onAddVisit: () => void;
  onDeleteVisit: (id: string) => void;
  onOpenPediatricReport: () => void;
}

export const MedicalPassport: React.FC<MedicalPassportProps> = ({
  babyProfile,
  medicalVisits,
  diaryEntries,
  onAddVisit,
  onDeleteVisit,
  onOpenPediatricReport,
}) => {
  const [activeTab, setActiveTab] = useState<'passport' | 'visits' | 'fever'>('passport');
  const ageDetails = getBabyAgeDetails(babyProfile.birthday);

  // Extract temperature logs from diary
  const feverLogs = diaryEntries
    .filter((e) => e.metrics?.temperatureC !== undefined)
    .map((e) => ({
      id: e.id,
      date: e.date,
      time: e.time,
      temp: e.metrics!.temperatureC!,
      medication: e.metrics?.medicationTaken,
      note: e.title || e.content,
    }))
    .sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime());

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2A2723]">
            {babyProfile.nickname || babyProfile.name} 的雲端醫療護照
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6457] mt-1 font-sans">
            整合急診過敏警訊、病歷號、兒科門診用藥與發燒監測，隨時隨地向醫師出示
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenPediatricReport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider text-[#2A2723] bg-[#F2EDE4] hover:bg-[#E6DFD1] border border-[#D9D1C2] transition-colors"
            title="開啟並列印兒科就診 PDF 報告"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>匯出就醫 PDF 報告</span>
          </button>

          <button
            id="add-medical-visit-btn"
            onClick={onAddVisit}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-sans uppercase tracking-wider bg-[#2A2723] text-[#F9F6F0] hover:bg-[#3D3833] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新增門診紀錄</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('passport')}
          className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wider transition-all ${
            activeTab === 'passport'
              ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
          }`}
        >
          📋 寶寶醫療基本卡 (護照)
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wider transition-all ${
            activeTab === 'visits'
              ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
          }`}
        >
          🏥 門診與用藥紀錄 ({medicalVisits.length})
        </button>
        <button
          onClick={() => setActiveTab('fever')}
          className={`px-5 py-2 rounded-full text-xs font-sans uppercase tracking-wider transition-all ${
            activeTab === 'fever'
              ? 'bg-[#2A2723] text-[#F9F6F0] font-bold shadow-xs'
              : 'bg-[#F2EDE4] text-[#6B6457] hover:bg-[#E6DFD1] hover:text-[#2A2723]'
          }`}
        >
          🌡️ 體溫與發燒追蹤 ({feverLogs.length})
        </button>
      </div>

      {/* TAB 1: BABY HEALTH PASSPORT CARD */}
      {activeTab === 'passport' && (
        <div className="bg-white rounded-[36px] p-7 sm:p-9 border border-[#EBE7DF] shadow-xs space-y-7 print:border-none print:shadow-none">
          
          {/* Printable Passport Header Badge */}
          <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-6">
            <div className="flex items-center space-x-5">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-[#D9D1C2] p-1 bg-[#F9F6F0] flex items-center justify-center">
                {babyProfile.avatarUrl ? (
                  <img
                    src={babyProfile.avatarUrl}
                    alt={babyProfile.name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Baby className="w-9 h-9 text-[#8C8475]" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8C8475] bg-[#F2EDE4] px-2.5 py-0.5 rounded-full border border-[#D9D1C2]">
                  Baby Health Passport
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2723] mt-1.5">
                  {babyProfile.name} {babyProfile.nickname ? `(${babyProfile.nickname})` : ''}
                </h3>
                <p className="text-xs text-[#8C8475] font-sans mt-0.5">
                  出生月齡：{ageDetails.formattedText} ｜ 性別：{babyProfile.gender === 'female' ? '女寶' : '男寶'}
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block font-sans">
              <div className="text-[11px] uppercase tracking-widest text-[#8C8475]">醫療病歷號碼</div>
              <div className="text-sm font-mono font-bold text-[#2A2723] mt-0.5">
                {babyProfile.medicalRecordNumber || '未填寫'}
              </div>
            </div>
          </div>

          {/* Key Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-[24px] bg-[#F9F6F0] border border-[#EBE7DF]">
              <div className="text-[11px] font-sans uppercase tracking-widest text-[#8C8475]">出生日期 / 時間</div>
              <div className="text-sm font-serif font-bold text-[#2A2723] mt-1">
                {babyProfile.birthday} {babyProfile.birthTime ? `(${babyProfile.birthTime})` : ''}
              </div>
            </div>
            <div className="p-5 rounded-[24px] bg-[#F2E6E6] border border-[#E0D0D0]">
              <div className="text-[11px] font-sans uppercase tracking-widest text-[#6B3E3E]">血型 (Blood Type)</div>
              <div className="text-sm font-serif font-bold text-[#2A2723] mt-1">
                {babyProfile.bloodType} 型
              </div>
            </div>
            <div className="p-5 rounded-[24px] bg-[#F2EDE4] border border-[#D9D1C2]">
              <div className="text-[11px] font-sans uppercase tracking-widest text-[#6B6457]">出生週數 / 體重</div>
              <div className="text-sm font-serif font-bold text-[#2A2723] mt-1">
                {babyProfile.gestationalWeeks} 週 ｜ {babyProfile.birthWeight > 0 ? `${babyProfile.birthWeight} kg` : '未填寫'}
              </div>
            </div>
            <div className="p-5 rounded-[24px] bg-[#E6E9F2] border border-[#D5D9E6]">
              <div className="text-[11px] font-sans uppercase tracking-widest text-[#3A4050]">出生身長 / 頭圍</div>
              <div className="text-sm font-serif font-bold text-[#2A2723] mt-1">
                {babyProfile.birthLength > 0 ? `${babyProfile.birthLength} cm` : '未填寫'} ｜ {babyProfile.birthHeadCirc > 0 ? `${babyProfile.birthHeadCirc} cm` : '未填寫'}
              </div>
            </div>
          </div>

          {/* Allergy Alert & Critical Care Box */}
          <div className="p-6 rounded-[28px] bg-[#F2E6E6] border border-[#E0D0D0]">
            <div className="flex items-center gap-2 text-[#6B3E3E] font-sans uppercase tracking-wider text-xs font-bold mb-3">
              <ShieldAlert className="w-4 h-4 text-[#8C5D5D]" />
              <span>過敏史與藥物敏感警訊 (Allergies & Sensitivities)</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap font-sans">
              {babyProfile.allergies && babyProfile.allergies.length > 0 ? (
                babyProfile.allergies.map((alg, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-[#E0D0D0] text-[#6B3E3E]"
                  >
                    ⚠️ {alg}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#6B3E3E]">無已知藥物或食物過敏紀錄</span>
              )}
            </div>
          </div>

          {/* Primary Care & Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
            
            {/* Primary Pediatrician */}
            <div className="p-6 rounded-[28px] bg-[#F9F6F0] border border-[#EBE7DF] space-y-2">
              <div className="text-xs uppercase tracking-wider font-bold text-[#6B6457] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8C8475]" />
                <span>主要兒科診所與主治醫師</span>
              </div>
              <div className="text-base font-serif font-bold text-[#2A2723]">
                {babyProfile.hospital || babyProfile.pediatrician ? `${babyProfile.hospital || '診所未填'} ｜ ${babyProfile.pediatrician || '醫師未填'}` : '尚未填寫常用院所'}
              </div>
              <p className="text-xs text-[#8C8475]">
                定期於此院所進行公費疫苗接種與兒童發展篩檢
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="p-6 rounded-[28px] bg-[#E6EBE6] border border-[#D5DDD5] space-y-2">
              <div className="text-xs uppercase tracking-wider font-bold text-[#3E4A3E] flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#5A6D5A]" />
                <span>緊急聯絡人 (Emergency Contact)</span>
              </div>
              <div className="text-base font-serif font-bold text-[#2A2723]">
                {babyProfile.emergencyContact?.name ? (
                  <>
                    {babyProfile.emergencyContact.name} ({babyProfile.emergencyContact.relationship || '照護者'})：
                    <span className="font-mono text-[#3E4A3E] ml-1 font-normal text-sm">
                      {babyProfile.emergencyContact.phone}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-[#5C6B5C]">尚未設定緊急聯絡人</span>
                )}
              </div>
              <p className="text-xs text-[#5C6B5C]">
                如遇緊急醫療處置請優先聯絡家長
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MEDICAL VISITS & PRESCRIPTIONS */}
      {activeTab === 'visits' && (
        <div className="space-y-5">
          {medicalVisits.length === 0 ? (
            <div className="bg-white rounded-[36px] p-12 text-center border border-[#EBE7DF] shadow-xs">
              <FileHeart className="w-12 h-12 text-[#D9D1C2] mx-auto mb-3" strokeWidth={1.25} />
              <h3 className="text-xl font-serif font-bold text-[#2A2723]">尚無門診就醫記錄</h3>
              <p className="text-xs text-[#8C8475] mt-1 font-sans">
                若有去兒科診所看診或健檢，可點擊上方「新增門診紀錄」記錄醫生診斷與處方藥水。
              </p>
            </div>
          ) : (
            medicalVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#EBE7DF] hover:border-[#D1CEC4] shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2EDE4]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-medium bg-[#F2EDE4] text-[#2A2723] px-3 py-1 rounded-full">
                      {visit.date}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#2A2723]">
                      {visit.clinicName} ｜ {visit.doctorName}
                    </h3>
                    {visit.temperatureAtVisit && (
                      <span className="text-xs font-sans uppercase tracking-wider text-[#6B3E3E] bg-[#F2E6E6] px-2.5 py-0.5 rounded-full border border-[#E0D0D0]">
                        診間體溫：{visit.temperatureAtVisit}°C
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteVisit(visit.id)}
                    className="self-end sm:self-auto p-1.5 text-[#D1CEC4] hover:text-[#C4685D] rounded-full hover:bg-[#F2E6E6] transition-colors"
                    title="刪除此就診記錄"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="text-xs sm:text-sm space-y-2 font-sans">
                  <div>
                    <strong className="text-[#2A2723]">就診原因：</strong>
                    <span className="text-[#4A453E] ml-1">{visit.reason}</span>
                  </div>
                  <div>
                    <strong className="text-[#2A2723]">醫師診斷：</strong>
                    <span className="text-[#2A2723] font-medium ml-1 bg-[#F2EDE4] px-2 py-0.5 rounded-md">{visit.diagnosis}</span>
                  </div>
                  {visit.notes && (
                    <div>
                      <strong className="text-[#2A2723]">衛教囑咐：</strong>
                      <span className="text-[#6B6457] ml-1">{visit.notes}</span>
                    </div>
                  )}
                </div>

                {/* Prescriptions List */}
                {visit.prescriptions && visit.prescriptions.length > 0 && (
                  <div className="mt-4 p-4 bg-[#F9F6F0] rounded-[24px] border border-[#EBE7DF]">
                    <div className="text-xs font-sans uppercase tracking-wider font-bold text-[#2A2723] flex items-center gap-1.5 mb-2.5">
                      <Pill className="w-3.5 h-3.5 text-[#8C8475]" />
                      <span>醫師開立處方用藥：</span>
                    </div>
                    <div className="space-y-2">
                      {visit.prescriptions.map((rx, rIdx) => (
                        <div key={rIdx} className="text-xs bg-white p-3 rounded-[16px] border border-[#EBE7DF]">
                          <div className="font-medium text-[#2A2723]">
                            {rx.name} — <span className="text-[#6B6457] font-normal">{rx.dosage} ｜ {rx.frequency} (服用 {rx.days} 天)</span>
                          </div>
                          {rx.instructions && (
                            <p className="text-[11px] text-[#8C8475] mt-1">用法：{rx.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visit.nextFollowUpDate && (
                  <div className="text-xs text-[#2A2723] font-sans pt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8C8475]" />
                    預約回診日期：<span className="font-mono">{visit.nextFollowUpDate}</span>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FEVER & TEMPERATURE LOGS */}
      {activeTab === 'fever' && (
        <div className="bg-white rounded-[36px] p-6 sm:p-8 border border-[#EBE7DF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EBE7DF] gap-2">
            <h3 className="text-xl font-serif font-bold text-[#2A2723] flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-[#8C5D5D]" strokeWidth={1.5} />
              <span>體溫監測歷史曲線記錄</span>
            </h3>
            <span className="text-xs font-sans text-[#8C8475]">正常體溫 36.5°C ~ 37.5°C ｜ 發燒警戒 &gt; 38.0°C</span>
          </div>

          {feverLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8C8475] font-sans">
              目前無體溫異常記錄，寶寶體溫穩定安好！
            </div>
          ) : (
            <div className="divide-y divide-[#F2EDE4]">
              {feverLogs.map((log) => {
                const isFever = log.temp >= 38.0;
                const isMild = log.temp >= 37.5 && log.temp < 38.0;

                return (
                  <div key={log.id} className="py-4 flex items-center justify-between gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-4">
                      <span className={`text-base font-mono font-bold px-3 py-1 rounded-full ${
                        isFever
                          ? 'bg-[#F2E6E6] text-[#6B3E3E] border border-[#E0D0D0]'
                          : isMild
                          ? 'bg-[#F5EEDB] text-[#5C4D2E]'
                          : 'bg-[#E6EBE6] text-[#3E4A3E]'
                      }`}>
                        {log.temp} °C
                      </span>
                      <div>
                        <div className="font-serif font-bold text-base text-[#2A2723]">{log.note}</div>
                        <div className="text-xs text-[#8C8475] mt-0.5 font-sans">
                          {log.date} {log.time} {log.medication && `｜ 用藥處置: ${log.medication}`}
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-sans uppercase tracking-wider px-3 py-1 rounded-full ${
                      isFever ? 'bg-[#F2E6E6] text-[#6B3E3E]' : isMild ? 'bg-[#F5EEDB] text-[#5C4D2E]' : 'bg-[#E6EBE6] text-[#3E4A3E]'
                    }`}>
                      {isFever ? '發燒' : isMild ? '微熱' : '正常'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
