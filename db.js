const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  // Tambahkan .trim() di sini untuk membuang karakter gaib dari file .env
  user: process.env.DB_USER.trim(),
  password: process.env.DB_PASSWORD.trim(),
  database: process.env.DB_NAME.trim(),
};

if (process.env.INSTANCE_CONNECTION_NAME) {
  dbConfig.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME.trim()}`;
} else {
  // Tambahkan .trim() juga di DB_HOST
  dbConfig.host = (process.env.DB_HOST || '127.0.0.1').trim();
  dbConfig.port = process.env.DB_PORT || 3306;
  dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);
module.exports = pool.promise();