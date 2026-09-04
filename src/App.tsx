import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Navbar, 
  TabType 
} from './components/Navbar';
import { BabyHeader } from './components/BabyHeader';
import { DiaryJournal } from './components/DiaryJournal';
import { GrowthTracker } from './components/GrowthTracker';
import { VaccineTracker } from './components/VaccineTracker';
import { MedicalPassport } from './components/MedicalPassport';
import { CloudSyncModal } from './components/CloudSyncModal';
import { PediatricReportModal } from './components/PediatricReportModal';
import { AddGrowthModal } from './components/AddGrowthModal';
import { AddDiaryModal } from './components/AddDiaryModal';
import { AddMedicalVisitModal } from './components/AddMedicalVisitModal';
import { EditProfileModal } from './components/EditProfileModal';
import { Toolbox } from './components/Toolbox';

import { 
  AppDataStore, 
  BabyProfile, 
  GrowthRecord, 
  VaccineRecord, 
  DiaryEntry, 
  MedicalVisit, 
  DiaryCategory 
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  pushToCloud, 
  pullFromCloud 
} from './utils/storage';
import { subscribeBabyDataFromFirebase } from './utils/firebase';
import { 
  ShieldCheck, 
  Heart, 
  PhoneCall, 
  FileText, 
  Info,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function App() {
  // Main Data Store State
  const [appData, setAppData] = useState<AppDataStore>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<TabType>('diary');

  // Firebase Real-time sync state
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(true);
  const lastProcessedRemoteUpdatedAtRef = useRef<string | null>(null);

  // Modal States
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [isAddDiaryOpen, setIsAddDiaryOpen] = useState(false);
  const [diaryInitialCategory, setDiaryInitialCategory] = useState<DiaryCategory>('daily');
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Save to LocalStorage whenever appData updates
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Firebase Live Sync Subscription (Multi-device real-time listener)
  useEffect(() => {
    if (!isLiveSyncing || !appData.syncInfo.syncCode) return;

    const syncCode = appData.syncInfo.syncCode;
    const unsubscribe = subscribeBabyDataFromFirebase(
      syncCode,
      (remoteData, meta) => {
        // If this update was from our own push, ignore echo
        if (meta.updatedAt && meta.updatedAt === lastProcessedRemoteUpdatedAtRef.current) {
          return;
        }
        lastProcessedRemoteUpdatedAtRef.current = meta.updatedAt || null;

        setAppData((current) => {
          const currentVer = current.syncInfo?.version || 0;
          const incomingVer = remoteData.syncInfo?.version || 0;

          // If incoming version is equal or newer, update local store
          if (incomingVer >= currentVer) {
            showToast(`🔥 Firebase 即時收到家庭成員更新！`);
            return {
              ...remoteData,
              syncInfo: {
                ...remoteData.syncInfo,
                firebaseConnected: true,
                liveSyncEnabled: true,
              },
            };
          }
          return current;
        });
      },
      (err) => {
        console.warn('Firebase real-time listener notice:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isLiveSyncing, appData.syncInfo.syncCode, showToast]);

  // Push to Cloud Handler (Manual or auto)
  const handlePushSync = async () => {
    const res = await pushToCloud(appData);
    if (res.success) {
      if (res.lastSyncedAt) {
        lastProcessedRemoteUpdatedAtRef.current = res.lastSyncedAt;
      }
      setAppData((prev) => ({
        ...prev,
        syncInfo: {
          ...prev.syncInfo,
          lastSyncedAt: res.lastSyncedAt || new Date().toISOString(),
          version: res.version || prev.syncInfo.version + 1,
          firebaseConnected: true,
        },
      }));
      showToast('🔥 Firebase 雲端同步備份成功！');
    } else {
      throw new Error(res.error || 'Firebase 雲端同步失敗');
    }
  };

  // Pull from Cloud Handler
  const handlePullSync = async (syncCode: string): Promise<boolean> => {
    const res = await pullFromCloud(syncCode);
    if (res.success && res.data) {
      lastProcessedRemoteUpdatedAtRef.current = res.data.syncInfo?.lastSyncedAt || null;
      setAppData(res.data);
      showToast(`🔥 已成功自 Firebase 載入最新資料 (${syncCode})！`);
      return true;
    }
    return false;
  };

  // Update Sync Code
  const handleUpdateSyncCode = (newCode: string) => {
    setAppData((prev) => ({
      ...prev,
      syncInfo: {
        ...prev.syncInfo,
        syncCode: newCode,
      },
    }));
    showToast(`已設定新家庭同步碼：${newCode}`);
  };

  // Restore from File
  const handleRestoreFromFile = (importedData: AppDataStore) => {
    setAppData(importedData);
    showToast('已成功還原全部記錄！');
  };

  // Profile Save
  const handleSaveProfile = (updatedProfile: BabyProfile) => {
    setAppData((prev) => ({
      ...prev,
      babyProfile: updatedProfile,
    }));
    showToast('已更新寶寶基本資料！');
  };

  // Growth Record Actions
  const handleAddGrowthRecord = (newRec: GrowthRecord) => {
    setAppData((prev) => ({
      ...prev,
      growthRecords: [...prev.growthRecords, newRec],
    }));
    showToast(`已儲存生長記錄：體重 ${newRec.weight}kg (P${newRec.percentileWeight})`);
  };

  const handleDeleteGrowthRecord = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      growthRecords: prev.growthRecords.filter((r) => r.id !== id),
    }));
    showToast('已刪除該筆生長記錄');
  };

  // Vaccine Actions
  const handleToggleVaccine = (record: VaccineRecord) => {
    setAppData((prev) => {
      const exists = prev.vaccineRecords.some((r) => r.id === record.id);
      const updated = exists
        ? prev.vaccineRecords.map((r) => (r.id === record.id ? record : r))
        : [...prev.vaccineRecords, record];
      return {
        ...prev,
        vaccineRecords: updated,
      };
    });
    showToast(record.isCompleted ? `🎉 已完成接種：${record.vaccineName}！` : `已更新：${record.vaccineName}`);
  };

  const handleUpdateVaccineRecord = (record: VaccineRecord) => {
    setAppData((prev) => {
      const exists = prev.vaccineRecords.some((r) => r.id === record.id);
      const updated = exists
        ? prev.vaccineRecords.map((r) => (r.id === record.id ? record : r))
        : [...prev.vaccineRecords, record];
      return {
        ...prev,
        vaccineRecords: updated,
      };
    });
    showToast(`已儲存【${record.vaccineName}】詳細醫囑與批號！`);
  };

  // Diary Actions
  const handleAddDiaryEntry = (newEntry: DiaryEntry) => {
    setAppData((prev) => ({
      ...prev,
      diaryEntries: [newEntry, ...prev.diaryEntries],
    }));
    showToast('📔 溫馨日記已發佈！');
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      diaryEntries: prev.diaryEntries.filter((e) => e.id !== id),
    }));
    showToast('已刪除該篇日記');
  };

  const handleQuickLog = (category: DiaryCategory) => {
    setDiaryInitialCategory(category);
    setIsAddDiaryOpen(true);
  };

  // Medical Visit Actions
  const handleAddMedicalVisit = (newVisit: MedicalVisit) => {
    setAppData((prev) => ({
      ...prev,
      medicalVisits: [newVisit, ...prev.medicalVisits],
    }));
    showToast(`已儲存 ${newVisit.clinicName} 就診與用藥紀錄！`);
  };

  const handleDeleteMedicalVisit = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      medicalVisits: prev.medicalVisits.filter((v) => v.id !== id),
    }));
    showToast('已刪除該門診就診紀錄');
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2A2723] flex flex-col selection:bg-[#E6DFD1] selection:text-[#2A2723]">
      
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-[#2A2723] text-[#F9F6F0] text-xs sm:text-sm font-medium px-5 py-3 rounded-full shadow-2xl border border-[#4A453E] flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#D9D1C2] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        syncCode={appData.syncInfo.syncCode}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Baby Profile & Quick Status Header (Visible on all views) */}
        <BabyHeader
          babyProfile={appData.babyProfile}
          growthRecords={appData.growthRecords}
          vaccineRecords={appData.vaccineRecords}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onOpenPediatricReport={() => setIsReportOpen(true)}
          onOpenGrowthTracker={() => setActiveTab('growth')}
          onOpenVaccineTracker={() => setActiveTab('vaccines')}
        />

        {/* Tab Views */}
        {activeTab === 'diary' && (
          <DiaryJournal
            babyProfile={appData.babyProfile}
            diaryEntries={appData.diaryEntries}
            onAddDiary={() => {
              setDiaryInitialCategory('daily');
              setIsAddDiaryOpen(true);
            }}
            onQuickLog={handleQuickLog}
            onDeleteDiary={handleDeleteDiaryEntry}
            onOpenTotalIO={() => setActiveTab('tools')}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthTracker
            babyProfile={appData.babyProfile}
            growthRecords={appData.growthRecords}
            onAddRecord={() => setIsAddGrowthOpen(true)}
            onDeleteRecord={handleDeleteGrowthRecord}
          />
        )}

        {activeTab === 'vaccines' && (
          <VaccineTracker
            babyProfile={appData.babyProfile}
            vaccineRecords={appData.vaccineRecords}
            onToggleComplete={handleToggleVaccine}
            onUpdateRecord={handleUpdateVaccineRecord}
          />
        )}

        {activeTab === 'medical' && (
          <MedicalPassport
            babyProfile={appData.babyProfile}
            medicalVisits={appData.medicalVisits}
            diaryEntries={appData.diaryEntries}
            onAddVisit={() => setIsAddVisitOpen(true)}
            onDeleteVisit={handleDeleteMedicalVisit}
            onOpenPediatricReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'tools' && (
          <Toolbox
            babyProfile={appData.babyProfile}
            growthRecords={appData.growthRecords}
            vaccineRecords={appData.vaccineRecords}
            medicalVisits={appData.medicalVisits}
            diaryEntries={appData.diaryEntries}
            syncInfo={appData.syncInfo}
            onOpenPediatricReport={() => setIsReportOpen(true)}
            onOpenCloudSync={() => setIsCloudSyncOpen(true)}
            onAddDiaryEntry={handleAddDiaryEntry}
          />
        )}

      </main>

      {/* Footer & Medical Reference Info */}
      <footer className="bg-white/90 border-t border-[#EBE7DF] py-8 mt-12 text-xs text-[#8C8475] font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#8C5D5D] fill-[#8C5D5D]" />
            <span className="font-serif font-bold text-sm text-[#2A2723]">暖暖初生・新生兒健康守護日記</span>
            <span>— 陪伴寶寶每一步安心成長</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#8C8475] flex-wrap justify-center font-sans">
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        appData={appData}
        onPushSync={handlePushSync}
        onPullSync={handlePullSync}
        onRestoreFromFile={handleRestoreFromFile}
        onUpdateSyncCode={handleUpdateSyncCode}
        isLiveSyncing={isLiveSyncing}
        onToggleLiveSync={setIsLiveSyncing}
      />

      {/* Pediatric Clinical Consultation PDF Report Modal */}
      <PediatricReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        babyProfile={appData.babyProfile}
        growthRecords={appData.growthRecords}
        vaccineRecords={appData.vaccineRecords}
        medicalVisits={appData.medicalVisits}
        diaryEntries={appData.diaryEntries}
      />

      {/* Add Growth Measurement Modal */}
      <AddGrowthModal
        isOpen={isAddGrowthOpen}
        onClose={() => setIsAddGrowthOpen(false)}
        babyProfile={appData.babyProfile}
        onSave={handleAddGrowthRecord}
      />

      {/* Add Diary Entry Modal */}
      <AddDiaryModal
        isOpen={isAddDiaryOpen}
        onClose={() => setIsAddDiaryOpen(false)}
        babyProfile={appData.babyProfile}
        initialCategory={diaryInitialCategory}
        onSave={handleAddDiaryEntry}
      />

      {/* Add Medical Visit Modal */}
      <AddMedicalVisitModal
        isOpen={isAddVisitOpen}
        onClose={() => setIsAddVisitOpen(false)}
        onSave={handleAddMedicalVisit}
      />

      {/* Edit Baby Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        babyProfile={appData.babyProfile}
        onSave={handleSaveProfile}
      />

    </div>
  );
}
