import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWorkerService } from '../services/api';
import { Snowflake, Building2, Shirt, Sparkles } from 'lucide-react';

const SERVICE_ICONS = [Snowflake, Building2, Shirt, Sparkles];

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiWorkerService.get('/api/v2/services').then(res => {
      setServices(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal mengambil data layanan dari API:", err);
      setServices([]);
      setLoading(false);
    });
  }, []);

  const handleOrder = (service) => {
    navigate('/checkout', { state: { service } });
  };

  return (
    <div className='page-container'>
      <div className='section-header' style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Layanan Kami</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>Pilih layanan kebersihan profesional terbaik untuk kenyamanan rumah Anda.</p>
        </div>
      </div>

      {loading ? (
        <div className='loading-spinner'>Memuat layanan...</div>
      ) : services.length === 0 ? (
        <div className='empty-state'>Layanan tidak tersedia saat ini.</div>
      ) : (
        <div className='services-grid'>
          {services.map((service, index) => {
            const IconComponent = SERVICE_ICONS[index] || Sparkles;
            return (
              <div key={service.id} className='service-card'>
                <div className='service-icon-box'>
                  <IconComponent size={28} />
                </div>
                <h3>{service.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', flexGrow: 1 }}>
                  {service.description || 'Layanan pembersihan menyeluruh oleh profesional berpengalaman.'}
                </p>
                <p className='service-price' style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1rem', marginBottom: '1.25rem' }}>
                  Mulai dari Rp {parseFloat(service.price).toLocaleString('id-ID')}
                </p>
                <button className='btn-service' onClick={() => handleOrder(service)}>Pesan Sekarang</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
