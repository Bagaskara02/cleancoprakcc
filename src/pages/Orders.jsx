import React, { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // States for the modal data
  const [tracking, setTracking] = useState(null);
  const [history, setHistory] = useState([]);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiUserOrder.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Gagal mengambil pesanan:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (order) => {
    setSelectedOrder(order);
    setTracking(null);
    setHistory([]);
    setPayment(null);

    try {
      const trackRes = await apiUserOrder.get(`/tracking/${order.id}`);
      setTracking(trackRes.data);
    } catch (e) { /* ignore 404 */ }
    
    try {
      const histRes = await apiUserOrder.get(`/order-history/${order.id}`);
      setHistory(histRes.data);
    } catch (e) { /* ignore 404 */ }
    
    try {
      const payRes = await apiUserOrder.get(`/payments/order/${order.id}`);
      setPayment(payRes.data);
    } catch (e) { /* ignore 404 */ }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      await apiUserOrder.patch(`/payments/${paymentId}/status`, {});
      alert("Pembayaran berhasil dikonfirmasi!");
      openModal(selectedOrder); // refresh modal data
    } catch (error) {
      console.error("Gagal konfirmasi pembayaran:", error.response || error);
      alert("Gagal konfirmasi pembayaran.");
    }
  };

  const handleAssignWorker = async (orderId) => {
    try {
      // API call to assign worker and change status to 'accepted'
      // Untuk MVP kita update status pesanan langsung saja via order status api
      await apiUserOrder.patch(`/orders/${orderId}/status`, { status: 'accepted' });
      alert("Berhasil meng-assign pekerja (Status -> Accepted)");
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      alert("Gagal meng-assign pekerja.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Monitor Pesanan & Operasional</h2>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4">Memuat data...</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{o.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.service_name || 'Layanan ID: '+o.service_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.scheduled_at).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${o.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(o)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">
                    Monitor Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Monitor */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Monitoring Pesanan #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Detail & Pembayaran */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-700 mb-2">Detail Pemesanan</h4>
                  <p className="text-sm"><span className="text-gray-500">Alamat:</span> {selectedOrder.address_detail}</p>
                  <p className="text-sm"><span className="text-gray-500">Harga:</span> Rp {parseFloat(selectedOrder.total_price).toLocaleString('id-ID')}</p>
                  <p className="text-sm mt-2"><span className="text-gray-500">Status Pekerjaan:</span> {selectedOrder.status.toUpperCase()}</p>
                  {selectedOrder.status === 'pending' && (
                    <button onClick={() => handleAssignWorker(selectedOrder.id)} className="mt-3 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded w-full">
                      Tugaskan Pekerja (Assign)
                    </button>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-2">Status Pembayaran</h4>
                  {payment ? (
                    <div>
                      <p className="text-sm">Metode: {payment.payment_method}</p>
                      <p className="text-sm font-bold mt-1">Status: {payment.status.toUpperCase()}</p>
                      {payment.proof_url && (
                        <a href={payment.proof_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline block mt-2">Lihat Bukti Transfer</a>
                      )}
                      {payment.status === 'pending' && (
                        <button onClick={() => handleConfirmPayment(payment.id)} className="mt-3 bg-green-600 text-white text-xs font-bold px-3 py-2 rounded w-full">
                          Konfirmasi Pembayaran Lunas
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada data pembayaran untuk pesanan ini.</p>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Tracking GPS & Foto */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">Tracking Lokasi (GPS)</h4>
                  {tracking ? (
                    <div>
                      <p className="text-sm">Lat: <span className="font-mono bg-white px-1 rounded">{tracking.latitude}</span></p>
                      <p className="text-sm mt-1">Lng: <span className="font-mono bg-white px-1 rounded">{tracking.longitude}</span></p>
                      <p className="text-xs text-gray-500 mt-2">Update terakhir: {new Date(tracking.updatedAt).toLocaleTimeString()}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Pekerja belum membagikan lokasi.</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-700 mb-2">Log Pekerjaan & Foto Bukti</h4>
                  {history.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {history.map((log, idx) => (
                        <div key={idx} className="bg-white p-3 border rounded text-sm">
                          <p className="font-bold text-blue-600">{log.status.toUpperCase()}</p>
                          <p className="text-xs text-gray-500 mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                          {log.note && <p className="italic text-gray-700">"{log.note}"</p>}
                          {log.photo_url && (
                            <img src={log.photo_url} alt="Bukti" className="w-full h-auto mt-2 rounded border" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada riwayat pengerjaan.</p>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
