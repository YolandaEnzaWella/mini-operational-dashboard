# Ops Dashboard: Mini Operational Dashboard

Aplikasi dashboard sederhana untuk memantau barang/aset operasional, stok gudang, dan riwayat transaksi (stok masuk & keluar).

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js (App Router) + React + TypeScript, Tailwind CSS, Recharts, Framer Motion, Axios, React Hot Toast, next-themes |
| Backend | Node.js + Express, express-validator |
| Database | MySQL (query SQL langsung dengan `mysql2`) |

---

## Cara Menjalankan

### Prasyarat
- Node.js 20 atau lebih baru
- MySQL 5.7 / 8 (misalnya dari Laragon atau XAMPP)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Sesuaikan isi `.env` dengan koneksi MySQL di komputer Anda:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ops_dashboard
```

Buat tabel dan isi data contoh:

```bash
npm run migrate   # membuat database + tabel (database/schema.sql)
npm run seed      # mengisi data contoh
# atau sekaligus: npm run fresh
```

Jalankan server:

```bash
npm run dev       # http://localhost:5000/api
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev       # http://localhost:3000
```

Buka **http://localhost:3000**.

---

## Fitur

**Data barang**
- Tambah, ubah, hapus barang (kode, nama, kategori, gudang, satuan, stok minimum, status maintenance)
- Pencarian berdasarkan nama/kode, filter status, gudang, dan kategori
- Sorting dengan klik judul kolom, plus pagination

**Transaksi stok**
- Stok masuk dan stok keluar (peminjaman/pemakaian)
- Stok barang otomatis bertambah/berkurang setiap ada transaksi
- Validasi:
  - stok keluar tidak boleh melebihi stok yang ada (**stok tidak mencukupi**)
  - barang yang sedang maintenance tidak bisa dikeluarkan
  - jumlah minimal 1
- Setiap transaksi menyimpan stok sebelum & sesudah, nama petugas, dan catatan
- Stok awal saat menambah barang baru ikut tercatat sebagai transaksi masuk

**Status barang otomatis**
- `Maintenance`: jika ditandai sedang maintenance
- `Low Stock`: jika stok ≤ stok minimum
- `Available`: selain kondisi di atas

**Dashboard**
- Kartu ringkasan: total barang, stok kritis, maintenance, transaksi hari ini (kartu stok kritis & maintenance bisa diklik untuk memfilter tabel)
- Grafik tren transaksi masuk/keluar (7, 14, 30 hari)
- Grafik perbandingan status barang
- Data dashboard, tabel, dan log aktivitas diperbarui secara realtime di semua tab/browser yang terbuka (Server-Sent Events)

**Tampilan**
- Dark mode / light mode
- Responsif (desktop & mobile)
- Skeleton loading, animasi (Framer Motion), toast notifikasi untuk setiap aksi berhasil/gagal

---

## Struktur Project

```
backend/
├── database/
│   ├── schema.sql          struktur tabel
│   ├── migrate.js          menjalankan schema.sql
│   └── seed.js             data contoh
└── src/
    ├── server.js           entry point
    ├── app.js              setup express, middleware, routes
    ├── config/database.js  koneksi MySQL (connection pool)
    ├── routes/api.js       daftar endpoint
    ├── controllers/        menerima request & mengembalikan response
    ├── models/             query SQL ke database
    ├── services/           logika bisnis yang melibatkan lebih dari satu tabel
    ├── validators/         aturan validasi request
    ├── middleware/         validasi request & error handler
    └── helpers/            fungsi bantu (penentuan status, HttpError)

frontend/src/
├── app/                    layout, halaman utama, provider (tema & toast)
├── components/             komponen halaman (tabel, filter, grafik, modal)
│   └── ui/                 komponen kecil yang dipakai ulang (Button, Modal, Card, dll)
├── hooks/                  custom hook untuk mengambil data (useItems, useDashboard, useDebounce)
├── lib/                    konfigurasi axios & fungsi format
└── types/                  tipe data TypeScript
```

Contoh response jika validasi gagal:

```json
{
  "message": "Data yang dikirim tidak valid",
  "errors": {
    "quantity": ["Jumlah minimal 1"]
  }
}
```

---

## Database

```
categories  (id, name)
warehouses  (id, name, city)
items       (id, code, name, category_id → categories, warehouse_id → warehouses,
             stock, min_stock, unit, status, created_at, updated_at)
transactions(id, item_id → items, type [in/out], quantity,
             stock_before, stock_after, note, created_by, created_at)
```

Saat transaksi disimpan, proses berikut dijalankan di dalam satu **database transaction**:

1. Ambil data barang dengan `SELECT ... FOR UPDATE` (baris dikunci agar tidak bentrok dengan transaksi lain di waktu yang sama)
2. Cek apakah barang sedang maintenance dan apakah stok mencukupi
3. Hitung stok baru dan status baru
4. Update tabel `items`
5. Simpan riwayat ke tabel `transactions`
6. `COMMIT`. Jika ada error di langkah mana pun, `ROLLBACK`

---

## API Endpoint

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/events` | Koneksi realtime (Server-Sent Events), mengirim event `data-changed` setiap ada perubahan data |
| GET | `/dashboard/summary` | Ringkasan statistik |
| GET | `/dashboard/chart?days=7` | Data grafik transaksi (7 / 14 / 30 hari) |
| GET | `/categories` | Daftar kategori |
| GET | `/warehouses` | Daftar gudang |
| GET | `/items` | Daftar barang. Query: `search`, `status`, `warehouse_id`, `category_id`, `sort_by`, `sort_order`, `page`, `per_page` |
| GET | `/items/:id` | Detail barang |
| POST | `/items` | Tambah barang |
| PUT | `/items/:id` | Ubah barang (stok tidak bisa diubah di sini, harus lewat transaksi) |
| DELETE | `/items/:id` | Hapus barang |
| GET | `/transactions?limit=10` | Riwayat transaksi terbaru |
| POST | `/transactions` | Simpan transaksi `{ item_id, type: "in" \| "out", quantity, created_by, note }` |

Contoh jika stok tidak mencukupi:

```
POST /api/transactions
{ "item_id": 1, "type": "out", "quantity": 999, "created_by": "Andi" }

422 Unprocessable Entity
{ "message": "Stok tidak mencukupi. Stok Helm Safety tersisa 27 pcs" }
```
