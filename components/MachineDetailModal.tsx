
import React, { useState, useEffect } from 'react';
import { X, Save, History, CheckSquare, Square, AlertCircle, Eraser, Activity, User, Clock } from 'lucide-react';
import { MachineLog, MachineStatus, MachineHistoryEntry, User as UserType } from '../types';
import { db } from '../services/DatabaseService';

interface MachineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MachineLog, newStatus: MachineStatus) => void;
  machineLabel: string;
  initialData?: MachineLog;
  labId?: string;
  machineId?: number;
  currentUser?: UserType;
}

const CRITICAL_ISSUES = ['CPU', 'Nguồn điện', 'Màn hình'];
const WARNING_ISSUES = ['Bàn phím', 'Chuột', 'Mạng'];
const DISPLAY_ISSUES = [...CRITICAL_ISSUES, ...WARNING_ISSUES];

const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  isOpen, onClose, onSave, machineLabel, initialData, labId, machineId, currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'update' | 'history'>('update');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showOfflineConfirm, setShowOfflineConfirm] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<MachineHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowOfflineConfirm(false);
      setActiveTab('update');
      if (initialData) {
        setSelectedIssues(initialData.issues || []);
        setNote(initialData.note || '');
      } else {
        setSelectedIssues([]);
        setNote('');
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen && activeTab === 'history' && labId && machineId) {
      setLoadingHistory(true);
      const unsubscribe = db.subscribeToMachineHistory(labId, machineId, (data) => {
        setHistoryLogs(data);
        setLoadingHistory(false);
      });
      return () => unsubscribe();
    }
  }, [isOpen, activeTab, labId, machineId]);

  if (!isOpen) return null;

  const toggleIssue = (issue: string) => {
    setSelectedIssues(prev => prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]);
  };
  const handleClearForm = () => { setSelectedIssues([]); setNote(''); setShowOfflineConfirm(false); };
  const finalizeSave = (status: MachineStatus) => {
    const now = new Date();
    const newData: MachineLog = {
      issues: selectedIssues,
      note: note,
      updatedBy: currentUser?.fullName || 'Admin',
      lastUpdated: `${now.toLocaleDateString('vi-VN')}, ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    };
    onSave(newData, status); onClose();
  };
  const handlePreSave = () => {
    const hasIssues = selectedIssues.length > 0;
    const hasNote = note.trim().length > 0;
    if (hasIssues) {
      if (selectedIssues.some(issue => CRITICAL_ISSUES.includes(issue))) finalizeSave(MachineStatus.ERROR);
      else finalizeSave(MachineStatus.MAINTENANCE);
      return;
    }
    if (hasNote) { setShowOfflineConfirm(true); return; }
    finalizeSave(MachineStatus.ONLINE);
  };
  const getCheckboxStyle = (issue: string, isSelected: boolean) => {
    const isCritical = CRITICAL_ISSUES.includes(issue);
    if (!isSelected) return 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50';
    if (isCritical) return 'bg-red-50 border-red-200 text-red-700 shadow-sm';
    return 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm';
  };
  const getCheckIconColor = (issue: string) => (CRITICAL_ISSUES.includes(issue) ? 'text-red-500' : 'text-amber-500');
  const getHistoryStatusBadge = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.ONLINE: return <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-100">Online</span>;
      case MachineStatus.OFFLINE: return <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">Offline</span>;
      case MachineStatus.ERROR: return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-semibold border border-red-100">Lỗi</span>;
      case MachineStatus.MAINTENANCE: return <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold border border-amber-100">Bảo trì</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-fade-in overflow-hidden flex flex-col max-h-[90vh] add-snow-cap">
        
        {/* Header - Use Primary Theme Background */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-primary/5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Trạng thái thiết bị</h3>
            <p className="text-sm text-primary font-medium">{machineLabel}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab('update')} className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'update' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Activity size={16} />Cập nhật</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><History size={16} />Lịch sử</button>
        </div>

        <div className="flex-1 overflow-y-auto relative min-h-[400px]">
          {activeTab === 'update' && (
            <div className="p-6 h-full flex flex-col">
              {showOfflineConfirm && (
                <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="bg-blue-100 p-4 rounded-full mb-4"><AlertCircle size={32} className="text-blue-600" /></div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Xác nhận trạng thái</h4>
                  <p className="text-slate-600 mb-6">Bạn có muốn kích hoạt trạng thái <span className="font-bold text-slate-800">OFFLINE</span> cho thiết bị này không?</p>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => finalizeSave(MachineStatus.MAINTENANCE)} className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">Không (Bảo trì)</button>
                    <button onClick={() => finalizeSave(MachineStatus.OFFLINE)} className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 shadow-lg shadow-slate-500/30 transition-all">Có (Offline)</button>
                  </div>
                </div>
              )}
              <div className="mb-6"><label className="block text-sm font-semibold text-slate-700 mb-3">Thiết bị hỏng / Sự cố:</label><div className="grid grid-cols-2 gap-3">{DISPLAY_ISSUES.map(issue => { const isSelected = selectedIssues.includes(issue); return (<div key={issue} onClick={() => toggleIssue(issue)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none ${getCheckboxStyle(issue, isSelected)}`}>{isSelected ? <CheckSquare size={18} className={`${getCheckIconColor(issue)} shrink-0`} /> : <Square size={18} className="text-slate-300 shrink-0" />}<span className="text-sm font-medium">{issue}</span></div>); })}</div></div>
              <div className="mb-6"><label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú chi tiết:</label><textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-slate-700 text-sm bg-slate-50 focus:bg-white" rows={4} placeholder="Nhập mô tả tình trạng máy..." value={note} onChange={(e) => setNote(e.target.value)} /></div>
              {initialData && (<div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-auto"><History size={14} /><span>Cập nhật lần cuối: <span className="font-semibold text-slate-600">{initialData.updatedBy}, {initialData.lastUpdated}</span></span></div>)}
            </div>
          )}
          {activeTab === 'history' && (
            <div className="h-full bg-slate-50/30">
              {loadingHistory ? (<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>) : historyLogs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {historyLogs.map((log, index) => (
                    <div key={log.id || index} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><User size={14} className="text-slate-400" /><span className="text-sm font-bold text-slate-700">{log.updatedBy}</span>{getHistoryStatusBadge(log.status)}</div><div className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} />{log.formattedDate}</div></div>
                      <div className="ml-5 space-y-1">{log.issues && log.issues.length > 0 && (<div className="flex flex-wrap gap-1">{log.issues.map(iss => (<span key={iss} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{iss}</span>))}</div>)}{log.note && (<p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2 mt-1">"{log.note}"</p>)}{!log.issues?.length && !log.note && (<span className="text-xs text-slate-400 italic">Cập nhật trạng thái (không có ghi chú)</span>)}</div>
                    </div>
                  ))}
                </div>
              ) : (<div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2"><History size={48} className="opacity-20" /><p className="text-sm">Chưa có lịch sử cập nhật nào</p></div>)}
            </div>
          )}
        </div>
        {activeTab === 'update' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-row gap-3">
            <button onClick={handlePreSave} className="flex-1 px-2 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"><Save size={18} />Lưu</button>
            <button onClick={handleClearForm} className="flex-1 px-2 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 font-semibold hover:bg-orange-100 transition-all flex items-center justify-center gap-2 whitespace-nowrap" title="Xóa nhập liệu để nhập lại"><Eraser size={18} />Xóa dữ liệu</button>
            <button onClick={onClose} className="flex-1 px-2 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-white hover:shadow-sm transition-all flex items-center justify-center whitespace-nowrap">Hủy</button>
          </div>
        )}
        {activeTab === 'history' && (<div className="p-4 border-t border-slate-100 bg-slate-50"><button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-white hover:shadow-sm transition-all">Đóng</button></div>)}
      </div>
    </div>
  );
};

export default MachineDetailModal;
