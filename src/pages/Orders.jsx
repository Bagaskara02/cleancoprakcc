import React, { useEffect, useState } from 'react';
import { apiUserOrder } from '../services/api';
import { Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
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

  const handleOpenReview = (order) => {
    setSelectedOrder(order);
    setReviewData({ rating: 5, comment: '' });
    setReviewModalOpen(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await apiUserOrder.post('/api/v1/reviews', {
        orderId: selectedOrder.id,
        workerId: selectedOrder.worker_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      alert('Terima kasih atas ulasan Anda!');
      setReviewModalOpen(false);
      // Optional: refresh orders or just assume it's done
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim ulasan.');
    }
  };

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
                  {order.status === 'completed' && (
                    <button 
                      onClick={() => handleOpenReview(order)}
                      style={{ padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Beri Ulasan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Review */}
      {reviewModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Beri Ulasan untuk Pekerja</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>{selectedOrder.service_name}</p>
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Rating (1-5)</label>
                <select 
                  value={reviewData.rating} 
                  onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Sangat Baik)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Baik)</option>
                  <option value={3}>⭐⭐⭐ (3 - Cukup)</option>
                  <option value={2}>⭐⭐ (2 - Kurang)</option>
                  <option value={1}>⭐ (1 - Buruk)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Komentar</label>
                <textarea 
                  required
                  value={reviewData.comment} 
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                  placeholder="Pekerjaannya sangat bersih dan cepat..."
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setReviewModalOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Kirim Ulasan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
