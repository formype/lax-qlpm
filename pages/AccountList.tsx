
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/DatabaseService';
import { Plus, Trash2, Search, User as UserIcon, Shield, Loader2, Edit } from 'lucide-react';

interface AccountListProps {
  currentUser?: User;
}

const AccountList: React.FC<AccountListProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmationUser, setDeleteConfirmationUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Giáo viên');
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await db.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setRole('Giáo viên');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !fullName) { alert("Vui lòng nhập đầy đủ thông tin"); return; }
    setProcessing(true);
    try {
      if (editingUser && editingUser.id) {
        await db.updateUser(editingUser.id, { fullName: fullName.trim(), role: role });
        alert(`Đã cập nhật tài khoản ${username}`);
      } else {
        await db.createUser({ username: username.trim(), password: '123', fullName: fullName.trim(), role: role });
        alert(`Đã tạo tài khoản ${username} với mật khẩu mặc định "123"`);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) { alert(error.message); } finally { setProcessing(false); }
  };

  const requestDeleteUser = (e: React.MouseEvent, user: User) => {
    e.preventDefault(); e.stopPropagation();
    if (user.username === currentUser?.username) { alert("Không thể xóa tài khoản đang đăng nhập"); return; }
    setDeleteConfirmationUser(user);
  };

  const executeDeleteUser = async () => {
    if (!deleteConfirmationUser || !deleteConfirmationUser.username) return;
    setIsDeleting(true);
    try {
      await db.deleteUser(deleteConfirmationUser.username);
      await fetchUsers(); 
      alert("Đã xóa tài khoản thành công");
      setDeleteConfirmationUser(null);
    } catch (error: any) {
      alert("Lỗi khi xóa tài khoản: " + error.message);
    } finally { setIsDeleting(false); }
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full animate-fade-in gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserIcon className="text-primary" />
            Danh sách tài khoản
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý người dùng hệ thống</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-hover transition-colors font-medium">
          <Plus size={18} /> Thêm tài khoản
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 add-snow-cap">
        <Search size={20} className="text-slate-400" />
        <input type="text" placeholder="Tìm kiếm theo tên đăng nhập hoặc họ tên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-slate-700 placeholder-slate-400" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 min-h-0 flex flex-col overflow-hidden add-snow-cap">
        <div className="overflow-y-auto overflow-x-auto flex-1 h-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase sticky top-0 z-10 shadow-sm">
              <tr><th className="px-6 py-4 font-semibold">Tên đăng nhập</th><th className="px-6 py-4 font-semibold">Họ và tên</th><th className="px-6 py-4 font-semibold">Vai trò</th><th className="px-6 py-4 font-semibold text-right">Thao tác</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (<tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2" /> Đang tải dữ liệu...</td></tr>) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{user.username}</td>
                    <td className="px-6 py-4 text-slate-600">{user.fullName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role === 'Administrator' ? <Shield size={12}/> : <UserIcon size={12}/>}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'Administrator' && user.username !== currentUser?.username && (
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditModal(user)} className="text-primary hover:text-primary-hover p-2 rounded-full hover:bg-slate-100 transition-colors" title="Sửa thông tin"><Edit size={18} /></button>
                          <button type="button" onClick={(e) => requestDeleteUser(e, user)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors" title="Xóa tài khoản"><Trash2 size={18} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (<tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Không tìm thấy tài khoản nào</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in add-snow-cap">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!!editingUser} className={`w-full px-4 py-2 rounded-lg border border-slate-300 outline-none ${editingUser ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-primary'}`} /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Vai trò</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white"><option value="Giáo viên">Giáo viên</option><option value="Administrator">Administrator</option></select></div>
              <button type="submit" disabled={processing} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all flex justify-center gap-2">{processing ? <Loader2 className="animate-spin" /> : (editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản')}</button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirmationUser && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-fade-in p-6 text-center add-snow-cap">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><Trash2 size={32} className="text-red-500" /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xóa tài khoản?</h3>
            <p className="text-slate-500 text-sm mb-6">Bạn có chắc chắn muốn xóa tài khoản <span className="font-bold text-slate-800">"{deleteConfirmationUser.username}"</span> không?</p>
            <div className="flex gap-3">
              <button onClick={executeDeleteUser} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2">{isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Xóa'}</button>
              <button onClick={() => setDeleteConfirmationUser(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;
