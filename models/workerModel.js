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

const createWorker = async (data) => {
    const { name, email, password, phone, status } = data;
    const [result] = await db.query(
        'INSERT INTO workers (name, email, password, phone, status) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, phone, status || 'available']
    );
    return result;
};

const loginWorker = async (email, password) => {
    const [rows] = await db.query('SELECT * FROM workers WHERE email = ? AND password = ?', [email, password]);
    return rows[0];
};

module.exports = {
    getAllWorkers,
    getWorkerById,
    updateWorkerStatus,
    createWorker,
    loginWorker
};
