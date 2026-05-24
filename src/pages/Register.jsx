import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUserOrder } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiUserOrder.post('/api/v1/users', formData);
      alert('Pendaftaran berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      console.error("Gagal mendaftar:", err);
      setError(err.response?.data?.error || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Daftar Akun CleanCo</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nama Lengkap</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            placeholder="Budi Santoso"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            placeholder="budi@example.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            placeholder="Minimal 6 karakter"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nomor Telepon</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            placeholder="081234567890"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Alamat Lengkap</label>
          <textarea 
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            required
            placeholder="Jl. Sudirman No. 1..."
          ></textarea>
        </div>
        <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: loading ? '#94a3b8' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Sudah punya akun? <Link to="/login" style={{ color: '#0ea5e9' }}>Login di sini</Link>
      </p>
    </div>
  );
}
