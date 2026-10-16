/**
 * SYNC & STORAGE MANAGER (e-Agihan SMKTego)
 * Menguruskan storan data, penyelarasan pelayan tempatan (REST API),
 * storan awan (Firebase/Cloud), dan sandaran tempatan (LocalStorage).
 */

const SYNC_KEYS = {
  REGISTRATIONS: "smktego_agihan_registrations_v1",
  CURRENT_TEACHER: "smktego_agihan_current_teacher_id",
  SETTINGS: "smktego_agihan_settings_v1",
  CLOUD_CONFIG: "smktego_agihan_cloud_config_v1",
  DEPARTMENTS: "smktego_agihan_departments_v1",
  TEACHERS: "smktego_agihan_teachers_v1"
};

class DataSyncManager {
  constructor() {
    this.isServerAvailable = false;
    // Gunakan API_BASE_URL dari environment jika ada, jika tidak gunakan window.location.origin
    this.serverUrl = (window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE_URL)
      ? window.__APP_CONFIG__.API_BASE_URL.replace(/\/$/, "")
      : window.location.origin;
    this.listeners = [];
    this.registrations = [];
    this.cloudConfig = this.loadCloudConfig();
    this.init();
  }

  async init() {
    // 1. Check local server availability
    await this.checkServer();

    // 2. Load initial data
    await this.loadData();

    // 3. Periodic poll if connected to server or cloud
    setInterval(() => {
      this.pollUpdates();
    }, 4000);
  }

  loadCloudConfig() {
    const envFirebaseUrl = (window.__APP_CONFIG__ && window.__APP_CONFIG__.FIREBASE_DATABASE_URL) || "";
    try {
      const saved = localStorage.getItem(SYNC_KEYS.CLOUD_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.firebaseUrl && envFirebaseUrl) {
          parsed.firebaseUrl = envFirebaseUrl;
          parsed.enabled = true;
        }
        return parsed;
      }
      return {
        enabled: Boolean(envFirebaseUrl),
        firebaseUrl: envFirebaseUrl
      };
    } catch (e) {
      return {
        enabled: Boolean(envFirebaseUrl),
        firebaseUrl: envFirebaseUrl
      };
    }
  }

  saveCloudConfig(config) {
    this.cloudConfig = config;
    localStorage.setItem(SYNC_KEYS.CLOUD_CONFIG, JSON.stringify(config));
  }

  async checkServer() {
    if (window.location.protocol.startsWith("http")) {
      try {
        const res = await fetch(`${this.serverUrl}/api/status`, { method: "GET", cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          this.isServerAvailable = data.status === "ok";
          return;
        }
      } catch (e) {
        this.isServerAvailable = false;
      }
    } else {
      this.isServerAvailable = false;
    }
  }

  async loadData() {
    // Priority 1: Cloud Sync (if enabled)
    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      try {
        const url = this.cloudConfig.firebaseUrl.replace(/\/$/, "") + "/registrations.json";
        const res = await fetch(url);
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData) {
            const list = Array.isArray(cloudData) ? cloudData : Object.values(cloudData);
            this.registrations = list.filter(Boolean);
            this.saveToLocal();
            this.notify();
            return this.registrations;
          }
        }
      } catch (e) {
        console.warn("Cloud sync load error:", e);
      }
    }

    // Priority 2: Local HTTP Server (PowerShell server)
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.serverUrl}/api/data`, { cache: "no-store" });
        if (res.ok) {
          const serverData = await res.json();
          if (serverData) {
            if (Array.isArray(serverData.departments) && serverData.departments.length > 0) {
              if (typeof DEPARTMENTS !== "undefined") {
                DEPARTMENTS = serverData.departments;
                if (typeof rebuildAllSubjects === "function") rebuildAllSubjects();
                localStorage.setItem(SYNC_KEYS.DEPARTMENTS, JSON.stringify(DEPARTMENTS));
              }
            }
            if (Array.isArray(serverData.teachers) && serverData.teachers.length > 0) {
              if (typeof TEACHERS_LIST !== "undefined") {
                TEACHERS_LIST = serverData.teachers;
                localStorage.setItem(SYNC_KEYS.TEACHERS, JSON.stringify(TEACHERS_LIST));
              }
            }
            if (Array.isArray(serverData.registrations)) {
              this.registrations = serverData.registrations;
              this.saveToLocal();
              this.notify();
              return this.registrations;
            }
          }
        }
      } catch (e) {
        console.warn("Server load error, falling back to local:", e);
      }
    }

    // Priority 3: LocalStorage
    try {
      const local = localStorage.getItem(SYNC_KEYS.REGISTRATIONS);
      this.registrations = local ? JSON.parse(local) : [];
    } catch (e) {
      this.registrations = [];
    }
    this.notify();
    return this.registrations;
  }

  saveToLocal() {
    try {
      localStorage.setItem(SYNC_KEYS.REGISTRATIONS, JSON.stringify(this.registrations));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  async pollUpdates() {
    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      await this.loadData();
    } else if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.serverUrl}/api/data`, { cache: "no-store" });
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && Array.isArray(serverData.registrations)) {
            if (JSON.stringify(serverData.registrations) !== JSON.stringify(this.registrations)) {
              this.registrations = serverData.registrations;
              this.saveToLocal();
              this.notify();
            }
          }
        }
      } catch (e) {}
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.registrations);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.registrations);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * Semak sama ada subjek untuk kelas tersebut sudah didaftarkan oleh sesiapa
   * Mengembalikan maklumat pendaftar terdahulu jika ada
   */
  checkConflict(subjectCode, classId, currentTeacherId = null) {
    const existing = this.registrations.find(
      r => r.subjectCode === subjectCode && r.classId === classId
    );

    if (!existing) {
      return { hasConflict: false };
    }

    const isOwnRegistration = currentTeacherId && existing.teacherId === currentTeacherId;
    return {
      hasConflict: !isOwnRegistration,
      isOwnRegistration,
      existing
    };
  }

  /**
   * Daftar Subjek Baharu mengikut dasar FIRST-COME FIRST-SERVED
   */
  async registerSubject(record) {
    // Format rekod
    const newRecord = {
      id: record.id || `reg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      teacherId: record.teacherId,
      teacherName: record.teacherName,
      deptId: record.deptId,
      deptName: record.deptName,
      subjectCode: record.subjectCode,
      subjectName: record.subjectName,
      classId: record.classId,
      className: record.className,
      hours: Number(record.hours),
      combination: record.combination,
      timestamp: record.timestamp || new Date().toISOString(),
      formattedTime: record.formattedTime || new Date().toLocaleString("ms-MY"),
      overrideNotes: record.overrideNotes || ""
    };

    // 1. Semak pertindihan di peringkat tempatan
    const check = this.checkConflict(newRecord.subjectCode, newRecord.classId, newRecord.teacherId);
    if (check.hasConflict && !record.isOverride) {
      return {
        success: false,
        conflict: true,
        existing: check.existing,
        message: `Subjek ${newRecord.subjectName} untuk kelas ${newRecord.className} telah didaftarkan. Sila berhubung dengan Guru Kanan Matapelajaran subjek ini.`
      };
    }

    // 2. Hantar ke pelayan tempatan jika ada
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.serverUrl}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord)
        });
        const result = await res.json();
        if (!result.success) {
          return result;
        }
        this.registrations = result.registrations;
        this.saveToLocal();
        this.notify();
        return { success: true, record: newRecord };
      } catch (e) {
        console.warn("Failed to save to server, falling back to local:", e);
      }
    }

    // 3. Hantar ke Cloud Firebase jika aktif
    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      try {
        const url = `${this.cloudConfig.firebaseUrl.replace(/\/$/, "")}/registrations/${newRecord.id}.json`;
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord)
        });
      } catch (e) {
        console.warn("Failed cloud write:", e);
      }
    }

    // 4. Simpan ke storan tempatan
    // Jika kemaskini (rekod sendiri atau override)
    const existingIndex = this.registrations.findIndex(
      r => r.subjectCode === newRecord.subjectCode && r.classId === newRecord.classId
    );

    if (existingIndex >= 0) {
      this.registrations[existingIndex] = newRecord;
    } else {
      this.registrations.push(newRecord);
    }

    this.saveToLocal();
    this.notify();
    return { success: true, record: newRecord };
  }

  /**
   * Padam Pendaftaran
   */
  async deleteRegistration(id, teacherId = null, isAdmin = false) {
    const item = this.registrations.find(r => r.id === id);
    if (!item) return { success: false, message: "Rekod tidak dijumpai." };

    if (!isAdmin && teacherId && item.teacherId !== teacherId) {
      return { success: false, message: "Anda hanya boleh memadam pendaftaran sendiri." };
    }

    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.serverUrl}/api/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          const result = await res.json();
          this.registrations = result.registrations;
          this.saveToLocal();
          this.notify();
          return { success: true };
        }
      } catch (e) {}
    }

    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      try {
        const url = `${this.cloudConfig.firebaseUrl.replace(/\/$/, "")}/registrations/${id}.json`;
        await fetch(url, { method: "DELETE" });
      } catch (e) {}
    }

    this.registrations = this.registrations.filter(r => r.id !== id);
    this.saveToLocal();
    this.notify();
    return { success: true };
  }

  /**
   * Reset / Kosongkan semua pendaftaran (Admin / Penyelaras sahaja)
   */
  async clearAllRegistrations() {
    if (this.isServerAvailable) {
      try {
        await fetch(`${this.serverUrl}/api/clear`, { method: "POST" });
      } catch (e) {}
    }
    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      try {
        const url = `${this.cloudConfig.firebaseUrl.replace(/\/$/, "")}/registrations.json`;
        await fetch(url, { method: "DELETE" });
      } catch (e) {}
    }
    this.registrations = [];
    this.saveToLocal();
    this.notify();
  }

  /**
   * Import data daripada fail JSON
   */
  async importData(importedRegistrations, merge = false) {
    if (!Array.isArray(importedRegistrations)) {
      throw new Error("Format fail JSON tidak sah. Mesti senarai array.");
    }

    let newList = [];
    if (merge) {
      const map = new Map();
      this.registrations.forEach(r => map.set(`${r.subjectCode}_${r.classId}`, r));
      importedRegistrations.forEach(r => map.set(`${r.subjectCode}_${r.classId}`, r));
      newList = Array.from(map.values());
    } else {
      newList = importedRegistrations;
    }

    this.registrations = newList;
    this.saveToLocal();

    if (this.isServerAvailable) {
      try {
        await fetch(`${this.serverUrl}/api/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrations: newList })
        });
      } catch (e) {}
    }

    this.notify();
    return true;
  }

  /**
   * Eksport fail sandaran JSON
   */
  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.registrations, null, 2));
    const downloadAnchor = document.createElement("a");
    const filename = `e-Agihan_SMKTego_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Eksport ke format aSc Timetables (.csv)
   */
  exportToAscTimetableCSV() {
    // Format standard aSc Timetables lessons import
    // Columns: Subject, Class, Teacher, LessonsCount, Combination
    let csv = "Subject Name,Subject Code,Class Name,Teacher Name,Periods,Combination\n";
    this.registrations.forEach(r => {
      const escape = str => `"${(str || "").replace(/"/g, '""')}"`;
      csv += `${escape(r.subjectName)},${escape(r.subjectCode)},${escape(r.className)},${escape(r.teacherName)},${r.hours},${escape(r.combination)}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aSc_Import_Agihan_SMKTego_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  /**
   * Simpan senarai Bidang & Subjek ke Pelayan dan Cloud
   */
  async saveDepartments(departments) {
    if (this.isServerAvailable) {
      try {
        await fetch(`${this.serverUrl}/api/departments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ departments })
        });
      } catch (e) {
        console.warn("Gagal simpan jabatan ke pelayan:", e);
      }
    }
    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      try {
        const url = `${this.cloudConfig.firebaseUrl.replace(/\/$/, "")}/departments.json`;
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(departments)
        });
      } catch (e) {}
    }
  }

  /**
   * Kemaskini berperingkat (Cascade Update) apabila nama subjek atau kod subjek diedit
   */
  async cascadeUpdateSubject(oldCode, newCode, newName, newDeptId, newDeptName) {
    let changed = false;
    this.registrations.forEach(r => {
      if (r.subjectCode === oldCode) {
        r.subjectCode = newCode;
        r.subjectName = newName;
        r.deptId = newDeptId;
        r.deptName = newDeptName;
        changed = true;
      }
    });

    if (changed) {
      this.saveToLocal();
      if (this.isServerAvailable) {
        try {
          await fetch(`${this.serverUrl}/api/import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrations: this.registrations })
          });
        } catch (e) {}
      }
      this.notify();
    }
  }

  /**
   * Simpan senarai Guru ke Pelayan dan Cloud
   */
  async saveTeachers(teachers) {
    if (this.isServerAvailable) {
      try {
        await fetch(`${this.serverUrl}/api/teachers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teachers })
        });
      } catch (e) {
        console.warn("Gagal simpan senarai guru ke pelayan:", e);
      }
    }
    if (this.cloudConfig.enabled && this.cloudConfig.firebaseUrl) {
      try {
        const url = `${this.cloudConfig.firebaseUrl.replace(/\/$/, "")}/teachers.json`;
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teachers)
        });
      } catch (e) {}
    }
  }

  /**
   * Kemaskini berperingkat (Cascade Update) apabila nama guru diedit
   */
  async cascadeUpdateTeacher(teacherId, newName) {
    let changed = false;
    this.registrations.forEach(r => {
      if (r.teacherId === Number(teacherId)) {
        r.teacherName = newName;
        changed = true;
      }
    });

    if (changed) {
      this.saveToLocal();
      if (this.isServerAvailable) {
        try {
          await fetch(`${this.serverUrl}/api/import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrations: this.registrations })
          });
        } catch (e) {}
      }
      this.notify();
    }
  }
}

// Instance global
const syncManager = new DataSyncManager();
