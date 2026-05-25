import React, { useState, useEffect } from 'react';
import { apiUserOrder, apiWorkerService } from '../services/api';
import { Search, Filter, Download, Eye, MapPin, CreditCard, Clock, CheckCircle2, User, X, Sparkles, PhoneCall, AlertCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for the modal data
  const [tracking, setTracking] = useState(null);
  const [history, setHistory] = useState([]);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    fetchWorkers();
    fetchOrders(true);

    const interval = setInterval(() => {
      fetchOrders(false);
      fetchWorkers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Polling for detail modal data
  useEffect(() => {
    if (!selectedOrder) return;

    const refreshModalData = async () => {
      try {
        const ordersRes = await apiUserOrder.get('/orders');
        const updated = ordersRes.data.find(o => o.id === selectedOrder.id);
        if (updated) {
          setSelectedOrder(updated);
        }
      } catch (e) { /* ignore */ }

      try {
        const histRes = await apiUserOrder.get(`/order-history/${selectedOrder.id}`);
        setHistory(histRes.data);
      } catch (e) { /* ignore 404 */ }
      
      try {
        const payRes = await apiUserOrder.get(`/payments/order/${selectedOrder.id}`);
        setPayment(payRes.data);
      } catch (e) { /* ignore 404 */ }
    };

    const interval = setInterval(refreshModalData, 5000);
    return () => clearInterval(interval);
  }, [selectedOrder]);

  const fetchWorkers = async () => {
    try {
      const res = await apiWorkerService.get('/workers');
      setWorkers(res.data);
    } catch (err) {
      console.error('Gagal mengambil pekerja:', err);
    }
  };

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await apiUserOrder.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Gagal mengambil pesanan:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const openModal = async (order) => {
    setSelectedOrder(order);
    setTracking(null);
    setHistory([]);
    setPayment(null);

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
    if (!selectedWorkerId) {
      alert("Silakan pilih pekerja terlebih dahulu!");
      return;
    }
    try {
      await apiUserOrder.patch(`/orders/${orderId}/assign`, { worker_id: selectedWorkerId });
      
      // Kirim notifikasi ke User
      await apiUserOrder.post('/notifications', {
        userId: selectedOrder.user_id,
        title: 'Pekerja Ditugaskan',
        message: 'berhasil mendapatkan pekerja tunggu pekerja datang'
      });

      // Kirim notifikasi ke Worker (menggunakan prefix worker_ untuk membedakan dengan userId jika ID nya sama)
      await apiUserOrder.post('/notifications', {
        userId: `worker_${selectedWorkerId}`,
        title: 'Pekerjaan Baru',
        message: 'mendapatkan pekerjaan'
      });

      alert("Berhasil meng-assign pekerja!");
      fetchOrders();
      setSelectedOrder(null);
      setSelectedWorkerId('');
    } catch (error) {
      alert("Gagal meng-assign pekerja.");
    }
  };

  // Filter orders based on query search by order ID only
  const filteredOrders = orders.filter(o => {
    const orderIdString = String(o.id);
    const paddedOrderIdString = 'ord-' + orderIdString.padStart(4, '0');
    const hashOrderIdString = '#ord-' + orderIdString.padStart(4, '0');
    const cleanQuery = searchQuery.toLowerCase().trim();
    
    return (
      orderIdString.includes(cleanQuery) ||
      paddedOrderIdString.includes(cleanQuery) ||
      hashOrderIdString.includes(cleanQuery)
    );
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'paid':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/50';
      case 'accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'in_progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200/50';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Data Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1.5">Monitor and manage all service requests.</p>
      </div>
      
      {/* Filter, Search & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/65">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layanan</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jadwal</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>Memuat data pesanan...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                    #ORD-{String(o.id).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {o.service_name || 'Layanan ID: ' + o.service_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {new Date(o.scheduled_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} WIB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openModal(o)} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
                    >
                      <Eye size={13} />
                      <span>Monitor Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">
                    Tidak ada pesanan tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Container */}
        <div className="bg-gray-50/70 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            Showing 1 to {filteredOrders.length} of {filteredOrders.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button disabled className="p-1 bg-white border border-gray-200 rounded-md text-gray-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-bold">1</button>
            <button disabled className="p-1 bg-white border border-gray-200 rounded-md text-gray-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Monitor */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-3.5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800">Detail Pesanan Monitoring</h3>
                  <span className="text-xs font-medium text-gray-400">ID: #ORD-{String(selectedOrder.id).padStart(4, '0')}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-full hover:bg-gray-100 transition-colors leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: Detail & Pembayaran (5 Columns of 12) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Detail Pemesanan Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-2.5 text-sm">
                    <MapPin size={16} className="text-blue-600" />
                    <span>Detail Pemesanan</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Alamat Layanan</span>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{selectedOrder.address_detail}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Total Harga</span>
                      <p className="text-2xl font-extrabold text-blue-600 mt-1">
                        Rp {parseFloat(selectedOrder.total_price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Status Pekerjaan</span>
                      <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-full mt-1 border ${getStatusStyle(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Worker Assignment Section */}
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'paid') && (
                    <div className="pt-4 border-t border-gray-50 space-y-3">
                      {(!payment || payment.status === 'pending') && (
                        <div className="bg-amber-50 text-amber-800 border border-amber-100 p-3 rounded-lg text-xs flex gap-2">
                          <AlertCircle size={16} className="shrink-0 text-amber-600" />
                          <span>Harap konfirmasi pembayaran lunas terlebih dahulu sebelum menugaskan pekerja.</span>
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Tugaskan Pekerja</label>
                        <select 
                          value={selectedWorkerId} 
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          className="w-full text-xs font-semibold border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-700"
                          disabled={!payment || payment.status === 'pending'}
                        >
                          <option value="">-- Pilih Pekerja --</option>
                          {workers.filter(w => w.status === 'available').map(w => (
                            <option key={w.id} value={w.id}>{w.name} (ID: {w.id})</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        disabled={!payment || payment.status === 'pending'}
                        onClick={() => handleAssignWorker(selectedOrder.id)} 
                        className={`w-full py-2.5 text-xs font-bold rounded-lg transition-all duration-200 active:scale-[0.98] shadow-md
                          ${(!payment || payment.status === 'pending') 
                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-blue-500/20'}`}
                      >
                        Tugaskan Pekerja (Assign)
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Pembayaran Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-2.5 text-sm">
                    <CreditCard size={16} className="text-emerald-600" />
                    <span>Status Pembayaran</span>
                  </h4>
                  {payment ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Metode Pembayaran</span>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{payment.payment_method}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Status Transaksi</span>
                        <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-full border mt-1
                          ${payment.status.toLowerCase() === 'paid' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                            : 'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      {payment.proof_url && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Bukti Transfer</span>
                          <a 
                            href={payment.proof_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
                          >
                            <span>Lihat Bukti Transfer</span>
                          </a>
                        </div>
                      )}
                      
                      {payment.status === 'pending' && (
                        <button 
                          onClick={() => handleConfirmPayment(payment.id)} 
                          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
                        >
                          Konfirmasi Pembayaran Lunas
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium py-2">Belum ada data pembayaran untuk pesanan ini.</p>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Foto Bukti & Timeline History (7 Columns of 12) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-2.5 text-sm">
                    <Clock size={16} className="text-blue-600" />
                    <span>Log Pekerjaan & Foto Bukti</span>
                  </h4>
                  
                  {history.length > 0 ? (
                    <div className="relative pl-6 space-y-6 max-h-[500px] overflow-y-auto pr-2">
                      {/* Vertical line indicator */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-blue-100"></div>
                      
                      {history.map((log, idx) => (
                        <div key={idx} className="relative space-y-2">
                          {/* Circular timeline bullet */}
                          <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm ring-4 ring-blue-50 z-10 flex items-center justify-center">
                          </div>

                          <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-extrabold text-blue-700 tracking-wide uppercase">
                                {log.status}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-400">
                                {new Date(log.timestamp).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} WIB
                              </span>
                            </div>
                            
                            {log.note && (
                              <p className="text-xs text-gray-600 italic font-medium">
                                "{log.note}"
                              </p>
                            )}

                            {log.photo_url && (
                              <div className="pt-1.5 max-w-sm">
                                <span className="text-[10px] font-bold text-gray-400 block mb-1">Foto Bukti Lapangan</span>
                                <div className="rounded-lg overflow-hidden border border-gray-200/60 shadow-inner group">
                                  <img 
                                    src={log.photo_url} 
                                    alt="Bukti Lapangan" 
                                    className="w-full h-auto object-cover max-h-48 group-hover:scale-105 transition-transform duration-300" 
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <Clock size={28} className="text-gray-300" />
                      <span className="text-xs font-semibold">Belum ada riwayat pengerjaan.</span>
                    </div>
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

