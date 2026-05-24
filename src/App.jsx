import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import WorkerDashboard from './pages/WorkerDashboard';
import OrderDetail from './pages/OrderDetail';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import { Bell } from 'lucide-react';
import './index.css';

function Navbar() {
  const navigate = useNavigate();
  const workerData = JSON.parse(localStorage.getItem('workerData') || 'null');
  
  if (!workerData) return null; // Don't show navbar on login page

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">W</span>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-green-600">CleanCo Worker</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/notifications')} 
          className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Bell size={20} />
        </button>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-800 block">{workerData.name}</span>
          <button 
            onClick={() => { localStorage.removeItem('workerData'); navigate('/login'); }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Keluar
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
          <span className="text-sky-700 font-bold">{workerData.name?.charAt(0).toUpperCase() || 'W'}</span>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const isAuth = () => localStorage.getItem('workerData') !== null;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={isAuth() ? <WorkerDashboard /> : <Navigate to="/login" />} />
            <Route path="/order/:id" element={isAuth() ? <OrderDetail /> : <Navigate to="/login" />} />
            <Route path="/chat/:orderId" element={isAuth() ? <Chat /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={isAuth() ? <Notifications /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
