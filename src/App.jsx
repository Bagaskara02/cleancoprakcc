import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import WorkerDashboard from './pages/WorkerDashboard';
import OrderDetail from './pages/OrderDetail';
import Chat from './pages/Chat';
import './index.css';

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl">W</span>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-green-600">CleanCo Worker</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Halo, Petugas!</span>
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
          <span className="text-sky-700 font-bold">W1</span>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<WorkerDashboard />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/chat/:orderId" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
