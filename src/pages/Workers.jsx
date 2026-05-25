import React, { useState, useEffect } from 'react';
import { apiWorkerService } from '../services/api';
import { Eye, EyeOff, Plus, Edit2, Trash2, Users, Phone, Shield, UserPlus } from 'lucide-react';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', status: 'available'
  });
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await apiWorkerService.get('/workers');
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data worker');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateWorker = async (e) => {
    e.preventDefault();
    try {
      if (editingWorkerId) {
        await apiWorkerService.put(`/workers/${editingWorkerId}`, formData);
        alert('Pekerja berhasil diperbarui!');
      } else {
        await apiWorkerService.post('/workers', formData);
        alert('Pekerja berhasil ditambahkan!');
      }
      setShowModal(false);
      setEditingWorkerId(null);
      setFormData({ name: '', email: '', password: '', phone: '', status: 'available' });
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert(editingWorkerId ? 'Gagal memperbarui pekerja' : 'Gagal membuat pekerja baru');
    }
  };

  const handleEditClick = (worker) => {
    setFormData({
      name: worker.name,
      email: worker.email,
      password: worker.password,
      phone: worker.phone,
      status: worker.status
    });
    setEditingWorkerId(worker.id);
    setShowModal(true);
  };

  const handleDeleteWorker = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pekerja ini?")) return;
    try {
      await apiWorkerService.delete(`/workers/${id}`);
      alert('Pekerja berhasil dihapus');
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus pekerja');
    }
  };

  // Filter workers based on status
  const filteredWorkers = workers.filter(w => {
    if (statusFilter === 'all') return true;
    return w.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Data Pekerja</h1>
        <p className="text-sm text-gray-500 mt-1.5">Kelola data tenaga kerja dan akses sistem.</p>
      </div>

      {/* Filter and Addition Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200"
          >
            <option value="all">Semua Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
          <span className="text-xs text-gray-400 font-medium">
            Menampilkan {filteredWorkers.length} pekerja
          </span>
        </div>

        <button 
          onClick={() => {
            setEditingWorkerId(null);
            setFormData({ name: '', email: '', password: '', phone: '', status: 'available' });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Tambah Pekerja
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
          <span className="text-sm font-medium">Memuat data pekerja...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/65">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Pekerja</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama & Email</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kontak</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
                      WRK-{String(worker.id).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-800">{worker.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{worker.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-gray-50 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-100">
                          {visiblePasswords[worker.id] ? worker.password : '••••••••'}
                        </span>
                        <button onClick={() => togglePasswordVisibility(worker.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                          {visiblePasswords[worker.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" />
                        {worker.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded-full border
                        ${worker.status.toLowerCase() === 'available' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                          : worker.status.toLowerCase() === 'busy' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200/50' 
                          : 'bg-gray-50 text-gray-600 border-gray-200/50'}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(worker)} 
                          className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200"
                          title="Edit Pekerja"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteWorker(worker.id)} 
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                          title="Hapus Pekerja"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                      Tidak ada pekerja dengan kriteria filter tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Container */}
          <div className="bg-gray-50/70 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Halaman 1 dari 1
            </span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg text-xs font-semibold cursor-not-allowed">
                Sebelumnya
              </button>
              <button disabled className="px-3 py-1.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg text-xs font-semibold cursor-not-allowed">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Worker Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 shadow-2xl relative z-50 transform transition-all duration-300">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" />
                {editingWorkerId ? 'Edit Pekerja' : 'Tambah Pekerja Baru'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-full hover:bg-gray-100 transition-colors leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateWorker} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" placeholder="Contoh: Budi Santoso" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" placeholder="budi@cleanco.id" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" placeholder="••••••••" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">No HP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
                    +62
                  </span>
                  <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 placeholder-gray-400" placeholder="81234567890" />
                </div>
              </div>

              {editingWorkerId && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm text-gray-800 font-medium"
                  >
                    <option value="available">AVAILABLE</option>
                    <option value="busy">BUSY</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-50 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-sm transition-all duration-200">
                  Batal
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

