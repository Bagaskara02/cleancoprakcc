const admin = require('firebase-admin');
const path = require('path');

// Mengarahkan ke file kredensial JSON yang akan Anda download dari GCP
// Ganti nama file json di bawah ini dengan nama file yang asli nanti.
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
    projectId: process.env.PROJECT_ID || 'd-08-497210',
    storageBucket: process.env.STORAGE_BUCKET || 'd-08-497210.appspot.com'
  });
  console.log("Firestore & Storage berhasil terkoneksi!");
} catch (error) {
  console.error("Gagal terhubung ke Firestore:", error.message);
}

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore('cleanco-firestore');
module.exports = db;
