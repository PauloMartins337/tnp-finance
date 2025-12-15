import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, PieChart, LogOut, MessageSquare } from 'lucide-react';

import { AuthService } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const navItems = [
    { to: '/', label: 'Dashboard', icon: PieChart },
    { to: '/new', label: 'Novo Recibo', icon: PlusCircle },
    { to: '/list', label: 'Listar Recibos', icon: List },
    { to: '/chat', label: 'Chat Interno', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-emerald-400" size={28} />
            <h1 className="text-xl font-bold tracking-wide">TNP <span className="text-emerald-400">CONTROL</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
          <div className="mt-4 text-xs text-slate-500 text-center">
            v1.0.0 - Gerencial
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;