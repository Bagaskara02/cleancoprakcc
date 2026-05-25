import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';
import { ShoppingBag, Wallet, RefreshCw, ArrowUpRight, TrendingUp } from 'lucide-react';

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
    <div className="space-y-8 font-sans">
      {/* Header and Subtitle */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1.5">Ringkasan aktivitas operasional CleanCo hari ini</p>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Pesanan Masuk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-start shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block">
              Total Pesanan Masuk
            </span>
            <span className="text-4xl font-extrabold text-gray-800 block">
              {stats.totalOrders}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
            <ShoppingBag size={22} />
          </div>
        </div>
        
        {/* Card 2: Total Pendapatan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-start shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block">
              Total Pendapatan
            </span>
            <span className="text-3xl font-extrabold text-gray-800 block">
              Rp {stats.totalRevenue.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 shadow-inner">
            <Wallet size={22} />
          </div>
        </div>
        
        {/* Card 3: Pekerjaan Berjalan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-between items-start shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block">
              Pekerjaan Berjalan
            </span>
            <span className="text-4xl font-extrabold text-gray-800 block">
              {stats.activeJobs}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
            <RefreshCw size={22} className="animate-spin-slow" />
          </div>
        </div>
      </div>
    </div>
  );
}