import React, { useState } from 'react';
import { X, Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Replit dynamic port detection
      let apiUrl = 'http://localhost:3001';
      if (typeof window !== 'undefined' && window.location.hostname.includes('replit.dev')) {
        const hostname = window.location.hostname;
        if (hostname.includes('-5000')) {
          apiUrl = `https://${hostname.replace('-5000', '-3001')}`;
        } else if (hostname.includes('-3000')) {
          apiUrl = `https://${hostname.replace('-3000', '-3001')}`;
        } else if (hostname.includes('-5173')) {
          apiUrl = `https://${hostname.replace('-5173', '-3001')}`;
        } else {
          apiUrl = '/api';
        }
      } else if (import.meta.env.VITE_API_URL) {
        apiUrl = import.meta.env.VITE_API_URL;
      }

      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (data?.success) {
        onLoginSuccess(data.session_token);
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setError(data?.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Admin Console</h2>
          <p className="text-gray-400 text-sm">Sign in to manage properties and API connections</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Session expires after 30 minutes of inactivity
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
