const db = require('../config/firestore');

// Menyimpan URL foto (misalnya sesudah/sebelum dibersihkan) untuk sebuah order
const addGalleryPhoto = async (req, res) => {
    try {
        const { orderId, photoUrl, description } = req.body;

        if (!orderId || !photoUrl) {
            return res.status(400).json({ error: 'Data tidak lengkap. Butuh orderId dan photoUrl' });
        }

        // Simpan data di sub-collection agar rapi: order_galleries -> {orderId} -> photos -> {autoId}
        const newPhotoRef = db.collection('order_galleries')
            .doc(String(orderId))
            .collection('photos')
            .doc(); 

        const photoData = {
            id: newPhotoRef.id,
            photoUrl: photoUrl,
            description: description || '',
            uploadedAt: new Date().toISOString()
        };

        await newPhotoRef.set(photoData);

        res.status(201).json({
            message: 'Foto berhasil disimpan ke galeri di Firestore',
            data: photoData
        });
    } catch (error) {
        console.error('Error saat simpan foto ke galeri Firestore:', error);
        res.status(500).json({ error: 'Gagal menyimpan foto ke galeri' });
    }
};

// Mengambil semua foto dari satu order
const getGalleryPhotos = async (req, res) => {
    try {
        const { orderId } = req.params;

        const snapshot = await db.collection('order_galleries')
            .doc(String(orderId))
            .collection('photos')
            .orderBy('uploadedAt', 'desc')
            .get();

        const photos = [];
        snapshot.forEach(doc => {
            photos.push(doc.data());
        });

        res.status(200).json(photos);
    } catch (error) {
        console.error('Error saat mengambil galeri Firestore:', error);
        res.status(500).json({ error: 'Gagal mengambil data galeri' });
    }
};

module.exports = {
    addGalleryPhoto,
    getGalleryPhotos
};
