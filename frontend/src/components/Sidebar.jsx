import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  TrendingUp, 
  AlertTriangle, 
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Anomalies', path: '/anomalies', icon: AlertTriangle },
  ];

  return (
    <div className="w-64 bg-white border-r border-surface-200 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-surface-900 tracking-tight">Smart Retail</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'
                  }`} 
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-surface-100">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-all">
          <Settings className="w-5 h-5 text-surface-400" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
