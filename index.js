require('dotenv').config();
const express = require('express');
const cors = require('cors');

const serviceRoutes = require('./routes/serviceRoutes');
const workerRoutes = require('./routes/workerRoutes');
const photoRoutes = require('./routes/photoRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

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

app.use('/api/v2/services', serviceRoutes);
app.use('/api/v2/workers', workerRoutes);
app.use('/api/v2/photos', photoRoutes);
app.use('/api/v2/tracking', trackingRoutes);
app.use('/api/v2/gallery', galleryRoutes);

// ==========================================
// START SERVER
// ==========================================

// Gunakan port dari environment (Cloud Run) atau default 3002 (Lokal)
const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Service Worker & Upload running on port ${port}`));