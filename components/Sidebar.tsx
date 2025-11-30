
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  ChevronDown, 
  Menu,
  ChevronLeft,
  Server,
  ClipboardList,
  LogOut,
  UserCog,
  ShieldAlert,
  Palette,
  Trees, 
  Gift,
  Bell,
  Snowflake,
  Scroll,    // For Tet Dashboard
  Wallet,    // For Tet Accounts
  Flower2,   // For Tet Theme
  Moon,      // For Mid-Autumn Dashboard
  Star,      // For Mid-Autumn Theme/Labs
  Cloud,     // For Mid-Autumn
  DownloadCloud // For Update
} from 'lucide-react';
import { MenuItem, User } from '../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser?: User;
  onLogout: () => void;
  currentThemeId?: string;
}

const isChristmas = (themeId?: string) => themeId === 'christmas';
const isTet = (themeId?: string) => themeId === 'tet';
const isMidAutumn = (themeId?: string) => themeId === 'mid_autumn';

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, currentUser, onLogout, currentThemeId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['labs', 'accounts']);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, path: 'dashboard' },
    {
      id: 'labs',
      label: 'Quản lý phòng máy',
      icon: Server, 
      subItems: [
        { id: 'lab1', label: 'Phòng Tin học 1', path: 'lab-1' },
        { id: 'lab3', label: 'Phòng Tin học 3', path: 'lab-3' },
      ]
    },
    {
      id: 'accounts',
      label: 'Quản lý tài khoản',
      icon: UserCog,
      subItems: [
        { id: 'acc_list', label: 'Danh sách tài khoản', path: 'account-list' },
        { id: 'acc_change_pass', label: 'Đổi mật khẩu', path: 'account-change-pass' },
        { id: 'acc_reset_pass', label: 'Reset mật khẩu', path: 'account-reset-pass' },
      ]
    },
    { id: 'report', label: 'Báo cáo thống kê', icon: ClipboardList, path: 'report' },
    { id: 'update', label: 'Cập nhật', icon: DownloadCloud, path: 'update-management' },
    { id: 'theme', label: 'Giao diện hệ thống', icon: Palette, path: 'theme-selection' }
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
      else setCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const minWidth = 200;
      const maxWidth = 400;
      let newWidth = e.clientX;
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizing]);

  const toggleMenu = (id: string) => {
    if (collapsed) setCollapsed(false);
    setExpandedMenus(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      const restrictedPaths = ['account-list', 'account-reset-pass', 'theme-selection', 'update-management'];
      if (restrictedPaths.includes(path) && currentUser?.role !== 'Administrator') {
        setShowPermissionModal(true);
        return;
      }
      onNavigate(path);
      if (isMobile) setCollapsed(true);
    }
  };

  const getWidth = () => { if (collapsed) return 60; if (isMobile) return 260; return sidebarWidth; };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden print:hidden ${(!collapsed && isMobile) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setCollapsed(true)} />

      {showPermissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-red-100 add-snow-cap">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100"><ShieldAlert size={32} className="text-red-500" /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Truy cập bị từ chối</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">Bạn không có quyền truy cập chức năng này.<br/>Chỉ có tài khoản <span className="font-bold text-slate-800 bg-slate-100 px-1 rounded">Administrator</span> mới có thể truy cập.</p>
            <button onClick={() => setShowPermissionModal(false)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors">Đã hiểu</button>
          </div>
        </div>
      )}

      <div ref={sidebarRef} style={{ width: getWidth() }} className={`flex flex-col bg-white border-r border-slate-200 text-slate-600 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.05)] transition-[width] duration-300 ease-in-out z-50 fixed inset-y-0 left-0 md:relative md:sticky md:top-0 md:h-screen print:hidden`}>
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} border-b border-slate-100 bg-white shrink-0 add-snow-cap`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 font-bold text-lg text-slate-800 overflow-hidden whitespace-nowrap animate-fade-in">
              <div className="bg-gradient-to-br from-primary to-primary-hover p-1.5 rounded-lg shadow-md shadow-primary/20"><Monitor size={18} className="text-white" /></div>
              <span className="truncate tracking-tight">LAX-QLPM</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`p-2 rounded-lg transition-all duration-200 ${collapsed ? 'bg-transparent text-slate-400 hover:text-primary hover:bg-blue-50' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1 scrollbar-hide">
          {menuItems.map((item) => {
            // Check roles for top-level menu items
            if ((item.id === 'theme' || item.id === 'update') && currentUser?.role !== 'Administrator') return null;

            const isActive = item.path === currentPath;
            const hasSub = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedMenus.includes(item.id);
            const isChildActive = item.subItems?.some(sub => sub.path === currentPath);
            const isParentActive = isActive || isChildActive;

            // --- FESTIVE ICON LOGIC ---
            let Icon = item.icon || Monitor;
            if (isChristmas(currentThemeId)) {
               if (item.id === 'dashboard') Icon = Trees;
               if (item.id === 'labs') Icon = Gift;
               if (item.id === 'accounts') Icon = Bell;
               if (item.id === 'theme') Icon = Snowflake;
               if (item.id === 'update') Icon = DownloadCloud;
            } else if (isTet(currentThemeId)) {
               if (item.id === 'dashboard') Icon = Scroll;
               if (item.id === 'labs') Icon = Gift;
               if (item.id === 'accounts') Icon = Wallet;
               if (item.id === 'theme') Icon = Flower2;
               if (item.id === 'update') Icon = DownloadCloud;
            } else if (isMidAutumn(currentThemeId)) {
               if (item.id === 'dashboard') Icon = Moon;
               if (item.id === 'labs') Icon = Cloud;
               if (item.id === 'accounts') Icon = Star;
               if (item.id === 'theme') Icon = Star;
               if (item.id === 'update') Icon = DownloadCloud;
            }

            return (
              <div key={item.id} className="select-none">
                <div onClick={() => hasSub ? toggleMenu(item.id) : handleNavigate(item.path)} className={`flex items-center gap-3 px-2.5 py-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 border ${(isActive || (isChildActive && !hasSub)) ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20 border-primary/10 font-medium' : 'border-transparent hover:bg-slate-50 hover:text-slate-900 text-slate-500'} ${collapsed ? 'justify-center' : ''} group`} title={collapsed ? item.label : ''}>
                  <Icon size={22} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${(isParentActive && !hasSub) ? 'text-white' : (isParentActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600')}`} />
                  {!collapsed && (<><span className="flex-1 text-sm truncate">{item.label}</span>{hasSub && (<div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={14} /></div>)}</>)}
                </div>

                {!collapsed && hasSub && (
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="ml-5 space-y-1 border-l-2 border-slate-100 pl-2 py-1">
                        {item.subItems!.map((sub) => {
                          const isSubActive = sub.path === currentPath;
                          return (
                            <div key={sub.id} onClick={(e) => { e.stopPropagation(); handleNavigate(sub.path); }} className={`px-3 py-2.5 rounded-lg cursor-pointer text-xs transition-all truncate flex items-center gap-2 animate-slide-in ${isSubActive ? 'bg-blue-50 text-primary font-semibold translate-x-1' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:translate-x-1'}`}>
                                {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>}
                              {sub.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white cursor-default">{currentUser ? currentUser.username.substring(0,2).toUpperCase() : 'US'}</div>
            {!collapsed && (<div className="flex-1 overflow-hidden min-w-0"><p className="text-sm font-bold text-slate-700 truncate">{currentUser?.fullName || 'User'}</p><p className="text-xs text-slate-500 truncate">{currentUser?.role || 'Guest'}</p></div>)}
            <button onClick={onLogout} className={`rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ${collapsed ? 'p-2 mt-1' : 'p-2'}`} title="Đăng xuất"><LogOut size={collapsed ? 18 : 20} /></button>
          </div>
        </div>
        {!collapsed && !isMobile && (<div onMouseDown={startResizing} className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors z-50 ${isResizing ? 'bg-primary' : 'bg-transparent'}`} />)}
      </div>
    </>
  );
};

export default Sidebar;
