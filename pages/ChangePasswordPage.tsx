import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/DatabaseService';
import { Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ChangePasswordPageProps {
  currentUser?: User;
  onLogout: () => void;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ currentUser, onLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.id) return;
    setError('');
    if (!oldPassword || !newPassword || !confirmPassword) { setError("Vui lòng nhập đầy đủ thông tin"); return; }
    if (newPassword.length < 6) { setError("Mật khẩu mới phải có ít nhất 6 ký tự"); return; }
    if (newPassword === '123') { setError("Vui lòng chọn mật khẩu khác mật khẩu mặc định"); return; }
    if (newPassword === oldPassword) { setError("Mật khẩu này đang được sử dụng cho tài khoản này. Hãy đổi mật khẩu khác"); return; }
    if (newPassword !== confirmPassword) { setError("Xác nhận mật khẩu không khớp"); return; }
    setLoading(true);
    try {
      await db.login(currentUser.username, oldPassword);
      await db.changePassword(currentUser.id, newPassword);
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      onLogout();
    } catch (err: any) {
      setError("Mật khẩu hiện tại không đúng");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Đổi mật khẩu</h2>
            <p className="text-sm text-slate-500">Cập nhật mật khẩu cho tài khoản {currentUser?.username}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (<div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-shake"><AlertCircle size={20} /><span>{error}</span></div>)}
          <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Mật khẩu hiện tại</label><input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Nhập mật khẩu cũ" /></div>
          <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" /></div>
          <div className="space-y-2"><label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Nhập lại mật khẩu mới" /></div>
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70">{loading ? 'Đang xử lý...' : (<><Save size={18} />Lưu thay đổi</>)}</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;