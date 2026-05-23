import axios from 'axios';

// TODO: Ganti URL di bawah dengan URL Cloud Run backend Anda setelah di-deploy
const API_USER_ORDER_URL = 'http://localhost:3001'; // Contoh: 'https://service-user-order-xxxx-et.a.run.app'
const API_WORKER_SERVICE_URL = 'http://localhost:3002'; // Contoh: 'https://service-worker-xxxx-et.a.run.app'

export const apiUserOrder = axios.create({
  baseURL: API_USER_ORDER_URL,
});

export const apiWorkerService = axios.create({
  baseURL: API_WORKER_SERVICE_URL,
});