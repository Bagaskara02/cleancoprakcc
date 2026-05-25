import { LogOut, User } from 'lucide-react';

export default function Topbar() {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm font-sans">
      {/* Left side: Dynamic Page Context Title */}
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-800">CleanCo Admin</h2>
      </div>

      {/* Right side: Action Icons and User Profile */}
      <div className="flex items-center gap-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-bold active:scale-95"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline">Logout</span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile Avatar */}
        <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm select-none">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}

