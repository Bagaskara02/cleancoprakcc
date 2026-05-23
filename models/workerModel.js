const db = require('../config/database');

// Sesuai tabel 'workers' di cleanco_schema.sql
const getAllWorkers = async () => {
    const [rows] = await db.query('SELECT * FROM workers');
    return rows;
};

const getWorkerById = async (id) => {
    const [rows] = await db.query('SELECT * FROM workers WHERE id = ?', [id]);
    return rows[0];
};

const updateWorkerStatus = async (id, status) => {
    return await db.query('UPDATE workers SET status = ? WHERE id = ?', [status, id]);
};

module.exports = {
    getAllWorkers,
    getWorkerById,
    updateWorkerStatus
};
