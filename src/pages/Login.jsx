import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Hardcode autentikasi seperti permintaan (username: admin, password: admin123)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'super-secret-admin-token');
      window.location.href = '/dashboard';
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Decorative Ambient Blobs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl -top-48 -left-48 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/25 blur-3xl -bottom-48 -right-48 pointer-events-none"></div>

      {/* Login Card */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 w-full max-w-md relative z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-blue-800">CleanCo</h2>
          <span className="text-xs font-bold text-blue-500/70 tracking-widest uppercase block mt-1.5">
            Admin Panel
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 text-sm animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-wider">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 mt-6"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}

