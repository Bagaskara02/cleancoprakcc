import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { apiUserOrder } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userId = localStorage.getItem('userId');
  const [userName, setUserName] = useState('');

  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : 'U';
  };

  useEffect(() => {
    if (userId) {
      apiUserOrder.get(`/api/v1/users/${userId}`).then(res => {
        if (res.data && res.data.name) {
          setUserName(res.data.name);
        }
      }).catch(err => console.error(err));
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">CleanCo</Link>

      <div className="nav-center">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Beranda
        </Link>
        <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
          Layanan
        </Link>
        <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
          Pesanan Saya
        </Link>
      </div>

      <div className="nav-right">
        <Link to="/notifications" className="nav-bell">
          <Bell size={20} />
          <span className="bell-badge"></span>
        </Link>

        <div className="nav-avatar-wrapper" ref={dropdownRef}>
          <div
            className="nav-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {getInitial()}
          </div>
          <div className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
            <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
              <Settings size={16} />
              Profil
            </Link>
            <div className="nav-dropdown-divider" />
            <button className="nav-dropdown-item danger" onClick={handleLogout}>
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
