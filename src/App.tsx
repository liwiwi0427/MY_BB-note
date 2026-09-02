import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  BabyProfile,
  GrowthRecord,
  DiaryEntry,
  VaccineRecord,
  MedicalVisit,
  StickyNote,
} from './types';
import {
  initAuth,
  syncBabyProfileToCloud,
  listenToBabyProfile,
  saveGrowthRecordToCloud,
  deleteGrowthRecordFromCloud,
  listenToGrowthRecords,
  saveDiaryEntryToCloud,
  deleteDiaryEntryFromCloud,
  listenToDiaryEntries,
  saveVaccineRecordToCloud,
  listenToVaccineRecords,
  saveMedicalVisitToCloud,
  deleteMedicalVisitFromCloud,
  listenToMedicalVisits,
  saveStickyNoteToCloud,
  deleteStickyNoteFromCloud,
  listenToStickyNotes,
  registerFamilyShareRoom,
  joinFamilyByCode,
  uploadAllLocalDataToCloud,
  downloadAllCloudData,
  checkBabyExistsInCloud,
} from './firebase';
import { localStorageService } from './utils/storage';
import {
  evaluateAllSmartReminders,
  getStoredNotificationSettings,
  saveNotificationSettings,
  sendBrowserPushNotification,
  type AppNotification,
} from './utils/notificationService';
import type { NotificationSettings } from './types';
import { Navbar } from './components/Navbar';
import { BabyHeader } from './components/BabyHeader';
import { NotificationBanner } from './components/NotificationBanner';
import { NotificationModal } from './components/NotificationModal';
import { DiaryJournal } from './components/DiaryJournal';
import { GrowthTracker } from './components/GrowthTracker';
import { VaccineTracker } from './components/VaccineTracker';
import { StickyNotesBoard } from './components/StickyNotesBoard';
import { Toolbox } from './components/Toolbox';
import { EditProfileModal } from './components/EditProfileModal';
import { AddDiaryModal } from './components/AddDiaryModal';
import { AddGrowthModal } from './components/AddGrowthModal';
import { AddMedicalVisitModal } from './components/AddMedicalVisitModal';
import { PediatricReportModal } from './components/PediatricReportModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { DataBackupModal } from './components/DataBackupModal';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { ParsedImportResult } from './utils/dataImportExport';

function BabyAppContent() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'diary' | 'growth' | 'vaccines' | 'notes' | 'toolbox'>('diary');

  // Core Data States (Initialized from local storage cache)
  const [baby, setBaby] = useState<BabyProfile>(() => localStorageService.getBabyProfile());
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(() => localStorageService.getGrowthRecords());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => localStorageService.getDiaryEntries());
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>(() => localStorageService.getVaccineRecords());
  const [medicalVisits, setMedicalVisits] = useState<MedicalVisit[]>(() => localStorageService.getMedicalVisits());
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => localStorageService.getStickyNotes());

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    getStoredNotificationSettings()
  );

  // Cloud & Sync States
  const [familyCode, setFamilyCode] = useState<string>(() => localStorageService.getFamilyCode());
  const [memberName, setMemberName] = useState<string>(() => localStorageService.getMemberName());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddDiaryOpen, setIsAddDiaryOpen] = useState(false);
  const [editingDiaryEntry, setEditingDiaryEntry] = useState<DiaryEntry | null>(null);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [editingGrowthRecord, setEditingGrowthRecord] = useState<GrowthRecord | null>(null);
  const [isAddMedicalVisitOpen, setIsAddMedicalVisitOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Dismissed notifications list
  const [dismissedNotiIds, setDismissedNotiIds] = useState<string[]>([]);
  const [lastPushedIds, setLastPushedIds] = useState<string[]>([]);

  // Network connectivity status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Initial Auth and Realtime Subscriptions setup
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initFirebase = async () => {
      try {
        await initAuth();
        setIsOnline(navigator.onLine);

        // Register room code in cloud
        if (familyCode) {
          await registerFamilyShareRoom(familyCode, baby.id, baby.name, memberName);
        }

        // Check if cloud already has this baby profile
        const exists = await checkBabyExistsInCloud(baby.id);
        if (!exists) {
          // First time initial seeding of local state to Firestore
          await uploadAllLocalDataToCloud(
            baby,
            growthRecords,
            diaryEntries,
            vaccineRecords,
            medicalVisits,
            stickyNotes
          );
        }

        // Realtime Listeners with direct reactive data flow
        const unsubBaby = listenToBabyProfile(baby.id, (cloudBaby) => {
          if (cloudBaby) {
            setBaby(cloudBaby);
            localStorageService.saveBabyProfile(cloudBaby);
          }
        });
        unsubs.push(unsubBaby);

        const unsubGrowth = listenToGrowthRecords(baby.id, (records) => {
          setGrowthRecords(records);
          localStorageService.saveGrowthRecords(records);
        });
        unsubs.push(unsubGrowth);

        const unsubDiary = listenToDiaryEntries(baby.id, (entries) => {
          setDiaryEntries(entries);
          localStorageService.saveDiaryEntries(entries);
        });
        unsubs.push(unsubDiary);

        const unsubVaccines = listenToVaccineRecords(baby.id, (records) => {
          setVaccineRecords(records);
          localStorageService.saveVaccineRecords(records);
        });
        unsubs.push(unsubVaccines);

        const unsubVisits = listenToMedicalVisits(baby.id, (visits) => {
          setMedicalVisits(visits);
          localStorageService.saveMedicalVisits(visits);
        });
        unsubs.push(unsubVisits);

        const unsubSticky = listenToStickyNotes(baby.id, (notes) => {
          setStickyNotes(notes);
          localStorageService.saveStickyNotes(notes);
        });
        unsubs.push(unsubSticky);
      } catch (err) {
        console.warn('Firebase initialization or listeners notice:', err);
      }
    };

    initFirebase();

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [baby.id, familyCode]);

  // Ensure robust multi-tier persistent backup in localStorage
  useEffect(() => {
    localStorageService.saveEmergencyBackup({
      baby,
      growthRecords,
      diaryEntries,
      vaccineRecords,
      medicalVisits,
      stickyNotes,
      familyCode,
    });
  }, [baby, growthRecords, diaryEntries, vaccineRecords, medicalVisits, stickyNotes, familyCode]);

  // Notifications calculation & Smart Push Reminders
  const notifications = useMemo(() => {
    const raw = evaluateAllSmartReminders(vaccineRecords, diaryEntries, baby, notificationSettings);
    return raw.filter((n) => !dismissedNotiIds.includes(n.id));
  }, [vaccineRecords, diaryEntries, baby, notificationSettings, dismissedNotiIds]);

  // Background Push Interval (Runs every 60 seconds to check due reminders)
  useEffect(() => {
    if (!notificationSettings.enableBrowserPush) return;

    const checkAndPush = () => {
      const activeReminders = evaluateAllSmartReminders(
        vaccineRecords,
        diaryEntries,
        baby,
        notificationSettings
      );

      for (const reminder of activeReminders) {
        if (!lastPushedIds.includes(reminder.id) && !dismissedNotiIds.includes(reminder.id)) {
          sendBrowserPushNotification(reminder.title, {
            body: reminder.message,
            playSound: notificationSettings.enableSound,
          });
          setLastPushedIds((prev) => [...prev.slice(-20), reminder.id]);
          break; // Avoid spamming multiple pushes in same tick
        }
      }
    };

    // Initial check on load/update
    checkAndPush();

    const intervalId = setInterval(checkAndPush, 60000); // Check every 1 minute
    return () => clearInterval(intervalId);
  }, [vaccineRecords, diaryEntries, baby, notificationSettings, lastPushedIds, dismissedNotiIds]);

  const handleDismissNotification = (id: string) => {
    setDismissedNotiIds((prev) => [...prev, id]);
  };

  const handleSaveNotificationSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  // Profile Save
  const handleSaveBabyProfile = async (updated: BabyProfile) => {
    setBaby(updated);
    localStorageService.saveBabyProfile(updated);
    await syncBabyProfileToCloud(updated);
  };

  // Diary Handlers
  const handleSaveDiaryEntry = async (entryData: Partial<DiaryEntry>) => {
    if (editingDiaryEntry) {
      const updated: DiaryEntry = {
        ...editingDiaryEntry,
        ...entryData,
      } as DiaryEntry;

      const next = diaryEntries.map((e) => (e.id === updated.id ? updated : e));
      setDiaryEntries(next);
      localStorageService.saveDiaryEntries(next);
      await saveDiaryEntryToCloud(updated);
      setEditingDiaryEntry(null);
    } else {
      const newEntry: DiaryEntry = {
        id: `diary-${Date.now()}`,
        babyId: baby.id,
        type: entryData.type || 'feed_bottle',
        timestamp: entryData.timestamp || new Date().toISOString(),
        title: entryData.title,
        note: entryData.note,
        amountMl: entryData.amountMl,
        durationMinutes: entryData.durationMinutes,
        temperatureCelsius: entryData.temperatureCelsius,
        diaperColor: entryData.diaperColor,
        mood: entryData.mood || 'happy',
        loggedBy: entryData.loggedBy || memberName || '媽媽',
        createdAt: new Date().toISOString(),
      };

      const next = [newEntry, ...diaryEntries];
      setDiaryEntries(next);
      localStorageService.saveDiaryEntries(next);
      await saveDiaryEntryToCloud(newEntry);
    }
  };

  const handleDeleteDiaryEntry = async (id: string) => {
    const next = diaryEntries.filter((e) => e.id !== id);
    setDiaryEntries(next);
    localStorageService.saveDiaryEntries(next);
    await deleteDiaryEntryFromCloud(id);
  };

  const handleQuickAddDiary = async (type: DiaryEntry['type'], title: string, amountMl?: number) => {
    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      babyId: baby.id,
      type,
      timestamp: new Date().toISOString(),
      title,
      amountMl,
      durationMinutes: type === 'sleep' ? 60 : undefined,
      mood: 'happy',
      loggedBy: memberName || '照護者',
      createdAt: new Date().toISOString(),
    };
    const next = [newEntry, ...diaryEntries];
    setDiaryEntries(next);
    localStorageService.saveDiaryEntries(next);
    await saveDiaryEntryToCloud(newEntry);
  };

  // Growth Handlers
  const handleSaveGrowthRecord = async (recordData: Partial<GrowthRecord>) => {
    if (editingGrowthRecord) {
      const updated: GrowthRecord = {
        ...editingGrowthRecord,
        ...recordData,
      } as GrowthRecord;
      const next = growthRecords.map((r) => (r.id === updated.id ? updated : r));
      setGrowthRecords(next);
      localStorageService.saveGrowthRecords(next);
      await saveGrowthRecordToCloud(updated);
      setEditingGrowthRecord(null);
    } else {
      const newRec: GrowthRecord = {
        id: `growth-${Date.now()}`,
        babyId: baby.id,
        date: recordData.date || new Date().toISOString().split('T')[0],
        ageMonths: recordData.ageMonths || 0,
        ageDays: recordData.ageDays || 0,
        weight: recordData.weight || 0,
        length: recordData.length || 0,
        headCirc: recordData.headCirc || 0,
        doctorNote: recordData.doctorNote,
        measuredBy: recordData.measuredBy || memberName,
        createdAt: new Date().toISOString(),
      };
      const next = [...growthRecords, newRec];
      setGrowthRecords(next);
      localStorageService.saveGrowthRecords(next);
      await saveGrowthRecordToCloud(newRec);
    }
  };

  const handleDeleteGrowthRecord = async (id: string) => {
    const next = growthRecords.filter((r) => r.id !== id);
    setGrowthRecords(next);
    localStorageService.saveGrowthRecords(next);
    await deleteGrowthRecordFromCloud(id);
  };

  // Vaccine Handlers
  const handleToggleVaccine = async (record: VaccineRecord) => {
    const nextState = !record.isCompleted;
    const updated: VaccineRecord = {
      ...record,
      isCompleted: nextState,
      administeredDate: nextState ? new Date().toISOString().split('T')[0] : undefined,
      clinicName: nextState ? record.clinicName || '兒科小兒專科門診' : undefined,
    };
    const next = vaccineRecords.map((v) => (v.id === record.id ? updated : v));
    setVaccineRecords(next);
    localStorageService.saveVaccineRecords(next);
    await saveVaccineRecordToCloud(updated);
  };

  const handleUpdateVaccine = async (updated: VaccineRecord) => {
    const next = vaccineRecords.map((v) => (v.id === updated.id ? updated : v));
    setVaccineRecords(next);
    localStorageService.saveVaccineRecords(next);
    await saveVaccineRecordToCloud(updated);
  };

  const handleResetSchedule = async (newSchedule: VaccineRecord[]) => {
    setVaccineRecords(newSchedule);
    localStorageService.saveVaccineRecords(newSchedule);
    for (const v of newSchedule) {
      await saveVaccineRecordToCloud(v);
    }
  };

  // Medical Visits Handlers
  const handleSaveMedicalVisit = async (visitData: Partial<MedicalVisit>) => {
    const newVisit: MedicalVisit = {
      id: `med-${Date.now()}`,
      babyId: baby.id,
      date: visitData.date || new Date().toISOString().split('T')[0],
      clinic: visitData.clinic || '兒科門診',
      doctor: visitData.doctor,
      reason: visitData.reason || '常規門診',
      diagnosis: visitData.diagnosis,
      temperature: visitData.temperature,
      weight: visitData.weight,
      prescriptions: visitData.prescriptions,
      doctorAdvice: visitData.doctorAdvice,
      createdAt: new Date().toISOString(),
    };
    const next = [newVisit, ...medicalVisits];
    setMedicalVisits(next);
    localStorageService.saveMedicalVisits(next);
    await saveMedicalVisitToCloud(newVisit);
  };

  const handleDeleteMedicalVisit = async (id: string) => {
    const next = medicalVisits.filter((m) => m.id !== id);
    setMedicalVisits(next);
    localStorageService.saveMedicalVisits(next);
    await deleteMedicalVisitFromCloud(id);
  };

  // Sticky Notes Handlers
  const handleAddStickyNote = async (
    content: string,
    author: string,
    color: StickyNote['color']
  ) => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      babyId: baby.id,
      content,
      author,
      color,
      isPinned: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    const next = [newNote, ...stickyNotes];
    setStickyNotes(next);
    localStorageService.saveStickyNotes(next);
    await saveStickyNoteToCloud(newNote);
  };

  const handleToggleStickyResolve = async (id: string) => {
    const target = stickyNotes.find((n) => n.id === id);
    if (!target) return;
    const updated: StickyNote = {
      ...target,
      isResolved: !target.isResolved,
      updatedAt: new Date().toISOString(),
    };
    const next = stickyNotes.map((n) => (n.id === id ? updated : n));
    setStickyNotes(next);
    localStorageService.saveStickyNotes(next);
    await saveStickyNoteToCloud(updated);
  };

  const handleDeleteStickyNote = async (id: string) => {
    const next = stickyNotes.filter((n) => n.id !== id);
    setStickyNotes(next);
    localStorageService.saveStickyNotes(next);
    await deleteStickyNoteFromCloud(id);
  };

  // Family Sync Configuration
  const handleSaveSyncConfig = async (newCode: string, newMember: string) => {
    setFamilyCode(newCode);
    setMemberName(newMember);
    localStorageService.saveFamilyCode(newCode);
    localStorageService.saveMemberName(newMember);

    const updatedBaby = { ...baby, familyCode: newCode };
    setBaby(updatedBaby);
    localStorageService.saveBabyProfile(updatedBaby);

    await registerFamilyShareRoom(newCode, baby.id, baby.name, newMember);
    await syncBabyProfileToCloud(updatedBaby);
  };

  const handleJoinFamilyByCode = async (code: string): Promise<boolean> => {
    setIsSyncing(true);
    const room = await joinFamilyByCode(code, memberName);
    if (room && room.babyId) {
      setFamilyCode(code);
      localStorageService.saveFamilyCode(code);

      // Download all cloud records for this baby
      const cloudData = await downloadAllCloudData(room.babyId);
      if (cloudData.baby) {
        setBaby(cloudData.baby);
        localStorageService.saveBabyProfile(cloudData.baby);
      }
      setGrowthRecords(cloudData.growthRecords || []);
      localStorageService.saveGrowthRecords(cloudData.growthRecords || []);
      setDiaryEntries(cloudData.diaryEntries || []);
      localStorageService.saveDiaryEntries(cloudData.diaryEntries || []);
      setVaccineRecords(cloudData.vaccineRecords || []);
      localStorageService.saveVaccineRecords(cloudData.vaccineRecords || []);
      setMedicalVisits(cloudData.medicalVisits || []);
      localStorageService.saveMedicalVisits(cloudData.medicalVisits || []);
      setStickyNotes(cloudData.stickyNotes || []);
      localStorageService.saveStickyNotes(cloudData.stickyNotes || []);

      setIsSyncing(false);
      return true;
    }
    setIsSyncing(false);
    return false;
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await uploadAllLocalDataToCloud(
      baby,
      growthRecords,
      diaryEntries,
      vaccineRecords,
      medicalVisits,
      stickyNotes
    );
    setIsSyncing(false);
  };

  // Handle Full JSON Import
  const handleImportData = async (imported: ParsedImportResult) => {
    setIsSyncing(true);

    // 1. Update all React states
    setBaby(imported.baby);
    setGrowthRecords(imported.growthRecords);
    setDiaryEntries(imported.diaryEntries);
    setVaccineRecords(imported.vaccineRecords);
    setMedicalVisits(imported.medicalVisits);
    setStickyNotes(imported.stickyNotes);
    if (imported.familyCode) {
      setFamilyCode(imported.familyCode);
      localStorageService.saveFamilyCode(imported.familyCode);
    }

    // 2. Persist to localStorage
    localStorageService.saveBabyProfile(imported.baby);
    localStorageService.saveGrowthRecords(imported.growthRecords);
    localStorageService.saveDiaryEntries(imported.diaryEntries);
    localStorageService.saveVaccineRecords(imported.vaccineRecords);
    localStorageService.saveMedicalVisits(imported.medicalVisits);
    localStorageService.saveStickyNotes(imported.stickyNotes);

    // 3. Sync to Firebase Cloud Firestore
    try {
      await registerFamilyShareRoom(
        imported.familyCode || familyCode,
        imported.baby.id,
        imported.baby.name,
        memberName
      );
      await uploadAllLocalDataToCloud(
        imported.baby,
        imported.growthRecords,
        imported.diaryEntries,
        imported.vaccineRecords,
        imported.medicalVisits,
        imported.stickyNotes
      );
    } catch (e) {
      console.warn('Firebase cloud sync after import notice:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Latest Growth Record for header display
  const latestGrowth = growthRecords.length > 0 ? growthRecords[growthRecords.length - 1] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE6] text-[#2A2723]">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSyncing={isSyncing}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        notificationCount={notifications.length}
        isOnline={isOnline}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 pb-24 md:pb-10">
        
        {/* Baby Info Top Header */}
        <BabyHeader
          baby={baby}
          latestGrowthRecord={latestGrowth}
          vaccineRecords={vaccineRecords}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          onNavigateToNotes={() => setActiveTab('notes')}
        />

        {/* Actionable Notification Banner */}
        <NotificationBanner
          notifications={notifications}
          onDismiss={handleDismissNotification}
          onActionClick={(noti) => {
            if (noti.targetTab) {
              setActiveTab(noti.targetTab as any);
            } else {
              setActiveTab('vaccines');
            }
          }}
          onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'diary' && (
          <DiaryJournal
            entries={diaryEntries}
            baby={baby}
            onAddEntry={() => {
              setEditingDiaryEntry(null);
              setIsAddDiaryOpen(true);
            }}
            onEditEntry={(entry) => {
              setEditingDiaryEntry(entry);
              setIsAddDiaryOpen(true);
            }}
            onDeleteEntry={handleDeleteDiaryEntry}
            onQuickAdd={handleQuickAddDiary}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthTracker
            growthRecords={growthRecords}
            baby={baby}
            onAddRecord={() => {
              setEditingGrowthRecord(null);
              setIsAddGrowthOpen(true);
            }}
            onEditRecord={(rec) => {
              setEditingGrowthRecord(rec);
              setIsAddGrowthOpen(true);
            }}
            onDeleteRecord={handleDeleteGrowthRecord}
          />
        )}

        {activeTab === 'vaccines' && (
          <VaccineTracker
            vaccineRecords={vaccineRecords}
            medicalVisits={medicalVisits}
            baby={baby}
            onToggleVaccine={handleToggleVaccine}
            onUpdateVaccine={handleUpdateVaccine}
            onResetSchedule={handleResetSchedule}
            onAddMedicalVisit={() => setIsAddMedicalVisitOpen(true)}
            onDeleteMedicalVisit={handleDeleteMedicalVisit}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'notes' && (
          <StickyNotesBoard
            notes={stickyNotes}
            onAddNote={handleAddStickyNote}
            onToggleResolve={handleToggleStickyResolve}
            onDeleteNote={handleDeleteStickyNote}
            currentMemberName={memberName}
          />
        )}

        {activeTab === 'toolbox' && <Toolbox baby={baby} />}

      </main>

      {/* Modals */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onSaveSettings={handleSaveNotificationSettings}
        activeNotifications={notifications}
        onDismissNotification={handleDismissNotification}
        onSelectNotificationTab={(tab) => setActiveTab(tab as any)}
      />
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        baby={baby}
        onSave={handleSaveBabyProfile}
      />

      <AddDiaryModal
        isOpen={isAddDiaryOpen}
        onClose={() => {
          setIsAddDiaryOpen(false);
          setEditingDiaryEntry(null);
        }}
        onSave={handleSaveDiaryEntry}
        editingEntry={editingDiaryEntry}
        currentMemberName={memberName}
      />

      <AddGrowthModal
        isOpen={isAddGrowthOpen}
        onClose={() => {
          setIsAddGrowthOpen(false);
          setEditingGrowthRecord(null);
        }}
        baby={baby}
        onSave={handleSaveGrowthRecord}
        editingRecord={editingGrowthRecord}
      />

      <AddMedicalVisitModal
        isOpen={isAddMedicalVisitOpen}
        onClose={() => setIsAddMedicalVisitOpen(false)}
        onSave={handleSaveMedicalVisit}
      />

      <PediatricReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        baby={baby}
        growthRecords={growthRecords}
        medicalVisits={medicalVisits}
        vaccineRecords={vaccineRecords}
      />

      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        baby={baby}
        familyCode={familyCode}
        memberName={memberName}
        onSaveConfig={handleSaveSyncConfig}
        onJoinFamily={handleJoinFamilyByCode}
        onForceSync={handleForceSync}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        isSyncing={isSyncing}
        isOnline={isOnline}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        baby={baby}
        growthRecords={growthRecords}
        diaryEntries={diaryEntries}
        vaccineRecords={vaccineRecords}
        medicalVisits={medicalVisits}
        stickyNotes={stickyNotes}
        familyCode={familyCode}
        onImportData={handleImportData}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BabyAppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

