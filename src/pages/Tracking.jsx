import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { Clock, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function Tracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) {
      navigate('/orders');
      return;
    }

    const fetchData = async () => {
      try {
        // Ambil log history (termasuk foto sebelum-sesudah)
        const histRes = await apiUserOrder.get(`/api/v1/order-history/${order.id}`);
        setHistoryLogs(histRes.data);
      } catch (err) {
        console.log("Riwayat status belum tersedia", err);
      }

      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh tiap 5 detik
    return () => clearInterval(interval);
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className='tracking-page'>
      <button className='btn-back-circle' onClick={() => navigate('/orders')}>
        <ArrowLeft size={20} />
      </button>
      <h1>Pantau Pesanan #{order.id}</h1>

      {loading ? (
        <div className='loading-spinner'>Memuat data...</div>
      ) : (
        <div className='tracking-card'>
          <div className='tracking-header'>
            <Clock size={20} color='#22c55e' />
            <h3>Log Waktu &amp; Aktivitas</h3>
          </div>

          {historyLogs.length === 0 ? (
            <div className='empty-state'>
              Belum ada riwayat aktivitas untuk pesanan ini.
            </div>
          ) : (
            <div className='timeline'>
              {historyLogs.map((log, idx) => (
                <div key={idx} className='timeline-item'>
                  <div className='timeline-top'>
                    <span className='timeline-status'>{log.status}</span>
                    <span className='timeline-time'>
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>

                  {log.note && <p className='timeline-note'>{log.note}</p>}

                  {log.photo_url && (
                    <img
                      src={log.photo_url}
                      alt='Bukti'
                      className='timeline-photo'
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
