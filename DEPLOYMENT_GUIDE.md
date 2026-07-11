# Panduan Menyebarkan Web (Deploy) ke GitHub Pages Menggunakan GitHub Desktop

Aplikasi web **AI CV Matcher & Reviser** ini terbuat dari file web statis (`index.html`, `styles.css`, `app.js`, `gemini-api.js`, dan `mock-data.js`). Anda dapat menjalankannya secara lokal langsung di komputer Anda, atau mengunggahnya ke **GitHub Pages** agar bisa diakses dari perangkat lain (ponsel, laptop lain) secara gratis dan privat.

Berikut adalah langkah-langkah mudah menyebarkannya menggunakan aplikasi **GitHub Desktop**:

---

## Langkah 1: Buat Repositori Baru di GitHub Desktop
1. Buka aplikasi **GitHub Desktop**.
2. Klik menu **File** -> **New Repository...** (atau tekan `Ctrl + N`).
3. Isi kolom yang tersedia:
   - **Name**: Masukkan nama bebas (misal: `cv-reviser` atau `cv-matcher`).
   - **Local Path**: Pilih lokasi folder repositori ini di komputer Anda (pilih lokasi luar, atau pindahkan file web ke folder baru yang dibuat oleh GitHub Desktop ini).
4. Klik tombol **Create Repository**.

---

## Langkah 2: Salin File Proyek ke Folder Repositori
1. Salin seluruh file aplikasi web ini dari direktori proyek (`C:\Users\RIANO\.gemini\antigravity\scratch\cv-reviser`):
   - `index.html`
   - `styles.css`
   - `app.js`
   - `gemini-api.js`
   - `mock-data.js`
2. Tempelkan (paste) semua file tersebut ke dalam folder repositori baru yang baru saja dibuat di Langkah 1.
3. Kembali ke aplikasi **GitHub Desktop**. Anda akan melihat file-file tersebut terdeteksi di kolom kiri sebagai file baru yang siap di-commit.

---

## Langkah 3: Commit & Publish ke GitHub
1. Di pojok kiri bawah GitHub Desktop, tulis ringkasan komit di kolom **Summary** (misal: `Initial commit`).
2. Klik tombol biru **Commit to main**.
3. Di bagian atas GitHub Desktop, klik tombol **Publish repository** (jika repositori belum ada di web GitHub Anda).
4. Pada jendela popup yang muncul:
   - **Keep this code private**: Centang opsi ini jika Anda ingin kodenya tetap privat (hanya Anda yang bisa melihat kodenya di GitHub). GitHub Pages tetap bisa aktif meskipun kodenya diset privat!
   - Klik **Publish Repository**.

---

## Langkah 4: Aktifkan GitHub Pages di GitHub.com
1. Buka repositori Anda di situs [GitHub.com](https://github.com/) lewat browser.
2. Masuk ke tab **Settings** (ikon roda gigi di bagian menu atas repositori).
3. Di menu sidebar kiri, klik submenu **Pages** (di bawah bagian *Code and automation*).
4. Di bagian **Build and deployment**:
   - Di bawah **Source**, pilih **Deploy from a branch**.
   - Di bawah **Branch**, klik dropdown yang bertuliskan *None*, lalu pilih **main** (atau **master**).
   - Biarkan folder default pada `/ (root)`.
   - Klik tombol **Save**.
5. Tunggu sekitar 1 hingga 2 menit. GitHub akan memproses dan menampilkan tautan web Anda di bagian atas halaman tersebut (misalnya: `https://username.github.io/cv-reviser/`).

Selesai! Aplikasi web Anda kini berjalan secara daring, aman, dan hanya membutuhkan Gemini API Key Anda untuk bekerja secara real-time.
