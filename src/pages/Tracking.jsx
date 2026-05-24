import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { MapPin, Image as ImageIcon, Clock } from 'lucide-react';

export default function Tracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  
  const [trackingData, setTrackingData] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) {
      navigate('/orders');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Ambil data tracking (lokasi GPS)
        const trackRes = await apiUserOrder.get(`/api/v1/tracking/${order.id}`);
        setTrackingData(trackRes.data);
      } catch (err) {
        console.log("Lokasi petugas belum tersedia", err);
      }

      try {
        // 2. Ambil log history (termasuk foto sebelum-sesudah)
        const histRes = await apiUserOrder.get(`/api/v1/order-history/${order.id}`);
        setHistoryLogs(histRes.data);
      } catch (err) {
        console.log("Riwayat status belum tersedia", err);
      }

      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh tiap 10 detik
    return () => clearInterval(interval);
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Pantau Pesanan #{order.id}</h2>
      
      {loading ? (
        <p style={{ textAlign: 'center' }}>Memuat data...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Bagian Tracking GPS */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
              <MapPin size={20} color="#0ea5e9" /> Lokasi Petugas (GPS)
            </h3>
            {trackingData ? (
              <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: '0 0 10px 0' }}><strong>Pembaruan Terakhir:</strong> {new Date(trackingData.updatedAt).toLocaleTimeString('id-ID')}</p>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, padding: '10px', backgroundColor: 'white', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Latitude</span>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{trackingData.latitude}</p>
                  </div>
                  <div style={{ flex: 1, padding: '10px', backgroundColor: 'white', borderRadius: '4px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Longitude</span>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{trackingData.longitude}</p>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
                  *Dalam sistem nyata, ini akan dirender menjadi peta (Google Maps API)
                </p>
              </div>
            ) : (
              <p style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                Petugas belum menyalakan/membagikan lokasi GPS untuk pesanan ini.
              </p>
            )}
          </div>

          {/* Bagian History & Foto Bukti Kerja */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
              <Clock size={20} color="#22c55e" /> Riwayat & Bukti Kerja
            </h3>
            
            {historyLogs.length === 0 ? (
              <p style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                Belum ada riwayat aktivitas untuk pesanan ini.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {historyLogs.map((log, idx) => (
                  <div key={idx} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', color: '#0ea5e9' }}>
                        {log.status}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                    
                    {log.note && <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{log.note}</p>}
                    
                    {log.photo_url && (
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ImageIcon size={14} /> Foto Bukti
                        </p>
                        <img 
                          src={log.photo_url} 
                          alt="Bukti Kerja" 
                          style={{ maxWidth: '100%', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
