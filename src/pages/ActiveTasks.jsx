import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Briefcase, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ActiveTasks() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = workerData.id || 1;

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  const fetchActiveTasks = async () => {
    try {
      const res = await apiUserOrder.get('/api/v1/orders');
      // Filter tasks assigned to this worker that are NOT completed and NOT cancelled
      const active = res.data.filter(
        o => o.worker_id === WORKER_ID && o.status !== 'completed' && o.status !== 'cancelled'
      );
      // Sort priority: 'in_progress' first, then scheduled_at ascending
      active.sort((a, b) => {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
        return new Date(a.scheduled_at) - new Date(b.scheduled_at);
      });
      setActiveTasks(active);
    } catch (error) {
      console.error("Gagal mengambil tugas aktif:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-primary-bg border-primary-light/20 text-primary border-t-primary';
      case 'on_the_way':
        return 'bg-orange-50 border-orange-100 text-orange border-t-orange';
      case 'arrived':
        return 'bg-teal/5 border-teal/10 text-teal border-t-teal';
      default:
        return 'bg-warning/5 border-warning/15 text-warning border-t-warning';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-10 w-full max-w-full overflow-hidden">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-text flex items-center gap-2">
            <ClipboardList size={22} className="text-primary" />
            Kumpulan Tugas Aktif
          </h2>
          <p className="text-text-muted text-sm font-semibold">Seluruh pekerjaan berjalan atau dijadwalkan untuk Anda.</p>
        </div>

        {/* Task Counter Badge */}
        <span className="bg-primary-bg text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary-light/10">
          {activeTasks.length} Tugas Sedang Aktif
        </span>
      </div>

      {/* Grid List of Cards */}
      {activeTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border-custom shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-text-muted mx-auto mb-4">
            <ClipboardList size={24} className="opacity-50" />
          </div>
          <h4 className="font-extrabold text-text text-base">Tidak ada tugas aktif</h4>
          <p className="text-xs text-text-muted font-semibold mt-1">Anda sudah menyelesaikan semua tugas saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full">
          {activeTasks.map((order) => {
            const statusStyle = getStatusStyles(order.status);
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden border-t-4 flex flex-col justify-between ${statusStyle} hover:shadow-md transition-shadow`}
              >
                
                {/* Header details inside card */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Order #{order.id}</span>
                      <h3 className="font-extrabold text-text text-base leading-none truncate">
                        {order.service_name || `Layanan ID #${order.service_id}`}
                      </h3>
                    </div>
                    
                    {/* Status badge */}
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border border-current/25 bg-current/5">
                      {order.status === 'in_progress' ? 'Dikerjakan' : order.status}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="space-y-2 text-xs font-semibold text-text-secondary">
                    
                    {/* Customer */}
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0">
                        {order.user_name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <span className="truncate">Pelanggan: <strong className="text-text">{order.user_name || 'Pelanggan'}</strong></span>
                    </div>

                    {/* Schedule date */}
                    <div className="flex items-center gap-2.5">
                      <Calendar size={13} className="text-text-muted shrink-0" />
                      <span>{formatDate(order.scheduled_at)}</span>
                    </div>

                    {/* Schedule time */}
                    <div className="flex items-center gap-2.5">
                      <Clock size={13} className="text-text-muted shrink-0" />
                      <span>{formatTime(order.scheduled_at)}</span>
                    </div>

                    {/* Address details */}
                    <div className="flex items-start gap-2.5 leading-normal pt-1">
                      <MapPin size={13} className="text-text-muted mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{order.address_detail}</span>
                    </div>

                  </div>
                </div>

                {/* Footer button inside card */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-border-custom flex justify-end shrink-0">
                  <button 
                    onClick={() => navigate(`/order/${order.id}`, { state: { order } })}
                    className="flex items-center gap-1.5 text-xs font-extrabold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    Buka Detail Tugas
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
