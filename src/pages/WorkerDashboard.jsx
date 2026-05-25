import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUserOrder, apiWorkerService } from '../services/api';
import ChatModal from '../components/ChatModal';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle, 
  CreditCard, 
  Star, 
  Briefcase, 
  Camera, 
  ChevronRight, 
  Navigation,
  Phone,
  MessageSquare
} from 'lucide-react';

export default function WorkerDashboard() {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'start' atau 'finish'
  const [historyLogs, setHistoryLogs] = useState([]);
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatOrder, setChatOrder] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
  const WORKER_ID = workerData.id || 1;

  useEffect(() => {
    fetchOrders();
    fetchReviews();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await apiUserOrder.get(`/api/v1/reviews/worker/${WORKER_ID}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Gagal mengambil ulasan:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await apiUserOrder.get('/api/v1/orders');
      const myOrders = res.data.filter(o => o.worker_id === WORKER_ID && o.status !== 'cancelled');
      setOrders(myOrders);
    } catch (error) {
      console.error("Gagal mengambil tugas:", error);
    } finally {
      setLoading(false);
    }
  };

  // ACTIVE TASK QUEUE PRIORITY LOGIC:
  // 1. Filter all active (uncompleted) tasks.
  // 2. Sort: 'in_progress' comes first. If none, sort by scheduled_at ascending (oldest/earliest first).
  // 3. activeTask = sorted[0].
  // 4. upcomingTasks = sorted.slice(1).
  const activeTasks = orders.filter(o => o.status !== 'completed');
  
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
    return new Date(a.scheduled_at) - new Date(b.scheduled_at);
  });

  const activeTask = sortedActiveTasks[0] || null;
  const upcomingTasks = sortedActiveTasks.slice(1);

  // Fetch active customer user data
  useEffect(() => {
    if (activeTask) {
      apiUserOrder.get(`/api/v1/users/${activeTask.user_id}`)
        .then(res => setActiveUser(res.data))
        .catch(err => {
          console.error("Gagal mengambil data pelanggan:", err);
          setActiveUser(null);
        });
    } else {
      setActiveUser(null);
    }
  }, [activeTask]);

  // Fetch active task history logs
  useEffect(() => {
    if (activeTask) {
      fetchHistoryLogs(activeTask.id);
    } else {
      setHistoryLogs([]);
    }
  }, [activeTask]);

  const fetchHistoryLogs = async (orderId) => {
    try {
      const res = await apiUserOrder.get(`/api/v1/order-history/${orderId}`);
      setHistoryLogs(res.data);
    } catch (err) {
      console.error("Gagal mengambil histori:", err);
      setHistoryLogs([]);
    }
  };

  // Determine effective status based on Firestore logs & SQL status
  const getEffectiveStatus = () => {
    if (!activeTask) return '';
    if (activeTask.status === 'completed' || activeTask.status === 'in_progress') {
      return activeTask.status;
    }
    const hasArrivedLog = historyLogs.some(log => log.status === 'arrived');
    if (hasArrivedLog) return 'arrived';
    const hasOnTheWayLog = historyLogs.some(log => log.status === 'on_the_way');
    if (hasOnTheWayLog) return 'on_the_way';
    return activeTask.status;
  };

  const effectiveStatus = getEffectiveStatus();

  // Statistics calculation for TODAY
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.scheduled_at).toDateString() === todayStr);
  const completedToday = todayOrders.filter(o => o.status === 'completed');
  const earningsToday = completedToday.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  // If worker is new (reviews.length === 0), average rating is '0.0' and working hours start from 0
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const totalMinutesWorkedToday = completedToday.reduce((sum, o) => sum + (Number(o.duration_minutes) || 0), 0);
  const hoursWorkedToday = parseFloat((totalMinutesWorkedToday / 60).toFixed(1));

  const getServiceDetails = (serviceName) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('kamar mandi')) {
      return ['2 Kamar Mandi', 'Pembersihan kerak & noda', 'Desinfektan total'];
    }
    if (name.includes('ac')) {
      return ['Pembersihan filter & evaporator', 'Cek tekanan freon', 'Garansi cuci 14 hari'];
    }
    if (name.includes('sofa')) {
      return ['Pembersihan debu & tungau', 'Pembersihan noda & kotoran', 'Extractor washing'];
    }
    if (name.includes('setrika') || name.includes('pakaian')) {
      return ['Setrika rapi & wangi', 'Pelipatan pakaian', 'Pemisahan bahan sensitif'];
    }
    return ['Pembersihan menyeluruh', 'Pengerjaan cepat & rapi', 'Peralatan lengkap disediakan'];
  };

  const updateStatus = async (orderId, newStatus, note, photo_url) => {
    try {
      await apiUserOrder.patch(`/api/v1/orders/${orderId}/status`, { status: newStatus });
      await apiUserOrder.post('/api/v1/order-history', {
        orderId,
        status: newStatus,
        updatedByRole: 'worker',
        note,
        photo_url
      });
      await fetchHistoryLogs(orderId);
      
      // If task is completed, make worker available again!
      if (newStatus === 'completed') {
        try {
          await apiWorkerService.patch(`/api/v2/workers/${WORKER_ID}/status`, { status: 'available' });
          const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
          workerData.status = 'available';
          localStorage.setItem('workerData', JSON.stringify(workerData));
          window.dispatchEvent(new Event('storage'));
        } catch (statusErr) {
          console.error("Gagal memperbarui status worker ke available:", statusErr);
        }
      }
      
      fetchOrders();
      alert(`Berhasil memperbarui status menjadi: ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate status');
    }
  };

  const logMicroAction = async (orderId, actionName, note) => {
    try {
      await apiUserOrder.post('/api/v1/order-history', {
        orderId,
        status: actionName,
        updatedByRole: 'worker',
        note,
        photo_url: ''
      });
      await fetchHistoryLogs(orderId);
      if (actionName === 'on_the_way' || actionName === 'arrived') {
        try {
          await apiWorkerService.patch(`/api/v2/workers/${WORKER_ID}/status`, { status: 'busy' });
          const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');
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
    if (!file || !activeTask) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const uploadRes = await apiWorkerService.post('/api/v2/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const photoUrl = uploadRes.data.url;

      if (pendingAction === 'start') {
        await updateStatus(activeTask.id, 'in_progress', 'Pekerja telah tiba dan mulai membersihkan.', photoUrl);
      } else if (pendingAction === 'finish') {
        await updateStatus(activeTask.id, 'completed', 'Pekerjaan selesai dilakukan dengan baik.', photoUrl);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-10 w-full max-w-full overflow-hidden">
      
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full">
        
        {/* Stat 1: Pendapatan Hari Ini */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-primary-bg flex items-center justify-center text-primary shrink-0">
            <CreditCard size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] lg:text-xs font-bold text-text-muted block uppercase tracking-wider mb-0.5 truncate">Pendapatan Hari Ini</span>
            <span className="text-lg lg:text-xl font-extrabold text-text block truncate">
              {formatPrice(earningsToday)}
            </span>
          </div>
        </div>

        {/* Stat 2: Tugas Selesai */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center text-teal shrink-0">
            <CheckCircle size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] lg:text-xs font-bold text-text-muted block uppercase tracking-wider mb-0.5 truncate">Tugas Selesai</span>
            <span className="text-lg lg:text-xl font-extrabold text-text block truncate">
              {completedToday.length} / {todayOrders.length}
            </span>
          </div>
        </div>

        {/* Stat 3: Rating Rata-rata */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
            <Star size={22} className="fill-warning" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] lg:text-xs font-bold text-text-muted block uppercase tracking-wider mb-0.5 truncate">Rating Rata-rata</span>
            <span className="text-lg lg:text-xl font-extrabold text-text block truncate">{averageRating}</span>
          </div>
        </div>

        {/* Stat 4: Total Jam Kerja */}
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger shrink-0">
            <Clock size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] lg:text-xs font-bold text-text-muted block uppercase tracking-wider mb-0.5 truncate">Total Jam Kerja</span>
            <span className="text-lg lg:text-xl font-extrabold text-text block truncate">{hoursWorkedToday} Jam</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Tugas Saat Ini (Left) vs Jadwal Berikutnya (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* Left Column: Tugas Saat Ini */}
        <div className="lg:col-span-2 space-y-6 w-full">
          
          {activeTask ? (
            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden border-t-4 border-t-primary w-full">
              
              {/* Card Header */}
              <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-border-custom flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-bg flex items-center justify-center text-primary">
                    <Briefcase size={16} />
                  </div>
                  <h2 className="font-extrabold text-text text-sm lg:text-base">Tugas Saat Ini</h2>
                </div>
                
                {/* Scheduled Time Pill */}
                <span className="bg-warning/10 border border-warning/15 text-warning text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {effectiveStatus === 'in_progress' ? 'Sedang Dikerjakan' : 'Segera'} - {new Date(activeTask.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 lg:p-6 space-y-6 w-full">
                
                {/* Customer Info Card */}
                <div className="bg-slate-50/70 border border-border-custom rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center w-full">
                  <div className="flex gap-3.5 items-start min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary-bg-deep flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                      {activeTask.user_name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="font-extrabold text-text block text-base truncate">{activeTask.user_name || 'Pelanggan'}</span>
                      <span className="text-text-secondary text-xs lg:text-sm flex items-center gap-1.5 font-semibold">
                        <Phone size={13} className="text-text-muted" />
                        {activeUser?.phone || '+62 812-3456-7890'}
                      </span>
                      <span className="text-text-secondary text-xs lg:text-sm flex items-start gap-1.5 mt-1 font-semibold leading-snug break-words">
                        <MapPin size={13} className="text-text-muted mt-0.5 shrink-0" />
                        {activeTask.address_detail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Details Section */}
                <div className="space-y-3 w-full">
                  <span className="text-xs font-bold text-text uppercase tracking-wider block">Rincian Layanan</span>
                  
                  <div className="flex gap-4 items-start w-full">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                        <rect x="5" y="10" width="14" height="5" rx="1.5" />
                        <path d="M7 15v3M10 15v3M13 15v3M17 15v3" />
                      </svg>
                    </div>
                    
                    {/* Bullet List Details */}
                    <div className="space-y-2 min-w-0 flex-1">
                      <h3 className="font-extrabold text-text text-base leading-none truncate">
                        {activeTask.service_name || `Layanan ID #${activeTask.service_id}`}
                      </h3>
                      <ul className="space-y-1.5">
                        {getServiceDetails(activeTask.service_name).map((detail, idx) => (
                          <li key={idx} className="text-text-secondary text-xs lg:text-sm flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Chat and Travel Status Logs Actions */}
                <div className="pt-5 border-t border-border-custom flex flex-col sm:flex-row gap-3">
                  {activeTask.status !== 'completed' && activeTask.status !== 'cancelled' && (
                    <button 
                      onClick={() => {
                        setChatOrder(activeTask);
                        setIsChatOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-text-secondary font-bold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      Chat Pelanggan
                    </button>
                  )}

                  {effectiveStatus !== 'in_progress' && (
                    <>
                      {/* Perjalanan Button */}
                      <button 
                        onClick={() => logMicroAction(activeTask.id, 'on_the_way', 'Petugas sedang dalam perjalanan menuju lokasi.')}
                        disabled={effectiveStatus === 'on_the_way' || effectiveStatus === 'arrived'}
                        className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl text-sm transition-colors
                          ${effectiveStatus === 'on_the_way' 
                            ? 'bg-orange-500 text-white border border-orange-500 cursor-default' 
                            : effectiveStatus === 'arrived'
                              ? 'bg-slate-100 border border-border-custom text-text-muted cursor-not-allowed'
                              : 'bg-orange-50 hover:bg-orange-100 border border-orange-100 text-orange-600 cursor-pointer'}`}
                      >
                        <MapPin size={16} />
                        {effectiveStatus === 'on_the_way' ? 'Perjalanan (Aktif)' : effectiveStatus === 'arrived' ? 'Perjalanan (Selesai)' : 'Perjalanan'}
                      </button>

                      {/* Tiba Button */}
                      <button 
                        onClick={() => logMicroAction(activeTask.id, 'arrived', 'Petugas telah tiba di lokasi.')}
                        disabled={effectiveStatus !== 'on_the_way'}
                        title={effectiveStatus !== 'on_the_way' && effectiveStatus !== 'arrived' ? 'Anda harus memulai Perjalanan terlebih dahulu' : ''}
                        className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl text-sm transition-colors
                          ${effectiveStatus === 'arrived'
                            ? 'bg-teal text-white border border-teal cursor-default'
                            : effectiveStatus === 'on_the_way'
                              ? 'bg-teal/5 hover:bg-teal/10 border border-teal/10 text-teal cursor-pointer'
                              : 'bg-slate-100 border border-border-custom text-slate-300 cursor-not-allowed'}`}
                      >
                        <CheckCircle size={16} />
                        {effectiveStatus === 'arrived' ? 'Tiba (Aktif)' : 'Tiba'}
                      </button>
                    </>
                  )}
                </div>

                {/* Primary Job Actions (Mulai / Selesai) */}
                <div className="pt-4">
                  {effectiveStatus !== 'in_progress' ? (
                    effectiveStatus === 'arrived' ? (
                      <button 
                        onClick={() => triggerPhotoUpload('start')}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-extrabold py-3.5 lg:py-4 px-6 rounded-2xl shadow-md shadow-primary/10 hover:shadow-lg transition-all text-sm cursor-pointer"
                      >
                        <Camera size={18} />
                        {uploading && pendingAction === 'start' ? 'Mengupload Foto...' : 'Mulai Pekerjaan & Foto Sebelum'}
                      </button>
                    ) : (
                      <div 
                        className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-400 font-extrabold py-3.5 lg:py-4 px-6 rounded-2xl border border-slate-300/10 text-sm cursor-not-allowed"
                        title="Anda harus mencatat 'Tiba' terlebih dahulu sebelum dapat memulai pekerjaan"
                      >
                        <Camera size={18} />
                        Mulai Pekerjaan & Foto Sebelum (Terkunci)
                      </div>
                    )
                  ) : (
                    <button 
                      onClick={() => triggerPhotoUpload('finish')}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark disabled:bg-teal/50 text-white font-extrabold py-3.5 lg:py-4 px-6 rounded-2xl shadow-md shadow-teal/10 hover:shadow-lg transition-all text-sm cursor-pointer"
                    >
                      <Camera size={18} />
                      {uploading && pendingAction === 'finish' ? 'Mengupload Bukti...' : 'Selesai & Foto Sesudah'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border-custom p-8 lg:p-12 shadow-sm text-center w-full">
              <CheckCircle size={48} className="mx-auto text-teal mb-4 opacity-40" />
              <h3 className="font-extrabold text-text text-lg">Tidak ada tugas aktif</h3>
              <p className="text-text-muted text-sm mt-1">Anda sudah menyelesaikan semua tugas Anda untuk saat ini. Kerja bagus!</p>
            </div>
          )}

        </div>

        {/* Right Column: Jadwal Berikutnya */}
        <div className="bg-white rounded-2xl border border-border-custom shadow-sm p-5 lg:p-6 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-text text-sm lg:text-base">Jadwal Berikutnya</h2>
            <button 
              onClick={() => navigate('/active-tasks')}
              className="text-xs font-bold text-primary hover:text-primary-dark cursor-pointer whitespace-nowrap"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <p className="text-text-muted text-xs lg:text-sm text-center py-6">Belum ada tugas berikutnya.</p>
            ) : (
              upcomingTasks.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => navigate(`/order/${order.id}`, { state: { order } })}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-custom hover:border-primary-light hover:bg-slate-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-text-secondary font-bold text-xs shrink-0">
                      {order.user_name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-extrabold text-text block text-xs lg:text-sm group-hover:text-primary transition-colors truncate">
                        {order.user_name || 'Pelanggan'}
                      </span>
                      <span className="text-[10px] text-text-muted block font-bold uppercase truncate">
                        {order.service_name || `Layanan ID #${order.service_id}`}
                      </span>
                      <span className="text-[9px] text-primary font-bold flex items-center gap-1 mt-0.5">
                        <Clock size={9} />
                        {new Date(order.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        {new Date(order.scheduled_at).toDateString() !== todayStr && ' (Besok)'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>

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
