import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Menu as MenuIcon, ClipboardList, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { logout } from '../../api/auth.js';

export function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Menu', path: '/admin/menu', icon: MenuIcon },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
  ];

  const handleSignOut = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-brand-sand flex overflow-hidden font-sans">
      <aside className="w-64 bg-brand-maroon text-brand-sand flex flex-col items-start border-r border-brand-maroon/20">
        <div className="p-6 w-full border-b border-brand-sand/20">
          <h2 className="text-2xl font-serif font-bold tracking-tight">
            Admin Panel
          </h2>
          <p className="text-sm opacity-80 mt-1">Hello, {user.name || user.email}</p>
        </div>

        <nav className="flex-1 w-full py-4 space-y-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors font-medium
                  ${isActive ? 'bg-brand-sand text-brand-maroon shadow-sm' : 'hover:bg-brand-sand/10'}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 w-full">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-brand-sand hover:bg-brand-sand/10 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white/50">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

