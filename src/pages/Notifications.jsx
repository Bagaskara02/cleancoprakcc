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
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Notifikasi</h2>
        <p>Anda belum login.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Bell size={24} /> Notifikasi Saya
      </h2>
      
      {loading ? (
        <p>Memuat notifikasi...</p>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ color: '#64748b' }}>Belum ada notifikasi baru.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.map((notif, idx) => (
            <div key={idx} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: notif.isRead ? '#f8fafc' : '#f0f9ff', borderLeft: notif.isRead ? '1px solid #eee' : '4px solid #0ea5e9' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>{notif.title}</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{notif.message}</p>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {new Date(notif.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
