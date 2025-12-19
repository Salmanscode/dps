import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Truck, DollarSign, Calendar, Home, LogOut, ChevronRight, User, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SidebarContent = ({ location, handleLogout, user, closeMobileMenu }) => (
  <>
    <div className="p-6 overflow-y-auto flex-1">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 bg-brand text-white rounded-lg flex items-center justify-center shadow-subtle">
          <span className="font-bold text-lg">D</span>
        </div>
        <span className="font-bold text-lg tracking-tight text-gray-900">DriverPay</span>
      </div>

      <nav className="space-y-1">
        <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} onClick={closeMobileMenu} />
        <NavItem to="/drivers" icon={<Truck />} label="Drivers" active={location.pathname === '/drivers'} onClick={closeMobileMenu} />
        <NavItem to="/trips" icon={<Calendar />} label="Trip Logs" active={location.pathname === '/trips'} onClick={closeMobileMenu} />
        <NavItem to="/settlements" icon={<DollarSign />} label="Settlements" active={location.pathname === '/settlements'} onClick={closeMobileMenu} />
      </nav>
    </div>

    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
      <div
        onClick={handleLogout}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group border border-transparent hover:border-gray-200"
      >
        <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-medium text-xs text-gray-600 group-hover:bg-gray-50 flex-shrink-0">
          {user?.email?.charAt(0).toUpperCase() || <User size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User'}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email || 'Not logged in'}</p>
        </div>
        <LogOut size={14} className="text-gray-400 group-hover:text-gray-900 flex-shrink-0" />
      </div>
    </div>
  </>
);

const NavItem = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${active
      ? 'bg-gray-900 text-white border-gray-900 shadow-subtle'
      : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200'
      }`}
  >
    {React.cloneElement(icon, { size: 18, className: active ? 'text-white' : 'text-gray-500 group-hover:text-gray-900' })}
    <span>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </Link>
);

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-brand selection:text-white antialiased">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 z-50">
        <SidebarContent location={location} handleLogout={handleLogout} user={user} />
      </aside>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={closeMobileMenu} />
          <aside className="relative w-72 h-full bg-white shadow-xl animate-fade-in flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent location={location} handleLogout={handleLogout} user={user} closeMobileMenu={closeMobileMenu} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 transition-all duration-300 min-h-screen">
        <div className="max-w-6xl mx-auto p-5 md:p-8">

          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-200 bg-white/50 sticky top-0 backdrop-blur-md z-40 -mx-5 px-5 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-brand text-white rounded-lg flex items-center justify-center shadow-subtle">
                <span className="font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-gray-900 tracking-tight">DriverPay</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all"
            >
              <Menu size={24} />
            </button>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
