import React, { useEffect, useState } from 'react';
import { apiUserOrder } from '../services/api';
import { Clock, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [activeTab, setActiveTab] = useState('active');
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
        userId: userId,
        workerId: selectedOrder.worker_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      alert('Terima kasih atas ulasan Anda!');
      setReviewModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim ulasan.');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'MENUNGGU PEMBAYARAN';
      case 'paid': return 'SUDAH DIBAYAR';
      case 'accepted': return 'DIKONFIRMASI';
      case 'in_progress': return 'SEDANG DIKERJAKAN';
      case 'completed': return 'SELESAI';
      case 'cancelled': return 'DIBATALKAN';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'active') {
      return ['pending', 'accepted', 'in_progress', 'paid'].includes(order.status);
    }
    return ['completed', 'cancelled'].includes(order.status);
  });

  if (!userId) {
    return (
      <div className='orders-page'>
        <h1>Pesanan Saya</h1>
        <p>Anda belum login. Silakan <Link to="/login">login di sini</Link> untuk melihat riwayat pesanan Anda.</p>
      </div>
    );
  }

  return (
    <div className='orders-page'>
      <h1>Pesanan Saya</h1>
      <p>Lacak status layanan pembersihan Anda saat ini dan riwayat sebelumnya.</p>

      <div className='orders-tabs'>
        <button className={`orders-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Pesanan Aktif</button>
        <button className={`orders-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Riwayat Selesai</button>
      </div>

      {loading ? (
        <p>Memuat pesanan...</p>
      ) : (
        <div className='orders-list'>
          {filteredOrders.length === 0 && (
            <p>Tidak ada pesanan untuk ditampilkan.</p>
          )}
          {filteredOrders.map(order => (
            <div key={order.id} className='order-card'>
              <div className='order-card-header'>
                <div className='order-card-header-left'>
                  <span className={`status-badge ${order.status}`}>{getStatusLabel(order.status)}</span>
                  <h3>{order.service_name || 'Layanan Kebersihan'}</h3>
                  <span className='order-id'>Order ID: #CLN-{order.id}</span>
                </div>
                <span className='order-price'>Rp {parseFloat(order.total_price).toLocaleString('id-ID')}</span>
              </div>

              <div className='order-schedule'>
                <span className='order-schedule-icon'><Clock size={18}/></span>
                <div className='order-schedule-text'>
                  <h5>{new Date(order.scheduled_at).toLocaleDateString('id-ID')}</h5>
                  <p>{new Date(order.scheduled_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
              </div>

              <div className='order-card-footer'>
                <div className='order-worker-info'>
                  {order.worker_name && (
                    <>
                      <div className='worker-avatar'>{order.worker_name?.charAt(0)}</div>
                      <div className='worker-details'>
                        <h5>{order.worker_name}</h5>
                      </div>
                    </>
                  )}
                </div>
                <div className='order-actions'>
                  {order.status === 'pending' && <button className='btn-pay-now' onClick={() => navigate('/payment', { state: { order } })}>Bayar Sekarang</button>}
                  {order.status !== 'pending' && order.status !== 'cancelled' && <button className='btn-track' onClick={() => navigate('/tracking', { state: { order } })}>Pantau</button>}
                  <button className='btn-chat' onClick={() => navigate('/chat', { state: { order } })}>💬 Chat Pekerja</button>
                  {order.status === 'completed' && <button className='btn-review' onClick={() => handleOpenReview(order)}>Beri Ulasan</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Review */}
      {reviewModalOpen && selectedOrder && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h3>Beri Ulasan untuk Pekerja</h3>
            <p className='modal-subtitle'>{selectedOrder.service_name}</p>
            <form className='modal-form' onSubmit={submitReview}>
              <div>
                <label>Rating (1-5)</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Sangat Baik)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Baik)</option>
                  <option value={3}>⭐⭐⭐ (3 - Cukup)</option>
                  <option value={2}>⭐⭐ (2 - Kurang)</option>
                  <option value={1}>⭐ (1 - Buruk)</option>
                </select>
              </div>
              <div>
                <label>Komentar</label>
                <textarea
                  required
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Pekerjaannya sangat bersih dan cepat..."
                ></textarea>
              </div>
              <div className='modal-actions'>
                <button type="button" className='btn-cancel' onClick={() => setReviewModalOpen(false)}>Batal</button>
                <button type="submit" className='btn-submit'>Kirim Ulasan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
