require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

console.log("=== CEK ENV ===");
console.log("User:", process.env.DB_USER);
console.log("Pass:", process.env.DB_PASSWORD);
console.log("Name:", process.env.DB_NAME);
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("===============");

// ==========================================
// ENDPOINT USERS
// ==========================================
app.get('/api/v1/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data users', detail: error.message });
    }
});

app.post('/api/v1/users', async (req, res) => {
    try {
        const { name, email, role } = req.body;
        await db.query('INSERT INTO users (name, email, role) VALUES (?, ?, ?)', [name, email, role || 'customer']);
        res.json({ message: "User berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat user', detail: error.message });
    }
});

// ==========================================
// ENDPOINT ORDERS
// ==========================================
app.get('/api/v1/orders', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM orders');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data orders', detail: error.message });
    }
});

app.post('/api/v1/orders', async (req, res) => {
    try {
        const { user_id, service_id } = req.body;
        // Pastikan tabel orders memiliki kolom user_id dan service_id sesuai database_schema.sql
        await db.query('INSERT INTO orders (user_id, service_id, status) VALUES (?, ?, ?)', [user_id, service_id, 'Pending']);
        res.json({ message: "Order berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat order', detail: error.message });
    }
});

// ==========================================
// START SERVER
// ==========================================
// Service User & Order berjalan di PORT 3001
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Service User & Order running on port ${port}`));