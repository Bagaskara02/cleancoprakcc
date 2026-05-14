-- Schema Database SQL untuk Proyek Cleanco
-- Target Deploy: Google Cloud SQL (MySQL)

CREATE DATABASE IF NOT EXISTS cleanco_db;
USE cleanco_db;

-- 1. Tabel users (Pelanggan)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel workers (Petugas Kebersihan)
CREATE TABLE IF NOT EXISTS workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status ENUM('available', 'busy', 'offline') DEFAULT 'offline',
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel services (Layanan Kebersihan)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabel orders (Pesanan)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    worker_id INT DEFAULT NULL,
    service_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    scheduled_at DATETIME NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    address_detail TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- 5. Tabel payments (Pembayaran)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    proof_url TEXT, -- URL gambar bukti bayar ke Cloud Storage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 6. Tabel reviews (Ulasan & Rating)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    worker_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Insert Data Dummy Awal
INSERT INTO services (name, description, price, duration_minutes) VALUES 
('Basic Cleaning', 'Pembersihan standar harian (sapu, pel, debu)', 150000.00, 120),
('Deep Cleaning', 'Pembersihan menyeluruh termasuk noda membandel', 300000.00, 240),
('AC Cleaning', 'Pembersihan dan cuci AC split', 75000.00, 60);

-- Insert Data User & Worker Dummy (Password di-hash nantinya)
INSERT INTO users (name, email, password, phone, address) VALUES 
('Budi Santoso', 'budi@example.com', 'hashed_pwd_here', '08123456789', 'Jl. Merdeka No. 1, Jakarta');

INSERT INTO workers (name, email, password, phone, status) VALUES 
('Siti Aminah', 'siti@cleanco.com', 'hashed_pwd_here', '08987654321', 'available');

-- Insert Data Order Dummy
INSERT INTO orders (user_id, worker_id, service_id, status, scheduled_at, total_price, address_detail) VALUES 
(1, 1, 1, 'completed', '2026-05-15 10:00:00', 150000.00, 'Jl. Merdeka No. 1, Jakarta');
