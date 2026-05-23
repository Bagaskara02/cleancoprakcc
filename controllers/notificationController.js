const db = require('../config/firestore');

// Mengirim/Membuat Notifikasi Baru (NoSQL)
const createNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ error: 'Data tidak lengkap. Butuh userId, title, message' });
        }

        const notifRef = db.collection('notifications').doc(String(userId)).collection('user_notifs').doc();
        
        const notifData = {
            id: notifRef.id,
            title,
            message,
            isRead: false,
            createdAt: new Date().toISOString()
        };

        await notifRef.set(notifData);
        res.status(201).json({ info: 'Notifikasi berhasil dikirim (Firestore)', data: notifData });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat notifikasi' });
    }
};

// Mengambil Daftar Notifikasi User (NoSQL)
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('notifications')
            .doc(String(userId))
            .collection('user_notifs')
            .orderBy('createdAt', 'desc')
            .get();

        const notifications = [];
        snapshot.forEach(doc => notifications.push(doc.data()));

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil notifikasi' });
    }
};

module.exports = { createNotification, getUserNotifications };
