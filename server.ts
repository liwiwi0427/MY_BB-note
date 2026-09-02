import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side persistent storage for cloud sync/backup
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create data directory", err);
  }
}

const BACKUP_FILE = path.join(DATA_DIR, "cloud_backups.json");

interface BackupStore {
  [syncCode: string]: {
    data: any;
    updatedAt: string;
    deviceName?: string;
    version: number;
  };
}

function loadBackups(): BackupStore {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const content = fs.readFileSync(BACKUP_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading backups file:", e);
  }
  return {};
}

function saveBackups(store: BackupStore) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving backups file:", e);
  }
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Cloud Sync & Backup API
app.post("/api/sync/push", (req, res) => {
  try {
    const { syncCode, babyData, deviceName } = req.body;
    if (!syncCode || !babyData) {
      return res.status(400).json({ error: "syncCode and babyData are required" });
    }

    const code = String(syncCode).trim().toUpperCase();
    const store = loadBackups();
    const existing = store[code];
    const newVersion = existing ? (existing.version || 1) + 1 : 1;

    store[code] = {
      data: babyData,
      updatedAt: new Date().toISOString(),
      deviceName: deviceName || "Parent Device",
      version: newVersion,
    };

    saveBackups(store);
    res.json({
      success: true,
      syncCode: code,
      version: newVersion,
      updatedAt: store[code].updatedAt,
      message: "雲端資料已成功同步備份！",
    });
  } catch (error: any) {
    console.error("Sync push error:", error);
    res.status(500).json({ error: "Failed to backup data: " + error.message });
  }
});

app.get("/api/sync/pull/:code", (req, res) => {
  try {
    const code = String(req.params.code).trim().toUpperCase();
    const store = loadBackups();
    const record = store[code];

    if (!record) {
      return res.status(404).json({ error: "找不到此同步碼的雲端備份記錄，請確認代碼是否正確" });
    }

    res.json({
      success: true,
      syncCode: code,
      data: record.data,
      updatedAt: record.updatedAt,
      deviceName: record.deviceName,
      version: record.version,
    });
  } catch (error: any) {
    console.error("Sync pull error:", error);
    res.status(500).json({ error: "Failed to pull cloud backup: " + error.message });
  }
});

// List all active backups (for quick switch or restore)
app.get("/api/sync/list", (_req, res) => {
  try {
    const store = loadBackups();
    const list = Object.keys(store).map((code) => ({
      syncCode: code,
      babyName: store[code].data?.babyProfile?.name || "未命名寶寶",
      updatedAt: store[code].updatedAt,
      deviceName: store[code].deviceName,
      recordsCount: {
        growth: store[code].data?.growthRecords?.length || 0,
        vaccines: store[code].data?.vaccineRecords?.length || 0,
        diaries: store[code].data?.diaryEntries?.length || 0,
      },
    }));
    res.json({ success: true, backups: list });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve backup list" });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Baby Health Diary Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
