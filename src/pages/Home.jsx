import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWorkerService, apiUserOrder } from '../services/api';
import { Snowflake, Building2, Shirt, Sparkles, CalendarClock, Clock } from 'lucide-react';

const SERVICE_ICONS = [Snowflake, Building2, Shirt, Sparkles];

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [userName, setUserName] = useState('User');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    apiWorkerService.get('/api/v2/services').then(res => {
      setServices(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal mengambil data layanan dari API:", err);
      setServices([]);
      setLoading(false);
    });

    if (userId) {
      apiUserOrder.get(`/api/v1/orders/user/${userId}`).then(res => {
        setOrders(res.data);
      }).catch(err => {
        console.error("Gagal mengambil data pesanan:", err);
        setOrders([]);
      });

      apiUserOrder.get(`/api/v1/users/${userId}`).then(res => {
        if (res.data && res.data.name) {
          setUserName(res.data.name);
        }
      }).catch(err => {
        console.error("Gagal mengambil data user:", err);
      });
    }
  }, []);

  const handleOrder = (service) => {
    navigate('/checkout', { state: { service } });
  };

  const activeOrders = orders.filter(o =>
    ['pending', 'accepted', 'in_progress', 'paid'].includes(o.status)
  );

  return (
    <div className='dashboard'>
      {/* Top section: greeting + promo */}
      <div className='dashboard-top'>
        <div className='greeting'>
          <h1>Halo, {userName}!</h1>
          <p>Siap untuk rumah yang lebih bersih hari ini?</p>
        </div>
        <div className='promo-banner'>
          <span className='promo-badge'>Promo Spesial</span>
          <h2>Diskon 20% Deep Cleaning</h2>
          <p>Gunakan kode CLEAN20 hari ini.</p>
          <button className='btn-promo'>Klaim Promo</button>
        </div>
      </div>

      {/* Services section */}
      <div className='section-header'>
        <h2>Layanan Kami</h2>
        <a href='/Services'>Lihat Semua</a>
      </div>

      {loading ? (
        <div className='loading-spinner'>Memuat layanan...</div>
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
                <p className='service-price'>Mulai dari Rp {parseFloat(service.price).toLocaleString('id-ID')}</p>
                <button className='btn-service' onClick={() => handleOrder(service)}>Pesan Sekarang</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Active orders section */}
      {activeOrders.length > 0 && (
        <div className='active-order-section'>
          <div className='section-header'>
            <h2>Pesanan Aktif</h2>
          </div>
          {activeOrders.slice(0, 1).map(order => (
            <div key={order.id} className='active-order-card'>
              <div className='active-order-left'>
                <div className='active-order-icon'>
                  <CalendarClock size={22} />
                </div>
                <div className='active-order-info'>
                  <h4>
                    {order.service_name || 'Layanan Kebersihan'}{' '}
                    <span className='status-badge in-progress'>{order.status}</span>
                  </h4>
                  <div className='order-meta'>
                    <Clock size={14} />
                    <span>
                      Hari ini, {new Date(order.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className='active-order-right'>
                {order.worker_name && (
                  <span className='active-order-worker'>Petugas: {order.worker_name}</span>
                )}
                <button className='btn-detail-order' onClick={() => navigate('/orders')}>Detail Pesanan</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
