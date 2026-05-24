import { useState, useEffect } from 'react';
import { apiWorkerService } from '../services/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_minutes: '' });
  const [editingId, setEditingId] = useState(null);

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
      if (editingId) {
        await apiWorkerService.put(`/services/${editingId}`, form);
        setEditingId(null);
      } else {
        await apiWorkerService.post('/services', form);
      }
      setForm({ name: '', description: '', price: '', duration_minutes: '' });
      await refreshData();
    } catch (err) {
      console.error("Gagal menyimpan layanan:", err);
    }
  };

  const handleEditClick = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes
    });
    setEditingId(service.id);
  };

  const handleDelete = async (id) => {
    try {
      await apiWorkerService.delete(`/services/${id}`);
      await refreshData();
    } catch (err) {
      console.error("Gagal menghapus layanan:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Katalog Layanan</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          placeholder="Nama Layanan (Contoh: Basic Cleaning)" 
          required 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <input 
          placeholder="Harga Dasar (Rp)" 
          type="number" 
          required 
          value={form.price} 
          onChange={e => setForm({...form, price: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <input 
          placeholder="Durasi (Menit)" 
          type="number" 
          required 
          value={form.duration_minutes} 
          onChange={e => setForm({...form, duration_minutes: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <input 
          placeholder="Deskripsi Singkat" 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          className="border p-2 rounded w-full" 
        />
        <div className="md:col-span-2 flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition flex-1">
            {editingId ? 'Simpan Perubahan' : 'Tambah Layanan Baru'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => {
                setEditingId(null);
                setForm({ name: '', description: '', price: '', duration_minutes: '' });
              }} 
              className="bg-gray-400 text-white px-4 py-2 rounded font-semibold hover:bg-gray-500 transition">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Layanan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.duration_minutes} Menit</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">Rp {parseFloat(s.price).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-3">
                  <button onClick={() => handleEditClick(s)} className="text-blue-500 hover:text-blue-700">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}