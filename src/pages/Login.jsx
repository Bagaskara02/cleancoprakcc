import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUserOrder } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    <div className="auth-container" style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Masuk ke CleanCo</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            placeholder="contoh@email.com"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            placeholder="Masukkan password Anda"
          />
        </div>
        <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: loading ? '#94a3b8' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Belum punya akun? <Link to="/register" style={{ color: '#0ea5e9' }}>Daftar di sini</Link>
      </p>
    </div>
  );
}
