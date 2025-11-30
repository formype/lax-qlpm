import React, { useState, useEffect } from 'react';
import { db } from '../services/DatabaseService';
import { User } from '../types';
import { Monitor, User as UserIcon, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('lax_saved_username');
    const savedPass = localStorage.getItem('lax_saved_password');
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await db.login(username.trim(), password.trim());
      if (rememberMe) {
        localStorage.setItem('lax_saved_username', username.trim());
        localStorage.setItem('lax_saved_password', password.trim());
      } else {
        localStorage.removeItem('lax_saved_username');
        localStorage.removeItem('lax_saved_password');
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header - Uses Primary Theme Color */}
        <div className="bg-gradient-to-br from-primary to-primary-hover p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-sm shadow-lg">
               <Monitor size={40} className="text-white drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">LAX-QLPM</h1>
            <p className="text-blue-100 text-sm">Hệ thống quản lý phòng máy</p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">Đăng nhập</h2>
            <p className="text-slate-500 text-sm mt-1">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Tài khoản</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <UserIcon size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none font-medium">
                Ghi nhớ tài khoản và mật khẩu
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400">
             &copy; 2025 Trường THCS Lê Anh Xuân
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;