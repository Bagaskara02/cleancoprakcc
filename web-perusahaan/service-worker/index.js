require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db'); // Memanggil file koneksi dinamis

const app = express();
app.use(cors());
app.use(express.json());

console.log("=== CEK ENV ===");
console.log("User:", process.env.DB_USER);
console.log("Pass:", process.env.DB_PASSWORD);
console.log("Name:", process.env.DB_NAME);
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("===============");
// ==========================================
// ENDPOINT SERVICES (Katalog Layanan)
// ==========================================

// Mengambil semua data layanan
app.get('/api/v2/services', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cleaning_services');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data services', detail: error.message });
    }
});

// Menambahkan data layanan baru
app.post('/api/v2/services', async (req, res) => {
    try {
        const { nama_layanan, harga_dasar } = req.body;
        await db.query('INSERT INTO cleaning_services (nama_layanan, harga_dasar) VALUES (?, ?)', [nama_layanan, harga_dasar]);
        res.json({ message: "Service berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat service', detail: error.message });
    }
});

// Menghapus data layanan berdasarkan ID
app.delete('/api/v2/services/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cleaning_services WHERE id = ?', [req.params.id]);
        res.json({ message: "Service berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus service', detail: error.message });
    }
});

// ==========================================
// ENDPOINT WORKERS (Pekerja)
// ==========================================

// Mengambil semua data pekerja
app.get('/api/v2/workers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM workers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data workers', detail: error.message });
    }
});

// ==========================================
// ENDPOINT UPLOAD GCS (Simulasi Lokal)
// ==========================================

// Konfigurasi Multer untuk menerima file upload sementara di folder 'uploads/'
const upload = multer({ dest: 'uploads/' });

app.post('/api/v2/photos/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    // Jika nanti di-deploy ke Cloud Run dan pakai Cloud Storage (GCS), 
    // logika upload-nya akan ditambahkan di sini.
    // Untuk saat ini, kita return URL simulasi.
    res.json({ url: `https://storage.googleapis.com/cleanco-bucket/${req.file.filename}` });
});

// ==========================================
// START SERVER
// ==========================================

// Gunakan port dari environment (Cloud Run) atau default 3002 (Lokal)
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Service Worker & Upload running on port ${port}`));