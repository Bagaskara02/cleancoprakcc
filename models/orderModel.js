const db = require('../config/database');

// Sesuai tabel 'orders' di cleanco_schema.sql
const getAllOrders = async () => {
    const [rows] = await db.query(`
        SELECT o.*, u.name AS user_name, s.name AS service_name, s.duration_minutes, w.name AS worker_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN services s ON o.service_id = s.id
        LEFT JOIN workers w ON o.worker_id = w.id
        ORDER BY o.created_at DESC
    `);
    return rows;
};

const getOrdersByUserId = async (user_id) => {
    const [rows] = await db.query(`
        SELECT o.*, s.name AS service_name, s.duration_minutes, w.name AS worker_name
        FROM orders o
        LEFT JOIN services s ON o.service_id = s.id
        LEFT JOIN workers w ON o.worker_id = w.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `, [user_id]);
    return rows;
};

const createOrder = async (user_id, service_id, scheduled_at, total_price, address_detail) => {
    return await db.query(
        'INSERT INTO orders (user_id, service_id, status, scheduled_at, total_price, address_detail) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, service_id, 'pending', scheduled_at, total_price, address_detail]
    );
};

const updateOrderStatus = async (id, status) => {
    return await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
};

const assignWorker = async (id, worker_id) => {
    return await db.query('UPDATE orders SET status = ?, worker_id = ? WHERE id = ?', ['accepted', worker_id, id]);
};

module.exports = {
    getAllOrders,
    getOrdersByUserId,
    createOrder,
    updateOrderStatus,
    assignWorker
};
