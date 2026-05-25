import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Snowflake, 
  Sparkles, 
  Flame, 
  Bookmark,
  Calendar,
  ArrowUpDown
} from 'lucide-react';

export default function History() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = workerData.id || 1;

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const res = await apiUserOrder.get('/api/v1/orders');
      // Filter completed orders for this worker
      const filtered = res.data.filter(o => o.worker_id === WORKER_ID && o.status === 'completed');
      setCompletedOrders(filtered);
    } catch (error) {
      console.error("Gagal mengambil riwayat order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const todayStr = new Date().toDateString();
  const completedToday = completedOrders.filter(o => new Date(o.scheduled_at).toDateString() === todayStr);
  const earningsToday = completedToday.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const countToday = completedToday.length;

  // Icon & color mapper for service
  const getServiceStyles = (serviceName) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('ac')) {
      return {
        icon: Snowflake,
        bg: 'bg-teal/10 text-teal border-teal/15'
      };
    }
    if (name.includes('cleaning') || name.includes('bersih') || name.includes('ruang tamu')) {
      return {
        icon: Sparkles,
        bg: 'bg-primary/10 text-primary border-primary/15'
      };
    }
    if (name.includes('setrika') || name.includes('pakaian')) {
      return {
        icon: Flame,
        bg: 'bg-warning/10 text-warning border-warning/15'
      };
    }
    return {
      icon: Bookmark,
      bg: 'bg-slate-100 text-slate-500 border-slate-200'
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sortedOrders = [...completedOrders].sort((a, b) => {
    const dateA = new Date(a.scheduled_at);
    const dateB = new Date(b.scheduled_at);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-text">Riwayat & Pendapatan</h2>
        <p className="text-text-muted text-sm font-semibold">Ringkasan aktivitas hari ini</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Pendapatan Hari Ini */}
        <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary-bg flex items-center justify-center text-primary shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-muted block uppercase tracking-wider mb-0.5">Pendapatan Hari Ini</span>
              <span className="text-2xl font-extrabold text-text block">
                {formatPrice(earningsToday)}
              </span>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-primary/5 rounded-l-full pointer-events-none"></div>
        </div>

        {/* Card 2: Total Tugas Selesai */}
        <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center text-teal shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-muted block uppercase tracking-wider mb-0.5">Total Tugas Selesai</span>
              <span className="text-2xl font-extrabold text-text block">
                {countToday} Tugas
              </span>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-teal/5 rounded-l-full pointer-events-none"></div>
        </div>

      </div>

      {/* History List Table / Card */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
        
        <div className="px-6 py-5 border-b border-border-custom flex justify-between items-center">
          <h3 className="font-extrabold text-text text-base">Riwayat Pekerjaan</h3>
          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-border-light"
          >
            <ArrowUpDown size={14} />
            {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
          </button>
        </div>

        <div className="overflow-x-auto">
          {completedOrders.length === 0 ? (
            <div className="text-center py-12 px-6">
              <CheckCircle2 size={40} className="mx-auto text-text-muted mb-3 opacity-30" />
              <p className="text-text-muted text-sm font-semibold">Belum ada riwayat pekerjaan selesai.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-border-custom text-xs font-bold text-text-muted uppercase tracking-wider">
                  <th className="px-6 py-4">Layanan</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {sortedOrders.map((order) => {
                  const style = getServiceStyles(order.service_name);
                  const Icon = style.icon;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm font-semibold text-text">
                      {/* Service Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <span className="font-extrabold text-text block">{order.service_name || `Layanan ID #${order.service_id}`}</span>
                            <span className="text-[10px] text-text-muted block font-bold uppercase mt-0.5">Order #{order.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Time Column */}
                      <td className="px-6 py-4 text-text-secondary">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Clock size={12} className="text-text-muted" />
                            {formatTime(order.scheduled_at)}
                          </div>
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <Calendar size={12} className="text-text-muted" />
                            {formatDate(order.scheduled_at)}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge Column */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal/10 text-teal border border-teal/20">
                          Selesai
                        </span>
                      </td>

                      {/* Earnings Column */}
                      <td className="px-6 py-4 text-right font-extrabold text-teal">
                        {formatPrice(order.total_price || 150000)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
