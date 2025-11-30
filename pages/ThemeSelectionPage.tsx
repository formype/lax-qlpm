
import React, { useState, useEffect } from 'react';
import { Palette, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../services/DatabaseService';
import { ThemeOption, User } from '../types';

interface ThemeSelectionPageProps {
  currentUser?: User;
}

const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Mặc định (Xanh Dương)',
    description: 'Giao diện chuẩn, chuyên nghiệp, dễ nhìn.',
    colors: { primary: '#2563eb', primaryHover: '#1d4ed8', secondary: '#475569' }
  },
  {
    id: 'christmas',
    name: 'Giáng Sinh (Luxury)',
    description: 'Phong cách lễ hội sang trọng với tông Đỏ Nhung & Vàng Kim. Có hiệu ứng tuyết rơi, Ông già Noel bay và nền mùa đông.',
    colors: { primary: '#991b1b', primaryHover: '#7f1d1d', secondary: '#b45309' },
    enableSnow: true
  },
  {
    id: 'tet',
    name: 'Tết Nguyên Đán (Xuân)',
    description: 'Rực rỡ sắc xuân với màu đỏ may mắn. Hiệu ứng Rồng Vàng bay, mưa Tài Lộc (Hoa/Tiền) và nền Hoa Mai/Đào.',
    colors: { primary: '#dc2626', primaryHover: '#b91c1c', secondary: '#b45309' },
    enableTet: true
  },
  {
    id: 'mid_autumn',
    name: 'Tết Trung Thu (Trăng Rằm)',
    description: 'Huyền ảo với tông màu Xanh Đêm & Vàng Ánh Trăng. Hiệu ứng đèn lồng bay, Chị Hằng, Thỏ Ngọc và mặt trăng khổng lồ.',
    colors: { primary: '#4338ca', primaryHover: '#3730a3', secondary: '#f59e0b' },
    enableMidAutumn: true
  },
  {
    id: 'ocean',
    name: 'Đại Dương (Xanh Ngọc)',
    description: 'Thư giãn, nhẹ nhàng với tông màu biển.',
    colors: { primary: '#0891b2', primaryHover: '#0e7490', secondary: '#0f766e' }
  },
  {
    id: 'forest',
    name: 'Rừng Xanh (Xanh Lá)',
    description: 'Tươi mát, gần gũi thiên nhiên.',
    colors: { primary: '#16a34a', primaryHover: '#15803d', secondary: '#14532d' }
  }
];

const ThemeSelectionPage: React.FC<ThemeSelectionPageProps> = ({ currentUser }) => {
  const [currentThemeId, setCurrentThemeId] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = db.subscribeToGlobalSettings((settings) => {
      if (settings && settings.themeId) {
        setCurrentThemeId(settings.themeId);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleApplyTheme = async (theme: ThemeOption) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await db.updateGlobalTheme(theme.id, currentUser.username);
    } catch (error) {
      alert("Lỗi khi lưu cài đặt giao diện");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Palette className="text-primary" />
            Giao diện hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">Thay đổi giao diện toàn bộ ứng dụng (Áp dụng cho mọi người dùng)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEMES.map((theme) => {
          const isActive = currentThemeId === theme.id;
          return (
            <div 
              key={theme.id}
              onClick={() => !loading && handleApplyTheme(theme)}
              className={`
                relative bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all duration-200 overflow-hidden group
                ${isActive ? 'border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]' : 'border-slate-100 hover:border-primary/50 hover:shadow-md'}
              `}
            >
              <div style={{ backgroundColor: theme.colors.primary }} className="h-24 w-full flex items-center justify-center relative">
                 <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                    <Palette className="text-white" size={24} />
                 </div>
                 {theme.enableSnow && <div className="absolute top-2 right-2 text-white text-xs bg-white/20 px-2 py-1 rounded-full">❄ Tuyết rơi</div>}
                 {theme.enableTet && <div className="absolute top-2 right-2 text-white text-xs bg-white/20 px-2 py-1 rounded-full">🐲 Tết</div>}
                 {theme.enableMidAutumn && <div className="absolute top-2 right-2 text-white text-xs bg-white/20 px-2 py-1 rounded-full">🌕 Trung Thu</div>}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-bold ${isActive ? 'text-primary' : 'text-slate-800'}`}>
                    {theme.name}
                  </h3>
                  {isActive && <CheckCircle className="text-primary" size={20} />}
                </div>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  {theme.description}
                </p>
                
                <div className="flex gap-2 mt-auto">
                  <div className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: theme.colors.primary }} title="Primary"></div>
                  <div className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: theme.colors.primaryHover }} title="Hover"></div>
                  <div className="w-8 h-8 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: theme.colors.secondary }} title="Secondary"></div>
                </div>

                {loading && isActive && (
                   <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" size={32} />
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelectionPage;
