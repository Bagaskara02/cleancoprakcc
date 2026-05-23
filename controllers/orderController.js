const orderModel = require('../models/orderModel');

const getOrders = async (req, res) => {
    try {
        const rows = await orderModel.getAllOrders();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data orders', detail: error.message });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const rows = await orderModel.getOrdersByUserId(req.params.userId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data orders user', detail: error.message });
    }
};

const addOrder = async (req, res) => {
    try {
        const { user_id, service_id, scheduled_at, total_price, address_detail } = req.body;
        await orderModel.createOrder(user_id, service_id, scheduled_at, total_price, address_detail);
        res.json({ message: "Order berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat order', detail: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await orderModel.updateOrderStatus(req.params.id, status);
        res.json({ message: "Status order berhasil diupdate" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal update status order', detail: error.message });
    }
};

module.exports = {
    getOrders,
    getOrdersByUser,
    addOrder,
    updateStatus
};
