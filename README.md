# 🏛️ e-Agihan SMKTego 2026
### Sistem Pendaftaran & Pengutipan Agihan Subjek PdP Guru (Pra-Jadual Waktu)
**Sekolah Menengah Kebangsaan Tenghilan, Tuaran, Sabah**  
*Penyelaras Jadual Waktu: Steve Shilton Ating (Sidang Pagi 2026/2027)*

---

## 🌟 Pengenalan Sistem

**e-Agihan SMKTego** dibangunkan khusus untuk Guru Penyelaras Jadual Waktu SMK Tenghilan bagi mengutip data agihan mata pelajaran yang akan diajar oleh semua 92 orang guru mengikut bidang masing-masing secara berpusat dan teratur sebelum dipindahkan ke dalam perisian jadual waktu rasmi (**aSc Timetables** atau **e-Jadual SMKTego**).

Sistem ini direka khas dengan tema **Royal Blue dan Kuning Emas** berserta kesan visual **Glassmorphism (Frosted Glass)** yang moden, kemas, dan boleh dipasang terus ke dalam telefon pintar para guru sebagai **Progressive Web App (PWA)**.

---

## 🚀 Ciri-Ciri Utama Sistem

### 1. 📱 PWA & Pemasangan Terus ke Telefon Bimbit Guru
* **Android (Google Chrome)**: Tekan menu 3 titik `(⋮)` dan pilih **"Install app"** / **"Add to Home screen"**.
* **iPhone / iOS (Safari)**: Tekan ikon **Kongsi (Share ⎋)** di bahagian bawah dan pilih **"Add to Home Screen" (+)**.
* Berfungsi pantas seperti aplikasi telefon asli tanpa perlu menaip URL berulang kali.

### 2. 🛡️ Kawalan Pertindihan Pintar (First-Come, First-Served Rule)
* Sekiranya terdapat guru lain yang cuba mendaftar subjek dan kelas yang telah didaftarkan lebih awal oleh guru sebelumnya:
  * Sistem memberikan **keutamaan kepada guru yang telah mendaftar terlebih dahulu**.
  * Sistem memaparkan amaran rasmi dalam **warna merah yang terang, jelas, dan berhuruf tebal**:
    > **"Subjek [nama subjek] untuk kelas [nama kelas] telah didaftarkan. Sila berhubung dengan Guru Kanan Matapelajaran subjek ini"**
  * Memaparkan nama guru terdahulu, masa tepat pendaftaran, dan mengunci butang pendaftaran secara automatik.
  * Terdapat sokongan **Kunci Khas GKMP / Penyelaras (Override PIN: 2026)** sekiranya GKMP memberi kelulusan rasmi untuk penukaran.

### 3. 👥 Data Rasmi Lengkap SMK Tenghilan Terbina Dalam
* **92 Senarai Guru Rasmi**: Lengkap dari Cikgu Aidah binti Anga sehingga Cikgu Nurul Ain Farhana binti Mohamed Rozali.
* **30 Kelas KSSM**: Tingkatan 1 hingga Tingkatan 5 (Aliran: `UM`, `UKM`, `UPM`, `UUM`, `UTM`, `UMS`).
* **4 Bidang Matapelajaran**:
  * 🔬 **Bidang Sains & Matematik**: Matematik, Sains, Kimia, Biologi, Fizik, Matematik Tambahan.
  * 🌍 **Bidang Kemanusiaan**: Geografi, Pendidikan Muzik, Pendidikan Jasmani, Pendidikan Moral, Sejarah, Pendidikan Islam.
  * ⚙️ **Bidang TVET**: Reka Bentuk Grafik Digital, Sains Rumah Tangga, Sains Komputer, Reka Bentuk & Teknologi, Asas Sains Komputer, Perniagaan, Perakaunan.
### 4. 📚 Modul Pengurusan, Tambah & Edit Mata Pelajaran (Baharu)
* **Tambah Subjek Baharu**: Guru penyelaras atau pentadbir boleh menambah mata pelajaran baharu bila-bila masa terus daripada borang pendaftaran atau tab khas **"📚 Urus Subjek"**.
* **Pilihan Meletakkan Subjek di Bawah Bidang**: Setiap subjek baharu boleh ditetapkan di bawah mana-mana 4 Bidang rasmi (*Sains & Matematik, Kemanusiaan, TVET, Bahasa*).
* **Fungsi Edit Subjek (Kemas Kini Nama & Kod Terkini)**:
  * Sekiranya berlaku perubahan nama mata pelajaran rasmi KPM atau ejaan baharu, nama subjek boleh dikemaskini dengan segera.
  * Dilengkapi fungsi **Penyelarasan Berperingkat (*Cascade Update*)**: Pengemaskinian nama atau kod subjek akan menyelaraskan semua rekod pendaftaran guru sedia ada secara automatik tanpa perlu mendaftar semula!
* **Pintasan Pantas (Quick-Action)**: Butang `➕ Tambah` dan `✏️ Edit` disediakan tepat di atas menu pilihan subjek dalam borang pendaftaran.

### 5. ⏱️ Pilihan Jam Kredit & Kombinasi Masa KSSM
* Penentuan jam kredit fleksibel (1 hingga 6 waktu seminggu) dengan cadangan automatik mengikut subjek.
* Pilihan pecahan kombinasi masa rasmi jadual:
  * 5 Waktu: `3+2` (Disyorkan) atau `2+2+1`
  * 4 Waktu: `2+2` (Disyorkan) atau `3+1`
  * 3 Waktu: `2+1` (Disyorkan) atau `1+1+1`
  * 2 Waktu: `2 berkembar` atau `1+1`
  * 6 Waktu: `3+3` atau `2+2+2`
  * Pilihan input kombinasi khas untuk keperluan panitia tertentu.

### 6. 📄 Muat Turun Rumusan Fail PDF Rasmi
Jana dokumen PDF rasmi bersaiz A4 dengan kepala surat rasmi dan lencana sekolah SMK Tenghilan:
1. **Laporan Rumusan Penuh Agihan Guru (A4 Landscape)**: Senarai lengkap 92 guru berserta jumlah waktu mingguan dan 3 kotak tandatangan (Penyelaras, PK Pentadbiran, Pengetua).
2. **Matriks Agihan 30 Kelas (A4 Landscape)**: Grid pemetaan 30 kelas vs subjek yang telah diisi.
3. **Laporan Mengikut 4 Bidang (A4 Portrait)**: Format khas untuk simpanan fail 4 GKMP.
4. **Slip Pendaftaran Guru Individu**: Slip pengesahan agihan tugas mengajar rasmi untuk setiap guru.

### 7. 🔄 Eksport Terus ke Software Jadual Waktu
* **aSc Timetables (.csv)**: Eksport fail CSV berformat piawai yang sedia diimport ke dalam aSc Timetables tanpa perlu menaip semula satu persatu.
* **e-Jadual SMKTego (.json)**: Eksport fail sandaran serasi dengan projek sistem jadual waktu sidang pagi.

---

## 💻 Cara Menjalankan Sistem

### Kaedah 1: Menggunakan Pelayan Rangkaian Sekolah (Disyorkan)
1. Sambungkan komputer Penyelaras dan telefon guru ke **Wi-Fi sekolah yang sama** (atau buka Hotspot komputer/telefon).
2. Klik dua kali pada fail:
   ```
   JALANKAN_SISTEM.bat
   ```
3. Skrin komputer akan memaparkan alamat pelayan (contoh: `http://192.168.1.50:8089`).
4. Paparkan **Kod QR** di skrin (Tab "Pelayan & QR Kod"). Semua guru boleh terus imbas kod QR menggunakan kamera telefon untuk membuka dan memasang aplikasi!
5. Semua data yang didaftarkan oleh guru akan disimpan secara berpusat ke dalam fail:
   ```
   data/pendaftaran.json
   ```

### Kaedah 2: Penggunaan Kendiri / Luar Talian (Offline)
1. Buka terus fail `index.html` menggunakan Google Chrome atau Microsoft Edge.
2. Data akan disimpan dalam storan telefon (`LocalStorage`) dan guru boleh menghantar slip pendaftaran atau mesej WhatsApp rasmi terus kepada Cikgu Steve.

### Kaedah 3: Penyelarasan Awan (Cloud Sync - Untuk Luar Sekolah)
1. Buka Tab **"Pelayan & QR Kod"**.
2. Masukkan URL pangkalan data percuma Google Firebase Realtime Database (contoh: `https://smktego-agihan-default-rtdb.firebaseio.com`).
3. Tandakan **"Aktifkan Penyelarasan Cloud"** dan tekan Simpan. Semua pendaftaran dari mana-mana telefon di luar sekolah akan diselaraskan serta-merta melalui talian internet!

---

## 🔐 Maklumat Keselamatan & Pentadbiran
* **Kod PIN Kelulusan Khas GKMP / Penyelaras**: `2026` (atau `1234`).
* Digunakan apabila GKMP meluluskan penukaran subjek yang telah didaftarkan lebih awal oleh guru lain.

---
*Dibangunkan khas untuk SMK Tenghilan, Tuaran, Sabah. Berusaha, Berilmu, Berbakti.*
