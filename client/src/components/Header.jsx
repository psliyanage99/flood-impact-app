import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, LogOut, User, Menu, X, Bell, Settings, ChevronDown } from 'lucide-react';

const Header = ({ user, onLogout, currentView, onReportClick, onDashboardClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'from-purple-500 to-pink-500',
      manager: 'from-blue-500 to-cyan-500',
      user: 'from-green-500 to-emerald-500',
      operator: 'from-orange-500 to-amber-500'
    };
    return roleColors[role?.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  const getRoleBadgeColor = (role) => {
    const badgeColors = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      manager: 'bg-blue-100 text-blue-700 border-blue-300',
      user: 'bg-green-100 text-green-700 border-green-300',
      operator: 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return badgeColors[role?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200' : 'bg-white/80 backdrop-blur-md border-b border-gray-100'}`}>
      <div className="max-w-[2000px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={onDashboardClick}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all group-hover:scale-105">
                  <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" className="animate-pulse"/>
                    <path d="M2 17L12 22L22 17"/>
                    <path d="M2 12L12 17L22 12"/>
                  </svg>
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Flood Command</h1>
                <p className="text-xs text-gray-600 font-medium tracking-wide">Infrastructure Monitoring</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2 ml-8">
              <button onClick={onDashboardClick} className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${currentView === 'dashboard' ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                {currentView === 'dashboard' && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30"></div>}
                <div className="relative flex items-center gap-2"><Activity className="w-4 h-4" /><span>Dashboard</span></div>
              </button>
              <button onClick={onReportClick} className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${currentView === 'report-form' ? 'text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                {currentView === 'report-form' && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30"></div>}
                <div className="relative flex items-center gap-2"><AlertTriangle className="w-4 h-4" /><span>Report Damage</span></div>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex relative p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all hover:scale-105 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-white">{notificationCount}</span>
                </div>
              )}
            </button>
            <button className="hidden md:flex p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all hover:scale-105 group">
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 hover:border-gray-300 group">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRoleColor(user.role)} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                  <div className={`relative w-10 h-10 bg-gradient-to-br ${getRoleColor(user.role)} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">{getUserInitials(user.name)}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-md border ${getRoleBadgeColor(user.role)} font-semibold uppercase tracking-wide`}>{user.role}</div>
                </div>
                <ChevronDown className={`hidden md:block w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-[slideDown_0.2s_ease-out]">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="font-semibold text-gray-900 mb-1">{user.name}</div>
                    <div className="text-xs text-gray-600">{user.email || 'user@floodcommand.lk'}</div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><User className="w-4 h-4" /> Profile Settings</button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Settings className="w-4 h-4" /> Preferences</button>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-2 animate-[slideDown_0.2s_ease-out]">
            <button onClick={() => { onDashboardClick(); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${currentView === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Activity className="w-4 h-4" /> <span>Dashboard</span>
            </button>
            <button onClick={() => { onReportClick(); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${currentView === 'report-form' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
              <AlertTriangle className="w-4 h-4" /> <span>Report Damage</span>
            </button>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-2">
               <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" /> <span>Logout</span>
               </button>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
      <style jsx>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </header>
  );
};

export default Header;