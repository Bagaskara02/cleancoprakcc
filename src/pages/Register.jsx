import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-page">
      <div className="auth-image-panel">
        <div className="auth-brand">
          <h1>CleanCo</h1>
          <p>Kebersihan Profesional.</p>
        </div>
        <p className="auth-image-text">
          Rasakan standar kebersihan tertinggi yang dipadukan dengan keramahan premium. Terpercaya, efisien, dan bebas stres.
        </p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Masuk</Link>
            <Link to="/register" className="auth-tab active">Daftar</Link>
          </div>
          <h2 className="auth-heading">Buat Akun Baru</h2>
          <p className="auth-subtext">Lengkapi data diri Anda untuk mendaftar.</p>
          {error && <div className="auth-error">{error}</div>}
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={18} /></span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Budi Santoso"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={18} /></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="budi@example.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Nomor Telepon</label>
              <div className="input-wrapper">
                <span className="input-icon"><Phone size={18} /></span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="081234567890"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <div className="input-wrapper">
                <span className="input-icon"><MapPin size={18} /></span>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Jl. Sudirman No. 1..."
                ></textarea>
              </div>
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>
          <p className="auth-footer-text">
            Sudah punya akun? <Link to="/login">Login di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
