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
import { FamilyGroupModal } from './components/FamilyGroupModal';
import { Toolbox } from './components/Toolbox';
import { TotalIOTracker } from './components/TotalIOTracker';

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
  pullFromCloud,
  pushCloudBackup,
  pullCloudBackup
} from './utils/storage';
import { PRIMARY_DEFAULT_SYNC_CODE } from './data/defaultBabyData';
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

  // Firebase Real-time sync & saving states
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedRemoteUpdatedAtRef = useRef<string | null>(null);

  // Modal States
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isFamilyGroupOpen, setIsFamilyGroupOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [editingGrowthRecord, setEditingGrowthRecord] = useState<GrowthRecord | null>(null);
  const [isAddDiaryOpen, setIsAddDiaryOpen] = useState(false);
  const [editingDiaryEntry, setEditingDiaryEntry] = useState<DiaryEntry | null>(null);
  const [diaryInitialCategory, setDiaryInitialCategory] = useState<DiaryCategory>('daily');
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [editingMedicalVisit, setEditingMedicalVisit] = useState<MedicalVisit | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Core function to immediately persist to localStorage and push backup to Cloud (Firebase + Server)
  const persistAndSync = useCallback((nextState: AppDataStore, immediateSync = false, toastSuccessMsg?: string) => {
    // 1. Immediately save to LocalStorage
    saveAppData(nextState);

    // 2. Mark our update timestamp to avoid echo loops
    const nowIso = new Date().toISOString();
    lastProcessedRemoteUpdatedAtRef.current = nowIso;

    // 3. Clear existing debounced timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const doCloudPush = async () => {
      setIsSaving(true);
      try {
        const res = await pushCloudBackup(nextState);
        if (res.success) {
          lastProcessedRemoteUpdatedAtRef.current = res.updatedAt || nowIso;
          setAppData((current) => ({
            ...current,
            syncInfo: {
              ...current.syncInfo,
              version: res.version || current.syncInfo.version,
              lastSyncedAt: res.updatedAt || nowIso,
              statusMessage: '已成功存檔至雲端與本機',
              firebaseConnected: true,
            },
          }));
        }
      } catch (err) {
        console.warn('Auto cloud sync push error:', err);
      } finally {
        setIsSaving(false);
      }
    };

    if (immediateSync) {
      doCloudPush();
    } else {
      autoSaveTimerRef.current = setTimeout(doCloudPush, 800);
    }

    if (toastSuccessMsg) {
      showToast(toastSuccessMsg);
    }
  }, [showToast]);

  // Initial cloud check / hydration on mount
  useEffect(() => {
    const code = appData.syncInfo?.syncCode || PRIMARY_DEFAULT_SYNC_CODE;
    pullCloudBackup(code).then((res) => {
      if (res.success && res.data) {
        setAppData((current) => {
          const remoteVer = res.data!.syncInfo?.version || 0;
          const currentVer = current.syncInfo?.version || 0;
          const currentCount = current.diaryEntries.length + current.growthRecords.length + current.medicalVisits.length;
          const remoteCount = res.data!.diaryEntries.length + res.data!.growthRecords.length + res.data!.medicalVisits.length;

          if (remoteVer > currentVer || (currentCount === 0 && remoteCount > 0)) {
            lastProcessedRemoteUpdatedAtRef.current = res.data!.syncInfo?.lastSyncedAt || null;
            saveAppData(res.data!);
            showToast('☁️ 已自動載入最新雲端存檔！');
            return res.data!;
          }
          return current;
        });
      }
    }).catch((err) => {
      console.warn('Initial cloud hydration check:', err);
    });
  }, []); // Run once on startup

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

        setAppData((current) => {
          const currentVer = current.syncInfo?.version || 0;
          const incomingVer = remoteData.syncInfo?.version || 0;
          const currentCount = current.diaryEntries.length + current.growthRecords.length + current.medicalVisits.length;
          const remoteCount = remoteData.diaryEntries.length + remoteData.growthRecords.length + remoteData.medicalVisits.length;

          // If incoming version is strictly newer OR incoming has records while current is empty
          if (incomingVer > currentVer || (currentCount === 0 && remoteCount > 0)) {
            lastProcessedRemoteUpdatedAtRef.current = meta.updatedAt || null;
            saveAppData(remoteData);
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

  // Manual Save Trigger (For header button and quick save)
  const handleManualSave = async () => {
    setIsSaving(true);
    showToast('正在將最新資料儲存至雲端與本機...');
    try {
      const res = await pushCloudBackup(appData);
      if (res.success) {
        lastProcessedRemoteUpdatedAtRef.current = res.updatedAt || new Date().toISOString();
        setAppData((prev) => ({
          ...prev,
          syncInfo: {
            ...prev.syncInfo,
            lastSyncedAt: res.updatedAt || new Date().toISOString(),
            version: res.version || prev.syncInfo.version + 1,
            statusMessage: '已成功存檔至 Firebase 雲端與本機',
            firebaseConnected: true,
          },
        }));
        showToast('✅ 已成功將所有記錄儲存至 Firebase 雲端資料庫與本機！');
      } else {
        saveAppData(appData);
        showToast('✅ 已安全儲存於本機快取');
      }
    } catch (e: any) {
      saveAppData(appData);
      showToast('✅ 已儲存於本機快取');
    } finally {
      setIsSaving(false);
    }
  };

  // Push to Cloud Handler (Manual or auto from modal)
  const handlePushSync = async () => {
    const res = await pushCloudBackup(appData);
    if (res.success) {
      if (res.updatedAt) {
        lastProcessedRemoteUpdatedAtRef.current = res.updatedAt;
      }
      setAppData((prev) => ({
        ...prev,
        syncInfo: {
          ...prev.syncInfo,
          lastSyncedAt: res.updatedAt || new Date().toISOString(),
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
    const res = await pullCloudBackup(syncCode);
    if (res.success && res.data) {
      lastProcessedRemoteUpdatedAtRef.current = res.data.syncInfo?.lastSyncedAt || null;
      setAppData(res.data);
      saveAppData(res.data);
      showToast(`🔥 已成功自 Firebase 載入最新資料 (${syncCode})！`);
      return true;
    }
    return false;
  };

  // Update Sync Code
  const handleUpdateSyncCode = (newCode: string) => {
    setAppData((prev) => {
      const nextState: AppDataStore = {
        ...prev,
        syncInfo: {
          ...prev.syncInfo,
          syncCode: newCode,
        },
      };
      persistAndSync(nextState, true);
      return nextState;
    });
    showToast(`已設定新家庭同步碼：${newCode}`);
  };

  // Restore from File
  const handleRestoreFromFile = (importedData: AppDataStore) => {
    setAppData(importedData);
    persistAndSync(importedData, true, '已成功還原全部記錄並備份！');
  };

  // Profile Save
  const handleSaveProfile = (updatedProfile: BabyProfile) => {
    setAppData((prev) => {
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        babyProfile: updatedProfile,
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      persistAndSync(nextState, true, '已更新寶寶基本資料並同步至雲端！');
      return nextState;
    });
  };

  // Growth Record Actions
  const handleAddGrowthRecord = (newRec: GrowthRecord) => {
    setAppData((prev) => {
      const exists = prev.growthRecords.some((r) => r.id === newRec.id);
      const updated = exists
        ? prev.growthRecords.map((r) => (r.id === newRec.id ? newRec : r))
        : [...prev.growthRecords, newRec];
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        growthRecords: updated,
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      const msg = editingGrowthRecord 
        ? '已更新生長記錄並同步至雲端！' 
        : `已儲存生長記錄：體重 ${newRec.weight}kg (P${newRec.percentileWeight}) 並備份！`;
      persistAndSync(nextState, true, msg);
      return nextState;
    });
    setEditingGrowthRecord(null);
  };

  const handleOpenEditGrowthRecord = (record: GrowthRecord) => {
    setEditingGrowthRecord(record);
    setIsAddGrowthOpen(true);
  };

  const handleDeleteGrowthRecord = (id: string) => {
    setAppData((prev) => {
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        growthRecords: prev.growthRecords.filter((r) => r.id !== id),
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      persistAndSync(nextState, true, '已刪除該筆生長記錄');
      return nextState;
    });
  };

  // Vaccine Actions
  const handleToggleVaccine = (record: VaccineRecord) => {
    setAppData((prev) => {
      const exists = prev.vaccineRecords.some((r) => r.id === record.id);
      const updated = exists
        ? prev.vaccineRecords.map((r) => (r.id === record.id ? record : r))
        : [...prev.vaccineRecords, record];
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        vaccineRecords: updated,
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      const msg = record.isCompleted ? `🎉 已完成接種：${record.vaccineName}（已存檔）！` : `已更新：${record.vaccineName}`;
      persistAndSync(nextState, true, msg);
      return nextState;
    });
  };

  const handleUpdateVaccineRecord = (record: VaccineRecord) => {
    setAppData((prev) => {
      const exists = prev.vaccineRecords.some((r) => r.id === record.id);
      const updated = exists
        ? prev.vaccineRecords.map((r) => (r.id === record.id ? record : r))
        : [...prev.vaccineRecords, record];
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        vaccineRecords: updated,
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      persistAndSync(nextState, true, `已儲存【${record.vaccineName}】詳細醫囑與批號！`);
      return nextState;
    });
  };

  // Diary Actions
  const handleAddDiaryEntry = (newEntry: DiaryEntry) => {
    setAppData((prev) => {
      const exists = prev.diaryEntries.some((e) => e.id === newEntry.id);
      const updated = exists
        ? prev.diaryEntries.map((e) => (e.id === newEntry.id ? newEntry : e))
        : [newEntry, ...prev.diaryEntries];
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        diaryEntries: updated,
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      const msg = editingDiaryEntry ? '📔 日記記錄已成功更新並同步！' : '📔 溫馨日記已發佈並同步存檔！';
      persistAndSync(nextState, true, msg);
      return nextState;
    });
    setEditingDiaryEntry(null);
  };

  const handleOpenEditDiaryEntry = (entry: DiaryEntry) => {
    setEditingDiaryEntry(entry);
    setDiaryInitialCategory(entry.category);
    setIsAddDiaryOpen(true);
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setAppData((prev) => {
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        diaryEntries: prev.diaryEntries.filter((e) => e.id !== id),
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      persistAndSync(nextState, true, '已刪除該篇日記');
      return nextState;
    });
  };

  const handleQuickLog = (category: DiaryCategory) => {
    setEditingDiaryEntry(null);
    setDiaryInitialCategory(category);
    setIsAddDiaryOpen(true);
  };

  // Medical Visit Actions
  const handleAddMedicalVisit = (newVisit: MedicalVisit) => {
    setAppData((prev) => {
      const exists = prev.medicalVisits.some((v) => v.id === newVisit.id);
      const updated = exists
        ? prev.medicalVisits.map((v) => (v.id === newVisit.id ? newVisit : v))
        : [newVisit, ...prev.medicalVisits];
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        medicalVisits: updated,
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      const msg = editingMedicalVisit ? '🏥 已更新就診與用藥紀錄並存檔！' : `已儲存 ${newVisit.clinicName} 就診與用藥紀錄！`;
      persistAndSync(nextState, true, msg);
      return nextState;
    });
    setEditingMedicalVisit(null);
  };

  const handleOpenEditMedicalVisit = (visit: MedicalVisit) => {
    setEditingMedicalVisit(visit);
    setIsAddVisitOpen(true);
  };

  const handleDeleteMedicalVisit = (id: string) => {
    setAppData((prev) => {
      const nextVer = (prev.syncInfo?.version || 1) + 1;
      const nextState: AppDataStore = {
        ...prev,
        medicalVisits: prev.medicalVisits.filter((v) => v.id !== id),
        syncInfo: {
          ...prev.syncInfo,
          version: nextVer,
          lastSyncedAt: new Date().toISOString(),
        },
      };
      persistAndSync(nextState, true, '已刪除該門診就診紀錄');
      return nextState;
    });
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
        isSaving={isSaving}
        onManualSave={handleManualSave}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8">
        
        {/* Baby Profile & Quick Status Header (Visible on all views) */}
        <BabyHeader
          babyProfile={appData.babyProfile}
          growthRecords={appData.growthRecords}
          vaccineRecords={appData.vaccineRecords}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onOpenPediatricReport={() => setIsReportOpen(true)}
          onOpenFamilyGroup={() => setIsFamilyGroupOpen(true)}
          onOpenGrowthTracker={() => setActiveTab('growth')}
          onOpenVaccineTracker={() => setActiveTab('vaccines')}
          syncInfo={appData.syncInfo}
          onManualSave={handleManualSave}
          isSaving={isSaving}
        />

        {/* Tab Views */}
        {activeTab === 'diary' && (
          <DiaryJournal
            babyProfile={appData.babyProfile}
            diaryEntries={appData.diaryEntries}
            onAddDiary={() => {
              setEditingDiaryEntry(null);
              setDiaryInitialCategory('daily');
              setIsAddDiaryOpen(true);
            }}
            onQuickLog={handleQuickLog}
            onEditDiary={handleOpenEditDiaryEntry}
            onDeleteDiary={handleDeleteDiaryEntry}
            onOpenTotalIO={() => setActiveTab('io')}
          />
        )}

        {activeTab === 'io' && (
          <TotalIOTracker
            babyProfile={appData.babyProfile}
            growthRecords={appData.growthRecords}
            diaryEntries={appData.diaryEntries}
            onAddDiaryEntry={handleAddDiaryEntry}
            onEditDiaryEntry={handleOpenEditDiaryEntry}
            onDeleteDiaryEntry={handleDeleteDiaryEntry}
            onQuickLogCategory={handleQuickLog}
            onOpenPediatricReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthTracker
            babyProfile={appData.babyProfile}
            growthRecords={appData.growthRecords}
            onAddRecord={() => {
              setEditingGrowthRecord(null);
              setIsAddGrowthOpen(true);
            }}
            onEditRecord={handleOpenEditGrowthRecord}
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
            onAddVisit={() => {
              setEditingMedicalVisit(null);
              setIsAddVisitOpen(true);
            }}
            onEditVisit={handleOpenEditMedicalVisit}
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
            onOpenFamilyGroup={() => setIsFamilyGroupOpen(true)}
            onAddDiaryEntry={handleAddDiaryEntry}
            onEditDiaryEntry={handleOpenEditDiaryEntry}
            onDeleteDiaryEntry={handleDeleteDiaryEntry}
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
        onClose={() => {
          setIsAddGrowthOpen(false);
          setEditingGrowthRecord(null);
        }}
        babyProfile={appData.babyProfile}
        editingRecord={editingGrowthRecord}
        onSave={handleAddGrowthRecord}
      />

      {/* Add Diary Entry Modal */}
      <AddDiaryModal
        isOpen={isAddDiaryOpen}
        onClose={() => {
          setIsAddDiaryOpen(false);
          setEditingDiaryEntry(null);
        }}
        babyProfile={appData.babyProfile}
        initialCategory={diaryInitialCategory}
        editingEntry={editingDiaryEntry}
        onSave={handleAddDiaryEntry}
      />

      {/* Add Medical Visit Modal */}
      <AddMedicalVisitModal
        isOpen={isAddVisitOpen}
        onClose={() => {
          setIsAddVisitOpen(false);
          setEditingMedicalVisit(null);
        }}
        editingVisit={editingMedicalVisit}
        onSave={handleAddMedicalVisit}
      />

      {/* Edit Baby Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        babyProfile={appData.babyProfile}
        onSave={handleSaveProfile}
      />

      {/* Family Group Management & Monthly Excel Export Modal */}
      <FamilyGroupModal
        isOpen={isFamilyGroupOpen}
        onClose={() => setIsFamilyGroupOpen(false)}
        appData={appData}
      />

    </div>
  );
}
