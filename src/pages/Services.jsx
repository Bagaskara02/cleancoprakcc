import { useState, useEffect } from 'react';
import { apiWorkerService } from '../services/api';
import { Clock, Plus, Edit2, Trash2, X, Briefcase } from 'lucide-react';

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
    if (!window.confirm("Yakin ingin menghapus layanan ini?")) return;
    try {
      await apiWorkerService.delete(`/services/${id}`);
      await refreshData();
    } catch (err) {
      console.error("Gagal menghapus layanan:", err);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header and Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Katalog Layanan</h1>
        <p className="text-sm text-gray-500 mt-1.5">Kelola daftar layanan pembersihan, durasi, dan harga dasar.</p>
      </div>
      
      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3 mb-5 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-600" />
          {editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            placeholder="Nama Layanan (Contoh: Basic Cleaning)" 
            required 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" 
          />
          <input 
            placeholder="Harga Dasar (Rp)" 
            type="number" 
            required 
            value={form.price} 
            onChange={e => setForm({...form, price: e.target.value})} 
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" 
          />
          <input 
            placeholder="Durasi (Menit)" 
            type="number" 
            required 
            value={form.duration_minutes} 
            onChange={e => setForm({...form, duration_minutes: e.target.value})} 
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" 
          />
          <input 
            placeholder="Deskripsi Singkat" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" 
          />
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex-1 flex items-center justify-center gap-2">
              <Plus size={16} />
              {editingId ? 'Simpan Perubahan' : 'Tambah Layanan Baru'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', description: '', price: '', duration_minutes: '' });
                }} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-bold text-sm active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
                <X size={16} />
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Services Table Card */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/65">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Layanan</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Durasi</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Harga Dasar</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.description || 'Tidak ada deskripsi'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      <Clock size={12} className="text-gray-400" />
                      {s.duration_minutes} Menit
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-extrabold">
                    Rp {parseFloat(s.price).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(s)} 
                        className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200"
                        title="Edit Layanan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                        title="Hapus Layanan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-400">
                    Belum ada layanan tersedia. Tambahkan layanan baru di atas!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}