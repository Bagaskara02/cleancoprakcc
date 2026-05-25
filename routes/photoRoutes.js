const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');

// Pastikan firebase diinisialisasi
require('../config/firestore');

// Gunakan memoryStorage agar file disimpan di RAM sementara, tidak di disk lokal
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
        }

        const bucket = getStorage().bucket();
        const ext = path.extname(req.file.originalname) || '.jpg';
        const filename = `uploads/photos/${Date.now()}_${Math.round(Math.random() * 1E9)}${ext}`;
        const file = bucket.file(filename);

        // Upload buffer ke Firebase Storage
        await file.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        // Dapatkan signed URL yang berlaku sangat lama (agar bisa diakses publik)
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2100'
        });

        res.json({ url: url });
    } catch (error) {
        console.error("Error upload to Firebase Storage:", error);
        res.status(500).json({ error: 'Gagal mengunggah foto ke Cloud Storage' });
    }
});

module.exports = router;
