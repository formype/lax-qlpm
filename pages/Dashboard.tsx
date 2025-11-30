
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  MonitorCheck, 
  AlertTriangle,
  Cloud,
  Database,
  Hammer
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { db } from '../services/DatabaseService';
import { MachineRecord, MachineStatus } from '../types';
import { APP_VERSION } from '../constants';

const STATUS_COLORS = {
  [MachineStatus.ONLINE]: '#10b981',
  [MachineStatus.OFFLINE]: '#64748b',
  [MachineStatus.MAINTENANCE]: '#f59e0b',
  [MachineStatus.ERROR]: '#ef4444',
};

const STATUS_NAMES = {
  [MachineStatus.ONLINE]: 'Online',
  [MachineStatus.OFFLINE]: 'Offline',
  [MachineStatus.MAINTENANCE]: 'Bảo trì',
  [MachineStatus.ERROR]: 'Lỗi',
};

const StatCard = ({ label, value, icon: Icon, color, subText }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow add-snow-cap">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      {subText && <p className="text-xs text-slate-400 mt-2">{subText}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
  </div>
);

const StatusPieChart = ({ title, data }: { title: string, data: any[] }) => {
  const hasData = data.some(d => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full add-snow-cap">
      <h3 className="font-bold text-slate-800 mb-4 text-center">{title}</h3>
      <div className="flex-1 min-h-[250px] flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
           <p className="text-slate-400 text-sm">Chưa có dữ liệu</p>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const isCloud = db.isUsingFirebase();

  useEffect(() => {
    db.checkAndSeedData();
    const unsubscribe = db.subscribeToAllMachines((data) => {
      setMachines(data);
    });
    return () => unsubscribe();
  }, []);

  const total = machines.length;
  const online = machines.filter(m => m.status === MachineStatus.ONLINE).length;
  const error = machines.filter(m => m.status === MachineStatus.ERROR).length;
  const maintenance = machines.filter(m => m.status === MachineStatus.MAINTENANCE).length;

  const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 0;

  const getPieData = (sourceData: MachineRecord[]) => {
    const stats = {
      [MachineStatus.ONLINE]: 0,
      [MachineStatus.OFFLINE]: 0,
      [MachineStatus.MAINTENANCE]: 0,
      [MachineStatus.ERROR]: 0,
    };
    sourceData.forEach(m => { if (stats[m.status] !== undefined) stats[m.status]++; });
    return Object.keys(stats).map(key => ({
        name: STATUS_NAMES[key as MachineStatus],
        value: stats[key as MachineStatus],
        color: STATUS_COLORS[key as MachineStatus]
    })).filter(item => item.value > 0);
  };

  const dataAll = getPieData(machines);
  const dataLab1 = getPieData(machines.filter(m => m.labId === 'lab-1'));
  const dataLab3 = getPieData(machines.filter(m => m.labId === 'lab-3'));

  return (
    <div className="space-y-6 animate-fade-in flex flex-col min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý trạng thái phòng máy tập trung</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isCloud ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
           {isCloud ? <Cloud size={14} /> : <Database size={14} />}
           {isCloud ? 'Kết nối thành công đến cơ sở dữ liệu' : 'Chế độ Offline (Local)'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Use 'bg-primary' for total if you want it themed, or stick to semantic blue/green/red for stats */}
        <StatCard 
          label="Tổng máy tính" 
          value={total} 
          icon={Users} 
          color="bg-primary" // Themed
          subText="Trên 2 phòng máy"
        />
        <StatCard 
          label="Đang hoạt động" 
          value={online} 
          icon={MonitorCheck} 
          color="bg-green-500" 
          subText={`${onlinePercent}% Công suất`}
        />
        <StatCard 
          label="Cần bảo trì" 
          value={maintenance} 
          icon={Hammer} 
          color="bg-amber-500" 
          subText="Máy đang bảo dưỡng"
        />
        <StatCard 
          label="Sự cố" 
          value={error} 
          icon={AlertTriangle} 
          color="bg-red-500" 
          subText="Cần sửa chữa"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusPieChart title="Trạng thái toàn bộ máy tính" data={dataAll} />
        <StatusPieChart title="Trạng thái máy tính Phòng tin học 1" data={dataLab1} />
        <StatusPieChart title="Trạng thái máy tính Phòng tin học 3" data={dataLab3} />
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-6 border-t border-slate-200 text-center text-slate-400 text-xs space-y-1 pb-4">
        <p className="font-semibold text-slate-500">Version: {APP_VERSION}</p>
        <p>&copy; 2025 THCS Lê Anh Xuân. All rights reserved.</p>
        <p>
          Ứng dụng được phát triển bởi Formype. Mọi chi tiết xin liên hệ <a href="mailto:tvhnhan.laxq11@hcm.edu.vn" className="text-primary hover:underline hover:text-primary-hover transition-colors">tvhnhan.laxq11@hcm.edu.vn</a>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
