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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const [pendingAction, setPendingAction] = useState(null); // 'start' atau 'finish'
  
  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = workerData.id || 1;

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

  const triggerPhotoUpload = (actionType) => {
    setPendingAction(actionType);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      // Upload ke service-worker
      const uploadRes = await apiWorkerService.post('/api/v2/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const photoUrl = uploadRes.data.url;

      if (pendingAction === 'start') {
        await updateStatus('in_progress', 'Pekerja telah tiba dan mulai membersihkan.', photoUrl);
      } else if (pendingAction === 'finish') {
        await updateStatus('completed', 'Pekerjaan selesai dilakukan dengan baik.', photoUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal mengupload foto');
    } finally {
      setUploading(false);
      setPendingAction(null);
      // reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const logMicroAction = async (actionName, note) => {
    try {
      await apiUserOrder.post('/api/v1/order-history', {
        orderId: order.id,
        status: actionName,
        updatedByRole: 'worker',
        note: note,
        photo_url: ''
      });
      alert(`Log "${note}" berhasil dicatat!`);
    } catch (err) {
      console.error(err);
      alert('Gagal mencatat log waktu');
    }
  };

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

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => navigate(`/chat/${order.id}`, { state: { order } })}
              className="flex items-center justify-center gap-2 bg-sky-50 text-sky-600 p-3 rounded-xl hover:bg-sky-100 transition-colors font-medium">
              <MessageSquare size={18} /> Chat Pelanggan
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="font-bold text-gray-800 mb-4">Aksi Pekerjaan</h3>
            
            {order.status !== 'in_progress' && order.status !== 'completed' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button 
                    onClick={() => logMicroAction('on_the_way', 'Petugas sedang dalam perjalanan menuju lokasi.')}
                    className="flex items-center justify-center gap-2 bg-orange-50 text-orange-600 p-3 rounded-xl hover:bg-orange-100 transition-colors font-medium">
                    <MapPin size={18} /> Catat: Berangkat
                  </button>
                  <button 
                    onClick={() => logMicroAction('arrived', 'Petugas telah tiba di lokasi.')}
                    className="flex items-center justify-center gap-2 bg-teal-50 text-teal-600 p-3 rounded-xl hover:bg-teal-100 transition-colors font-medium">
                    <Check size={18} /> Catat: Tiba
                  </button>
                </div>
                
                <button 
                  onClick={() => triggerPhotoUpload('start')}
                  disabled={uploading}
                  className={`w-full flex items-center justify-center gap-2 text-white p-4 rounded-xl hover:shadow-lg transition-all font-bold ${uploading ? 'bg-gray-400' : 'bg-gradient-to-r from-sky-500 to-sky-600'}`}>
                  <Camera size={20} /> {uploading && pendingAction === 'start' ? 'Mengupload...' : 'Mulai Pekerjaan & Foto Sebelum'}
                </button>
              </div>
            )}

            {order.status === 'in_progress' && (
              <button 
                onClick={() => triggerPhotoUpload('finish')}
                disabled={uploading}
                className={`w-full flex items-center justify-center gap-2 text-white p-4 rounded-xl hover:shadow-lg transition-all font-bold ${uploading ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-green-600'}`}>
                <Check size={20} /> {uploading && pendingAction === 'finish' ? 'Mengupload...' : 'Selesaikan Pekerjaan & Foto Sesudah'}
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

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
    </div>
  );
}
