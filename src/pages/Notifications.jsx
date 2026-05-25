import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';
import { Bell } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    apiUserOrder.get(`/api/v1/notifications/${userId}`).then(res => {
      setNotifications(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal mengambil notifikasi:", err);
      setNotifications([]);
      setLoading(false);
    });
  }, [userId]);

  if (!userId) {
    return (
      <div className='notifications-page'>
        <h1><Bell size={24} /> Notifikasi</h1>
        <div className='empty-state'>Anda belum login.</div>
      </div>
    );
  }

  return (
    <div className='notifications-page'>
      <h1><Bell size={24} /> Notifikasi Saya</h1>

      {loading ? (
        <div className='loading-spinner'>Memuat...</div>
      ) : notifications.length === 0 ? (
        <div className='empty-state'>Belum ada notifikasi.</div>
      ) : (
        <div className='notifications-card'>
          {notifications.map((notif, idx) => (
            <div key={idx} className={`notif-item ${notif.isRead ? '' : 'unread'}`}>
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <span className='notif-time'>
                {new Date(notif.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
