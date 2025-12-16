import React from 'react';
import { User, Role } from '../types';
import { LogOut, LayoutDashboard, Users, Calendar, CheckSquare, Star, FileBarChart, UserCircle } from 'lucide-react';

interface LayoutProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const TABS: Record<string, { label: string; icon: React.ReactNode; roles: Role[] }> = {
  dashboard: { label: 'Tổng Quan', icon: <LayoutDashboard size={18} />, roles: ['admin', 'manager', 'employee'] },
  users: { label: 'Người Dùng', icon: <Users size={18} />, roles: ['admin', 'manager'] },
  plan: { label: 'Kế Hoạch', icon: <Calendar size={18} />, roles: ['admin', 'manager', 'employee'] },
  daily: { label: 'Báo Cáo', icon: <CheckSquare size={18} />, roles: ['admin', 'manager', 'employee'] },
  rating: { label: 'Đánh Giá', icon: <Star size={18} />, roles: ['admin', 'manager', 'employee'] },
  summary: { label: 'Tổng Hợp', icon: <FileBarChart size={18} />, roles: ['admin', 'manager'] }
};

export const Layout: React.FC<LayoutProps> = ({ currentUser, activeTab, onTabChange, onLogout, children }) => {
  const availableTabs = Object.entries(TABS).filter(([_, config]) => config.roles.includes(currentUser.role));

  const roleLabels: Record<Role, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    employee: 'Nhân viên'
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="vnpt-gradient text-white shadow-lg flex-shrink-0">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">HỆ THỐNG QUẢN LÝ BÁN HÀNG VNPT</h1>
              <p className="text-sm opacity-90 mt-1">VNPT Hàm Yên - Tuyên Quang</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={24} />
                  )}
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold">{currentUser.employee_name}</p>
                  <p className="text-xs opacity-80">{roleLabels[currentUser.role]}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full px-4 flex gap-1 overflow-x-auto pb-0 hide-scrollbar mt-2">
          {availableTabs.map(([key, config]) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-all
                ${activeTab === key 
                  ? 'bg-gray-50 text-blue-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] translate-y-[1px]' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}
              `}
            >
              {config.icon}
              {config.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};