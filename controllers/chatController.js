const db = require('../config/firestore');

// Mengirim pesan baru ke chat room (berdasarkan orderId)
const sendMessage = async (req, res) => {
    try {
        const { orderId, senderId, senderRole, message } = req.body;

        if (!orderId || !senderId || !senderRole || !message) {
            return res.status(400).json({ error: 'Data tidak lengkap. Butuh orderId, senderId, senderRole, message' });
        }

        // Chat disimpan di koleksi: chats -> {orderId} -> messages -> {autoId}
        const newMessageRef = db.collection('chats')
            .doc(String(orderId))
            .collection('messages')
            .doc();

        const messageData = {
            id: newMessageRef.id,
            senderId,
            senderRole, // 'user' atau 'worker'
            message,
            timestamp: new Date().toISOString()
        };

        await newMessageRef.set(messageData);

        res.status(201).json({
            info: 'Pesan terkirim ke Firestore',
            data: messageData
        });
    } catch (error) {
        console.error('Error saat kirim pesan:', error);
        res.status(500).json({ error: 'Gagal mengirim pesan chat' });
    }
};

// Mengambil semua pesan dalam satu ruang obrolan (orderId)
const getChatMessages = async (req, res) => {
    try {
        const { orderId } = req.params;

        const snapshot = await db.collection('chats')
            .doc(String(orderId))
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push(doc.data());
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error mengambil pesan chat:', error);
        res.status(500).json({ error: 'Gagal mengambil data chat' });
    }
};

module.exports = {
    sendMessage,
    getChatMessages
};
