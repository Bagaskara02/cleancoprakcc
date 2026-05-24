import React, { useEffect, useState } from 'react';
import { apiUserOrder } from '../services/api';
import { Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Ambil userId dari localStorage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    apiUserOrder.get(`/api/v1/orders/user/${userId}`).then(res => {
      setOrders(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal mengambil pesanan:", err);
      setOrders([]);
      setLoading(false);
    });
  }, [userId]);

  if (!userId) {
    return (
      <div className="orders-container">
        <h2>Riwayat Pesanan Saya</h2>
        <p>Anda belum login. Silakan <Link to="/login" style={{ color: '#0ea5e9' }}>login di sini</Link> untuk melihat riwayat pesanan Anda.</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Riwayat Pesanan Saya</h2>
      {loading ? (
        <p>Memuat pesanan...</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>{order.service_name || 'Layanan Kebersihan'}</h3>
                <span className={`badge ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-details">
                <p><Clock size={14}/> {new Date(order.scheduled_at).toLocaleString('id-ID')}</p>
                <p className="price">Total: Rp {parseFloat(order.total_price).toLocaleString('id-ID')}</p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => navigate('/payment', { state: { order } })}
                      style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Bayar Sekarang
                    </button>
                  )}
                  
                  {order.status !== 'pending' && order.status !== 'cancelled' && (
                    <button 
                      onClick={() => navigate('/tracking', { state: { order } })}
                      style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Pantau Pekerjaan
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate('/chat', { state: { order } })}
                    style={{ padding: '8px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Chat Pekerja
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
