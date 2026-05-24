const userModel = require('../models/userModel');
const crypto = require('crypto');

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
        
        // Hashing password dengan SHA256
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        await userModel.createUser(name, email, hashedPassword, phone, address);
        res.json({ message: "User berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat user', detail: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Cek apakah user dengan email tersebut ada
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        // Cek kecocokan password dengan hashing SHA256
        const hashedInputPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (user.password !== hashedInputPassword) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        // Login sukses, kirim data user tanpa password
        const { password: _, ...userData } = user;
        res.json({ 
            message: 'Login berhasil', 
            user: userData 
        });

    } catch (error) {
        res.status(500).json({ error: 'Gagal melakukan login', detail: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    addUser,
    loginUser
};
