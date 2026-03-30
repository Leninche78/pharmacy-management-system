import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Receipt, Users, LogOut, FileText, BarChart3, Settings as SettingsIcon } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/inventory', icon: <PackageSearch size={20} />, label: 'Inventory' },
    { to: '/pos', icon: <Receipt size={20} />, label: 'Point of Sale' },
    { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/prescriptions', icon: <FileText size={20} />, label: 'Prescriptions' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: 'Settings' },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-72 bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-[#1e2538] flex flex-col h-screen transition-colors duration-300 relative z-20">
      <div className="p-8 flex items-center gap-3 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">MediManage</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Premium Pharmacy</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <div className="px-4 mb-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                isActive
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#151b2b] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-100 transition-opacity"></div>
              )}
              
              <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary-500'}`}>
                {item.icon}
              </div>
              <span className={`relative z-10 font-semibold tracking-wide ${isActive ? '' : ''}`}>{item.label}</span>
              
              {/* Hover indicator dot */}
              {!isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100"></div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-200 dark:border-[#1e2538] mx-4 mb-4 mt-auto rounded-xl">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 px-4 py-3 text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all group font-semibold"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
