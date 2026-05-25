import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import WorkerDashboard from './pages/WorkerDashboard';
import OrderDetail from './pages/OrderDetail';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import History from './pages/History';
import Profile from './pages/Profile';
import ActiveTasks from './pages/ActiveTasks';
import Reviews from './pages/Reviews';
import { apiWorkerService } from './services/api';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  User, 
  Bell, 
  LogOut, 
  Sparkles, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Star
} from 'lucide-react';
import './index.css';

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [workerData, setWorkerData] = useState(() => {
    return JSON.parse(localStorage.getItem('workerData') || 'null');
  });
  const [status, setStatus] = useState(workerData?.status || 'available');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem('workerData') || 'null');
      setWorkerData(updated);
      if (updated) setStatus(updated.status || 'available');
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!workerData) return <>{children}</>;

  const handleToggleSidebar = () => {
    const nextCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextCollapsed);
    localStorage.setItem('sidebarCollapsed', String(nextCollapsed));
  };

  const handleLogout = () => {
    localStorage.removeItem('workerData');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path === '/active-tasks') return 'Tugas Aktif';
    if (path === '/history') return 'Riwayat & Pendapatan';
    if (path === '/reviews') return 'Ulasan Pelanggan';
    if (path === '/profile') return 'Profil Saya';
    if (path.startsWith('/order/')) return 'Detail Tugas';
    if (path.startsWith('/chat/')) return 'Obrolan Pelanggan';
    if (path === '/notifications') return 'Notifikasi';
    return 'Dashboard';
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Tugas Aktif', path: '/active-tasks', icon: ClipboardList },
    { label: 'History', path: '/history', icon: HistoryIcon },
    { label: 'Ulasan', path: '/reviews', icon: Star },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`relative hidden lg:flex flex-col bg-white border-r border-border-custom h-screen sticky top-0 shrink-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Floating Toggle Arrow Button on Right Border */}
        <button 
          onClick={handleToggleSidebar}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-border-custom hover:border-primary text-text-muted hover:text-text rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md z-50 hover:scale-105"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-border-custom ${isSidebarCollapsed ? 'justify-center px-2' : 'px-5'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <Sparkles size={18} className="fill-white/20" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-lg text-primary tracking-tight whitespace-nowrap">CleanCo Mitra</span>
            )}
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'bg-primary text-white shadow-lg shadow-primary/15 scale-[1.02]' 
                    : 'text-text-secondary hover:bg-slate-50 hover:text-text'
                } ${isSidebarCollapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3'}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <IconComponent size={20} className={active ? 'text-white' : 'text-text-muted'} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-border-custom">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-sm font-semibold text-danger hover:bg-red-50 transition-colors ${
              isSidebarCollapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3'
            }`}
            title={isSidebarCollapsed ? "Keluar" : undefined}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-white h-full flex flex-col animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <span className="font-bold text-base text-primary">CleanCo Mitra</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-text">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active 
                        ? 'bg-primary text-white shadow-md shadow-primary/10' 
                        : 'text-text-secondary hover:bg-slate-50 hover:text-text'
                    }`}
                  >
                    <IconComponent size={20} className={active ? 'text-white' : 'text-text-muted'} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border-custom">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-danger hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-border-custom px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text hover:bg-slate-50 rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            {/* Show sidebar toggle on top-header if collapsed or for convenience */}
            <h1 className="text-lg lg:text-xl font-bold text-text tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            
            {/* Status Badge (Read-only, synchronized with profile page) */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 select-none ${
                status === 'available'
                  ? 'bg-teal/10 border-teal/20 text-teal shadow-sm shadow-teal/5'
                  : status === 'busy'
                  ? 'bg-amber-100 border-amber-200 text-amber-700'
                  : 'bg-text-light/10 border-text-light/20 text-text-light'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'available' ? 'bg-teal' : status === 'busy' ? 'bg-amber-500' : 'bg-text-light'
              } animate-pulse`}></span>
              {status === 'available' ? 'Online' : status === 'busy' ? 'Busy' : 'Offline'}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 text-text-secondary hover:text-primary hover:bg-primary-bg rounded-full transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white"></span>
            </button>

            <div className="h-8 w-px bg-border-custom hidden sm:block"></div>

            {/* Worker Avatar & Info */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="text-right hidden sm:block">
                <span className="text-sm font-bold text-text block leading-none mb-0.5">{workerData.name}</span>
                <span className="text-xs text-text-muted block leading-none">Mitra Kebersihan</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-bg-deep border-2 border-primary-light flex items-center justify-center text-primary font-bold shadow-sm shadow-primary/10">
                {workerData.name?.charAt(0).toUpperCase() || 'W'}
              </div>
            </div>

          </div>
        </header>

        {/* Page Content Panel */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-custom h-16 px-4 flex items-center justify-between z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                active 
                  ? 'text-primary scale-105' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <IconComponent size={18} className={active ? 'text-primary' : 'text-text-muted'} />
              <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

function App() {
  const isAuth = () => localStorage.getItem('workerData') !== null;

  return (
    <Router>
      <Routes>
        {/* Public login page */}
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated Pages wrapped in MainLayout */}
        <Route 
          path="/*" 
          element={
            isAuth() ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<WorkerDashboard />} />
                  <Route path="/active-tasks" element={<ActiveTasks />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/order/:id" element={<OrderDetail />} />
                  <Route path="/chat/:orderId" element={<Chat />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
