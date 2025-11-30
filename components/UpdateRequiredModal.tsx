
import React from 'react';
import { DownloadCloud, AlertTriangle } from 'lucide-react';
import { AppVersionConfig } from '../types';
import { APP_VERSION } from '../constants';

interface UpdateRequiredModalProps {
  config: AppVersionConfig;
}

const UpdateRequiredModal: React.FC<UpdateRequiredModalProps> = ({ config }) => {
  const handleUpdate = () => {
    if (config.downloadUrl) {
      window.open(config.downloadUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden text-center relative add-snow-cap">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 flex flex-col items-center justify-center text-white">
          <div className="bg-white/20 p-4 rounded-full mb-3 backdrop-blur-sm shadow-lg">
             <DownloadCloud size={40} className="text-white drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold">Cập nhật ứng dụng</h2>
          <p className="text-amber-100 mt-1 font-medium">Phiên bản mới đã sẵn sàng!</p>
        </div>

        <div className="p-8">
           <div className="mb-6 space-y-2">
             <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-500">Phiên bản hiện tại:</span>
                <span className="font-mono font-bold text-red-500">{APP_VERSION}</span>
             </div>
             <div className="flex items-center justify-center">
                <div className="h-6 w-px bg-slate-200"></div>
             </div>
             <div className="flex items-center justify-between text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                <span className="text-slate-500">Phiên bản mới nhất:</span>
                <span className="font-mono font-bold text-green-600">{config.version}</span>
             </div>
           </div>

           <p className="text-slate-600 text-sm mb-8 leading-relaxed">
             Phiên bản ứng dụng của bạn đã cũ. Vui lòng cập nhật lên phiên bản mới nhất để tiếp tục sử dụng và trải nghiệm các tính năng mới.
           </p>

           <button 
             onClick={handleUpdate}
             className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-pulse"
           >
             <DownloadCloud size={20} />
             Cập nhật ngay
           </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateRequiredModal;
