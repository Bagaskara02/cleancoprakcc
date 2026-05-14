import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Briefcase } from 'lucide-react';

export default function Sidebar() {
  const menus = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Katalog Layanan', path: '/services', icon: <Briefcase size={20} /> },
    { name: 'Data Pesanan', path: '/orders', icon: <ClipboardList size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold text-blue-400 mb-8 px-4 mt-4">✨ CleanCo.</h1>
      <nav className="space-y-2">
        {menus.map((m) => (
          <NavLink key={m.path} to={m.path} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400'}`}>
            {m.icon} <span>{m.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}