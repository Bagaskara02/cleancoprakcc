import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder, apiWorkerService } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!order) {
      alert("Tidak ada pesanan yang dipilih untuk dibayar.");
      return;
    }

    if (!proofFile) {
      alert("Harap upload bukti pembayaran terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      let uploadedProofUrl = 'https://example.com/dummy-proof.jpg';

      // Upload file jika ada
      if (proofFile) {
        const formData = new FormData();
        formData.append('photo', proofFile);
        const uploadRes = await apiWorkerService.post('/api/v2/photos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedProofUrl = uploadRes.data.url;
      }

      // POST ke /api/v1/payments
      await apiUserOrder.post('/api/v1/payments', {
        order_id: order.id,
        amount: order.total_price,
        payment_method: paymentMethod,
        proof_url: uploadedProofUrl
      });

      // Kirim notifikasi
      const userId = localStorage.getItem('userId');
      if (userId) {
        await apiUserOrder.post('/api/v1/notifications', {
          userId: userId,
          title: 'Pembayaran Diterima',
          message: 'berhasil mengupload bukti pembayaran harap tunggu verifikasi dari admin'
        });
      }

      alert('Pembayaran berhasil tunggu verifikasi dari admin');
      navigate('/orders');
    } catch (err) {
      console.error("Gagal melakukan pembayaran:", err);
      alert('Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <div className='payment-page payment-empty'>
        <h2>Pesanan tidak ditemukan.</h2>
        <button className='btn-back-orders' onClick={() => navigate('/orders')}>
          Kembali ke Riwayat Pesanan
        </button>
      </div>
    );
  }

  return (
    <div className='payment-page'>
      <button className='btn-back-circle' onClick={() => navigate('/orders')}>
        <ArrowLeft size={20} />
      </button>
      <h1>Selesaikan Pembayaran</h1>
      <div className='payment-card'>
        <div className='payment-info'>
          <p>Order ID: #{order.id}</p>
          <p>Layanan: {order.service_name || 'Layanan Kebersihan'}</p>
          <p className='payment-total'>Total: Rp {parseFloat(order.total_price).toLocaleString('id-ID')}</p>
        </div>
        <form className='payment-form' onSubmit={handlePayment}>
          <div>
            <label>Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Transfer Bank BCA">Transfer Bank BCA</option>
              <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
              <option value="GoPay">GoPay</option>
              <option value="OVO">OVO</option>
            </select>
          </div>
          <div>
            <label>Upload Bukti Transfer <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          {previewUrl && (
            <div className='payment-proof-preview' style={{ margin: '15px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Pratinjau Bukti Transfer:</p>
              <div style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: '2px dashed #cbd5e1', padding: '4px' }}>
                <img
                  src={previewUrl}
                  alt="Pratinjau Bukti"
                  style={{ maxWidth: '100%', maxHeight: '180px', display: 'block', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}
          <button type="submit" className='btn-confirm-pay' disabled={loading}>
            {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  );
}
