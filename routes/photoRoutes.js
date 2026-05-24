const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    // Kembalikan URL yang mengarah ke server ini (akan disajikan lewat express.static)
    const host = req.get('host');
    const protocol = req.protocol || 'https';
    // Di Cloud Run, kita bisa berasumsi https jika host mengandung run.app
    const scheme = host.includes('run.app') ? 'https' : protocol;
    res.json({ url: `${scheme}://${host}/uploads/${req.file.filename}` });
});

module.exports = router;
