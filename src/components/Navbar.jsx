import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CalendarClock, LogOut, Bell } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Sparkles className="icon-brand" />
        <Link to="/">CleanCo</Link>
      </div>
      <div className="nav-links">
        <Link to="/notifications" className="nav-item">
          <Bell size={18} />
          <span>Notifikasi</span>
        </Link>
        <Link to="/orders" className="nav-item">
          <CalendarClock size={18} />
          <span>Pesanan Saya</span>
        </Link>
        <button 
          className="btn-logout" 
          onClick={() => {
            localStorage.removeItem('userId');
            window.location.href = '/login';
          }}
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </nav>
  );
}
