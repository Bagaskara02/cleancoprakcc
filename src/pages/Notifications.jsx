import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';
import { Bell, ArrowLeft, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const workerId = workerData.id;

  useEffect(() => {
    if (!workerId) {
      setLoading(false);
      return;
    }

    apiUserOrder.get(`/api/v1/notifications/worker_${workerId}`)
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil notifikasi:", err);
        setNotifications([]);
        setLoading(false);
      });
  }, [workerId]);

  if (!workerId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-text">Notifikasi Pekerja</h2>
        <p className="text-text-muted text-sm mt-1">Anda belum login.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      {/* Title Header with Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="text-text-secondary hover:text-text p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-extrabold text-text flex items-center gap-2">
          <Bell size={20} className="text-primary" /> Notifikasi Pekerja
        </h2>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-border-custom shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-text-muted mx-auto mb-4">
            <Bell size={24} className="opacity-50" />
          </div>
          <h4 className="font-extrabold text-text text-base">Belum ada notifikasi</h4>
          <p className="text-xs text-text-muted font-semibold mt-1">Anda akan menerima notifikasi jika ada pembaruan pekerjaan baru.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border transition-all shadow-sm ${
                notif.isRead 
                  ? 'bg-white border-border-custom' 
                  : 'bg-primary/5 border-l-4 border-l-primary border-primary-light/10 border-border-custom'
              }`}
            >
              <div className="flex gap-3.5 items-start">
                {/* Icon indicator */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-100 text-text-muted' : 'bg-primary-bg-deep text-primary'}`}>
                  <Info size={16} />
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-text text-sm leading-tight">{notif.title}</h4>
                  <p className="text-xs font-semibold text-text-secondary leading-relaxed">{notif.message}</p>
                  
                  <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 pt-1.5">
                    <Calendar size={10} />
                    {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
