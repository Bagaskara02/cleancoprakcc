const db = require('../config/database');

// Sesuai tabel 'users' di cleanco_schema.sql
const getAllUsers = async () => {
    const [rows] = await db.query('SELECT id, name, email, phone, address, created_at, updated_at FROM users');
    return rows;
};

const getUserById = async (id) => {
    const [rows] = await db.query('SELECT id, name, email, phone, address, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0];
};

const createUser = async (name, email, password, phone, address) => {
    return await db.query(
        'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, phone, address]
    );
};

const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const updateUser = async (id, name, email, phone, address) => {
    return await db.query(
        'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, email, phone, address, id]
    );
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getUserByEmail,
    updateUser
};

