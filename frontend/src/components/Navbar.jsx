import { Bell, Search, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);
  const title = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button could go here */}
        <h1 className="text-xl font-semibold text-surface-900 capitalize">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <button 
          onClick={() => api.logout()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-surface-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-100"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
