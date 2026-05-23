const paymentModel = require('../models/paymentModel');

const processPayment = async (req, res) => {
    try {
        const { orderId, amount, paymentMethod } = req.body;
        await paymentModel.createPayment(orderId, amount, paymentMethod, 'pending');
        res.status(201).json({ message: "Pembayaran berhasil diproses dengan status pending" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal memproses pembayaran', detail: error.message });
    }
};

const getPaymentDetail = async (req, res) => {
    try {
        const row = await paymentModel.getPaymentByOrderId(req.params.orderId);
        if (!row) return res.status(404).json({ error: 'Data pembayaran tidak ditemukan' });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data pembayaran', detail: error.message });
    }
};

const confirmPayment = async (req, res) => {
    try {
        await paymentModel.updatePaymentStatus(req.params.id, 'completed');
        res.json({ message: "Status pembayaran berhasil diupdate menjadi completed" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal update status pembayaran', detail: error.message });
    }
};

module.exports = {
    processPayment,
    getPaymentDetail,
    confirmPayment
};
