import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWorkerService } from '../services/api';
import { Info, PlusCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mencoba mengambil data dari backend.
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
    <div className="home-container">
      <div className="hero-section">
        <h1>Layanan Kebersihan Terbaik <br/> Untuk Rumah Anda</h1>
        <p>Pilih layanan kebersihan yang Anda butuhkan hari ini.</p>
      </div>

      {loading ? (
        <div className="loading">Memuat layanan...</div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="card-header">
                <h3>{service.name}</h3>
                <span className="price">Rp {service.price.toLocaleString('id-ID')}</span>
              </div>
              <p className="desc">{service.description}</p>
              <div className="meta">
                <span className="duration"><Info size={14}/> {service.duration_minutes} Menit</span>
              </div>
              <button className="btn-order" onClick={() => handleOrder(service)}>
                <PlusCircle size={18} />
                Pesan Sekarang
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
