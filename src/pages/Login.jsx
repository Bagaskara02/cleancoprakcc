import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUserOrder } from '../services/api';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiUserOrder.post('/api/v1/users/login', { email, password });
      const userData = response.data.user;
      
      // Simpan userId ke localStorage
      localStorage.setItem('userId', userData.id);
      
      navigate('/');
    } catch (err) {
      console.error("Gagal login:", err);
      setError(err.response?.data?.error || 'Email atau password salah.');
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
            <Link to="/login" className="auth-tab active">Masuk</Link>
            <Link to="/register" className="auth-tab">Daftar</Link>
          </div>
          <h2 className="auth-heading">Selamat Datang Kembali</h2>
          <p className="auth-subtext">Masukkan detail akun Anda untuk masuk.</p>
          {error && <div className="auth-error">{error}</div>}
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Alamat Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={18} /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="contoh@email.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={18} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan kata sandi Anda"
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
            <div className="form-link">
              <a href="#">Lupa kata sandi?</a>
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          <p className="auth-footer-text">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
