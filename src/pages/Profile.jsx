import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWorkerService } from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  LogOut, 
  Power,
  ShieldCheck
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [workerData, setWorkerData] = useState(() => {
    return JSON.parse(localStorage.getItem('workerData') || '{}');
  });
  const [status, setStatus] = useState(workerData?.status || 'available');

  useEffect(() => {
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem('workerData') || '{}');
      setWorkerData(updated);
      setStatus(updated.status || 'available');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!workerData.id) return;
    apiWorkerService.get(`/api/v2/workers/${workerData.id}`)
      .then(res => {
        const latest = res.data;
        if (latest) {
          const updated = { ...workerData, ...latest };
          localStorage.setItem('workerData', JSON.stringify(updated));
          setStatus(latest.status || 'available');
        }
      })
      .catch(err => console.error("Gagal mengambil data worker terbaru:", err));
  }, [workerData.id]);

  const handleToggleStatus = async () => {
    if (status === 'busy') {
      alert("Anda sedang dalam tugas aktif (Busy). Tidak dapat mengubah status menjadi Offline!");
      return;
    }
    const nextStatus = status === 'available' ? 'offline' : 'available';
    try {
      await apiWorkerService.patch(`/api/v2/workers/${workerData.id}/status`, { status: nextStatus });
      const updatedData = { ...workerData, status: nextStatus };
      localStorage.setItem('workerData', JSON.stringify(updatedData));
      // Dispatch storage event to sync with App header instantly
      window.dispatchEvent(new Event('storage'));
      setStatus(nextStatus);
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('workerData');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  if (!workerData.id) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted">Loading data profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
        
        {/* Banner decorative header */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary-dark relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-full bg-primary-bg-deep border-4 border-white flex items-center justify-center text-primary font-extrabold text-2xl shadow-md">
              {workerData.name?.charAt(0).toUpperCase() || 'W'}
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="pt-14 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-text flex items-center gap-2">
              {workerData.name}
              <ShieldCheck size={18} className="text-primary fill-primary/10" />
            </h2>
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Mitra Kebersihan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-custom">
            
            {/* ID / Email */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-border-light">
              <Mail className="text-text-muted shrink-0" size={18} />
              <div className="space-y-0.5">
                <span className="text-[10px] text-text-muted font-bold uppercase block">Alamat Email</span>
                <span className="text-sm font-semibold text-text block">{workerData.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-border-light">
              <Phone className="text-text-muted shrink-0" size={18} />
              <div className="space-y-0.5">
                <span className="text-[10px] text-text-muted font-bold uppercase block">Nomor Telepon</span>
                <span className="text-sm font-semibold text-text block">{workerData.phone || '+62 812-3456-7890'}</span>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-border-light">
              <Briefcase className="text-text-muted shrink-0" size={18} />
              <div className="space-y-0.5">
                <span className="text-[10px] text-text-muted font-bold uppercase block">Jabatan</span>
                <span className="text-sm font-semibold text-text block">Mitra Pekerja Profesional</span>
              </div>
            </div>

            {/* ID Badge */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-border-light">
              <User className="text-text-muted shrink-0" size={18} />
              <div className="space-y-0.5">
                <span className="text-[10px] text-text-muted font-bold uppercase block">ID Mitra</span>
                <span className="text-sm font-semibold text-text block"># {workerData.id}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Status Toggle Card */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-text text-base">Status Ketersediaan</h3>
          <p className="text-text-muted text-sm font-semibold">Tentukan apakah Anda siap menerima tugas baru</p>
        </div>

        <button
          onClick={handleToggleStatus}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-extrabold border transition-all cursor-pointer ${
            status === 'available'
              ? 'bg-teal/10 border-teal/20 text-teal hover:bg-teal/15 shadow-sm shadow-teal/5'
              : status === 'busy'
              ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
              : 'bg-text-light/10 border-text-light/20 text-text-light hover:bg-text-light/15'
          }`}
        >
          <Power size={16} />
          {status === 'busy' ? 'Sedang Bekerja (Busy)' : status === 'available' ? 'Aktif (Online)' : 'Nonaktif (Offline)'}
        </button>
      </div>

      {/* Logout Card */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold text-danger hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Keluar dari Akun Mitra
        </button>
      </div>

    </div>
  );
}
