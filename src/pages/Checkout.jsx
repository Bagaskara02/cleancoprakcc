import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { service } = location.state || {};
  
  const [scheduledAt, setScheduledAt] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect ke home jika tidak ada service yang dipilih
    if (!service) {
      navigate('/');
    }
  }, [service, navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Silakan login terlebih dahulu!");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: userId,
        service_id: service.id,
        scheduled_at: new Date(scheduledAt).toISOString().slice(0, 19).replace('T', ' '), // format YYYY-MM-DD HH:MM:SS
        total_price: service.price,
        address_detail: addressDetail
      };

      // Buat pesanan
      const response = await apiUserOrder.post('/api/v1/orders', orderData);
      
      alert('Pesanan berhasil dibuat!');
      // TODO: Harusnya diarahkan ke Payment dengan ID order yang valid, 
      // tapi karena API addOrder belum mereturn ID order yang baru, kita asumsikan saja diarahkan ke riwayat pesanan
      navigate('/orders');
      
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      alert('Terjadi kesalahan saat membuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Checkout Pemesanan</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{service.name}</h3>
        <p style={{ margin: '0 0 5px 0' }}>Durasi: {service.duration_minutes} Menit</p>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '18px', color: '#0ea5e9' }}>
          Total: Rp {service.price.toLocaleString('id-ID')}
        </p>
      </div>

      <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Jadwal Pembersihan (Tanggal & Waktu)</label>
          <input 
            type="datetime-local" 
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Detail Alamat</label>
          <textarea 
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            required
            placeholder="Contoh: Jl. Merdeka No.1, Blok C, Warna Pagar Biru"
          ></textarea>
        </div>
        <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: loading ? '#94a3b8' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? 'Memproses...' : 'Buat Pesanan'}
        </button>
      </form>
    </div>
  );
}
