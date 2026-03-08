import React, { useState } from 'react';
import { Building, Menu, X, Shield, Heart, Home, Building2, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdmin, onLoginClick, onLogout, favoritesCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'rentals', label: 'Rentals', icon: Home },
    { id: 'commercial', label: 'Commercial', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">KeyHaven</span>
              <span className="text-[10px] text-gray-400 block -mt-1 font-medium tracking-wider">PROPERTY PLATFORM</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentView === item.id
                    ? 'bg-cyan-50 text-cyan-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Favorites */}
            <button
              onClick={() => onNavigate('favorites')}
              className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Heart className={`w-5 h-5 ${currentView === 'favorites' ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Admin */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentView === 'admin'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-cyan-50 text-cyan-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
