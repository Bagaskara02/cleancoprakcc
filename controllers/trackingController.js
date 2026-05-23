const db = require('../config/firestore');

// Contoh endpoint NoSQL: Mengupdate lokasi worker secara realtime
const updateLocation = async (req, res) => {
    try {
        const { workerId, lat, long } = req.body;

        if (!workerId || !lat || !long) {
            return res.status(400).json({ error: 'Data tidak lengkap. Butuh workerId, lat, dan long' });
        }

        // Menyimpan data koordinat ke koleksi 'worker_tracking' di Firestore
        const trackingRef = db.collection('worker_tracking').doc(String(workerId));
        await trackingRef.set({
            lat: lat,
            long: long,
            updatedAt: new Date().toISOString()
        }, { merge: true }); // merge: true agar tidak menimpa data lain di dokumen yang sama jika ada

        res.status(200).json({
            message: 'Lokasi worker berhasil diupdate di Firestore',
            data: { workerId, lat, long }
        });
    } catch (error) {
        console.error('Error saat update lokasi di Firestore:', error);
        res.status(500).json({ error: 'Gagal mengupdate lokasi pekerja' });
    }
};

module.exports = {
    updateLocation
};
