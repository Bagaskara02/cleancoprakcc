require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orderHistoryRoutes = require('./routes/orderHistoryRoutes');

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
// PENGGUNAAN ROUTES
// ==========================================

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/order-history', orderHistoryRoutes);

// ==========================================
// START SERVER
// ==========================================
// Service User & Order berjalan di PORT 3001
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Service User & Order running on port ${port}`));