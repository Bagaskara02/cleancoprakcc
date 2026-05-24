import axios from 'axios';

// Gunakan URL Cloud Run backend. 
// Worker app berinteraksi dengan API service-user-order (untuk ambil order) 
// dan service-worker (untuk update foto/tracking).
const API_USER_ORDER_URL = 'https://be-user-cleanco-739468618342.us-central1.run.app';
const API_WORKER_SERVICE_URL = 'https://be-admin-cleanco-739468618342.us-central1.run.app';

export const apiUserOrder = axios.create({
  baseURL: API_USER_ORDER_URL,
});

export const apiWorkerService = axios.create({
  baseURL: API_WORKER_SERVICE_URL,
});
