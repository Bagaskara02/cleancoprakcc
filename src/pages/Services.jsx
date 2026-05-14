import { useState, useEffect } from 'react';
import { apiWorkerService } from '../services/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ nama_layanan: '', harga_dasar: '' });

  // 1. Ambil data saat komponen pertama kali dirender
  useEffect(() => {
    const getInitialServices = async () => {
      try {
        const res = await apiWorkerService.get('/services');
        setServices(res.data);
      } catch (err) { 
        console.error("Gagal mengambil data awal:", err); 
      }
    };
    getInitialServices();
  }, []);

  // 2. Fungsi khusus untuk me-refresh data tabel 
  const refreshData = async () => {
    try {
      const res = await apiWorkerService.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error("Gagal me-refresh data layanan:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiWorkerService.post('/services', form);
      setForm({ nama_layanan: '', harga_dasar: '' });
      await refreshData(); // Refresh setelah sukses ditambah
    } catch (err) {
      console.error("Gagal menambah layanan:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiWorkerService.delete(`/services/${id}`);
      await refreshData(); // Refresh setelah sukses dihapus
    } catch (err) {
      console.error("Gagal menghapus layanan:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Katalog Layanan</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-4 flex gap-4 shadow-sm border rounded">
        <input 
          placeholder="Nama Layanan" 
          required 
          value={form.nama_layanan} 
          onChange={e => setForm({...form, nama_layanan: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <input 
          placeholder="Harga Dasar" 
          type="number" 
          required 
          value={form.harga_dasar} 
          onChange={e => setForm({...form, harga_dasar: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
          Tambah
        </button>
      </form>

      <table className="w-full bg-white shadow-sm rounded border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Layanan</th>
            <th className="p-3 text-left">Harga</th>
            <th className="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-3">{s.nama_layanan}</td>
              <td className="p-3">Rp {s.harga_dasar}</td>
              <td className="p-3 text-center">
                <button onClick={() => handleDelete(s.id)} className="text-red-500 font-semibold hover:text-red-700 transition">
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}