import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder, apiWorkerService } from '../services/api';

export default function Payment() {
  // Dalam skenario asli, orderId dikirim via route /payment/:orderId
  // Untuk MVP ini kita terima dari state atau set dummy
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank BCA');
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!order) {
      alert("Tidak ada pesanan yang dipilih untuk dibayar.");
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
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Pesanan tidak ditemukan.</h2>
        <button onClick={() => navigate('/orders')} style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Kembali ke Riwayat Pesanan
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Selesaikan Pembayaran</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
        <p style={{ margin: '0 0 5px 0' }}>Order ID: #{order.id}</p>
        <p style={{ margin: '0 0 5px 0' }}>Layanan: {order.service_name || 'Layanan Kebersihan'}</p>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '18px', color: '#0ea5e9' }}>
          Total Tagihan: Rp {parseFloat(order.total_price).toLocaleString('id-ID')}
        </p>
      </div>

      <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Metode Pembayaran</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Transfer Bank BCA">Transfer Bank BCA</option>
            <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
            <option value="GoPay">GoPay</option>
            <option value="OVO">OVO</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Upload Bukti Transfer (Dari Galeri)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
          />
        </div>
        <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: loading ? '#94a3b8' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
        </button>
      </form>
    </div>
  );
}
