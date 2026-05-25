import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { service } = location.state || {};

  const [scheduledAt, setScheduledAt] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Redirect ke home jika tidak ada service yang dipilih
    if (!service) {
      navigate('/');
    }
  }, [service, navigate]);

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
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
        total_price: parseFloat(service.price),
        address_detail: addressDetail
      };

      // Buat pesanan
      const response = await apiUserOrder.post('/api/v1/orders', orderData);

      // Kirim notifikasi
      await apiUserOrder.post('/api/v1/notifications', {
        userId: userId,
        title: 'Pesanan Baru',
        message: 'berhasil membuat pesanan lanjutkan pembayaran'
      });

      alert('pesanan telah dibuat lanjutkan pembayaran');
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
    <div className='booking-page'>
      <div className='booking-header'>
        <button className='booking-back' onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <span className='booking-brand'>CleanCo</span>
      </div>

      <div className='booking-content'>
        <div className='booking-main'>
          {/* Stepper */}
          <div className='stepper'>
            <div 
              className='step' 
              onClick={() => setStep(1)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`step-circle ${step >= 1 ? 'active' : 'inactive'}`}>1</div>
              <span className={`step-label ${step === 1 ? 'active' : ''}`}>Layanan</span>
            </div>
            <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
            <div 
              className='step' 
              onClick={() => {
                if (scheduledAt || step > 2) setStep(2);
              }}
              style={{ cursor: scheduledAt || step > 2 ? 'pointer' : 'not-allowed' }}
            >
              <div className={`step-circle ${step >= 2 ? 'active' : 'inactive'}`}>2</div>
              <span className={`step-label ${step === 2 ? 'active' : ''}`}>Jadwal</span>
            </div>
            <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
            <div 
              className='step' 
              onClick={() => {
                if (scheduledAt && addressDetail) setStep(3);
              }}
              style={{ cursor: scheduledAt && addressDetail ? 'pointer' : 'not-allowed' }}
            >
              <div className={`step-circle ${step >= 3 ? 'active' : 'inactive'}`}>3</div>
              <span className={`step-label ${step === 3 ? 'active' : ''}`}>Detail</span>
            </div>
          </div>

          {/* Step Content */}
          <div className='booking-card'>
            {step === 1 && (
              <>
                <h2>Detail Layanan</h2>
                <div className='form-group'>
                  <label>Layanan Terpilih</label>
                  <p className='service-info-text'>{service.name}</p>
                </div>
                <div className='form-group'>
                  <label>Durasi</label>
                  <p className='service-info-text'>{service.duration_minutes} Menit</p>
                </div>
                <div className='form-group'>
                  <label>Harga</label>
                  <p className='service-info-text'>Rp {parseFloat(service.price).toLocaleString('id-ID')}</p>
                </div>
                <div className='form-group'>
                  <label>Ukuran Rumah (opsional)</label>
                  <input
                    type='text'
                    className='form-input'
                    placeholder='misal: 120 m²'
                  />
                </div>
                <div className='booking-actions'>
                  <button className='btn-primary' onClick={() => setStep(2)}>
                    Lanjutkan ke Jadwal
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2>Jadwal</h2>
                <div className='form-group'>
                  <label>Tanggal &amp; Waktu Pembersihan</label>
                  <input
                    type='datetime-local'
                    className='form-input'
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>
                <div className='booking-actions'>
                  <button className='btn-secondary' onClick={() => setStep(1)}>
                    Kembali ke Layanan
                  </button>
                  <button
                    className='btn-primary'
                    onClick={() => setStep(3)}
                    disabled={!scheduledAt}
                  >
                    Lanjutkan ke Detail
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Detail</h2>
                <div className='form-group'>
                  <label>Alamat &amp; Catatan</label>
                  <textarea
                    className='form-input'
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder='misal: Jl. Merdeka No. 1, Blok C, Pintu Biru'
                    rows={4}
                    required
                  ></textarea>
                </div>
                <div className='booking-actions'>
                  <button className='btn-secondary' onClick={() => setStep(2)}>
                    Kembali ke Jadwal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className='order-summary'>
          <h3>Ringkasan Pesanan</h3>
          <div className='summary-row'>
            <span>{service.name}</span>
            <span>Rp {parseFloat(service.price).toLocaleString('id-ID')}</span>
          </div>
          <div className='summary-row'>
            <span>Biaya Admin</span>
            <span>Rp 5.000</span>
          </div>
          <div className='summary-divider'></div>
          <div className='summary-row total'>
            <span>Total</span>
            <span>Rp {(parseFloat(service.price) + 5000).toLocaleString('id-ID')}</span>
          </div>
          <button
            className='btn-pay'
            onClick={handleCheckout}
            disabled={loading || !scheduledAt || !addressDetail}
          >
            {loading ? 'Memproses...' : 'Bayar & Pesan'}
          </button>
        </div>
      </div>
    </div>
  );
}
