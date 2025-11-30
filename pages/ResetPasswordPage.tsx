
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/DatabaseService';
import { RotateCcw, Search, Loader2, AlertTriangle } from 'lucide-react';

interface ResetPasswordPageProps {
  currentUser?: User;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation Modal State
  const [resetConfirmationUser, setResetConfirmationUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await db.getUsers();
      setUsers(data);
    } catch (error) {
      alert("Lỗi khi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Step 1: Open Modal
  const requestReset = (user: User) => {
    setResetConfirmationUser(user);
  };

  // Step 2: Execute Reset
  const executeReset = async () => {
    if (!resetConfirmationUser || !resetConfirmationUser.id) return;

    setIsProcessing(true);
    try {
      await db.resetUserPassword(resetConfirmationUser.id);
      // alert removed, assume silent success or add toast later
      setResetConfirmationUser(null); // Close modal
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-fade-in gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <RotateCcw className="text-orange-600" />
            Reset mật khẩu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Khôi phục mật khẩu mặc định cho người dùng</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text"
          placeholder="Tìm kiếm tài khoản cần reset..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="overflow-y-auto overflow-x-auto flex-1 h-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-orange-50 border-b border-orange-100 text-orange-800 text-xs uppercase sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên đăng nhập</th>
                <th className="px-6 py-4 font-semibold">Họ và tên</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                 <tr><td colSpan={3} className="px-6 py-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Đang tải...</td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{user.username}</td>
                    <td className="px-6 py-4 text-slate-600">{user.fullName}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => requestReset(user)}
                        className="text-orange-600 hover:text-orange-800 border border-orange-200 hover:bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Reset mật khẩu
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                    Không tìm thấy tài khoản
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION DIALOG */}
      {resetConfirmationUser && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-fade-in p-6 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <AlertTriangle size={32} className="text-orange-500" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Reset mật khẩu?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bạn có chắc muốn khôi phục mật khẩu cho tài khoản <span className="font-bold text-slate-800">"{resetConfirmationUser.username}"</span> về mặc định <span className="font-mono bg-slate-100 px-1 rounded">123</span> không?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={executeReset}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Đồng ý'}
              </button>
              <button 
                onClick={() => setResetConfirmationUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;
