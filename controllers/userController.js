const userModel = require('../models/userModel');

const getUsers = async (req, res) => {
    try {
        const rows = await userModel.getAllUsers();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data users', detail: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const row = await userModel.getUserById(req.params.id);
        if (!row) return res.status(404).json({ error: 'User tidak ditemukan' });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data user', detail: error.message });
    }
};

const addUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        await userModel.createUser(name, email, password, phone, address);
        res.json({ message: "User berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat user', detail: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    addUser
};
