/**
 * LOGIK UTAMA APLIKASI (e-Agihan SMKTego)
 * Menguruskan interaksi dropdown, pengesanan konflik pendaftaran terawal,
 * paparan amaran merah terang, pengiraan jam kredit, dan papan pemuka penyelaras.
 */

// Keadaan Aplikasi (App State)
const appState = {
  currentTeacher: null,
  selectedDept: null,
  selectedSubject: null,
  selectedClass: null,
  selectedHours: 5,
  selectedCombo: "3+2",
  registrations: [],
  activeTab: "register", // 'register', 'my-subjects', 'dashboard', 'reports', 'settings'
  activeDeptFilter: "ALL",
  activeClassFilter: "ALL",
  searchQuery: "",
  deferredPrompt: null
};

// Inisialisasi Apabila Dokumen Bersedia
document.addEventListener("DOMContentLoaded", () => {
  initPWA();
  initDropdowns();
  initEventListeners();
  loadSavedTeacher();

  // Langgan kepada perubahan data dari Sync Manager
  syncManager.subscribe((data) => {
    appState.registrations = data;
    renderAllViews();
  });
});

/**
 * PWA Service Worker & Install Prompt Setup
 */
function initPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("Service Worker registered:", reg.scope))
      .catch(err => console.log("Service Worker registration failed:", err));
  }

  // Tangkap install prompt untuk butang pasang
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    appState.deferredPrompt = e;
    const installBanner = document.getElementById("pwaInstallBanner");
    if (installBanner) installBanner.style.display = "flex";
  });
}

function promptInstallPWA() {
  if (appState.deferredPrompt) {
    appState.deferredPrompt.prompt();
    appState.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Pengguna memasang aplikasi PWA");
      }
      appState.deferredPrompt = null;
      const installBanner = document.getElementById("pwaInstallBanner");
      if (installBanner) installBanner.style.display = "none";
    });
  } else {
    // Paparkan panduan manual untuk iOS / Chrome
    showModal("pwaGuideModal");
  }
}

/**
 * Muat dan Kemaskini Pilihan Nama Guru dalam Dropdown
 */
function populateTeacherDropdown(selectedId = null) {
  const teacherSelect = document.getElementById("teacherSelect");
  if (!teacherSelect) return;
  teacherSelect.innerHTML = `<option value="">-- Sila Pilih Nama Anda --</option>`;
  
  // Susun senarai guru mengikut abjad
  const sorted = [...TEACHERS_LIST].sort((a, b) => a.name.localeCompare(b.name));
  
  sorted.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.name} (T${String(t.id).padStart(3, '0')})`;
    if (selectedId && Number(selectedId) === t.id) {
      opt.selected = true;
    } else if (appState.currentTeacher && appState.currentTeacher.id === t.id) {
      opt.selected = true;
    }
    teacherSelect.appendChild(opt);
  });

  const badge = document.getElementById("teacherCountBadge");
  if (badge) {
    badge.textContent = `(${TEACHERS_LIST.length} Guru SMK Tenghilan)`;
  }
}

/**
 * Inisialisasi Pilihan Dropdown
 */
function initDropdowns() {
  // 1. Dropdown Nama Guru
  populateTeacherDropdown();

  // 2. Dropdown Bidang
  const deptSelect = document.getElementById("deptSelect");
  deptSelect.innerHTML = `<option value="">-- Sila Pilih Bidang --</option>`;
  DEPARTMENTS.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = `${d.icon} ${d.name}`;
    deptSelect.appendChild(opt);
  });

  // 3. Dropdown Kelas (30 Kelas KSSM)
  const classSelect = document.getElementById("classSelect");
  classSelect.innerHTML = `<option value="">-- Sila Pilih Kelas --</option>`;
  
  [1, 2, 3, 4, 5].forEach(form => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = `--- TINGKATAN ${form} ---`;
    CLASSES_LIST.filter(c => c.form === form).forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `Kelas ${c.name}`;
      optGroup.appendChild(opt);
    });
    classSelect.appendChild(optGroup);
  });

  // 4. Dropdown Jam Kredit
  const hoursSelect = document.getElementById("hoursSelect");
  hoursSelect.innerHTML = "";
  [1, 2, 3, 4, 5, 6].forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = `${h} Waktu (${h * 30} Minit Seminggu)`;
    if (h === 5) opt.selected = true;
    hoursSelect.appendChild(opt);
  });

  updateCombinationOptions(5);
}

/**
 * Kemaskini Pilihan Kombinasi Masa mengikut Jam Kredit
 */
function updateCombinationOptions(hours) {
  const comboSelect = document.getElementById("comboSelect");
  comboSelect.innerHTML = "";
  const combos = CREDIT_COMBINATIONS[hours] || ["1"];

  combos.forEach((c, idx) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = `${c} ${c.includes('+') ? 'waktu berganding' : 'waktu berturutan'}`;
    if (idx === 0) opt.selected = true;
    comboSelect.appendChild(opt);
  });

  const customOpt = document.createElement("option");
  customOpt.value = "CUSTOM";
  customOpt.textContent = "Kombinasi Khas / Lain-lain...";
  comboSelect.appendChild(customOpt);

  appState.selectedHours = Number(hours);
  appState.selectedCombo = comboSelect.value;
}

/**
 * Inisialisasi Semua Event Listener
 */
function initEventListeners() {
  // 1. Pilih Guru
  const teacherSelect = document.getElementById("teacherSelect");
  teacherSelect.addEventListener("change", (e) => {
    const tId = Number(e.target.value);
    const teacher = TEACHERS_LIST.find(t => t.id === tId) || null;
    appState.currentTeacher = teacher;
    if (teacher) {
      localStorage.setItem(SYNC_KEYS.CURRENT_TEACHER, tId);
    } else {
      localStorage.removeItem(SYNC_KEYS.CURRENT_TEACHER);
    }
    renderTeacherWorkloadBadge();
    renderMyRegisteredList();
    checkLiveConflict();
  });

  // Filter carian nama guru pantas
  const teacherSearchInput = document.getElementById("teacherSearchInput");
  if (teacherSearchInput) {
    teacherSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      teacherSelect.innerHTML = `<option value="">-- Sila Pilih Nama Anda --</option>`;
      const filtered = TEACHERS_LIST.filter(t => t.name.toLowerCase().includes(q));
      filtered.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = `${t.name} (T${String(t.id).padStart(3, '0')})`;
        if (appState.currentTeacher && appState.currentTeacher.id === t.id) opt.selected = true;
        teacherSelect.appendChild(opt);
      });
    });
  }

  // 2. Pilih Bidang -> Kemaskini Dropdown Subjek
  const deptSelect = document.getElementById("deptSelect");
  deptSelect.addEventListener("change", (e) => {
    const deptId = e.target.value;
    appState.selectedDept = DEPARTMENTS.find(d => d.id === deptId) || null;
    populateSubjectDropdown();
    checkLiveConflict();
  });

  // 3. Pilih Subjek -> Cadangkan Jam Kredit & Kombinasi Automatik
  const subjectSelect = document.getElementById("subjectSelect");
  const btnEditSel = document.getElementById("btnEditSelectedSubject");
  subjectSelect.addEventListener("change", (e) => {
    const code = e.target.value;
    appState.selectedSubject = ALL_SUBJECTS.find(s => s.code === code) || null;

    if (btnEditSel) {
      btnEditSel.style.display = appState.selectedSubject ? "inline-flex" : "none";
    }

    if (appState.selectedSubject) {
      // Set default hours & combo
      const hoursSelect = document.getElementById("hoursSelect");
      hoursSelect.value = appState.selectedSubject.defaultHours;
      updateCombinationOptions(appState.selectedSubject.defaultHours);

      const comboSelect = document.getElementById("comboSelect");
      if (appState.selectedSubject.defaultCombo) {
        comboSelect.value = appState.selectedSubject.defaultCombo;
        appState.selectedCombo = appState.selectedSubject.defaultCombo;
      }
    }
    checkLiveConflict();
  });

  // 4. Pilih Kelas
  const classSelect = document.getElementById("classSelect");
  classSelect.addEventListener("change", (e) => {
    const classId = e.target.value;
    appState.selectedClass = CLASSES_LIST.find(c => c.id === classId) || null;
    checkLiveConflict();
  });

  // 5. Pilih Jam Kredit
  const hoursSelect = document.getElementById("hoursSelect");
  hoursSelect.addEventListener("change", (e) => {
    updateCombinationOptions(e.target.value);
  });

  // 6. Pilih Kombinasi
  const comboSelect = document.getElementById("comboSelect");
  comboSelect.addEventListener("change", (e) => {
    if (e.target.value === "CUSTOM") {
      const customVal = prompt("Sila masukkan pecahan kombinasi waktu (contoh: 2+1+1 atau 4):", "2+2");
      if (customVal) {
        appState.selectedCombo = customVal.trim();
        const customOpt = comboSelect.querySelector("option[value='CUSTOM']");
        customOpt.textContent = `Khas: ${appState.selectedCombo}`;
      } else {
        comboSelect.selectedIndex = 0;
        appState.selectedCombo = comboSelect.value;
      }
    } else {
      appState.selectedCombo = e.target.value;
    }
  });

  // 7. Butang Hantar Pendaftaran
  const registrationForm = document.getElementById("registrationForm");
  registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });

  // 8. Tab Navigation
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });

  // 9. Carian di Dashboard Penyelaras
  const dashboardSearch = document.getElementById("dashboardSearch");
  if (dashboardSearch) {
    dashboardSearch.addEventListener("input", (e) => {
      appState.searchQuery = e.target.value.toLowerCase().trim();
      renderDashboardTable();
    });
  }

  // 10. Filter Bidang di Dashboard
  const filterDeptSelect = document.getElementById("filterDeptSelect");
  if (filterDeptSelect) {
    filterDeptSelect.addEventListener("change", (e) => {
      appState.activeDeptFilter = e.target.value;
      renderDashboardTable();
      renderMatrixView();
    });
  }

  // 11. Butang Muaturun Laporan PDF
  document.getElementById("btnPdfFull")?.addEventListener("click", () => {
    pdfGen.generateFullSummaryPDF(appState.registrations);
  });

  document.getElementById("btnPdfMatrix")?.addEventListener("click", () => {
    pdfGen.generateClassMatrixPDF(appState.registrations);
  });

  document.getElementById("btnPdfDept")?.addEventListener("click", () => {
    const dSelect = document.getElementById("reportDeptSelect");
    const val = dSelect ? dSelect.value : "ALL";
    pdfGen.generateDepartmentSummaryPDF(appState.registrations, val);
  });

  document.getElementById("btnPdfSlip")?.addEventListener("click", () => {
    if (!appState.currentTeacher) {
      alert("Sila pilih guru terlebih dahulu untuk memuat turun slip.");
      return;
    }
    pdfGen.generateIndividualSlipPDF(appState.currentTeacher.id, appState.registrations);
  });

  document.getElementById("btnExportAsc")?.addEventListener("click", () => {
    syncManager.exportToAscTimetableCSV();
  });

  document.getElementById("btnExportJson")?.addEventListener("click", () => {
    syncManager.exportJSON();
  });

  // 12. Import JSON
  const importFileInput = document.getElementById("importFileInput");
  if (importFileInput) {
    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (confirm(`Adakah anda pasti ingin mengimport ${parsed.length} rekod pendaftaran?`)) {
            await syncManager.importData(parsed, false);
            alert("Data berjaya diimport sepenuhnya!");
          }
        } catch (err) {
          alert("Fail JSON tidak sah. Sila periksa fail anda.");
        }
      };
      reader.readAsText(file);
    });
  }

  // 13. Cloud Sync Form
  const cloudSyncForm = document.getElementById("cloudSyncForm");
  if (cloudSyncForm) {
    const cloudToggle = document.getElementById("cloudSyncToggle");
    const cloudUrlInput = document.getElementById("cloudFirebaseUrl");
    
    // Set initial
    cloudToggle.checked = syncManager.cloudConfig.enabled;
    cloudUrlInput.value = syncManager.cloudConfig.firebaseUrl || "";

    cloudSyncForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const config = {
        enabled: cloudToggle.checked,
        firebaseUrl: cloudUrlInput.value.trim()
      };
      syncManager.saveCloudConfig(config);
      alert("Tetapan Cloud Sync disimpan. Data akan diselaraskan dengan pelayan awan.");
      syncManager.loadData();
    });
  }

  // 14. Penapis dan Carian Tab Pengurusan Subjek
  const subjectSearch = document.getElementById("subjectSearchInput");
  if (subjectSearch) {
    subjectSearch.addEventListener("input", () => {
      renderSubjectsManager();
    });
  }

  const subjectDeptFilter = document.getElementById("subjectDeptFilterSelect");
  if (subjectDeptFilter) {
    subjectDeptFilter.addEventListener("change", () => {
      renderSubjectsManager();
    });
  }
}

/**
 * Muat nama guru yang tersimpan di telefon
 */
function loadSavedTeacher() {
  const savedId = localStorage.getItem(SYNC_KEYS.CURRENT_TEACHER);
  if (savedId) {
    const teacher = TEACHERS_LIST.find(t => t.id === Number(savedId));
    if (teacher) {
      appState.currentTeacher = teacher;
      const teacherSelect = document.getElementById("teacherSelect");
      teacherSelect.value = teacher.id;
      renderTeacherWorkloadBadge();
      renderMyRegisteredList();
    }
  }
}

/**
 * Kemaskini Dropdown Subjek mengikut Bidang
 */
function populateSubjectDropdown() {
  const subjectSelect = document.getElementById("subjectSelect");
  const btnEditSel = document.getElementById("btnEditSelectedSubject");
  subjectSelect.innerHTML = `<option value="">-- Sila Pilih Subjek --</option>`;

  if (!appState.selectedDept) {
    subjectSelect.disabled = true;
    if (btnEditSel) btnEditSel.style.display = "none";
    return;
  }

  subjectSelect.disabled = false;
  appState.selectedDept.subjects.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub.code;
    opt.textContent = `${sub.name} (${sub.code}) - ${sub.defaultHours} Waktu`;
    if (appState.selectedSubject && appState.selectedSubject.code === sub.code) {
      opt.selected = true;
    }
    subjectSelect.appendChild(opt);
  });

  if (btnEditSel) {
    btnEditSel.style.display = (appState.selectedSubject && subjectSelect.value) ? "inline-flex" : "none";
  }
}

/**
 * SEMAKAN PERTINDIHAN SECARA MASA NYATA (LIVE CLASH CHECK)
 * Syarat Pengguna:
 * Jika terdapat pertindihan pilihan subjek dalam satu kelas, bagi keutamaan
 * kepada guru yang telah mendaftar subjek tersebut terlebih dahulu.
 * Paparkan amaran:
 * "Subjek [nama subjek] untuk kelas [nama kelas] telah didaftarkan. Sila berhubung dengan Guru Kanan Matapelajaran subjek ini"
 * Perkataan dalam warna merah yang terang dan jelas!
 */
function checkLiveConflict() {
  const conflictBanner = document.getElementById("conflictWarningBox");
  const successBadge = document.getElementById("slotAvailableBadge");
  const submitBtn = document.getElementById("btnSubmitRegistration");

  // Jika belum pilih subjek atau kelas, sembunyikan amaran
  if (!appState.selectedSubject || !appState.selectedClass) {
    if (conflictBanner) conflictBanner.style.display = "none";
    if (successBadge) successBadge.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>💾 Daftar Subjek Ini</span>`;
    }
    return;
  }

  const currentTeacherId = appState.currentTeacher ? appState.currentTeacher.id : null;
  const check = syncManager.checkConflict(
    appState.selectedSubject.code,
    appState.selectedClass.id,
    currentTeacherId
  );

  if (check.hasConflict) {
    // Terdapat pertindihan dengan guru lain (Keutamaan kepada pendaftar terdahulu!)
    const existing = check.existing;
    if (conflictBanner) {
      conflictBanner.style.display = "block";
      conflictBanner.innerHTML = `
        <div class="conflict-alert-card animate-pulse-glow">
          <div class="conflict-header">
            <span class="conflict-alert-icon">⚠️</span>
            <div class="conflict-title-wrap">
              <h4 class="conflict-headline">PERHATIAN: PERTINDIHAN SUBJEK DIKESAN!</h4>
              <span class="conflict-sub">Prinsip Keutamaan: Pendaftar Terawal (First-Come, First-Served)</span>
            </div>
          </div>
          
          <div class="conflict-quote-box">
            <p class="conflict-exact-message">
              "Subjek <strong class="subject-highlight">${appState.selectedSubject.name}</strong> untuk kelas <strong class="class-highlight">${appState.selectedClass.name}</strong> telah didaftarkan. Sila berhubung dengan Guru Kanan Matapelajaran subjek ini"
            </p>
          </div>

          <div class="conflict-metadata-grid">
            <div class="meta-item">
              <span class="meta-label">👤 Didaftarkan Oleh:</span>
              <span class="meta-value teacher-name-tag">${existing.teacherName}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🕒 Masa Pendaftaran:</span>
              <span class="meta-value">${existing.formattedTime || existing.timestamp}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">⏱️ Peruntukan Waktu:</span>
              <span class="meta-value">${existing.hours} Waktu (${existing.combination || 'Piawai'})</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🛡️ Status Kawalan:</span>
              <span class="meta-value status-locked">TERKUNCI & DILINDUNGI</span>
            </div>
          </div>

          <div class="conflict-footer-actions">
            <span class="gkmp-contact-note">Sila rujuk GKMP ${existing.deptName} untuk sebarang rayuan atau pelarasan semula.</span>
            <button type="button" class="btn-override-link" onclick="openOverrideModal()">Kunci Khas GKMP / Penyelaras</button>
          </div>
        </div>
      `;
    }

    if (successBadge) successBadge.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>🚫 Pendaftaran Disekat (Telah Didaftarkan)</span>`;
      submitBtn.classList.add("btn-disabled-conflict");
    }
  } else if (check.isOwnRegistration) {
    // Guru sendiri yang mendaftar sebelum ini
    if (conflictBanner) {
      conflictBanner.style.display = "block";
      conflictBanner.innerHTML = `
        <div class="own-reg-card">
          <span class="own-icon">ℹ️</span>
          <div class="own-info">
            <strong>Subjek ini telah anda daftarkan sebelum ini:</strong>
            <p>${appState.selectedSubject.name} di kelas ${appState.selectedClass.name} (${check.existing.hours} Waktu - ${check.existing.combination}). Anda boleh mengemaskini jam kredit atau kombinasi masa.</p>
          </div>
        </div>
      `;
    }
    if (successBadge) successBadge.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>🔄 Kemaskini Pendaftaran Anda</span>`;
      submitBtn.classList.remove("btn-disabled-conflict");
    }
  } else {
    // Slot Masih Kosong dan Tersedia!
    if (conflictBanner) conflictBanner.style.display = "none";
    if (successBadge) {
      successBadge.style.display = "flex";
      successBadge.innerHTML = `
        <span class="badge-icon">✓</span>
        <span>Slot <strong>${appState.selectedSubject.name}</strong> untuk kelas <strong>${appState.selectedClass.name}</strong> adalah <strong>TERSEDIA</strong> untuk didaftarkan!</span>
      `;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>💾 Daftar Subjek Ini</span>`;
      submitBtn.classList.remove("btn-disabled-conflict");
    }
  }
}

/**
 * Kendali Penghantaran Borang Pendaftaran
 */
async function handleFormSubmit() {
  if (!appState.currentTeacher) {
    alert("Sila pilih Nama Guru terlebih dahulu.");
    document.getElementById("teacherSelect").focus();
    return;
  }

  if (!appState.selectedDept) {
    alert("Sila pilih Bidang terlebih dahulu.");
    document.getElementById("deptSelect").focus();
    return;
  }

  if (!appState.selectedSubject) {
    alert("Sila pilih Subjek terlebih dahulu.");
    document.getElementById("subjectSelect").focus();
    return;
  }

  if (!appState.selectedClass) {
    alert("Sila pilih Kelas terlebih dahulu.");
    document.getElementById("classSelect").focus();
    return;
  }

  const hours = Number(document.getElementById("hoursSelect").value);
  const combo = appState.selectedCombo || document.getElementById("comboSelect").value;

  const newRecord = {
    teacherId: appState.currentTeacher.id,
    teacherName: appState.currentTeacher.name,
    deptId: appState.selectedDept.id,
    deptName: appState.selectedDept.name,
    subjectCode: appState.selectedSubject.code,
    subjectName: appState.selectedSubject.name,
    classId: appState.selectedClass.id,
    className: appState.selectedClass.name,
    hours: hours,
    combination: combo,
    formattedTime: new Date().toLocaleString("ms-MY", {
      dateStyle: "medium",
      timeStyle: "medium"
    })
  };

  const submitBtn = document.getElementById("btnSubmitRegistration");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>⏳ Menyimpan ke Pangkalan Data...</span>`;

  try {
    const result = await syncManager.registerSubject(newRecord);
    if (result.success) {
      showToast(`Berjaya mendaftar ${newRecord.subjectName} untuk kelas ${newRecord.className}!`);
      // Reset pilihan subjek dan kelas untuk pendaftaran seterusnya
      document.getElementById("subjectSelect").value = "";
      document.getElementById("classSelect").value = "";
      appState.selectedSubject = null;
      appState.selectedClass = null;
      checkLiveConflict();
      renderTeacherWorkloadBadge();
      renderMyRegisteredList();
    } else {
      alert(result.message || "Pendaftaran gagal disebabkan konflik.");
    }
  } catch (err) {
    alert("Ralat semasa mendaftar: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>💾 Daftar Subjek Ini</span>`;
  }
}

/**
 * Papar Lencana Beban Mengajar Guru Terpilih
 */
function renderTeacherWorkloadBadge() {
  const container = document.getElementById("teacherWorkloadBadge");
  if (!container) return;

  if (!appState.currentTeacher) {
    container.innerHTML = `
      <div class="empty-teacher-hint">
        <span>👈 Sila pilih nama anda dalam menu di atas untuk melihat status beban waktu anda.</span>
      </div>
    `;
    return;
  }

  const teacherRegs = appState.registrations.filter(r => r.teacherId === appState.currentTeacher.id);
  const totalHours = teacherRegs.reduce((sum, r) => sum + Number(r.hours || 0), 0);
  const totalClasses = teacherRegs.length;

  let statusClass = "status-low";
  let statusText = "Masih Kurang Waktu (Sasaran: 24 - 28 Waktu)";
  if (totalHours >= 24 && totalHours <= 30) {
    statusClass = "status-optimal";
    statusText = "Beban Waktu Optimum (KSSM)";
  } else if (totalHours > 30) {
    statusClass = "status-high";
    statusText = "Beban Waktu Maksimum / Melebihi Purata";
  }

  container.innerHTML = `
    <div class="workload-summary-glass">
      <div class="workload-header">
        <div class="teacher-avatar">👨‍🏫</div>
        <div class="teacher-info">
          <h3 class="teacher-title">${appState.currentTeacher.name}</h3>
          <span class="teacher-id-badge">ID: T${String(appState.currentTeacher.id).padStart(3, '0')}</span>
        </div>
        <div class="workload-counter ${statusClass}">
          <span class="counter-num">${totalHours}</span>
          <span class="counter-label">WAKTU SEMINGGU</span>
        </div>
      </div>
      <div class="workload-progress-bar">
        <div class="progress-fill" style="width: ${Math.min((totalHours / 28) * 100, 100)}%;"></div>
      </div>
      <div class="workload-footer">
        <span class="footer-classes">📚 ${totalClasses} Kelas Berdaftar</span>
        <span class="footer-status-tag ${statusClass}">${statusText}</span>
      </div>
    </div>
  `;
}

/**
 * Paparan Senarai Subjek Guru Yang Telah Berdaftar (My Subjects Tab)
 */
function renderMyRegisteredList() {
  const container = document.getElementById("mySubjectsContainer");
  if (!container) return;

  if (!appState.currentTeacher) {
    container.innerHTML = `
      <div class="glass-empty-state">
        <div class="empty-icon">👤</div>
        <h3>Belum Memilih Nama Guru</h3>
        <p>Sila pilih nama anda di bahagian atas untuk menyemak dan menguruskan subjek yang anda daftarkan.</p>
      </div>
    `;
    return;
  }

  const teacherRegs = appState.registrations.filter(r => r.teacherId === appState.currentTeacher.id);
  const totalHours = teacherRegs.reduce((sum, r) => sum + Number(r.hours || 0), 0);

  if (teacherRegs.length === 0) {
    container.innerHTML = `
      <div class="glass-empty-state">
        <div class="empty-icon">📝</div>
        <h3>Tiada Subjek Didaftarkan Lagi</h3>
        <p>Cikgu <strong>${appState.currentTeacher.name}</strong> belum mendaftar sebarang subjek untuk sesi 2026.</p>
        <button class="btn-primary-yellow" onclick="switchTab('register')">Mula Mendaftar Subjek Sekarang</button>
      </div>
    `;
    return;
  }

  let html = `
    <div class="my-subjects-top-bar">
      <div>
        <h3 class="text-gold">Senarai Pendaftaran: ${appState.currentTeacher.name}</h3>
        <p class="text-sm opacity-80">Jumlah Keseluruhan: <strong>${totalHours} Waktu</strong> (${teacherRegs.length} kelas)</p>
      </div>
      <div class="action-buttons-group">
        <button class="btn-action-slip" onclick="pdfGen.generateIndividualSlipPDF(${appState.currentTeacher.id}, appState.registrations)">
          📄 Muat Turun Slip (PDF)
        </button>
        <button class="btn-action-wa" onclick="shareViaWhatsApp()">
          💬 Hantar WhatsApp ke Penyelaras
        </button>
      </div>
    </div>

    <div class="registered-cards-grid">
  `;

  teacherRegs.forEach(r => {
    html += `
      <div class="registered-subject-card">
        <div class="reg-card-header">
          <span class="reg-dept-badge ${getDeptBadgeClass(r.deptId)}">${r.deptName}</span>
          <span class="reg-hours-badge">${r.hours} Waktu</span>
        </div>
        <h4 class="reg-subject-title">${r.subjectName}</h4>
        <div class="reg-class-pill">🏫 Kelas: <strong>${r.className}</strong></div>
        <div class="reg-details-row">
          <span>⏱️ Kombinasi: <strong>${r.combination || '-'}</strong></span>
          <span>🕒 Masa: <small>${r.formattedTime || r.timestamp}</small></span>
        </div>
        <div class="reg-actions-row">
          <button class="btn-delete-reg" onclick="deleteMySubject('${r.id}')" title="Batalkan Pendaftaran">
            🗑️ Batal Pendaftaran
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

/**
 * Batalkan Subjek Yang Didaftarkan Sendiri
 */
async function deleteMySubject(regId) {
  if (confirm("Adakah anda pasti ingin membatalkan pendaftaran subjek ini? Slot ini akan dibuka semula untuk guru lain.")) {
    const res = await syncManager.deleteRegistration(regId, appState.currentTeacher.id);
    if (res.success) {
      showToast("Pendaftaran berjaya dibatalkan.");
    } else {
      alert(res.message);
    }
  }
}

/**
 * Fungsi Kongsi Ringkasan Melalui WhatsApp
 */
function shareViaWhatsApp() {
  if (!appState.currentTeacher) return;
  const teacherRegs = appState.registrations.filter(r => r.teacherId === appState.currentTeacher.id);
  const totalHours = teacherRegs.reduce((sum, r) => sum + Number(r.hours || 0), 0);

  let text = `*PENDAFTARAN SUBJEK PDP SMK TENGHILAN 2026*\n`;
  text += `Nama Guru: *${appState.currentTeacher.name}* (ID: T${String(appState.currentTeacher.id).padStart(3, '0')})\n`;
  text += `Jumlah Waktu: *${totalHours} Waktu Seminggu*\n\n`;
  text += `*Senarai Subjek & Kelas:*\n`;

  teacherRegs.forEach((r, idx) => {
    text += `${idx + 1}. ${r.subjectName} (${r.subjectCode}) - Kelas ${r.className} [${r.hours} Waktu: ${r.combination || ''}]\n`;
  });

  text += `\n_Dihantar melalui Sistem e-Agihan SMKTego_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

/**
 * Paparan Papan Pemuka Penyelaras & GKMP (Dashboard)
 */
function renderDashboardTable() {
  const container = document.getElementById("dashboardTableBody");
  if (!container) return;

  // Kira KPI
  const totalTeachersWithReg = new Set(appState.registrations.map(r => r.teacherId)).size;
  const totalPeriods = appState.registrations.reduce((s, r) => s + Number(r.hours || 0), 0);
  const totalSlots = appState.registrations.length;

  document.getElementById("kpiTotalTeachers").textContent = `${totalTeachersWithReg} / ${TEACHERS_LIST.length}`;
  document.getElementById("kpiTotalSlots").textContent = totalSlots;
  document.getElementById("kpiTotalPeriods").textContent = totalPeriods;
  const avg = totalTeachersWithReg > 0 ? (totalPeriods / totalTeachersWithReg).toFixed(1) : 0;
  document.getElementById("kpiAvgPeriods").textContent = `${avg} Waktu`;

  // Saring mengikut carian nama / subjek / kelas
  let filtered = appState.registrations;

  if (appState.activeDeptFilter !== "ALL") {
    filtered = filtered.filter(r => r.deptId === appState.activeDeptFilter);
  }

  if (appState.searchQuery) {
    filtered = filtered.filter(r => 
      r.teacherName.toLowerCase().includes(appState.searchQuery) ||
      r.subjectName.toLowerCase().includes(appState.searchQuery) ||
      r.className.toLowerCase().includes(appState.searchQuery)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-6 text-slate-300">Tiada rekod pendaftaran ditemui.</td>
      </tr>
    `;
    return;
  }

  let html = "";
  filtered.forEach((r, idx) => {
    html += `
      <tr class="dashboard-table-row">
        <td class="text-center">${idx + 1}</td>
        <td class="font-bold text-yellow-300">${r.teacherName}</td>
        <td><span class="dept-chip ${getDeptBadgeClass(r.deptId)}">${r.deptName}</span></td>
        <td class="font-medium">${r.subjectName}</td>
        <td class="text-center font-bold text-cyan-300">${r.className}</td>
        <td class="text-center font-bold">${r.hours}W</td>
        <td class="text-center text-sm">${r.combination || '-'}</td>
        <td class="text-center">
          <button class="btn-row-action-delete" onclick="adminDeleteRegistration('${r.id}')" title="Padam sebagai Admin">
            🗑️
          </button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

/**
 * Matriks Agihan 30 Kelas (Grid View)
 */
function renderMatrixView() {
  const container = document.getElementById("matrixViewContainer");
  if (!container) return;

  let html = `<div class="matrix-grid-scroll"><table class="matrix-table"><thead><tr><th>Tingkatan</th><th>Kelas</th><th>Subjek & Guru Didaftar</th><th>Jumlah Waktu</th></tr></thead><tbody>`;

  [1, 2, 3, 4, 5].forEach(form => {
    const formClasses = CLASSES_LIST.filter(c => c.form === form);
    formClasses.forEach((cls, cIdx) => {
      const classRegs = appState.registrations.filter(r => r.classId === cls.id);
      const totalW = classRegs.reduce((sum, r) => sum + Number(r.hours || 0), 0);

      html += `<tr>`;
      if (cIdx === 0) {
        html += `<td rowspan="${formClasses.length}" class="form-cell">Tingkatan ${form}</td>`;
      }
      html += `<td class="class-cell"><strong>${cls.name}</strong></td>`;
      html += `<td class="subjects-cell">`;

      if (classRegs.length === 0) {
        html += `<span class="unfilled-tag">Belum Ada Subjek Didaftarkan</span>`;
      } else {
        html += `<div class="class-subject-chips">`;
        classRegs.forEach(cr => {
          html += `
            <div class="chip-item">
              <span class="chip-sub">${cr.subjectCode}</span>
              <span class="chip-teach">${cr.teacherName.split(' ')[0]}</span>
              <span class="chip-hours">${cr.hours}W (${cr.combination || ''})</span>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</td>`;
      html += `<td class="text-center font-bold text-yellow-300">${totalW}W</td>`;
      html += `</tr>`;
    });
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

/**
 * Padam sebagai Penyelaras / Admin
 */
async function adminDeleteRegistration(id) {
  if (confirm("PENGESAHAN PENYELARAS: Adakah anda pasti ingin memadam pendaftaran ini secara paksa?")) {
    await syncManager.deleteRegistration(id, null, true);
    showToast("Pendaftaran telah dipadam oleh Penyelaras.");
  }
}

/**
 * Modal Kunci Khas GKMP / Penyelaras (Override)
 */
function openOverrideModal() {
  const modal = document.getElementById("overrideModal");
  if (modal) {
    document.getElementById("overrideSubjekName").textContent = appState.selectedSubject ? appState.selectedSubject.name : "-";
    document.getElementById("overrideKelasName").textContent = appState.selectedClass ? appState.selectedClass.name : "-";
    modal.style.display = "flex";
  }
}

function closeOverrideModal() {
  const modal = document.getElementById("overrideModal");
  if (modal) modal.style.display = "none";
}

async function confirmOverride() {
  const pinInput = document.getElementById("overridePinInput");
  const reasonInput = document.getElementById("overrideReasonInput");

  // Kata laluan rasmi Penyelaras & GKMP dimuatkan dari pembolehubah persekitaran (ADMIN_PIN)
  const envPin = (window.__APP_CONFIG__ && window.__APP_CONFIG__.ADMIN_PIN)
    ? String(window.__APP_CONFIG__.ADMIN_PIN)
    : "2026";

  if (pinInput.value !== envPin) {
    alert("KOD KELULUSAN GKMP TIDAK SAH. Sila dapatkan kod dari Penyelaras Jadual Waktu atau GKMP.");
    return;
  }

  if (!reasonInput.value.trim()) {
    alert("Sila nyatakan justifikasi kelulusan pertukaran.");
    return;
  }

  const hours = Number(document.getElementById("hoursSelect").value);
  const combo = appState.selectedCombo || document.getElementById("comboSelect").value;

  const newRecord = {
    teacherId: appState.currentTeacher.id,
    teacherName: appState.currentTeacher.name,
    deptId: appState.selectedDept.id,
    deptName: appState.selectedDept.name,
    subjectCode: appState.selectedSubject.code,
    subjectName: appState.selectedSubject.name,
    classId: appState.selectedClass.id,
    className: appState.selectedClass.name,
    hours: hours,
    combination: combo,
    isOverride: true,
    overrideNotes: reasonInput.value.trim(),
    formattedTime: new Date().toLocaleString("ms-MY")
  };

  await syncManager.registerSubject(newRecord);
  closeOverrideModal();
  showToast("Kelulusan GKMP diterima! Subjek berjaya didaftarkan.");
  checkLiveConflict();
}

/**
 * Tukar Tab Paparan
 */
function switchTab(tabId) {
  appState.activeTab = tabId;
  document.querySelectorAll(".nav-tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `tab-${tabId}`);
  });

  if (tabId === "dashboard") {
    renderDashboardTable();
    renderMatrixView();
  } else if (tabId === "my-subjects") {
    renderMyRegisteredList();
  } else if (tabId === "subjects") {
    renderSubjectsManager();
  }
}

/**
 * Kemaskini Semua Paparan
 */
function renderAllViews() {
  renderTeacherWorkloadBadge();
  renderMyRegisteredList();
  renderDashboardTable();
  renderMatrixView();
  renderSubjectsManager();
  checkLiveConflict();
}

/**
 * =========================================================
 * MODUL PENGURUSAN SUBJEK & BIDANG (TAMBAH & EDIT SUBJEK)
 * =========================================================
 */

/**
 * Paparkan Grid Kad Pengurusan Subjek
 */
function renderSubjectsManager() {
  const container = document.getElementById("subjectsManagerGrid");
  if (!container) return;

  const searchInput = document.getElementById("subjectSearchInput");
  const deptFilter = document.getElementById("subjectDeptFilterSelect");
  
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const filterDept = deptFilter ? deptFilter.value : "ALL";

  let list = ALL_SUBJECTS;

  if (filterDept !== "ALL") {
    list = list.filter(s => s.deptId === filterDept);
  }

  if (query) {
    list = list.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      s.deptShort.toLowerCase().includes(query)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="glass-empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>Tiada Subjek Ditemui</h3>
        <p>Tiada mata pelajaran yang sepadan dengan carian anda.</p>
        <button class="btn-primary-yellow" onclick="openAddSubjectModal()">➕ Tambah Subjek Sekarang</button>
      </div>
    `;
    return;
  }

  let html = "";
  list.forEach(sub => {
    // Kira bilangan kelas yang mendaftar subjek ini
    const usageCount = appState.registrations.filter(r => r.subjectCode === sub.code).length;
    const levelsHtml = (sub.levels || [1,2,3,4,5]).map(lvl => `<span class="level-tag">T${lvl}</span>`).join(" ");

    html += `
      <div class="subject-manage-card">
        <div>
          <div class="sub-card-top">
            <span class="reg-dept-badge ${getDeptBadgeClass(sub.deptId)}">${sub.deptShort}</span>
            <span class="sub-code-badge">${sub.code}</span>
          </div>
          <h3 class="sub-card-name" style="margin-top: 10px;">${sub.name}</h3>
        </div>

        <div class="sub-card-meta">
          <div style="display: flex; justify-content: space-between;">
            <span>⏱️ Jam Kredit: <strong>${sub.defaultHours} Waktu</strong></span>
            <span>🧩 Kombinasi: <strong>${sub.defaultCombo || '-'}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span>Tingkatan:</span>
            <div class="sub-levels-pills">${levelsHtml}</div>
          </div>
          <div style="margin-top: 4px; font-size: 0.75rem; color: #93c5fd;">
            🏫 Didaftarkan di: <strong>${usageCount} Kelas</strong>
          </div>
        </div>

        <div class="sub-card-actions">
          <button type="button" class="btn-card-edit" onclick="openEditSubjectModal('${sub.code}')" title="Edit Maklumat Subjek">
            ✏️ Edit Subjek
          </button>
          <button type="button" class="btn-card-delete" onclick="handleDeleteSubject('${sub.code}')" title="Padam Subjek">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Buka Modal Tambah Subjek Baharu
 */
function openAddSubjectModal(preselectedDeptId = null) {
  const modal = document.getElementById("subjectModal");
  if (!modal) return;

  document.getElementById("subjectModalTitle").textContent = "➕ Tambah Mata Pelajaran Baharu";
  document.getElementById("subModalMode").value = "add";
  document.getElementById("subModalOldCode").value = "";

  document.getElementById("subModalName").value = "";
  document.getElementById("subModalCode").value = "";
  
  // Tetapkan pilihan bidang jika ada
  const deptSelect = document.getElementById("subModalDept");
  if (preselectedDeptId) {
    deptSelect.value = preselectedDeptId;
  } else if (appState.selectedDept) {
    deptSelect.value = appState.selectedDept.id;
  } else {
    deptSelect.selectedIndex = 0;
  }

  document.getElementById("subModalHours").value = "4";
  document.getElementById("subModalCombo").value = "2+2";

  // Tandakan semua tingkatan secara default
  document.querySelectorAll("input[name='subModalLevels']").forEach(cb => cb.checked = true);

  modal.style.display = "flex";
  setTimeout(() => document.getElementById("subModalName").focus(), 100);
}

/**
 * Buka Modal Edit Subjek Berdasarkan Kod
 */
function openEditSubjectModal(code) {
  const modal = document.getElementById("subjectModal");
  if (!modal) return;

  const sub = ALL_SUBJECTS.find(s => s.code === code);
  if (!sub) {
    alert("Subjek tidak dijumpai.");
    return;
  }

  document.getElementById("subjectModalTitle").textContent = `✏️ Edit Mata Pelajaran: ${sub.name}`;
  document.getElementById("subModalMode").value = "edit";
  document.getElementById("subModalOldCode").value = sub.code;

  document.getElementById("subModalName").value = sub.name;
  document.getElementById("subModalCode").value = sub.code;
  document.getElementById("subModalDept").value = sub.deptId;
  document.getElementById("subModalHours").value = sub.defaultHours || 4;
  document.getElementById("subModalCombo").value = sub.defaultCombo || "2+2";

  // Tandakan tingkatan yang terlibat
  const subLevels = sub.levels || [1, 2, 3, 4, 5];
  document.querySelectorAll("input[name='subModalLevels']").forEach(cb => {
    cb.checked = subLevels.includes(Number(cb.value));
  });

  modal.style.display = "flex";
  setTimeout(() => document.getElementById("subModalName").focus(), 100);
}

/**
 * Buka Modal Edit bagi Subjek yang sedang dipilih di Dropdown Tab 1
 */
function openEditSelectedSubjectModal() {
  if (appState.selectedSubject) {
    openEditSubjectModal(appState.selectedSubject.code);
  }
}

/**
 * Tutup Modal Subjek
 */
function closeSubjectModal() {
  const modal = document.getElementById("subjectModal");
  if (modal) modal.style.display = "none";
}

/**
 * Cadangan Automatik Kombinasi Masa dalam Modal
 */
function updateSubModalComboSuggestions(hours) {
  const comboInput = document.getElementById("subModalCombo");
  const h = Number(hours);
  const defaults = {
    1: "1",
    2: "2",
    3: "2+1",
    4: "2+2",
    5: "3+2",
    6: "3+3"
  };
  if (comboInput && defaults[h]) {
    comboInput.value = defaults[h];
  }
}

/**
 * Simpan Data Modal (Tambah atau Edit Subjek)
 */
function handleSaveSubjectModal(e) {
  e.preventDefault();

  const mode = document.getElementById("subModalMode").value;
  const oldCode = document.getElementById("subModalOldCode").value;
  const name = document.getElementById("subModalName").value.trim();
  const code = document.getElementById("subModalCode").value.trim().toUpperCase();
  const deptId = document.getElementById("subModalDept").value;
  const hours = Number(document.getElementById("subModalHours").value);
  const combo = document.getElementById("subModalCombo").value.trim();

  const levels = [];
  document.querySelectorAll("input[name='subModalLevels']:checked").forEach(cb => {
    levels.push(Number(cb.value));
  });

  if (!name || !code) {
    alert("Sila lengkapkan nama dan kod subjek.");
    return;
  }

  try {
    if (mode === "add") {
      const added = addCustomSubject({
        code,
        name,
        deptId,
        defaultHours: hours,
        defaultCombo: combo,
        levels: levels.length ? levels : [1, 2, 3, 4, 5]
      });
      showToast(`Subjek "${added.name}" (${added.code}) berjaya ditambah!`);
    } else {
      const updated = updateCustomSubject(oldCode, {
        code,
        name,
        deptId,
        defaultHours: hours,
        defaultCombo: combo,
        levels: levels.length ? levels : [1, 2, 3, 4, 5]
      });

      // Jika subjek yang diedit sedang dipilih dalam form pendaftaran, kemaskini appState
      if (appState.selectedSubject && appState.selectedSubject.code === oldCode) {
        appState.selectedSubject = ALL_SUBJECTS.find(s => s.code === updated.code) || null;
      }
      showToast(`Subjek "${updated.name}" berjaya dikemaskini!`);
    }

    closeSubjectModal();

    // Kemaskini dropdown bidang dan subjek
    const currentDeptId = document.getElementById("deptSelect").value;
    if (currentDeptId) {
      appState.selectedDept = DEPARTMENTS.find(d => d.id === currentDeptId) || null;
      populateSubjectDropdown();
    }

    renderAllViews();

  } catch (err) {
    alert(err.message || "Ralat menyimpan subjek.");
  }
}

/**
 * Padam Subjek
 */
function handleDeleteSubject(code) {
  const sub = ALL_SUBJECTS.find(s => s.code === code);
  if (!sub) return;

  const usageCount = appState.registrations.filter(r => r.subjectCode === code).length;
  let confirmMsg = `Adakah anda pasti ingin memadam subjek "${sub.name}" (${sub.code})?`;
  if (usageCount > 0) {
    confirmMsg += `\n\nPERHATIAN: Terdapat ${usageCount} rekod pendaftaran guru yang sedang menggunakan subjek ini. Rekod pendaftaran tidak akan terpadam, tetapi subjek tidak lagi tersenarai untuk pendaftaran baharu.`;
  }

  if (confirm(confirmMsg)) {
    deleteCustomSubject(code);
    populateSubjectDropdown();
    renderAllViews();
    showToast(`Subjek "${sub.name}" telah dipadam.`);
  }
}

/**
 * Pulihkan Senarai Subjek Piawai SMK Tenghilan
 */
function handleResetDefaultSubjects() {
  if (confirm("Adakah anda pasti ingin menetapkan semula senarai subjek kepada 22 subjek piawai SMK Tenghilan? Subjek tambahan akan dipadam.")) {
    resetDepartmentsToDefault();
    populateSubjectDropdown();
    renderAllViews();
    showToast("Senarai subjek piawai SMK Tenghilan telah dipulihkan.");
  }
}

/**
 * Helper Gaya Badge Bidang
 */
function getDeptBadgeClass(deptId) {
  switch (deptId) {
    case "SAINS_MATEMATIK": return "badge-sains";
    case "KEMANUSIAAN": return "badge-kemanusiaan";
    case "TVET": return "badge-tvet";
    case "BAHASA": return "badge-bahasa";
    default: return "badge-default";
  }
}

/**
 * Helper Toast Notifikasi
 */
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3500);
}

/**
 * =========================================================
 * MODUL PENGURUSAN GURU BAHARU (TAMBAH GURU BARU)
 * =========================================================
 */

/**
 * Buka Modal Tambah Guru Baharu
 */
function openAddTeacherModal() {
  const modal = document.getElementById("teacherModal");
  if (!modal) return;

  const maxId = TEACHERS_LIST.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
  const nextId = maxId + 1;

  document.getElementById("newTeacherName").value = "";
  document.getElementById("newTeacherIdPreview").value = "T" + String(nextId).padStart(3, '0');
  document.getElementById("newTeacherRole").selectedIndex = 0;

  modal.style.display = "flex";
  setTimeout(() => document.getElementById("newTeacherName").focus(), 100);
}

/**
 * Tutup Modal Tambah Guru
 */
function closeTeacherModal() {
  const modal = document.getElementById("teacherModal");
  if (modal) modal.style.display = "none";
}

/**
 * Simpan Guru Baharu
 */
function handleSaveTeacherModal(e) {
  e.preventDefault();

  const nameInput = document.getElementById("newTeacherName");
  const roleSelect = document.getElementById("newTeacherRole");

  const name = nameInput.value.trim().toUpperCase();
  const role = roleSelect.value;

  if (!name) {
    alert("Sila masukkan nama penuh guru.");
    return;
  }

  try {
    const newTeacher = addTeacher({ name, role });
    
    // Set guru baharu sebagai guru aktif
    appState.currentTeacher = newTeacher;
    localStorage.setItem(SYNC_KEYS.CURRENT_TEACHER, newTeacher.id);

    // Kemaskini dropdown
    populateTeacherDropdown(newTeacher.id);

    // Kemaskini paparan
    renderAllViews();
    closeTeacherModal();

    showToast(`Cikgu ${newTeacher.name} (T${String(newTeacher.id).padStart(3, '0')}) berjaya didaftarkan!`);
  } catch (err) {
    alert(err.message || "Ralat semasa menyimpan guru.");
  }
}

function showModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "flex";
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "none";
}


