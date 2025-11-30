
import React, { useState, useEffect } from 'react';
import { db } from '../services/DatabaseService';
import { MachineRecord, MachineStatus } from '../types';
import { 
  Filter, 
  AlertCircle, 
  Hammer, 
  CheckCircle2, 
  PowerOff,
  Search,
  FileText,
  Clock,
  User,
  Download,
} from 'lucide-react';
import saveAs from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, TextRun, AlignmentType, UnderlineType, PageOrientation } from 'docx';

const Report: React.FC = () => {
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<MachineRecord[]>([]);
  const [filterLab, setFilterLab] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const totalIssues = machines.filter(m => m.status === MachineStatus.ERROR).length;
  const totalMaintenance = machines.filter(m => m.status === MachineStatus.MAINTENANCE).length;
  const CURRENT_USER = "Admin User";

  useEffect(() => {
    db.checkAndSeedData();
    const unsubscribe = db.subscribeToAllMachines((data) => {
      setMachines(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...machines];
    if (filterLab !== 'all') result = result.filter(m => m.labId === filterLab);
    if (filterStatus !== 'all') {
      if (filterStatus === 'maintenance_repair') result = result.filter(m => m.status === MachineStatus.ERROR || m.status === MachineStatus.MAINTENANCE);
      else result = result.filter(m => m.status === filterStatus);
    }
    result.sort((a, b) => {
      if (a.labId !== b.labId) return a.labId.localeCompare(b.labId);
      return a.machineNumber - b.machineNumber;
    });
    setFilteredMachines(result);
  }, [machines, filterLab, filterStatus]);

  const getLabName = (labId: string) => (labId === 'lab-1' ? 'Phòng Tin học 1' : 'Phòng Tin học 3');
  const getStatusText = (status: MachineStatus) => {
    switch (status) { case MachineStatus.ONLINE: return 'Hoạt động'; case MachineStatus.OFFLINE: return 'Offline'; case MachineStatus.ERROR: return 'Cần sửa chữa'; case MachineStatus.MAINTENANCE: return 'Cần bảo trì'; default: return status; }
  };
  const getIssuesText = (m: MachineRecord) => {
    if (!m.log) return '';
    let text = '';
    if (m.log.issues && m.log.issues.length > 0) text += 'Lỗi: ' + m.log.issues.join(', ');
    if (m.log.note) text += (text ? '. ' : '') + 'Ghi chú: ' + m.log.note;
    return text;
  };
  const getStatusBadge = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.ONLINE: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 size={12}/> Online</span>;
      case MachineStatus.OFFLINE: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"><PowerOff size={12}/> Offline</span>;
      case MachineStatus.ERROR: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12}/> Cần sửa chữa</span>;
      case MachineStatus.MAINTENANCE: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Hammer size={12}/> Cần bảo trì</span>;
      default: return status;
    }
  };

  const exportToWord = async () => {
    setIsExporting(true);
    const tableBorder = { top: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 1, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 1, color: "000000" } };
    const tableRows = [new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Máy", bold: true })], alignment: AlignmentType.CENTER })], borders: tableBorder, width: { size: 10, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phòng", bold: true })], alignment: AlignmentType.CENTER })], borders: tableBorder, width: { size: 10, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trạng thái", bold: true })], alignment: AlignmentType.CENTER })], borders: tableBorder, width: { size: 15, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chi tiết lỗi/ ghi chú", bold: true })], alignment: AlignmentType.CENTER })], borders: tableBorder, width: { size: 35, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Người cập nhật", bold: true })], alignment: AlignmentType.CENTER })], borders: tableBorder, width: { size: 15, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Thời gian", bold: true })], alignment: AlignmentType.CENTER })], borders: tableBorder, width: { size: 15, type: WidthType.PERCENTAGE } }),
        ]})];

    filteredMachines.forEach(m => {
      tableRows.push(new TableRow({ children: [
            new TableCell({ children: [new Paragraph({ text: `Máy ${m.machineNumber}`, alignment: AlignmentType.CENTER })], borders: tableBorder }),
            new TableCell({ children: [new Paragraph({ text: getLabName(m.labId), alignment: AlignmentType.CENTER })], borders: tableBorder }),
            new TableCell({ children: [new Paragraph({ text: getStatusText(m.status), alignment: AlignmentType.CENTER })], borders: tableBorder }),
            new TableCell({ children: [new Paragraph(getIssuesText(m))], borders: tableBorder }),
            new TableCell({ children: [new Paragraph({ text: m.log?.updatedBy || '', alignment: AlignmentType.CENTER })], borders: tableBorder }),
            new TableCell({ children: [new Paragraph({ text: m.log?.lastUpdated || '', alignment: AlignmentType.CENTER })], borders: tableBorder }),
          ]}));
    });

    const doc = new Document({ sections: [{ properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } }, children: [
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } }, rows: [new TableRow({ children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TRƯỜNG THCS LÊ ANH XUÂN", bold: true })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: "Tổ Tin học – Công nghệ", bold: false })], alignment: AlignmentType.CENTER })], width: { size: 40, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, underline: { type: UnderlineType.SINGLE, color: "000000" } })], alignment: AlignmentType.CENTER })], width: { size: 60, type: WidthType.PERCENTAGE } })]})]}),
          new Paragraph({ text: "" }), new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "BÁO CÁO CHI TIẾT", bold: true, size: 32 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "TÌNH TRẠNG MÁY TÍNH PHÒNG TIN HỌC", bold: true, size: 32 })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
          new Paragraph({ children: [new TextRun({ text: `Người lập báo cáo: ${CURRENT_USER}` })], spacing: { before: 200, after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `Ngày lập báo cáo: ${new Date().toLocaleDateString('vi-VN')}` })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `Tình trạng máy tính tại phòng máy thực tế hiện nay như sau:` })], spacing: { after: 200 } }),
          new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }),
          new Paragraph({ text: "" }), new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: "Người lập báo cáo", bold: true })], alignment: AlignmentType.RIGHT, spacing: { before: 400 } }),
          new Paragraph({ text: "" }), new Paragraph({ text: "" }), new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: CURRENT_USER, bold: true })], alignment: AlignmentType.RIGHT })]}]});
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Bao_cao_Chi_tiet_${new Date().toISOString().slice(0,10)}.docx`);
    setIsExporting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-primary" />
            Báo cáo thống kê
          </h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách chi tiết trạng thái thiết bị toàn trường</p>
        </div>
        <div className="relative">
          <button disabled={isExporting} onClick={exportToWord} className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-hover transition-colors font-medium w-full md:w-auto justify-center ${isExporting ? 'opacity-70 cursor-wait' : ''}`}>
            <Download size={18} />
            {isExporting ? 'Đang tạo file...' : 'Xuất báo cáo'}
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center print:hidden shrink-0 add-snow-cap">
        <div className="flex items-center gap-2 text-slate-700 font-medium"><Filter size={18} /><span>Bộ lọc:</span></div>
        <select value={filterLab} onChange={(e) => setFilterLab(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"><option value="all">Tất cả phòng máy</option><option value="lab-1">Phòng Tin học 1</option><option value="lab-3">Phòng Tin học 3</option></select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"><option value="all">Tất cả trạng thái</option><option value="maintenance_repair">Cần bảo trì/sửa chữa</option><option value={MachineStatus.ERROR}>Cần sửa chữa</option><option value={MachineStatus.MAINTENANCE}>Cần bảo trì</option><option value={MachineStatus.ONLINE}>Hoạt động bình thường</option><option value={MachineStatus.OFFLINE}>Đã tắt (Offline)</option></select>
        <div className="md:ml-auto text-sm text-slate-500 text-center md:text-right">Tìm thấy <span className="font-bold text-slate-800">{filteredMachines.length}</span> kết quả</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 min-h-0 flex flex-col print:shadow-none print:border-0 print:h-auto print:overflow-visible overflow-hidden add-snow-cap">
        <div className="overflow-y-auto flex-1 h-full">
          <table className="w-full text-left border-collapse hidden md:table">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm"><tr className="border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider"><th className="px-6 py-4 font-semibold">Máy</th><th className="px-6 py-4 font-semibold">Phòng</th><th className="px-6 py-4 font-semibold">Trạng thái</th><th className="px-6 py-4 font-semibold">Chi tiết lỗi / Ghi chú</th><th className="px-6 py-4 font-semibold">Người cập nhật</th><th className="px-6 py-4 font-semibold">Thời gian</th></tr></thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredMachines.length > 0 ? filteredMachines.map((m) => (<tr key={m.id} className="hover:bg-slate-50/50 transition-colors"><td className="px-6 py-4 font-medium text-slate-800">Máy {m.machineNumber}</td><td className="px-6 py-4 text-slate-600">{getLabName(m.labId)}</td><td className="px-6 py-4">{getStatusBadge(m.status)}</td><td className="px-6 py-4 text-slate-600 max-w-xs">{m.log ? (<div className="space-y-1">{m.log.issues && m.log.issues.length > 0 && (<div className="font-medium text-red-600 flex flex-wrap gap-1">{m.log.issues.map(i => (<span key={i} className="bg-red-50 px-1.5 py-0.5 rounded text-[10px] border border-red-100">{i}</span>))}</div>)}{m.log.note && <p className="italic text-slate-500">{m.log.note}</p>}{(!m.log.issues?.length && !m.log.note) && <span className="text-slate-300">-</span>}</div>) : (<span className="text-slate-300">-</span>)}</td><td className="px-6 py-4 text-slate-700">{m.log?.updatedBy || '-'}</td><td className="px-6 py-4 text-slate-500 whitespace-nowrap">{m.log?.lastUpdated || '-'}</td></tr>)) : (<tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center justify-center"><Search size={32} className="mb-2 opacity-20" />Không tìm thấy dữ liệu phù hợp</td></tr>)}
            </tbody>
          </table>
          <div className="md:hidden p-4 space-y-3">
             {filteredMachines.length > 0 ? filteredMachines.map((m) => (
                  <div key={m.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start"><div><h3 className="text-lg font-bold text-slate-800">Máy {m.machineNumber}</h3><p className="text-xs text-slate-500 font-medium">{getLabName(m.labId)}</p></div><div>{getStatusBadge(m.status)}</div></div>
                    <div className="bg-white rounded-lg p-3 border border-slate-100 text-sm">{m.log ? (<div className="space-y-2">{m.log.issues && m.log.issues.length > 0 && (<div className="flex flex-wrap gap-1.5">{m.log.issues.map(i => (<span key={i} className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold border border-red-100">{i}</span>))}</div>)}{m.log.note && <p className="italic text-slate-600 border-l-2 border-slate-200 pl-2">{m.log.note}</p>}{(!m.log.issues?.length && !m.log.note) && <span className="text-slate-400 italic">Không có ghi chú chi tiết</span>}</div>) : (<span className="text-slate-400 italic">Chưa có dữ liệu ghi nhận</span>)}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-2 mt-1"><div className="flex items-center gap-1.5"><User size={14} /><span className="font-medium text-slate-600">{m.log?.updatedBy || '---'}</span></div><div className="flex items-center gap-1.5"><Clock size={14} /><span>{m.log?.lastUpdated || '---'}</span></div></div>
                  </div>)) : (<div className="text-center py-10 text-slate-400 flex flex-col items-center"><Search size={40} className="mb-3 opacity-20" /><p>Không tìm thấy dữ liệu phù hợp</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
