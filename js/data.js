/**
 * DATA RASMI SMK TENGHILAN (e-Agihan SMKTego)
 * Penyelaras Jadual Waktu: Steve Shilton Ating
 */

const DEFAULT_TEACHERS_LIST = [
  { id: 1, name: "AIDAH BINTI ANGA" },
  { id: 2, name: "AIDA HENRY ONGOL" },
  { id: 3, name: "AINI BINTI SIDEK" },
  { id: 4, name: "ALBERT BASINOU" },
  { id: 5, name: "ALCCAY BINTI JEFFRY" },
  { id: 6, name: "ALFEUS SINTEH" },
  { id: 7, name: "ALIJAH BINTI SERI" },
  { id: 8, name: "ANGELINE DURAT MISUN" },
  { id: 9, name: "AVILA RASIAH @ THOMY" },
  { id: 11, name: "AZLIAERDAWATTY BINTI ARKAM" },
  { id: 12, name: "BERNORD ADIH" },
  { id: 13, name: "BOBBY KANDINGU" },
  { id: 14, name: "CHONG YEN YIN @ GLORIA" },
  { id: 15, name: "CHRISTOPHER JOANNES TASIM" },
  { id: 16, name: "CHRISTOPHER SUGAU" },
  { id: 17, name: "DIANA BINTI MAMPOROK @ MANSUR" },
  { id: 18, name: "DISIL BIN LIMA" },
  { id: 19, name: "ELMIE BT AG JAAFAR" },
  { id: 20, name: "ERLYANAH BINTI MURILLAH" },
  { id: 21, name: "ERWIN BIN BALANTING" },
  { id: 22, name: "ESTHER YASANG" },
  { id: 23, name: "EVELYN BINTI BAGUNG" },
  { id: 24, name: "EVELYN BINTI JUANIS" },
  { id: 25, name: "EZANITA BINTI SAWAL" },
  { id: 26, name: "FLORA BINTI MOMPOROK" },
  { id: 27, name: "FRANCISCA ROLAND JASSIN @ PENNY" },
  { id: 28, name: "HANIZAH BINTI AHMAD" },
  { id: 29, name: "HARIDAH BINTI UTU SATU" },
  { id: 30, name: "HARTINI BINTI ABDUL RASSIN" },
  { id: 31, name: "HELLINA BT JAMBLI" },
  { id: 32, name: "IRMA SURIYANTI BINTI MOHD ISMAIL" },
  { id: 33, name: "ISMAIL SALLEH @ SALI" },
  { id: 34, name: "JASNIE BIN MASILANG" },
  { id: 35, name: "JESSICA ESLYN SAMBANG" },
  { id: 36, name: "JOEL @ JEFFREN BIN APOK" },
  { id: 37, name: "JOHEN @ JOEHAN GIPIN" },
  { id: 38, name: "JONIWOD GODUIS" },
  { id: 39, name: "JULIA GABAK" },
  { id: 40, name: "JUMIRIL BIN MOHAMMAD" },
  { id: 41, name: "JUSICH BT. LOGIDU" },
  { id: 42, name: "JUSTINA AUGUSTINE" },
  { id: 43, name: "LIAW KON YIN @ NURISMAH LIAW" },
  { id: 44, name: "LILIE ADING" },
  { id: 45, name: "MAEVE JUDI" },
  { id: 46, name: "MARIA @ FRANCISCA SANGGUL" },
  { id: 47, name: "MARIANY ANTHONY" },
  { id: 48, name: "MINAH @FLORA BINTI RUNSAB" },
  { id: 49, name: "MISFAT MATHERN" },
  { id: 50, name: "MITCHEL CHEE @ MICHELE CHEE" },
  { id: 51, name: "MOHD RAZLAN BIN MASRAT" },
  { id: 52, name: "MOHD SAAD BIN MOHD SHUIB" },
  { id: 53, name: "MOHD SUFIAN BIN WAN ABDUL RAZAK" },
  { id: 54, name: "MUHAMMAD ALIF AIMAN BIN ZUL" },
  { id: 55, name: "NEXCY BINTI SAUKI" },
  { id: 56, name: "NORANITA BINTI KIEFLI" },
  { id: 57, name: "NORIA MANDADI" },
  { id: 58, name: "NORMAH BINTI JAIM" },
  { id: 59, name: "NORZIAH BT. ANGOR" },
  { id: 60, name: "NURFITRI BINTI MIRHAN" },
  { id: 61, name: "NUR ZURIATY BINTI ZAKI" },
  { id: 62, name: "PADER YAKIM" },
  { id: 63, name: "P.RAMLI SUANG" },
  { id: 64, name: "RADHIATUN NURFATEHAH BINTI FAKHRUZROZI" },
  { id: 65, name: "RASITA BINTI JAMALUDIN @ ROSITA" },
  { id: 66, name: "RAYNOL BIN KALONG" },
  { id: 67, name: "REGINA BOLILIT" },
  { id: 68, name: "RICHARD BIN DAVID" },
  { id: 69, name: "RIZAL ASMIN" },
  { id: 70, name: "ROBERT BIN DADU" },
  { id: 71, name: "ROSITA BINTI ABU BAKAR" },
  { id: 72, name: "ROWILINE BT. KANSEDO" },
  { id: 73, name: "RUZILA BINTI ISMAIL" },
  { id: 74, name: "SA'DIAH BINTI JUMA" },
  { id: 75, name: "SALMIAH BINTI UMAR KHITAB" },
  { id: 76, name: "SELVERIA @ MAZNIE RAYMOND" },
  { id: 77, name: "SETIATEY WATI BINTI YATAM" },
  { id: 78, name: "SHIRLEYN GINSARI" },
  { id: 80, name: "STEVE SHILTON ATING" },
  { id: 81, name: "SUALI BIN LOKINSIM" },
  { id: 82, name: "SUEPARTTY ANTONI" },
  { id: 83, name: "SUHAIDA BINTI AWANG LADIN" },
  { id: 84, name: "SURAINIE BINTI DELAMIN" },
  { id: 85, name: "TG NURHASIFAH BINTI TG ABDULLAH" },
  { id: 86, name: "VIANNIE MOMIN" },
  { id: 87, name: "WILLIAM JOHNNY LUMPISAU" },
  { id: 88, name: "WILLSON LUKAS" },
  { id: 89, name: "YONG SHIU FEN @ CAROLINA YONG" },
  { id: 90, name: "NUR EZZATI BINTI BUSTAM" },
  { id: 91, name: "RAISAH BT MATJIN" },
  { id: 92, name: "NURUL AIN FARHANA BINTI MOHAMED ROZALI" }
];

// Senarai guru dinamik yang boleh ditambah
let TEACHERS_LIST = JSON.parse(JSON.stringify(DEFAULT_TEACHERS_LIST));

/**
 * Simpan senarai guru ke storan tempatan dan pelayan
 */
function saveTeachersToStorage() {
  try {
    localStorage.setItem("smktego_agihan_teachers_v1", JSON.stringify(TEACHERS_LIST));
    if (typeof syncManager !== "undefined" && syncManager.saveTeachers) {
      syncManager.saveTeachers(TEACHERS_LIST);
    }
  } catch (e) {
    console.error("Gagal simpan guru ke storan:", e);
  }
}

/**
 * Muat senarai guru dari storan tempatan
 */
function loadTeachersFromStorage() {
  try {
    const saved = localStorage.getItem("smktego_agihan_teachers_v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        TEACHERS_LIST = parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal memuat guru dari storan:", e);
  }
}

// Muat data guru tersimpan sekarang
loadTeachersFromStorage();

/**
 * TAMBAH GURU BAHARU KE DALAM SENARAI
 */
function addTeacher(teacherData) {
  const { name, role = "Guru Akademik Biasa", customId = null } = teacherData;
  const upperName = name.toUpperCase().trim();

  if (!upperName) {
    throw new Error("Sila masukkan nama guru.");
  }

  // Semak jika nama guru sudah wujud
  const existing = TEACHERS_LIST.find(t => t.name.toUpperCase() === upperName);
  if (existing) {
    throw new Error(`Nama guru "${upperName}" telah sedia ada dalam senarai (ID: T${String(existing.id).padStart(3, '0')}).`);
  }

  // Tentukan ID baharu
  let newId;
  if (customId) {
    newId = Number(customId);
  } else {
    const maxId = TEACHERS_LIST.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
    newId = maxId + 1;
  }

  const newTeacher = {
    id: newId,
    name: upperName,
    role: role
  };

  TEACHERS_LIST.push(newTeacher);
  
  // Susun mengikut abjad atau kekalkan ID
  saveTeachersToStorage();
  return newTeacher;
}

/**
 * KEMASKINI NAMA GURU
 */
function updateTeacher(id, newName) {
  const teacher = TEACHERS_LIST.find(t => t.id === Number(id));
  if (!teacher) throw new Error("Guru tidak dijumpai.");

  const upper = newName.toUpperCase().trim();
  teacher.name = upper;
  saveTeachersToStorage();

  // Cascade update kepada rekod pendaftaran sedia ada
  if (typeof syncManager !== "undefined" && syncManager.cascadeUpdateTeacher) {
    syncManager.cascadeUpdateTeacher(id, upper);
  }
  return teacher;
}

/**
 * PADAM GURU
 */
function deleteTeacher(id) {
  const tId = Number(id);
  const idx = TEACHERS_LIST.findIndex(t => t.id === tId);
  if (idx === -1) return false;

  TEACHERS_LIST.splice(idx, 1);
  saveTeachersToStorage();
  return true;
}

/**
 * RESET SENARAI GURU KEPADA ASAL (92 GURU)
 */
function resetTeachersToDefault() {
  TEACHERS_LIST = JSON.parse(JSON.stringify(DEFAULT_TEACHERS_LIST));
  saveTeachersToStorage();
}

const CLASSES_LIST = [
  // Tingkatan 1
  { id: "1_UM", form: 1, name: "1 UM" },
  { id: "1_UKM", form: 1, name: "1 UKM" },
  { id: "1_UPM", form: 1, name: "1 UPM" },
  { id: "1_UUM", form: 1, name: "1 UUM" },
  { id: "1_UTM", form: 1, name: "1 UTM" },
  { id: "1_UMS", form: 1, name: "1 UMS" },

  // Tingkatan 2
  { id: "2_UM", form: 2, name: "2 UM" },
  { id: "2_UKM", form: 2, name: "2 UKM" },
  { id: "2_UPM", form: 2, name: "2 UPM" },
  { id: "2_UUM", form: 2, name: "2 UUM" },
  { id: "2_UTM", form: 2, name: "2 UTM" },
  { id: "2_UMS", form: 2, name: "2 UMS" },

  // Tingkatan 3
  { id: "3_UM", form: 3, name: "3 UM" },
  { id: "3_UKM", form: 3, name: "3 UKM" },
  { id: "3_UPM", form: 3, name: "3 UPM" },
  { id: "3_UUM", form: 3, name: "3 UUM" },
  { id: "3_UTM", form: 3, name: "3 UTM" },
  { id: "3_UMS", form: 3, name: "3 UMS" },

  // Tingkatan 4
  { id: "4_UM", form: 4, name: "4 UM" },
  { id: "4_UKM", form: 4, name: "4 UKM" },
  { id: "4_UPM", form: 4, name: "4 UPM" },
  { id: "4_UUM", form: 4, name: "4 UUM" },
  { id: "4_UTM", form: 4, name: "4 UTM" },
  { id: "4_UMS", form: 4, name: "4 UMS" },

  // Tingkatan 5
  { id: "5_UM", form: 5, name: "5 UM" },
  { id: "5_UKM", form: 5, name: "5 UKM" },
  { id: "5_UPM", form: 5, name: "5 UPM" },
  { id: "5_UUM", form: 5, name: "5 UUM" },
  { id: "5_UTM", form: 5, name: "5 UTM" },
  { id: "5_UMS", form: 5, name: "5 UMS" }
];

// Senarai Bidang Piawai (Default)
const DEFAULT_DEPARTMENTS = [
  {
    id: "SAINS_MATEMATIK",
    name: "BIDANG SAINS & MATEMATIK",
    shortName: "Sains & Matematik",
    color: "#3B82F6",
    badgeClass: "badge-sains",
    icon: "🔬",
    subjects: [
      { code: "MAT", name: "MATEMATIK", defaultHours: 5, defaultCombo: "3+2", levels: [1,2,3,4,5] },
      { code: "SN", name: "SAINS", defaultHours: 5, defaultCombo: "3+2", levels: [1,2,3,4,5] },
      { code: "KIM", name: "KIMIA", defaultHours: 5, defaultCombo: "3+2", levels: [4,5] },
      { code: "BIO", name: "BIOLOGI", defaultHours: 5, defaultCombo: "3+2", levels: [4,5] },
      { code: "FIZ", name: "FIZIK", defaultHours: 5, defaultCombo: "3+2", levels: [4,5] },
      { code: "MT", name: "MATEMATIK TAMBAHAN", defaultHours: 5, defaultCombo: "3+2", levels: [4,5] }
    ]
  },
  {
    id: "KEMANUSIAAN",
    name: "BIDANG KEMANUSIAAN",
    shortName: "Kemanusiaan",
    color: "#10B981",
    badgeClass: "badge-kemanusiaan",
    icon: "🌍",
    subjects: [
      { code: "GEO", name: "GEOGRAFI", defaultHours: 3, defaultCombo: "2+1", levels: [1,2,3,4,5] },
      { code: "MZ", name: "PENDIDIKAN MUZIK", defaultHours: 2, defaultCombo: "2", levels: [1,2,3] },
      { code: "PJK", name: "PENDIDIKAN JASMANI", defaultHours: 2, defaultCombo: "2", levels: [1,2,3,4,5] },
      { code: "PM", name: "PENDIDIKAN MORAL", defaultHours: 3, defaultCombo: "2+1", levels: [1,2,3,4,5] },
      { code: "SEJ", name: "SEJARAH", defaultHours: 4, defaultCombo: "2+2", levels: [1,2,3,4,5] },
      { code: "PI", name: "PENDIDIKAN ISLAM", defaultHours: 4, defaultCombo: "2+2", levels: [1,2,3,4,5] }
    ]
  },
  {
    id: "TVET",
    name: "BIDANG TVET",
    shortName: "TVET",
    color: "#F59E0B",
    badgeClass: "badge-tvet",
    icon: "⚙️",
    subjects: [
      { code: "RBGD", name: "REKA BENTUK GRAFIK DIGITAL", defaultHours: 4, defaultCombo: "2+2", levels: [4,5] },
      { code: "SRT", name: "SAINS RUMAH TANGGA", defaultHours: 4, defaultCombo: "2+2", levels: [4,5] },
      { code: "SK", name: "SAINS KOMPUTER", defaultHours: 4, defaultCombo: "2+2", levels: [4,5] },
      { code: "RBT", name: "REKA BENTUK & TEKNOLOGI", defaultHours: 3, defaultCombo: "2+1", levels: [1,2,3] },
      { code: "ASK", name: "ASAS SAINS KOMPUTER", defaultHours: 3, defaultCombo: "2+1", levels: [1,2,3] },
      { code: "PERN", name: "PERNIAGAAN", defaultHours: 4, defaultCombo: "2+2", levels: [4,5] },
      { code: "PRK", name: "PERAKAUNAN", defaultHours: 4, defaultCombo: "2+2", levels: [4,5] }
    ]
  },
  {
    id: "BAHASA",
    name: "BIDANG BAHASA",
    shortName: "Bahasa",
    color: "#EC4899",
    badgeClass: "badge-bahasa",
    icon: "📖",
    subjects: [
      { code: "BM", name: "BAHASA MELAYU", defaultHours: 5, defaultCombo: "3+2", levels: [1,2,3,4,5] },
      { code: "BI", name: "BAHASA INGGERIS", defaultHours: 4, defaultCombo: "2+2", levels: [1,2,3,4,5] },
      { code: "BKD", name: "BAHASA KADAZAN DUSUN", defaultHours: 3, defaultCombo: "2+1", levels: [1,2,3,4,5] }
    ]
  }
];

// Array dinamik yang boleh disunting dan ditambah
let DEPARTMENTS = JSON.parse(JSON.stringify(DEFAULT_DEPARTMENTS));
let ALL_SUBJECTS = [];

// Pilihan Jam Kredit & Cadangan Kombinasi Masa KSSM
const CREDIT_COMBINATIONS = {
  1: ["1"],
  2: ["2", "1+1"],
  3: ["2+1", "1+1+1", "3"],
  4: ["2+2", "3+1", "2+1+1", "4"],
  5: ["3+2", "2+2+1", "5"],
  6: ["3+3", "2+2+2", "3+2+1", "4+2"]
};

/**
 * Bina semula senarai ALL_SUBJECTS rata daripada DEPARTMENTS
 */
function rebuildAllSubjects() {
  ALL_SUBJECTS = [];
  DEPARTMENTS.forEach(dept => {
    dept.subjects.forEach(sub => {
      ALL_SUBJECTS.push({
        ...sub,
        deptId: dept.id,
        deptName: dept.name,
        deptShort: dept.shortName,
        deptColor: dept.color
      });
    });
  });
  return ALL_SUBJECTS;
}

// Inisialisasi awal
rebuildAllSubjects();

/**
 * Simpan senarai bidang & subjek ke storan tempatan dan pelayan
 */
function saveDepartmentsToStorage() {
  try {
    localStorage.setItem("smktego_agihan_departments_v1", JSON.stringify(DEPARTMENTS));
    // Hantar ke syncManager jika ada
    if (typeof syncManager !== "undefined" && syncManager.saveDepartments) {
      syncManager.saveDepartments(DEPARTMENTS);
    }
  } catch (e) {
    console.error("Gagal menyimpan jabatan ke storan:", e);
  }
}

/**
 * Muat senarai bidang & subjek dari storan
 */
function loadDepartmentsFromStorage() {
  try {
    const saved = localStorage.getItem("smktego_agihan_departments_v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        DEPARTMENTS = parsed;
        rebuildAllSubjects();
      }
    }
  } catch (e) {
    console.warn("Gagal memuat jabatan dari storan, guna default:", e);
  }
}

// Muat storan sekarang
loadDepartmentsFromStorage();

/**
 * TAMBAH SUBJEK BAHARU KE DALAM BIDANG
 */
function addCustomSubject(subjectData) {
  const { code, name, deptId, defaultHours = 4, defaultCombo = "2+2", levels = [1,2,3,4,5] } = subjectData;
  const upperCode = code.toUpperCase().trim();
  const upperName = name.toUpperCase().trim();

  // Semak jika kod subjek sudah wujud
  const existing = ALL_SUBJECTS.find(s => s.code === upperCode);
  if (existing) {
    throw new Error(`Kod subjek "${upperCode}" telah wujud untuk subjek "${existing.name}". Sila gunakan kod lain.`);
  }

  // Cari bidang
  const dept = DEPARTMENTS.find(d => d.id === deptId);
  if (!dept) {
    throw new Error(`Bidang yang dipilih tidak wujud.`);
  }

  const newSub = {
    code: upperCode,
    name: upperName,
    defaultHours: Number(defaultHours),
    defaultCombo: defaultCombo,
    levels: levels
  };

  dept.subjects.push(newSub);
  rebuildAllSubjects();
  saveDepartmentsToStorage();
  return newSub;
}

/**
 * KEMASKINI / EDIT SUBJEK SEDIA ADA
 * Mengubah nama subjek, kod subjek, bidang, jam kredit, dan kombinasi.
 * Mengemaskini semua rekod pendaftaran sedia ada secara automatik (*cascade update*).
 */
function updateCustomSubject(oldCode, newSubjectData) {
  const { code, name, deptId, defaultHours = 4, defaultCombo = "2+2", levels = [1,2,3,4,5] } = newSubjectData;
  const upperCode = code.toUpperCase().trim();
  const upperName = name.toUpperCase().trim();

  // Jika kod bertukar, pastikan kod baharu belum digunakan oleh subjek lain
  if (upperCode !== oldCode) {
    const conflict = ALL_SUBJECTS.find(s => s.code === upperCode);
    if (conflict) {
      throw new Error(`Kod subjek "${upperCode}" telah digunakan oleh subjek "${conflict.name}".`);
    }
  }

  // Cari subjek lama dan buang dari bidang lama
  let foundSub = null;
  let oldDeptId = null;

  for (const dept of DEPARTMENTS) {
    const idx = dept.subjects.findIndex(s => s.code === oldCode);
    if (idx !== -1) {
      foundSub = dept.subjects[idx];
      oldDeptId = dept.id;
      dept.subjects.splice(idx, 1);
      break;
    }
  }

  if (!foundSub) {
    throw new Error(`Subjek dengan kod "${oldCode}" tidak dijumpai.`);
  }

  // Masukkan subjek yang dikemaskini ke dalam bidang sasaran
  const targetDept = DEPARTMENTS.find(d => d.id === deptId);
  if (!targetDept) {
    throw new Error(`Bidang sasaran tidak dijumpai.`);
  }

  const updatedSub = {
    code: upperCode,
    name: upperName,
    defaultHours: Number(defaultHours),
    defaultCombo: defaultCombo,
    levels: levels
  };

  targetDept.subjects.push(updatedSub);
  rebuildAllSubjects();
  saveDepartmentsToStorage();

  // Cascade update kepada rekod pendaftaran sedia ada
  if (typeof syncManager !== "undefined" && syncManager.cascadeUpdateSubject) {
    syncManager.cascadeUpdateSubject(oldCode, upperCode, upperName, targetDept.id, targetDept.name);
  }

  return updatedSub;
}

/**
 * PADAM SUBJEK
 */
function deleteCustomSubject(code) {
  let deleted = false;
  for (const dept of DEPARTMENTS) {
    const idx = dept.subjects.findIndex(s => s.code === code);
    if (idx !== -1) {
      dept.subjects.splice(idx, 1);
      deleted = true;
      break;
    }
  }

  if (deleted) {
    rebuildAllSubjects();
    saveDepartmentsToStorage();
  }
  return deleted;
}

/**
 * MUAT SEMULA SUBJEK PIAWAI SMK TENGHILAN
 */
function resetDepartmentsToDefault() {
  DEPARTMENTS = JSON.parse(JSON.stringify(DEFAULT_DEPARTMENTS));
  rebuildAllSubjects();
  saveDepartmentsToStorage();
}
