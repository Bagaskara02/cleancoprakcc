import axios from 'axios';

// TODO: Ganti URL di bawah dengan URL Cloud Run backend Anda setelah di-deploy
const API_USER_ORDER_URL = 'https://be-user-cleanco-739468618342.us-central1.run.app'; // Contoh: 'https://service-user-order-xxxx-et.a.run.app'
const API_WORKER_SERVICE_URL = 'https://be-admin-cleanco-739468618342.us-central1.run.app'; // Contoh: 'https://service-worker-xxxx-et.a.run.app'

export const apiUserOrder = axios.create({
  baseURL: API_USER_ORDER_URL,
});

export const apiWorkerService = axios.create({
  baseURL: API_WORKER_SERVICE_URL,
});
