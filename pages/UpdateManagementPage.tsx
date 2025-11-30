
import React, { useState, useEffect } from 'react';
import { RefreshCcw, Save, Loader2, AlertCircle, Link as LinkIcon, DownloadCloud } from 'lucide-react';
import { db } from '../services/DatabaseService';
import { User, AppVersionConfig } from '../types';
import { APP_VERSION } from '../constants';

interface UpdateManagementPageProps {
  currentUser?: User;
}

const UpdateManagementPage: React.FC<UpdateManagementPageProps> = ({ currentUser }) => {
  const [version, setVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchCurrentVersion = async () => {
      setFetching(true);
      try {
        const config = await db.getAppVersion();
        if (config) {
          setVersion(config.version);
          setDownloadUrl(config.downloadUrl);
        } else {
          // Default to current app version if nothing in DB
          setVersion(APP_VERSION);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentVersion();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!version.trim() || !downloadUrl.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await db.updateAppVersion(version.trim(), downloadUrl.trim(), currentUser.username);
      setMessage({ type: 'success', text: 'Cập nhật thông tin phiên bản thành công!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Lỗi khi lưu dữ liệu: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="flex flex-col h-full animate-fade-in gap-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <RefreshCcw className="text-primary" />
            Quản lý cập nhật
          </h1>
          <p className="text-sm text-slate-500 mt-1">Phát hành phiên bản mới cho ứng dụng</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden add-snow-cap">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <DownloadCloud size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Thông tin phiên bản</h2>
            <p className="text-sm text-slate-500">Cập nhật version và link tải xuống</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              <AlertCircle size={20} />
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Phiên bản hiện tại (Local)</label>
               <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono">
                 {APP_VERSION}
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-semibold text-slate-700">Phiên bản mới nhất (Server)</label>
               <div className="relative">
                 <RefreshCcw size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   value={version}
                   onChange={(e) => setVersion(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                   placeholder="VD: 1.0.1"
                 />
               </div>
               <p className="text-xs text-slate-400">Nhập số phiên bản mới để kích hoạt yêu cầu cập nhật cho người dùng cũ.</p>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Đường dẫn tải xuống (Link Download)</label>
            <div className="relative">
              <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="url" 
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <button 
               type="submit" 
               disabled={loading} 
               className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
             >
               {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Lưu thông tin cập nhật</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateManagementPage;
