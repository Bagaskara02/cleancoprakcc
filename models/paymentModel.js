const db = require('../config/database');

const createPayment = async (orderId, amount, paymentMethod, status, proofUrl) => {
    return await db.query(
        'INSERT INTO payments (order_id, amount, payment_method, status, proof_url) VALUES (?, ?, ?, ?, ?)',
        [orderId, amount, paymentMethod, status, proofUrl]
    );
};

const getPaymentByOrderId = async (orderId) => {
    const [rows] = await db.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
    return rows[0];
};

const updatePaymentStatus = async (id, status) => {
    return await db.query('UPDATE payments SET status = ? WHERE id = ?', [status, id]);
};

module.exports = {
    createPayment,
    getPaymentByOrderId,
    updatePaymentStatus
};
