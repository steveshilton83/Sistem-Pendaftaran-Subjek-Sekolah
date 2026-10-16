/**
 * PENJANA LAPORAN PDF RASMI SMK TENGHILAN (e-Agihan SMKTego)
 * Menjana dokumen rasmi A4 berkualiti tinggi dengan logo sekolah,
 * jadual teratur, statistik beban waktu, dan ruangan tandatangan rasmi.
 */

class PDFGenerator {
  constructor() {
    this.schoolName = "SEKOLAH MENENGAH KEBANGSAAN TENGHILAN";
    this.schoolAddress = "Peti Surat 92, 89257 Tenghilan, Tuaran, Sabah";
    this.schoolCode = "XEA4401 | Kod Sekolah";
    this.sessionYear = "SESI PERSEKOLAHAN 2026 / 2027";
  }

  getLogo() {
    return typeof SCHOOL_LOGO_BASE64 !== "undefined" ? SCHOOL_LOGO_BASE64 : null;
  }

  /**
   * 1. RUMUSAN PENUH AGIHAN GURU (A4 LANDSCAPE / PORTRAIT)
   */
  generateFullSummaryPDF(registrations) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("Pustaka PDF sedang dimuatkan, sila cuba sebentar lagi.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const logo = this.getLogo();
    if (logo) {
      try {
        doc.addImage(logo, "PNG", 14, 8, 18, 22);
      } catch (e) {
        console.warn("Logo add error:", e);
      }
    }

    // Header Rasmi
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(11, 47, 100); // Royal Blue
    doc.text(this.schoolName, 36, 14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(this.schoolAddress + " • " + this.schoolCode, 36, 19);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(180, 130, 0); // Gold/Yellow
    doc.text(`RUMUSAN KESELURUHAN AGIHAN TUGAS MENGAJAR PDP (${this.sessionYear})`, 36, 25);

    doc.setDrawColor(200, 160, 20);
    doc.setLineWidth(0.6);
    doc.line(14, 32, 283, 32);

    // Kumpul data mengikut guru
    const teacherMap = new Map();
    TEACHERS_LIST.forEach(t => {
      teacherMap.set(t.id, {
        id: t.id,
        name: t.name,
        subjects: [],
        totalHours: 0
      });
    });

    registrations.forEach(r => {
      const t = teacherMap.get(r.teacherId) || {
        id: r.teacherId,
        name: r.teacherName,
        subjects: [],
        totalHours: 0
      };
      t.subjects.push(r);
      t.totalHours += Number(r.hours || 0);
      teacherMap.set(r.teacherId, t);
    });

    // Susun mengikut abjad nama guru
    const sortedTeachers = Array.from(teacherMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    const tableRows = [];
    let bil = 1;

    sortedTeachers.forEach(t => {
      if (t.subjects.length === 0) {
        tableRows.push([
          bil++,
          t.name,
          "- Belum Mendaftar -",
          "-",
          "0",
          "-",
          "0 Waktu"
        ]);
      } else {
        const subjekText = t.subjects.map(s => s.subjectName).join("\n");
        const kelasText = t.subjects.map(s => s.className).join("\n");
        const waktuText = t.subjects.map(s => `${s.hours}W`).join("\n");
        const comboText = t.subjects.map(s => s.combination || "-").join("\n");

        tableRows.push([
          bil++,
          t.name,
          subjekText,
          kelasText,
          waktuText,
          comboText,
          `${t.totalHours} Waktu`
        ]);
      }
    });

    doc.autoTable({
      startY: 35,
      head: [["Bil", "Nama Guru", "Mata Pelajaran", "Kelas", "Jam Kredit", "Kombinasi", "Jumlah Waktu"]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle"
      },
      headStyles: {
        fillColor: [11, 47, 100], // Royal Blue
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center"
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 62, fontStyle: "bold" },
        2: { cellWidth: 60 },
        3: { cellWidth: 40, halign: "center" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 35, halign: "center" },
        6: { cellWidth: 25, halign: "center", fontStyle: "bold" }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 254]
      },
      didDrawPage: function (data) {
        // Footer nombor muka surat
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(
          `Muka Surat ${doc.internal.getCurrentPageInfo().pageNumber} daripada ${pageCount} | e-Agihan SMKTego (Dijana pada: ${new Date().toLocaleString("ms-MY")})`,
          14,
          202
        );
      }
    });

    // Ruangan Tandatangan di akhir dokumen
    let finalY = doc.lastAutoTable.finalY + 10;
    if (finalY > 165) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(8);
    doc.setTextColor(50);

    const boxWidth = 60;
    const boxHeight = 22;

    // Kotak 1: Penyelaras
    doc.setDrawColor(180);
    doc.rect(14, finalY, boxWidth, boxHeight);
    doc.text("Disediakan Oleh:", 16, finalY + 4);
    doc.setFont("helvetica", "bold");
    doc.text("STEVE SHILTON ATING", 16, finalY + 16);
    doc.setFont("helvetica", "normal");
    doc.text("Penyelaras Jadual Waktu", 16, finalY + 20);

    // Kotak 2: PK Pentadbiran
    doc.rect(84, finalY, boxWidth, boxHeight);
    doc.text("Disemak Oleh:", 86, finalY + 4);
    doc.setFont("helvetica", "bold");
    doc.text("AINI BINTI SIDEK", 86, finalY + 16);
    doc.setFont("helvetica", "normal");
    doc.text("Penolong Kanan Pentadbiran", 86, finalY + 20);

    // Kotak 3: Pengetua
    doc.rect(154, finalY, boxWidth, boxHeight);
    doc.text("Disahkan Oleh:", 156, finalY + 4);
    doc.setFont("helvetica", "bold");
    doc.text("RICHARD BIN DAVID", 156, finalY + 16);
    doc.setFont("helvetica", "normal");
    doc.text("Pengetua SMK Tenghilan", 156, finalY + 20);

    doc.save(`Rumusan_Agihan_Subjek_SMKTego_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  /**
   * 2. MATRIKS AGIHAN 30 KELAS (A4 LANDSCAPE)
   */
  generateClassMatrixPDF(registrations) {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const logo = this.getLogo();
    if (logo) {
      try { doc.addImage(logo, "PNG", 14, 8, 16, 20); } catch (e) {}
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(11, 47, 100);
    doc.text(this.schoolName, 34, 13);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("MATRIKS AGIHAN SUBJEK MENGIKUT KELAS (TINGKATAN 1 HINGGA 5)", 34, 18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 130, 0);
    doc.text(this.sessionYear, 34, 23);

    doc.setDrawColor(200, 160, 20);
    doc.line(14, 27, 283, 27);

    // Buat senarai bagi setiap kelas
    const classRows = [];
    CLASSES_LIST.forEach((cls, idx) => {
      const classRegs = registrations.filter(r => r.classId === cls.id);
      if (classRegs.length === 0) {
        classRows.push([
          idx + 1,
          cls.name,
          "Tingkatan " + cls.form,
          "- Tiada Subjek Didaftar -",
          "-",
          "0 Waktu"
        ]);
      } else {
        const subjekText = classRegs.map(r => `${r.subjectName} (${r.subjectCode})`).join("\n");
        const guruText = classRegs.map(r => `${r.teacherName} [${r.hours}W - ${r.combination || ''}]`).join("\n");
        const totalWaktu = classRegs.reduce((sum, r) => sum + Number(r.hours || 0), 0);

        classRows.push([
          idx + 1,
          cls.name,
          "Tingkatan " + cls.form,
          subjekText,
          guruText,
          `${totalWaktu} Waktu`
        ]);
      }
    });

    doc.autoTable({
      startY: 30,
      head: [["Bil", "Nama Kelas", "Tingkatan", "Subjek Didaftar", "Guru Mengajar & Jam Kredit", "Jumlah Waktu"]],
      body: classRows,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, valign: "middle" },
      headStyles: { fillColor: [11, 47, 100], textColor: [255, 255, 255], halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "center", fontStyle: "bold", cellWidth: 24 },
        2: { halign: "center", cellWidth: 24 },
        3: { cellWidth: 90 },
        4: { cellWidth: 100 },
        5: { halign: "center", fontStyle: "bold", cellWidth: 22 }
      },
      alternateRowStyles: { fillColor: [248, 250, 254] },
      didDrawPage: function () {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Muka Surat ${doc.internal.getCurrentPageInfo().pageNumber} daripada ${pageCount} | Matriks Agihan Kelas SMKTego`, 14, 202);
      }
    });

    doc.save(`Matriks_Agihan_Kelas_SMKTego_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  /**
   * 3. RUMUSAN MENGIKUT 4 BIDANG (UNTUK 4 GKMP)
   */
  generateDepartmentSummaryPDF(registrations, deptId = "ALL") {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const departmentsToPrint = deptId === "ALL" ? DEPARTMENTS : DEPARTMENTS.filter(d => d.id === deptId);

    departmentsToPrint.forEach((dept, deptIdx) => {
      if (deptIdx > 0) doc.addPage();

      const logo = this.getLogo();
      if (logo) {
        try { doc.addImage(logo, "PNG", 14, 8, 16, 20); } catch (e) {}
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(11, 47, 100);
      doc.text(this.schoolName, 34, 13);
      doc.setFontSize(10);
      doc.setTextColor(180, 130, 0);
      doc.text(`LAPORAN AGIHAN TUGAS MENGAJAR: ${dept.name}`, 34, 18);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(`${this.schoolAddress} • ${this.sessionYear}`, 34, 23);

      doc.setDrawColor(200, 160, 20);
      doc.line(14, 27, 196, 27);

      // Cari pendaftaran di bawah bidang ini
      const deptRegs = registrations.filter(r => r.deptId === dept.id);

      const rows = [];
      let b = 1;
      dept.subjects.forEach(sub => {
        const subRegs = deptRegs.filter(r => r.subjectCode === sub.code);
        if (subRegs.length === 0) {
          rows.push([b++, sub.name, "-", "-", `${sub.defaultHours}W`, sub.defaultCombo, "Belum Ada Guru"]);
        } else {
          subRegs.forEach(sr => {
            rows.push([
              b++,
              sub.name,
              sr.className,
              sr.teacherName,
              `${sr.hours} Waktu`,
              sr.combination || "-",
              "Disahkan"
            ]);
          });
        }
      });

      doc.autoTable({
        startY: 31,
        head: [["Bil", "Mata Pelajaran", "Kelas", "Guru Mengajar", "Waktu", "Kombinasi", "Status"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, valign: "middle" },
        headStyles: { fillColor: [11, 47, 100], textColor: [255, 255, 255], halign: "center" },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { cellWidth: 42, fontStyle: "bold" },
          2: { halign: "center", cellWidth: 20 },
          3: { cellWidth: 55 },
          4: { halign: "center", cellWidth: 18 },
          5: { halign: "center", cellWidth: 22 },
          6: { halign: "center", cellWidth: 18 }
        },
        alternateRowStyles: { fillColor: [248, 250, 254] }
      });

      // Kotak Pengesahan GKMP
      let finalY = doc.lastAutoTable.finalY + 12;
      if (finalY > 240) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(8);
      doc.setTextColor(50);
      doc.rect(14, finalY, 80, 22);
      doc.text("Disemak dan Disahkan oleh:", 16, finalY + 4);
      doc.setFont("helvetica", "bold");
      doc.text(`Guru Kanan Mata Pelajaran (${dept.shortName})`, 16, finalY + 16);
      doc.setFont("helvetica", "normal");
      doc.text("SMK Tenghilan, Tuaran", 16, finalY + 20);

      doc.rect(116, finalY, 80, 22);
      doc.text("Disahkan oleh:", 118, finalY + 4);
      doc.setFont("helvetica", "bold");
      doc.text("STEVE SHILTON ATING", 118, finalY + 16);
      doc.setFont("helvetica", "normal");
      doc.text("Penyelaras Jadual Waktu", 118, finalY + 20);
    });

    doc.save(`Laporan_Bidang_SMKTego_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  /**
   * 4. SLIP PENDAFTARAN GURU INDIVIDU
   */
  generateIndividualSlipPDF(teacherId, registrations) {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const teacher = TEACHERS_LIST.find(t => t.id === Number(teacherId));
    if (!teacher) {
      alert("Sila pilih guru terlebih dahulu.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const logo = this.getLogo();
    if (logo) {
      try { doc.addImage(logo, "PNG", 14, 10, 18, 22); } catch (e) {}
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(11, 47, 100);
    doc.text(this.schoolName, 36, 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(this.schoolAddress + " • " + this.schoolCode, 36, 21);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 130, 0);
    doc.text("SLIP PENGESAHAN PENDAFTARAN SUBJEK PDP GURU", 36, 27);
    doc.text(this.sessionYear, 36, 32);

    doc.setDrawColor(200, 160, 20);
    doc.setLineWidth(0.6);
    doc.line(14, 36, 196, 36);

    // Maklumat Guru Card
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(14, 40, 182, 22, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(11, 47, 100);
    doc.setFont("helvetica", "bold");
    doc.text("NAMA GURU:", 18, 48);
    doc.setFontSize(11);
    doc.text(teacher.name, 45, 48);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    doc.text(`ID Guru: T${String(teacher.id).padStart(3, '0')}`, 18, 56);
    doc.text(`Tarikh Slip Dijana: ${new Date().toLocaleString("ms-MY")}`, 90, 56);

    // Senarai Subjek
    const teacherRegs = registrations.filter(r => r.teacherId === teacher.id);
    const rows = [];
    let totalWaktu = 0;

    teacherRegs.forEach((r, idx) => {
      totalWaktu += Number(r.hours || 0);
      rows.push([
        idx + 1,
        r.subjectName,
        r.className,
        `${r.hours} Waktu`,
        r.combination || "-",
        r.formattedTime || "-"
      ]);
    });

    if (rows.length === 0) {
      rows.push(["-", "Tiada pendaftaran subjek ditemui", "-", "0 Waktu", "-", "-"]);
    }

    doc.autoTable({
      startY: 66,
      head: [["Bil", "Mata Pelajaran", "Kelas", "Jam Kredit", "Kombinasi Masa", "Masa Pendaftaran"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3, valign: "middle" },
      headStyles: { fillColor: [11, 47, 100], textColor: [255, 255, 255], halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { fontStyle: "bold", cellWidth: 60 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "center", cellWidth: 25 },
        5: { halign: "center", cellWidth: 35 }
      },
      foot: [["", "JUMLAH KESELURUHAN WAKTU MENGAJAR:", "", `${totalWaktu} Waktu`, "", ""]],
      footStyles: { fillColor: [240, 244, 255], textColor: [11, 47, 100], fontStyle: "bold" }
    });

    // Tandatangan
    const finalY = doc.lastAutoTable.finalY + 16;
    doc.rect(14, finalY, 80, 25);
    doc.text("Tandatangan Guru:", 18, finalY + 5);
    doc.setFont("helvetica", "bold");
    doc.text(teacher.name, 18, finalY + 19);
    doc.setFont("helvetica", "normal");
    doc.text("Tarikh: ...................................", 18, finalY + 23);

    doc.rect(116, finalY, 80, 25);
    doc.text("Pengesahan Penyelaras Jadual Waktu:", 120, finalY + 5);
    doc.setFont("helvetica", "bold");
    doc.text("STEVE SHILTON ATING", 120, finalY + 19);
    doc.setFont("helvetica", "normal");
    doc.text("Penyelaras Jadual Waktu SMKTego", 120, finalY + 23);

    doc.save(`Slip_Pendaftaran_${teacher.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  }
}

const pdfGen = new PDFGenerator();
