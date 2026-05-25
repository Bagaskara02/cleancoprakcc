import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiWorkerService } from '../services/api';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Briefcase } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await apiWorkerService.post('/api/v2/workers/login', { email, password });
      if (res.data && res.data.worker) {
        localStorage.setItem('workerData', JSON.stringify(res.data.worker));
        // Trigger a custom storage event so App.jsx picks it up instantly
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* Left Panel: Brand info */}
      <div className="flex-1 bg-primary flex flex-col justify-center items-center p-8 lg:p-16 text-white text-center md:text-left relative overflow-hidden min-h-[300px] md:min-h-screen">
        
        {/* Decorative Circle Backgrounds */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>

        <div className="max-w-md relative z-10 flex flex-col items-center md:items-start">
          {/* Cleaning Brush Icon Container */}
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm border border-white/15">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 10V6a3 3 0 0 1 6 0v4" />
              <rect x="5" y="10" width="14" height="5" rx="1.5" />
              <path d="M7 15v3M10 15v3M13 15v3M17 15v3" />
            </svg>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">CleanCo Mitra</h1>
          <p className="text-white/80 text-base lg:text-lg leading-relaxed font-medium">
            Portal Pekerja Profesional terpadu untuk mengatur jadwal, melacak pendapatan, dan mengembangkan layanan Anda.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:p-12 lg:p-24">
        <div className="w-full max-w-md mx-auto">
          
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-text tracking-tight mb-2">Selamat Datang Kembali</h2>
            <p className="text-text-muted text-sm font-semibold">Silakan masuk ke akun mitra Anda untuk melanjutkan.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger/5 border border-danger/10 text-danger p-4 rounded-2xl text-sm font-semibold mb-6 flex items-center justify-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input 1: ID Pekerja / Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text uppercase tracking-wider">ID Pekerja atau Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Briefcase size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 border border-border-custom rounded-2xl text-sm font-semibold text-text placeholder-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                  placeholder="Masukkan ID atau Email Anda"
                />
              </div>
            </div>

            {/* Input 2: Kata Sandi */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text uppercase tracking-wider">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-12 py-3.5 border border-border-custom rounded-2xl text-sm font-semibold text-text placeholder-text-muted/65 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forget Password */}
            <div className="text-right">
              <button 
                type="button"
                onClick={() => alert("Silakan hubungi admin Anda untuk mereset kata sandi.")}
                className="text-xs font-bold text-primary hover:text-primary-dark hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? 'Sedang Masuk...' : 'Masuk ke Dashboard'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Footer Assistance */}
          <div className="mt-8 text-center">
            <p className="text-xs text-text-muted font-semibold">
              Butuh bantuan?{' '}
              <button 
                onClick={() => alert("Hubungi Admin CleanCo di nomor +62 812-3456-7890")}
                className="text-primary hover:text-primary-dark hover:underline font-bold"
              >
                Hubungi Admin
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
