import { useState, useEffect } from 'react';
import { apiUserOrder } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ user_id: '', service_id: '' });

  // 1. Fungsi rahasia khusus di dalam useEffect (Linter pasti diam)
  useEffect(() => {
    const getInitialOrders = async () => {
      try {
        const res = await apiUserOrder.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Gagal mengambil data awal pesanan:', err);
      }
    };
    getInitialOrders();
  }, []); // Array kosong aman karena fungsinya ada di dalam

  // 2. Fungsi terpisah untuk me-refresh data setelah submit
  const refreshData = async () => {
    try {
      const res = await apiUserOrder.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Gagal me-refresh data pesanan:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiUserOrder.post('/orders', form);
      setForm({ user_id: '', service_id: '' });
      await refreshData(); // Panggil fungsi refresh di sini
    } catch (err) {
      console.error('Gagal membuat pesanan:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Data Pesanan (Orders)</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-4 flex gap-4 shadow-sm border rounded">
        <input 
          placeholder="ID User (contoh: 1)" 
          type="number" 
          required 
          value={form.user_id} 
          onChange={e => setForm({...form, user_id: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <input 
          placeholder="ID Layanan (contoh: 1)" 
          type="number" 
          required 
          value={form.service_id} 
          onChange={e => setForm({...form, service_id: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
          Buat Pesanan
        </button>
      </form>

      <table className="w-full bg-white shadow-sm rounded border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">ID Pesanan</th>
            <th className="p-3 text-left">ID User</th>
            <th className="p-3 text-left">ID Layanan</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3">#{o.id}</td>
                <td className="p-3">{o.user_id}</td>
                <td className="p-3">{o.service_id}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                    {o.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">Belum ada data pesanan.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}