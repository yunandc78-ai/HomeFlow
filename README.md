# 🌿 HomeFlow — Aplikasi Manajemen Rumah Tangga & Keuangan

**HomeFlow** adalah aplikasi *mobile-first* cerdas untuk pengelolaan kebutuhan rumah tangga Indonesia, pembagian gaji bulanan otomatis, inventaris sembako dapur, checklist belanja dengan auto-sync ke kas, serta jadwal tugas rumah dan *meal planner*.

Desain mengusung estetika **Warm Minimalist ala App Store** dengan **Bento Grid Layout**, aksen warna *Sage Green* lembut (`#4E7350`), dan palet *warm neutral* yang nyaman di mata.

---

## ✨ Fitur Utama (V1 Terimplementasi)

### 1. 🔐 Otentikasi Akun (Login System Terproteksi)
- Kredensial Default: **`admin`** / **`123`**
- **Fitur Ganti Password Admin**: Admin dapat mengubah kata sandi default kapan saja melalui menu pengaturan profil/logo kiri atas -> tombol **"Ganti Password Admin"**.
- Dilengkapi tombol cepat satu klik: *"✨ Klik di sini untuk isi Akun Admin (admin / [password])"* yang otomatis sinkron dengan password aktif saat ini.
- Sesi login tersimpan (*persistent*) di browser `localStorage`.
- Tombol logout terintegrasi pada avatar profil pengguna di header.

### 2. 🍱 Dashboard Bento Grid
- **Hero Card Finansial**:
  - Saldo Kas Tersisa secara *real-time* (Gaji + Pemasukan - Pengeluaran - Alokasi).
  - Total Gaji Pokok & Pemasukan Tambahan.
  - Total Pengeluaran Terpakai.
- **Smart Salary Allocator Banner** (Fitur Unggulan USP).
- **Widget Progres Tabungan Keluarga**: Bar persentase pencapaian target tabungan.
- **Widget Peringatan Sembako Dapur**: Notifikasi sembako menipis/habis dengan 1-klik masuk daftar belanja.
- **Widget Checklist Belanja Aktif**: Centang cepat barang belanjaan langsung dari dashboard.
- **Widget Tugas Rumah & Menu Masakan Hari Ini**: Tampilan menu siang & tugas hari ini.

### 3. ⚡ Smart Salary Allocator & Auto-Sync Belanja (Fitur USP)
- **Smart Salary Allocator**:
  - Input total gaji masuk (contoh: `Rp 12.500.000`).
  - Pilihan preset pintar:
    - *Mode Seimbang* (40% Dapur & Sembako, 30% Tabungan Keluarga, 20% Operasional Rumah, 10% Fleksibel)
    - *Mode Tabungan Prioritas* (35% Dapur, 45% Tabungan Keluarga, 15% Operasional, 5% Fleksibel)
    - *Mode Custom Slider*: Geser persentase alokasi secara dinamis dengan kalkulasi rupiah *real-time*.
  - Tombol *"Terapkan Alokasi Otomatis ke Kas & Tabungan"*: Otomatis mencatat pos alokasi gaji ke transaksi kas.
- **Auto-Sync Belanja ke Kas & Inventaris**:
  - Saat Anda selesai belanja dan mencentang item di **Daftar Belanja**, klik tombol **"⚡ Selesaikan & Auto-Sync ke Kas"**:
    1. Otomatis mencatat pengeluaran belanja ke Kas Transaksi.
    2. Otomatis menambah kuantitas stok di **Inventaris Dapur** untuk bahan sembako yang tersambung!

### 4. 💵 Input Total Gaji, Tagihan Rutin & Arus Kas (Pemasukan / Pengeluaran)
- **⚡ Fitur Input Cepat Tagihan Rutin Bulanan**:
  - Modal khusus untuk langsung mencatat atau memperbarui 5 pos pengeluaran rutin:
    - 🛒 **Belanja Bulanan Supermarket & Sembako** (`Rp 1.850.000`)
    - ⚡ **Tagihan Listrik PLN (Token / Pascabayar)** (`Rp 450.000`)
    - 🌐 **Internet WiFi Rumah** (`Rp 350.000`)
    - 🔥 **Gas Elpiji Dapur (Refill)** (`Rp 85.000`)
    - 🏘️ **Iuran RT, Sampah & Keamanan** (`Rp 100.000`)
  - Kartu ringkasan pos tagihan rutin bulanan di layar Kas & Pengeluaran.
- Catat transaksi harian dengan kategori lengkap (*Belanja Bulanan, Listrik, Internet, Gas, Iuran RT, Dapur & Makanan, Utilitas, Transportasi, Hiburan, Pemasukan Tambahan*).
- Filter transaksi cepat berdasarkan kategori pengeluaran spesifik maupun jenis transaksi (*Semua, Belanja Bulanan, Listrik, Internet, Gas, Iuran RT, Pengeluaran, Pemasukan*).

### 5. 🎯 Tabungan Keluarga (Target Finansial)
- **Target Tabungan Masa Depan**:
  - *Dana Darurat (Emergency Fund)*
  - *Liburan Akhir Tahun*
  - *Dana Pendidikan Anak*
  - *Renovasi & Perawatan Rumah*
- Progress bar persentase target capaian tabungan, rincian sisa kebutuhan dana, tombol setoran instan (*"+ Setor"*), serta tombol **Edit (✏️)** dan **Hapus (🗑️)** pada setiap kartu target tabungan secara fleksibel.

### 6. 🥬 Inventaris Sembako & Dapur
- Kategori sembako: *Bahan Pokok, Protein & Lauk, Bumbu & Rempah, Kebersihan*.
- Pengaturan batas minimum stok dengan indikator status visual:
  - 🟢 **Aman** (Stok di atas batas minimum)
  - 🟡 **Menipis** (Stok sama dengan atau di bawah batas minimum)
  - 🔴 **Habis** (Stok 0)
- Stepper kuantitas cepat `+` dan `-` pada kartu barang.
- Tombol **"+ Masuk Daftar Belanja"**: Menambahkan bahan dapur yang menipis langsung ke checklist belanja dalam 1 klik.

### 7. 🛒 Daftar Belanja Interaktif
- Checklist interaktif dengan efek coret (*strikethrough*).
- Estimasi total anggaran belanjaan.
- Filter: *Semua*, *Belum Dibeli*, *Sudah Dicentang*.
- Auto-Sync selesai belanja ke kas dan restock dapur.

### 8. 📅 Jadwal Tugas Rumah (Chores) & Meal Planner
- **Jadwal Tugas Rumah (Chores)**:
  - Pembagian tugas (*Ayah, Ibu, Anak, Bersama*).
  - Waktu pelaksanaan (*Pagi, Siang, Sore, Malam*).
  - Centang tugas selesai dan tambah tugas baru.
- **Meal Planner (Menu Masakan Harian)**:
  - Perencanaan menu: *Sarapan, Makan Siang, Makan Malam*.
  - Resep singkat dan bahan dapur yang terpakai.
  - Tombol **"🎲 Acak Inspirasi Menu"**: Rekomendasi otomatis menu masakan rumahan lezat dan sehat.
  - Tombol **"Ubah"**: Ganti menu harian sesuai selera keluarga.

### 9. 🚀 Roadmap Lanjutan (V2 & V3 Preview)
Akses melalui ikon bintang di header atas:
- **Auto-Budgeting Rule 50/30/20** *(V2 • Coming Soon)*
- **Pengingat Tagihan Bulanan (Listrik, WiFi, Air, BPJS)** *(V2 • Coming Soon)*
- **Scan Struk Belanja Otomatis (OCR)** *(V3 • Coming Soon)*

- **Kustomisasi Logo Kiri Atas & Profil (Admin)**: Klik logo / avatar di kiri atas kapan saja untuk mengganti logo ikon estetik (🏡, 🌿, 🪴, dll.), upload foto/gambar kustom sendiri, menggunakan inisial huruf, serta mengganti nama identitas keluarga.
- **Toggle Mode HP (iPhone Frame) vs Fullscreen**: Nikmati simulasi layar smartphone dengan dynamic island atau tampilan penuh bento grid di desktop.
- **Tema Warm Sage & Dark Sage**: Tombol tema di bagian atas.
- **Efek Suara Haptik Lembut**: Sintesis audio Web Audio API tanpa perlu aset file audio eksternal.
- **Ekspor Data & Reset**: Cadangkan data ke file `.json` atau kembalikan ke data awal kapan saja.

---

## 🚀 Cara Menjalankan

Buka file [index.html](file:///f:/AI%20anti%20gravity/HomeFlow/index.html) langsung di peramban (Google Chrome, Microsoft Edge, Safari, Firefox) atau klik dua kali file tersebut di Windows Explorer:
```text
f:\AI anti gravity\HomeFlow\index.html
```

**Kredensial Default:**
- **Username**: `admin`
- **Password**: `123`
*(Atau cukup klik kartu bantuan demo di layar login untuk pengisian instan)*
