const db = require('../config/firestore');

// Mencatat histori pembaruan status pekerjaan (NoSQL)
const logOrderStatus = async (req, res) => {
    try {
        const { orderId, status, updatedByRole, note, photo_url } = req.body;

        const historyRef = db.collection('order_history').doc(String(orderId)).collection('logs').doc();
        
        const logData = {
            id: historyRef.id,
            status,
            updatedByRole, // contoh: 'worker' atau 'system'
            note: note || '',
            photo_url: photo_url || null, // Untuk foto sebelum/sesudah pekerjaan
            timestamp: new Date().toISOString()
        };

        await historyRef.set(logData);
        res.status(201).json({ info: 'Log histori status order berhasil dicatat (Firestore)', data: logData });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mencatat histori status' });
    }
};

// Mengambil riwayat pembaruan status pekerjaan (NoSQL)
const getOrderHistory = async (req, res) => {
    try {
        const { orderId } = req.params;
        const snapshot = await db.collection('order_history')
            .doc(String(orderId))
            .collection('logs')
            .orderBy('timestamp', 'asc')
            .get();

        const logs = [];
        snapshot.forEach(doc => logs.push(doc.data()));

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil histori status order' });
    }
};

module.exports = { logOrderStatus, getOrderHistory };
