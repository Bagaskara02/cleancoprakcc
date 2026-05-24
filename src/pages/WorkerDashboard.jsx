import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function WorkerDashboard() {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = workerData.id || 1;

  useEffect(() => {
    fetchOrders();
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await apiUserOrder.get(`/api/v1/reviews/worker/${WORKER_ID}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Gagal mengambil ulasan:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      // Kita fetch semua order lalu filter yang worker_id == 1 dan belum cancelled
      const res = await apiUserOrder.get('/api/v1/orders');
      const myOrders = res.data.filter(o => o.worker_id === WORKER_ID && o.status !== 'cancelled');
      setOrders(myOrders);
    } catch (error) {
      console.error("Gagal mengambil tugas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-sky-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Tugas Hari Ini</h1>
          <p className="text-green-50">Anda memiliki {orders.filter(o => o.status !== 'completed').length} pekerjaan aktif.</p>
        </div>
        <div className="absolute -right-10 -top-10 opacity-20">
          <CheckCircle2 size={150} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada tugas yang diberikan kepada Anda.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} onClick={() => navigate(`/order/${order.id}`, { state: { order } })} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">{order.service_name || `Layanan #${order.service_id}`}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2
                    ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'in_progress' ? 'bg-sky-100 text-sky-700' :
                      'bg-orange-100 text-orange-700'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                  #{order.id}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-sky-500" />
                  <span>{new Date(order.scheduled_at).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-sky-500" />
                  <span>{new Date(order.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-sky-500 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{order.address_detail}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Ulasan & Penilaian</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada ulasan untuk Anda.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 font-bold">{'★'.repeat(r.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span>
                    <span className="text-sm font-semibold text-gray-700 ml-2">({r.rating}/5)</span>
                  </div>
                  <p className="text-gray-600 text-sm italic">"{r.comment}"</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleString('id-ID')} - Order #{r.order_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
