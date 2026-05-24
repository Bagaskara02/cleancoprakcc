const admin = require('firebase-admin');
const path = require('path');

// Mengarahkan ke file kredensial JSON yang akan Anda download dari GCP
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
const fs = require('fs');

try {
  let credential;
  // Cek apakah file json ada (untuk local development)
  if (fs.existsSync(serviceAccountPath)) {
    credential = admin.credential.cert(require(serviceAccountPath));
    console.log("Menggunakan file firebase-service-account.json untuk kredensial.");
  } else {
    // Fallback menggunakan Application Default Credentials (ADC) untuk GCP Cloud Run
    credential = admin.credential.applicationDefault();
    console.log("File JSON tidak ditemukan. Menggunakan Application Default Credentials (ADC) Cloud Run.");
  }

  admin.initializeApp({
    credential: credential,
    projectId: process.env.PROJECT_ID || 'cleanco-739468618342'
  });
  console.log("Firestore berhasil terkoneksi di Service User Order!");
} catch (error) {
  console.error("Gagal terhubung ke Firestore:", error.message);
}

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore('cleanco-firestore');
module.exports = db;
