import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { User, Bell, CalendarCheck, Tag, CheckCircle } from 'lucide-react';

export default function Profile() {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeMenu, setActiveMenu] = useState('personal');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (userId) {
      // Fetch data profil user dari backend
      apiUserOrder.get(`/api/v1/users/${userId}`).then(res => {
        if (res.data) {
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            address: res.data.address || ''
          });
        }
      }).catch(err => console.error("Gagal mengambil data user:", err));

      apiUserOrder.get(`/api/v1/notifications/${userId}`).then(res => {
        setNotifications(res.data.slice(0, 3));
      }).catch(err => console.error(err));
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (userId) {
      apiUserOrder.put(`/api/v1/users/${userId}`, formData)
        .then(res => {
          alert('Perubahan disimpan!');
        })
        .catch(err => {
          console.error("Gagal menyimpan perubahan:", err);
          alert('Gagal menyimpan perubahan. Silakan coba lagi.');
        });
    }
  };

  const getInitial = () => {
    return formData.name ? formData.name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className='settings-page'>
      {/* Sidebar */}
      <div className='settings-sidebar'>
        <div className='sidebar-avatar'>{getInitial()}</div>
        <div className='sidebar-title'>Pengaturan Akun</div>
        <p className='sidebar-subtitle'>Kelola preferensi Anda</p>
        <div className='sidebar-menu'>
          <button className={`sidebar-menu-item ${activeMenu === 'personal' ? 'active' : ''}`} onClick={() => setActiveMenu('personal')}>
            <User size={18} /> Info Pribadi
          </button>
          <button className='sidebar-menu-item' onClick={() => navigate('/notifications')}>
            <Bell size={18} /> Notifikasi {notifications.length > 0 && <span className='menu-badge'>{notifications.length}</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className='settings-content'>
        <h2>Info Pribadi</h2>
        <p className='settings-desc'>Perbarui detail pribadi Anda dan cara kami menghubungi Anda.</p>
        <form className='settings-form' onSubmit={handleSave}>
          <div className='form-group'>
            <label>Nama Lengkap</label>
            <input name='name' value={formData.name} onChange={handleChange} placeholder='Nama Lengkap Anda' />
          </div>
          <div className='form-group'>
            <label>Alamat Email</label>
            <input name='email' type='email' value={formData.email} onChange={handleChange} placeholder='email@contoh.com' />
          </div>
          <div className='form-group'>
            <label>Nomor Telepon</label>
            <input name='phone' value={formData.phone} onChange={handleChange} placeholder='081234567890' />
          </div>
          <div className='form-group'>
            <label>Alamat Rumah</label>
            <textarea name='address' value={formData.address} onChange={handleChange} placeholder='Alamat lengkap...' rows={3} />
          </div>
          <div className='settings-actions'>
            <button type='button' className='btn-cancel'>Batal</button>
            <button type='submit' className='btn-save'>Simpan Perubahan</button>
          </div>
        </form>
      </div>

      {/* Notifications panel */}
      <div className='settings-notif-panel'>
        <div className='notif-panel-header'>
          <h3>Notifikasi</h3>
        </div>
        <div className='notif-panel-list'>
          {notifications.length === 0 ? (
            <p className='empty-state'>Tidak ada notifikasi</p>
          ) : (
            notifications.map((notif, idx) => (
              <div key={idx} className='notif-panel-item'>
                <div className={`notif-panel-icon ${idx === 0 ? 'blue' : idx === 1 ? 'yellow' : 'green'}`}>
                  {idx === 0 ? <CalendarCheck size={18} /> : idx === 1 ? <Tag size={18} /> : <CheckCircle size={18} />}
                </div>
                <div className='notif-panel-info'>
                  <h5>{notif.title}</h5>
                  <p>{notif.message?.substring(0, 50)}...</p>
                  <span className='notif-panel-time'>{new Date(notif.createdAt).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
