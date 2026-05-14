import axios from 'axios';

export const apiUserOrder = axios.create({
  baseURL: import.meta.env.VITE_API_USER_ORDER,
});

export const apiWorkerService = axios.create({
  baseURL: import.meta.env.VITE_API_WORKER_SERVICE,
});