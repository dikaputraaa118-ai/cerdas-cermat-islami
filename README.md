# Cerdas Cermat Islami

Game edukasi interaktif berbasis web yang menguji pengetahuan dasar Islam dengan format kuis cepat dan menyenangkan. Game ini dibuat dengan HTML5, CSS3, dan JavaScript vanilla tanpa dependency tambahan.

## Struktur File

- `index.html` — struktur utama halaman game.
- `style.css` — styling modern, responsif, dan tema islami.
- `questions.js` — database soal yang dipisahkan dari logika permainan.
- `script.js` — logika permainan, timer, skor, navigasi, dan LocalStorage.

## Fitur

- Halaman beranda dengan tombol Mulai Bermain, Cara Bermain, dan Rekor Saya.
- Pilihan kategori soal.
- Pilihan tingkat kesulitan Mudah, Menengah, dan Sulit.
- 10 soal per sesi dengan timer 20 detik per soal.
- Pembahasan singkat setelah setiap jawaban.
- Skor otomatis, progress bar, dan penyimpanan rekor tinggi menggunakan LocalStorage.
- Toggle suara untuk mengaktifkan atau menonaktifkan efek suara.
- Antarmuka responsif untuk desktop, tablet, dan ponsel.

## Cara Menjalankan

### Metode 1: Buka langsung file
1. Buka folder proyek.
2. Klik `index.html`.
3. Browser akan menampilkan game secara mandiri.

### Metode 2: Gunakan Live Server
1. Pastikan VS Code sudah terinstall extension Live Server.
2. Buka folder proyek di VS Code.
3. Klik kanan pada `index.html` lalu pilih `Open with Live Server`.
4. Browser akan otomatis membuka halaman game.

## Cara Bermain

1. Pilih kategori soal yang ingin dimainkan.
2. Pilih tingkat kesulitan.
3. Jawab 10 pertanyaan dalam waktu 20 detik per soal.
4. Tiap jawaban benar mendapat 10 poin.
5. Setelah semua soal selesai, tampilkan hasil akhir dan skor tertinggi.

## Cara Menambah Soal

Buka file `questions.js` dan tambahkan objek pertanyaan ke dalam kategori yang sesuai. Struktur data tiap soal adalah:

```js
{
  id: 'AQS-001',
  category: 'al-quran-surah',
  difficulty: 'mudah',
  question: 'Pertanyaan Anda di sini',
  options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
  answerIndex: 1,
  explanation: 'Pembahasan singkat tentang jawaban yang benar.'
}
```

Pastikan:
- ID unik
- `category` sesuai dengan kategori terdaftar
- `difficulty` memakai `mudah`, `menengah`, atau `sulit`
- `options` memiliki tepat 4 pilihan
- `answerIndex` menunjuk ke jawaban benar yang valid
- `explanation` menjelaskan alasan jawaban benar

## Catatan

Game ini dibuat untuk kebutuhan edukasi lokal dan tidak menggunakan backend, API, atau framework besar. Semua data soal di simpan di sisi klien untuk memudahkan pengelolaan dan menjalankan game tanpa server tambahan.
