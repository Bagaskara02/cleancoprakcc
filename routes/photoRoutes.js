const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    res.json({ url: `https://storage.googleapis.com/cleanco-bucket/${req.file.filename}` });
});

module.exports = router;
