const db = require('../config/database');

const createReview = async (orderId, workerId, rating, comment) => {
    return await db.query(
        'INSERT INTO reviews (order_id, worker_id, rating, comment) VALUES (?, ?, ?, ?)',
        [orderId, workerId, rating, comment]
    );
};

const getReviewsByWorker = async (workerId) => {
    const [rows] = await db.query('SELECT * FROM reviews WHERE worker_id = ? ORDER BY created_at DESC', [workerId]);
    return rows;
};

module.exports = {
    createReview,
    getReviewsByWorker
};
