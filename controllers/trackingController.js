const db = require('../config/firestore');

// Memperbarui lokasi GPS petugas secara realtime (NoSQL)
const updateLocation = async (req, res) => {
    try {
        const { orderId, workerId, latitude, longitude } = req.body;

        if (!orderId || !workerId || !latitude || !longitude) {
            return res.status(400).json({ error: 'Data tidak lengkap. Butuh orderId, workerId, latitude, longitude' });
        }

        const trackingRef = db.collection('tracking').doc(String(orderId));
        
        const trackingData = {
            workerId,
            latitude,
            longitude,
            updatedAt: new Date().toISOString()
        };

        await trackingRef.set(trackingData);
        res.status(200).json({ info: 'Lokasi petugas berhasil diupdate (Firestore)', data: trackingData });
    } catch (error) {
        res.status(500).json({ error: 'Gagal update lokasi petugas' });
    }
};

// Mengambil lokasi GPS petugas saat ini (NoSQL)
const getLocation = async (req, res) => {
    try {
        const { orderId } = req.params;
        const doc = await db.collection('tracking').doc(String(orderId)).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Data tracking tidak ditemukan untuk order ini' });
        }

        res.status(200).json(doc.data());
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil lokasi petugas' });
    }
};

module.exports = { updateLocation, getLocation };
