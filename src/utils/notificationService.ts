import type { VaccineRecord, DiaryEntry, BabyProfile, NotificationSettings } from '../types';

export interface AppNotification {
  id: string;
  type: 'vaccine_due' | 'feed_reminder' | 'diaper_reminder' | 'fever_alert' | 'sticky_note';
  title: string;
  message: string;
  dueDate?: string;
  priority: 'high' | 'normal';
  createdAt: string;
  targetTab?: string;
  extraData?: Record<string, unknown>;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enableBrowserPush: true,
  enableSound: true,
  vaccineReminder: true,
  feedReminder: true,
  feedIntervalHours: 3.5,
  diaperReminder: true,
  diaperIntervalHours: 2.5,
  feverWarning: true,
  stickyNotesReminder: true,
};

const SETTINGS_KEY = 'bb_notification_settings_v1';

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse notification settings', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save notification settings', e);
  }
}

/**
 * 柔和育兒提示音效合成器 (使用 Web Audio API，無需外部音檔)
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // 兩段式溫和鈴聲 (E5 -> G#5 -> B5)
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(659.25, now, 0.25); // E5
    playTone(830.61, now + 0.12, 0.35); // G#5
    playTone(987.77, now + 0.24, 0.45); // B5
  } catch (e) {
    console.warn('Audio chime failed', e);
  }
}

/**
 * 請求瀏覽器原生推播權限
 */
export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      console.warn('Notification permission request error', e);
      return false;
    }
  }
  return false;
};

/**
 * 取得當前瀏覽器推播授權狀態
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * 發送瀏覽器原生系統推播與聲音通知
 */
export function sendBrowserPushNotification(
  title: string,
  options?: NotificationOptions & { playSound?: boolean }
): boolean {
  if (options?.playSound !== false) {
    playNotificationChime();
  }

  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const noti = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'bb-note-notification',
      ...options,
    });

    noti.onclick = () => {
      window.focus();
      noti.close();
    };
    return true;
  } catch (e) {
    console.warn('Failed to dispatch browser notification', e);
    return false;
  }
}

/**
 * 智慧檢查所有即將到期之疫苗、餵奶與尿布時程
 */
export function evaluateAllSmartReminders(
  vaccineRecords: VaccineRecord[],
  diaryEntries: DiaryEntry[],
  baby: BabyProfile,
  settings: NotificationSettings
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const now = new Date();

  // 1. 疫苗時程檢查
  if (settings.vaccineReminder) {
    const pendingVaccines = vaccineRecords.filter((v) => !v.isCompleted);
    for (const v of pendingVaccines) {
      // 根據目標月齡與預定日計算
      let isDueOrUpcoming = false;
      if (v.scheduledDate) {
        const schedDate = new Date(v.scheduledDate);
        const diffDays = Math.ceil((schedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          isDueOrUpcoming = true;
        }
      } else {
        isDueOrUpcoming = true;
      }

      if (isDueOrUpcoming) {
        notifications.push({
          id: `noti-vac-${v.id}`,
          type: 'vaccine_due',
          title: `💉 疫苗接種提醒：${v.vaccineName}`,
          message: `建議時程【${v.targetAgeDescription}】${v.category === 'national_free' ? '（公費）' : '（自費推薦）'}，請儘速帶 ${baby.name} 前往兒科門診接種！`,
          dueDate: v.scheduledDate || '即將到期',
          priority: 'high',
          createdAt: new Date().toISOString(),
          targetTab: 'vaccines',
        });
        if (notifications.length >= 3) break;
      }
    }
  }

  // 2. 餵奶間隔提醒
  if (settings.feedReminder && diaryEntries.length > 0) {
    const feedEntries = diaryEntries
      .filter((e) => e.type.startsWith('feed_'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (feedEntries.length > 0) {
      const lastFeed = feedEntries[0];
      const lastFeedTime = new Date(lastFeed.timestamp);
      const elapsedHours = (now.getTime() - lastFeedTime.getTime()) / (1000 * 60 * 60);

      if (elapsedHours >= settings.feedIntervalHours) {
        notifications.push({
          id: `noti-feed-${lastFeed.id}`,
          type: 'feed_reminder',
          title: `🍼 寶寶喝奶時間到囉`,
          message: `距離上次餵食（${Math.floor(elapsedHours)} 小時 ${Math.floor((elapsedHours % 1) * 60)} 分前）已達預設間隔 ${settings.feedIntervalHours} 小時，快準備溫奶或哺乳吧！`,
          dueDate: '該喝奶囉',
          priority: 'high',
          createdAt: new Date().toISOString(),
          targetTab: 'diary',
        });
      }
    }
  }

  // 3. 換尿布檢查提醒
  if (settings.diaperReminder && diaryEntries.length > 0) {
    const diaperEntries = diaryEntries
      .filter((e) => e.type.startsWith('diaper_'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (diaperEntries.length > 0) {
      const lastDiaper = diaperEntries[0];
      const lastDiaperTime = new Date(lastDiaper.timestamp);
      const elapsedHours = (now.getTime() - lastDiaperTime.getTime()) / (1000 * 60 * 60);

      if (elapsedHours >= settings.diaperIntervalHours) {
        notifications.push({
          id: `noti-diaper-${lastDiaper.id}`,
          type: 'diaper_reminder',
          title: `💧 尿布檢查與更換提醒`,
          message: `已超過 ${settings.diaperIntervalHours} 小時未更換尿布，檢查一下屁屁保持乾爽，預防尿布疹與紅屁屁！`,
          dueDate: '檢查尿布',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          targetTab: 'diary',
        });
      }
    }
  }

  // 4. 發燒體溫追蹤警報
  if (settings.feverWarning && diaryEntries.length > 0) {
    const tempEntries = diaryEntries
      .filter((e) => e.temperatureCelsius && e.temperatureCelsius >= 38.0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (tempEntries.length > 0) {
      const lastFever = tempEntries[0];
      const lastFeverTime = new Date(lastFever.timestamp);
      const elapsedHours = (now.getTime() - lastFeverTime.getTime()) / (1000 * 60 * 60);

      if (elapsedHours <= 12) {
        notifications.push({
          id: `noti-fever-${lastFever.id}`,
          type: 'fever_alert',
          title: `🌡️ 發燒追蹤警示：${lastFever.temperatureCelsius}°C`,
          message: `近期曾記錄發燒（${lastFever.temperatureCelsius}°C），請持續監測寶寶活動力、食慾及體溫變化。`,
          dueDate: '密切觀察',
          priority: 'high',
          createdAt: new Date().toISOString(),
          targetTab: 'diary',
        });
      }
    }
  }

  return notifications;
}
