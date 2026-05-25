import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Briefcase, LogOut, Users } from 'lucide-react';

export default function Sidebar() {
  const menus = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Katalog Layanan', path: '/services', icon: <Briefcase size={20} /> },
    { name: 'Data Pekerja', path: '/workers', icon: <Users size={20} /> },
    { name: 'Data Pesanan', path: '/orders', icon: <ClipboardList size={20} /> },
  ];

  return (
    <aside className="w-64 bg-blue-800 text-white min-h-screen flex flex-col p-6 shadow-xl border-r border-blue-900/20">
      {/* Brand Logo & Subtitle */}
      <div className="mb-10 px-2 mt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">CleanCo</h1>
        <span className="text-[10px] font-bold tracking-widest text-blue-200 uppercase block mt-1">
          ADMIN PANEL
        </span>
      </div>

      {/* Navigation Menus */}
      <nav className="space-y-1.5 flex-1">
        {menus.map((m) => (
          <NavLink
            key={m.path}
            to={m.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-blue-100 hover:bg-blue-700/40 hover:text-white'
              }`
            }
          >
            <span className="opacity-90">{m.icon}</span>
            <span>{m.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
