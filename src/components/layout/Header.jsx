import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { ShoppingBag, LogOut, LayoutDashboard, UserRound, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { logout } from '../../api/auth.js';

export function Header() {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const totalItems = getTotalItems();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
    window.location.reload();
  };

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-sand/90 backdrop-blur border-b border-brand-maroon/20">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Sana's Kitchen logo"
            className="w-15 h-15 rounded-full object-contain "
            loading="eager"
            decoding="async"
          />
          <span className="text-2xl font-serif font-bold text-brand-maroon tracking-tight">
            Sana's Kitchen
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {user && (
            <Link
              to="/cart"
              className="relative text-brand-maroon hover:text-brand-maroon/80 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-maroon text-brand-sand text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 ml-2 border-l border-brand-maroon/20 pl-4">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              {!isAdmin && (
                <>
                  <Link to="/orders">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Orders
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <UserRound className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}
              <span className="text-sm font-medium hidden md:inline-block">
                Hello {user.name || user.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline-block">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2 border-l border-brand-maroon/20 pl-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

