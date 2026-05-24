import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, activeJobs: 0 });

  useEffect(() => {
    // Ambil data orders untuk menghitung summary (Dalam produksi sebaiknya ada endpoint khusus /stats)
    apiUserOrder.get('/orders').then(res => {
      const orders = res.data;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
      const activeJobs = orders.filter(o => o.status === 'in_progress').length;
      
      setStats({ totalOrders, totalRevenue, activeJobs });
    }).catch(err => console.error("Gagal memuat statistik", err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Monitoring</h2>
      <p className="text-gray-500">Ringkasan aktivitas operasional CleanCo hari ini.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Pesanan Masuk</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Pendapatan</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Pekerjaan Berjalan (In Progress)</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeJobs}</p>
        </div>
      </div>
    </div>
  );
}