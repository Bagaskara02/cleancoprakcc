import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';
import { Bell, ArrowLeft } from 'lucide-react';
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

    // Ambil dengan prefix worker_
    apiUserOrder.get(`/api/v1/notifications/worker_${workerId}`).then(res => {
      setNotifications(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal mengambil notifikasi:", err);
      setNotifications([]);
      setLoading(false);
    });
  }, [workerId]);

  if (!workerId) {
    return (
      <div className="text-center mt-10">
        <h2>Notifikasi Pekerja</h2>
        <p>Anda belum login.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell size={24} className="text-blue-500" /> Notifikasi Pekerja
        </h1>
      </div>
      
      {loading ? (
        <p className="text-center text-gray-500">Memuat notifikasi...</p>
      ) : notifications.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500">Belum ada notifikasi pekerjaan baru.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${notif.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-l-4 border-l-blue-500 border-blue-100'}`}>
              <h4 className="font-bold text-gray-800 mb-1">{notif.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(notif.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
