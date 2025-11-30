
import React, { useState, useEffect } from 'react';
import ComputerIcon from '../components/ComputerIcon';
import MachineDetailModal from '../components/MachineDetailModal';
import { MachineLog, MachineStatus, MachineRecord, User } from '../types';
import { db } from '../services/DatabaseService';

interface LabRoomProps {
  labName: string;
  labId: string;
  currentUser?: User;
}

const LabRoom: React.FC<LabRoomProps> = ({ labName, labId, currentUser }) => {
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMachineNum, setActiveMachineNum] = useState<number | null>(null);

  // Realtime Subscription
  useEffect(() => {
    setLoading(true);

    const initData = async () => {
       // 1. Kiểm tra và seed data nếu lần đầu chạy (Async)
       await db.checkAndSeedData();
    };
    initData();

    // 2. Đăng ký lắng nghe dữ liệu
    const unsubscribe = db.subscribeToLab(labId, (data) => {
      setMachines(data);
      setLoading(false);
    });

    // Cleanup khi component unmount
    return () => unsubscribe();
  }, [labId]);

  const handleMachineClick = (machineNumber: number) => {
    setActiveMachineNum(machineNumber);
    setIsModalOpen(true);
  };

  const handleTeacherClick = () => {
    setActiveMachineNum(0); // 0 is Teacher
    setIsModalOpen(true);
  };

  const handleSaveLog = (data: MachineLog, newStatus: MachineStatus) => {
    if (activeMachineNum !== null) {
      // Gửi lên Firebase (UI sẽ tự cập nhật nhờ listener ở useEffect)
      db.updateMachine(labId, activeMachineNum, newStatus, data);
    }
  };

  const getMachineLabel = () => {
    if (activeMachineNum === 0) return 'Máy Giáo viên';
    return `Máy số ${activeMachineNum}`;
  };

  const getActiveLog = () => {
    if (activeMachineNum !== null) {
        const record = machines.find(m => m.machineNumber === activeMachineNum);
        return record?.log;
    }
    return undefined;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 text-sm">Đang kết nối cơ sở dữ liệu...</p>
        </div>
    );
  }

  // Teacher machine record (ID 0)
  const teacherMachine = machines.find(m => m.machineNumber === 0);

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      {/* Modal */}
      <MachineDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLog}
        machineLabel={getMachineLabel()}
        initialData={getActiveLog()}
        labId={labId}
        machineId={activeMachineNum !== null ? activeMachineNum : undefined}
        currentUser={currentUser}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{labName}</h1>
          <p className="text-slate-500">
            Tổng số: <span className="font-semibold text-slate-700">{machines.filter(m => m.machineNumber !== 0).length}</span> máy học sinh + 1 máy giáo viên
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Online</div>
          <div className="flex items-center gap-2 px-2 border-l border-slate-200"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Offline</div>
          <div className="flex items-center gap-2 px-2 border-l border-slate-200"><div className="w-2 h-2 rounded-full bg-red-500"></div> Lỗi</div>
          <div className="flex items-center gap-2 px-2 border-l border-slate-200"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Bảo trì</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 overflow-y-auto">
        
        {/* Grid Layout */}
        <div className="grid grid-cols-4 lg:grid-cols-10 gap-x-6 gap-y-16 md:gap-x-4 md:gap-y-8 max-w-7xl mx-auto">
          
          {/* Teacher Machine - Always First */}
          <div className="col-span-1 flex justify-center">
            <ComputerIcon 
              isTeacher={true}
              machineId={0}
              onClick={handleTeacherClick}
              status={teacherMachine?.status || MachineStatus.ONLINE}
              logData={teacherMachine?.log}
            />
          </div>

          {/* Student Machines (Filter out ID 0) */}
          {machines.filter(m => m.machineNumber !== 0).map((record) => {
            return (
              <div key={record.id} className="col-span-1 flex justify-center">
                <ComputerIcon 
                  machineId={record.machineNumber} 
                  status={record.status}
                  onClick={() => handleMachineClick(record.machineNumber)}
                  logData={record.log}
                />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default LabRoom;
