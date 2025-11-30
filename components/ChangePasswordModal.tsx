import React, { useState } from 'react';
import { Lock, Save, AlertCircle } from 'lucide-react';
import { db } from '../services/DatabaseService';
import { User } from '../types';

interface ChangePasswordModalProps {
  currentUser: User;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ currentUser, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (oldPassword !== '123') {
       setError("Mật khẩu hiện tại không đúng (Mặc định là 123)");
       return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword === '123') {
        setError("Vui lòng chọn mật khẩu khác mật khẩu mặc định");
        return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (currentUser.id) {
        await db.changePassword(currentUser.id, newPassword);
        alert("Đổi mật khẩu thành công!");
        onSuccess();
      } else {
        setError("Không tìm thấy thông tin người dùng.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-amber-500 p-6 text-white text-center">
          <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-bold">Yêu cầu đổi mật khẩu</h2>
          <p className="text-amber-100 text-sm mt-1">Vì lý do bảo mật, bạn cần đổi mật khẩu mặc định trong lần đăng nhập đầu tiên.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 mb-4 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu hiện tại (Mặc định)</label>
              <input 
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Nhập '123'"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : (
              <>
                <Save size={18} />
                Lưu và Vào ứng dụng
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;