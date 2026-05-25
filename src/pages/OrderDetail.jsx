import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiUserOrder, apiWorkerService } from '../services/api';
import ChatModal from '../components/ChatModal';
import { 
  Camera, 
  MapPin, 
  MessageSquare, 
  Check, 
  ArrowLeft, 
  Clock, 
  Phone, 
  User, 
  Navigation,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export default function OrderDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [customer, setCustomer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const fileInputRef = useRef(null);
  const [pendingAction, setPendingAction] = useState(null); // 'start' atau 'finish'

  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Fetch history logs when order updates
  useEffect(() => {
    if (order) {
      fetchHistoryLogs(order.id);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      const res = await apiUserOrder.get('/api/v1/orders');
      const found = res.data.find(o => String(o.id) === String(id));
      if (found) {
        setOrder(found);
        fetchCustomerDetails(found.user_id);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (userId) => {
    try {
      const res = await apiUserOrder.get(`/api/v1/users/${userId}`);
      setCustomer(res.data);
    } catch (err) {
      console.error("Gagal mengambil data pelanggan:", err);
    }
  };

  const fetchHistoryLogs = async (orderId) => {
    try {
      const res = await apiUserOrder.get(`/api/v1/order-history/${orderId}`);
      setHistoryLogs(res.data);
    } catch (err) {
      console.error("Gagal mengambil histori:", err);
      setHistoryLogs([]);
    }
  };

  const updateStatus = async (newStatus, note, photo_url) => {
    try {
      await apiUserOrder.patch(`/api/v1/orders/${order.id}/status`, { status: newStatus });
      await apiUserOrder.post('/api/v1/order-history', {
        orderId: order.id,
        status: newStatus,
        updatedByRole: 'worker',
        note: note,
        photo_url: photo_url
      });
      await fetchHistoryLogs(order.id);
      
      // If task is completed, make worker available again!
      if (newStatus === 'completed') {
        try {
          const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
          const WORKER_ID = workerData.id || 1;
          await apiWorkerService.patch(`/api/v2/workers/${WORKER_ID}/status`, { status: 'available' });
          workerData.status = 'available';
          localStorage.setItem('workerData', JSON.stringify(workerData));
          window.dispatchEvent(new Event('storage'));
        } catch (statusErr) {
          console.error("Gagal memperbarui status worker ke available:", statusErr);
        }
      }
      
      setOrder({ ...order, status: newStatus });
      alert(`Berhasil memperbarui status menjadi: ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate status');
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
      await fetchHistoryLogs(order.id);
      if (actionName === 'on_the_way' || actionName === 'arrived') {
        try {
          const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
          const WORKER_ID = workerData.id || 1;
          await apiWorkerService.patch(`/api/v2/workers/${WORKER_ID}/status`, { status: 'busy' });
          workerData.status = 'busy';
          localStorage.setItem('workerData', JSON.stringify(workerData));
          window.dispatchEvent(new Event('storage'));
        } catch (statusErr) {
          console.error("Gagal memperbarui status worker ke busy:", statusErr);
        }
      }
      alert(`Log "${note}" berhasil dicatat!`);
    } catch (err) {
      console.error(err);
      alert('Gagal mencatat log waktu');
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
      e.target.value = '';
    }
  };

  // Determine effective status based on SQL order status & Firestore history logs
  const getEffectiveStatus = () => {
    if (!order) return '';
    if (order.status === 'completed' || order.status === 'in_progress') {
      return order.status;
    }
    const hasArrivedLog = historyLogs.some(log => log.status === 'arrived');
    if (hasArrivedLog) return 'arrived';
    const hasOnTheWayLog = historyLogs.some(log => log.status === 'on_the_way');
    if (hasOnTheWayLog) return 'on_the_way';
    return order.status;
  };

  const effectiveStatus = getEffectiveStatus();

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      {/* Back navigation */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-text-secondary hover:text-text font-bold text-sm transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Main Task Detail Card */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden border-t-4 border-t-primary">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-custom flex justify-between items-center bg-slate-50/50">
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-text text-base">Detail Tugas</h2>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">ID Order #{order.id}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border
            ${effectiveStatus === 'completed' ? 'bg-teal/10 border-teal/20 text-teal' :
              effectiveStatus === 'in_progress' ? 'bg-primary-bg border-primary-light/20 text-primary' :
              'bg-warning/10 border-warning/20 text-warning'}`}>
            {effectiveStatus.toUpperCase()}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Details list */}
          <div className="grid grid-cols-1 gap-5">
            
            {/* Customer Contact Card */}
            <div className="bg-slate-50/70 border border-border-custom rounded-2xl p-5 space-y-3.5">
              <span className="text-xs font-bold text-text uppercase tracking-wider block">Pelanggan</span>
              
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-primary-bg-deep flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                  {order.user_name?.charAt(0).toUpperCase() || 'P'}
                </div>
                
                <div className="space-y-1">
                  <span className="font-extrabold text-text block text-base">{order.user_name || 'Pelanggan'}</span>
                  
                  <span className="text-text-secondary text-sm flex items-center gap-1.5 font-semibold">
                    <Phone size={14} className="text-text-muted" />
                    {customer?.phone || '+62 812-3456-7890'}
                  </span>

                  <span className="text-text-secondary text-sm flex items-start gap-1.5 font-semibold leading-tight pt-0.5">
                    <MapPin size={14} className="text-text-muted mt-0.5 shrink-0" />
                    {order.address_detail}
                  </span>
                </div>
              </div>
            </div>

            {/* Service & Time Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Service Details */}
              <div className="p-4 rounded-xl border border-border-custom bg-slate-50/30">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Layanan</span>
                <span className="font-extrabold text-text text-sm flex items-center gap-1.5">
                  <Briefcase size={16} className="text-primary shrink-0" />
                  {order.service_name || `Layanan ID #${order.service_id}`}
                </span>
              </div>

              {/* Time Details */}
              <div className="p-4 rounded-xl border border-border-custom bg-slate-50/30">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Waktu Penjadwalan</span>
                <span className="font-extrabold text-text text-sm flex items-center gap-1.5">
                  <Clock size={16} className="text-primary shrink-0" />
                  {new Date(order.scheduled_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} - {new Date(order.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>

            </div>

          </div>

          {/* Chat Button */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="pt-4 border-t border-border-custom">
              <button 
                onClick={() => {
                  setChatOrder(order);
                  setIsChatOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-text-secondary font-extrabold py-3.5 px-4 rounded-xl text-sm transition-colors cursor-pointer"
              >
                <MessageSquare size={18} /> Chat Pelanggan
              </button>
            </div>
          )}

          {/* Job Actions */}
          <div className="pt-4 border-t border-border-custom space-y-4">
            <h3 className="font-extrabold text-text text-sm">Log & Aksi Pekerjaan</h3>
            
            {effectiveStatus !== 'in_progress' && effectiveStatus !== 'completed' && (
              <div className="space-y-4">
                
                {/* Travel Logging */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Berangkat (Perjalanan) */}
                  <button 
                    onClick={() => logMicroAction('on_the_way', 'Petugas sedang dalam perjalanan menuju lokasi.')}
                    disabled={effectiveStatus === 'on_the_way' || effectiveStatus === 'arrived'}
                    className={`flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors
                      ${effectiveStatus === 'on_the_way' 
                        ? 'bg-orange-500 text-white border border-orange-500 cursor-default' 
                        : effectiveStatus === 'arrived'
                          ? 'bg-slate-100 border border-border-custom text-text-muted cursor-not-allowed'
                          : 'bg-orange-50 hover:bg-orange-100 border border-orange-100 text-orange-600 cursor-pointer'}`}
                  >
                    <MapPin size={16} />
                    {effectiveStatus === 'on_the_way' ? 'Berangkat (Aktif)' : effectiveStatus === 'arrived' ? 'Berangkat (Selesai)' : 'Berangkat'}
                  </button>

                  {/* Tiba */}
                  <button 
                    onClick={() => logMicroAction('arrived', 'Petugas telah tiba di lokasi.')}
                    disabled={effectiveStatus !== 'on_the_way'}
                    title={effectiveStatus !== 'on_the_way' && effectiveStatus !== 'arrived' ? 'Anda harus Berangkat terlebih dahulu' : ''}
                    className={`flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors
                      ${effectiveStatus === 'arrived'
                        ? 'bg-teal text-white border border-teal cursor-default'
                        : effectiveStatus === 'on_the_way'
                          ? 'bg-teal/5 hover:bg-teal/10 border border-teal/10 text-teal cursor-pointer'
                          : 'bg-slate-100 border border-border-custom text-slate-300 cursor-not-allowed'}`}
                  >
                    <Check size={16} />
                    {effectiveStatus === 'arrived' ? 'Tiba (Aktif)' : 'Tiba di Lokasi'}
                  </button>
                </div>
                
                {/* Start job */}
                {effectiveStatus === 'arrived' ? (
                  <button 
                    onClick={() => triggerPhotoUpload('start')}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-extrabold py-4 px-6 rounded-2xl shadow-md transition-all text-sm cursor-pointer"
                  >
                    <Camera size={18} />
                    {uploading && pendingAction === 'start' ? 'Mengupload Foto...' : 'Mulai Pekerjaan & Foto Sebelum'}
                  </button>
                ) : (
                  <div 
                    className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-400 font-extrabold py-4 px-6 rounded-2xl border border-slate-300/10 text-sm cursor-not-allowed text-center"
                    title="Anda harus mencatat 'Tiba' terlebih dahulu sebelum dapat memulai pekerjaan"
                  >
                    <Camera size={18} />
                    Mulai Pekerjaan & Foto Sebelum (Terkunci)
                  </div>
                )}
              </div>
            )}

            {effectiveStatus === 'in_progress' && (
              /* Finish job */
              <button 
                onClick={() => triggerPhotoUpload('finish')}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark disabled:bg-teal/50 text-white font-extrabold py-4 px-6 rounded-2xl shadow-md transition-all text-sm cursor-pointer"
              >
                <Camera size={18} />
                {uploading && pendingAction === 'finish' ? 'Mengupload Foto...' : 'Selesaikan Pekerjaan & Foto Sesudah'}
              </button>
            )}

            {effectiveStatus === 'completed' && (
              /* Job complete success notification */
              <div className="bg-teal/10 border border-teal/20 text-teal p-4 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Tugas ini telah selesai dengan sukses! 🎉
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Invisible file input for photo uploads */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Pop-up ChatModal matching fe-user-cleanco style */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        order={chatOrder} 
      />

    </div>
  );
}
