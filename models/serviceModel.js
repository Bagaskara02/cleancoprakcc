const db = require('../config/database');

// Sesuai tabel 'services' di cleanco_schema.sql
const getAllServices = async () => {
    const [rows] = await db.query('SELECT * FROM services');
    return rows;
};

const createService = async (name, description, price, duration_minutes) => {
    return await db.query(
        'INSERT INTO services (name, description, price, duration_minutes) VALUES (?, ?, ?, ?)',
        [name, description, price, duration_minutes]
    );
};

const deleteService = async (id) => {
    return await db.query('DELETE FROM services WHERE id = ?', [id]);
};

const updateService = async (id, name, description, price, duration_minutes) => {
    return await db.query(
        'UPDATE services SET name = ?, description = ?, price = ?, duration_minutes = ? WHERE id = ?',
        [name, description, price, duration_minutes, id]
    );
};

module.exports = {
    getAllServices,
    createService,
    deleteService,
    updateService
};
