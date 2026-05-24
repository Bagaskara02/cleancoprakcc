import axios from 'axios';

// Ganti URL di bawah dengan URL Cloud Run backend Anda
const API_USER_ORDER_URL = 'https://be-user-cleanco-739468618342.us-central1.run.app';
const API_WORKER_SERVICE_URL = 'https://be-admin-cleanco-739468618342.us-central1.run.app';

export const apiUserOrder = axios.create({
  baseURL: `${API_USER_ORDER_URL}/api/v1`,
});

export const apiWorkerService = axios.create({
  baseURL: `${API_WORKER_SERVICE_URL}/api/v2`,
});
