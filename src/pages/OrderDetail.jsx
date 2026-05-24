import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiUserOrder, apiWorkerService } from '../services/api';
import { Camera, MapPin, MessageSquare, Check, ArrowLeft } from 'lucide-react';

export default function OrderDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [tracking, setTracking] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  
  const WORKER_ID = 1;

  useEffect(() => {
    if (!order) {
      // Boleh ditambahkan fungsi fetch order by id
      navigate('/');
    }
  }, [order, navigate]);

  const updateStatus = async (newStatus, note, photo_url) => {
    try {
      // 1. Update status order di SQL
      await apiUserOrder.patch(`/api/v1/orders/${order.id}/status`, { status: newStatus });
      
      // 2. Simpan history & foto ke Firestore
      await apiUserOrder.post('/api/v1/order-history', {
        orderId: order.id,
        status: newStatus,
        updatedByRole: 'worker',
        note: note,
        photo_url: photo_url
      });
      
      setOrder({ ...order, status: newStatus });
      alert(`Berhasil memperbarui status menjadi: ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate status');
    }
  };

  const handleStartWork = () => {
    updateStatus('in_progress', 'Pekerja telah tiba dan mulai membersihkan.', 'https://placehold.co/600x400/png?text=Foto+Sebelum');
  };

  const handleFinishWork = () => {
    updateStatus('completed', 'Pekerjaan selesai dilakukan dengan baik.', 'https://placehold.co/600x400/png?text=Foto+Sesudah');
  };

  const toggleTracking = () => {
    if (tracking) {
      clearInterval(intervalId);
      setIntervalId(null);
      setTracking(false);
      alert('Tracking GPS dihentikan');
    } else {
      alert('Tracking GPS dimulai! Mengirim lokasi setiap 5 detik (simulasi).');
      setTracking(true);
      // Dummy tracking (simulate movement)
      let lat = -6.200000;
      let long = 106.816666;
      const id = setInterval(async () => {
        lat += 0.0001;
        long += 0.0001;
        try {
          await apiWorkerService.patch('/api/v2/tracking/location', {
            workerId: WORKER_ID,
            lat,
            long
          });
        } catch (e) {
          console.error("Gagal kirim tracking:", e);
        }
      }, 5000);
      setIntervalId(id);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  if (!order) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-lg">Detail Tugas #{order.id}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
              order.status === 'in_progress' ? 'bg-sky-100 text-sky-700' :
              'bg-orange-100 text-orange-700'}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Alamat Pelanggan</p>
              <p className="font-medium text-gray-800">{order.address_detail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Layanan</p>
              <p className="font-medium text-gray-800">{order.service_name || `ID ${order.service_id}`}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => navigate(`/chat/${order.id}`, { state: { order } })}
              className="flex items-center justify-center gap-2 bg-sky-50 text-sky-600 p-3 rounded-xl hover:bg-sky-100 transition-colors font-medium">
              <MessageSquare size={18} /> Chat Pelanggan
            </button>
            <button 
              onClick={toggleTracking}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors font-medium
                ${tracking ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <MapPin size={18} /> {tracking ? 'Hentikan GPS' : 'Mulai Tracking GPS'}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="font-bold text-gray-800 mb-4">Aksi Pekerjaan</h3>
            
            {order.status !== 'in_progress' && order.status !== 'completed' && (
              <button 
                onClick={handleStartWork}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 rounded-xl hover:shadow-lg transition-all font-bold">
                <Camera size={20} /> Mulai Pekerjaan & Foto Sebelum
              </button>
            )}

            {order.status === 'in_progress' && (
              <button 
                onClick={handleFinishWork}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition-all font-bold">
                <Check size={20} /> Selesaikan Pekerjaan & Foto Sesudah
              </button>
            )}

            {order.status === 'completed' && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-medium border border-green-100">
                Tugas ini telah selesai dengan sukses! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
