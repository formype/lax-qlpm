
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LabRoom from './pages/LabRoom';
import Report from './pages/Report';
import Login from './pages/Login';
import AccountList from './pages/AccountList';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ThemeSelectionPage from './pages/ThemeSelectionPage'; 
import UpdateManagementPage from './pages/UpdateManagementPage';
import ChangePasswordModal from './components/ChangePasswordModal';
import UpdateRequiredModal from './components/UpdateRequiredModal';
import { User, ThemeOption, AppVersionConfig } from './types';
import { db } from './services/DatabaseService';
import { APP_VERSION } from './constants';

// Theme Definitions
const THEME_MAP: Record<string, ThemeOption> = {
  default: { id: 'default', name: 'Default', description: '', colors: { primary: '#2563eb', primaryHover: '#1d4ed8', secondary: '#475569' } },
  christmas: { id: 'christmas', name: 'Christmas', description: '', colors: { primary: '#991b1b', primaryHover: '#7f1d1d', secondary: '#b45309' }, enableSnow: true },
  tet: { id: 'tet', name: 'Tet', description: '', colors: { primary: '#dc2626', primaryHover: '#b91c1c', secondary: '#b45309' }, enableTet: true },
  mid_autumn: { id: 'mid_autumn', name: 'MidAutumn', description: '', colors: { primary: '#4338ca', primaryHover: '#3730a3', secondary: '#f59e0b' }, enableMidAutumn: true },
  ocean: { id: 'ocean', name: 'Ocean', description: '', colors: { primary: '#0891b2', primaryHover: '#0e7490', secondary: '#0f766e' } },
  forest: { id: 'forest', name: 'Forest', description: '', colors: { primary: '#16a34a', primaryHover: '#15803d', secondary: '#14532d' } }
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState('default');
  const [updateConfig, setUpdateConfig] = useState<AppVersionConfig | null>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('lax_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('lax_user');
      }
    }
  }, []);

  // Check App Version
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const config = await db.getAppVersion();
        if (config && config.version !== APP_VERSION) {
           setUpdateConfig(config);
        }
      } catch (error) {
        console.error("Failed to check app version", error);
      }
    };
    checkVersion();
  }, []);

  useEffect(() => {
    const unsubscribe = db.subscribeToGlobalSettings((settings) => {
      if (settings && settings.themeId) {
        setCurrentThemeId(settings.themeId);
        const theme = THEME_MAP[settings.themeId] || THEME_MAP['default'];
        
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
        root.style.setProperty('--color-secondary', theme.colors.secondary);

        // Toggle Theme Classes
        if (theme.enableSnow) document.body.classList.add('theme-snow');
        else document.body.classList.remove('theme-snow');

        if (theme.enableTet) document.body.classList.add('theme-tet');
        else document.body.classList.remove('theme-tet');

        if (theme.enableMidAutumn) document.body.classList.add('theme-mid-autumn');
        else document.body.classList.remove('theme-mid-autumn');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('lax_user', JSON.stringify(user));
    setCurrentPath('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('lax_user');
  };

  const handlePasswordUpdate = () => {
    if (currentUser) {
      const updatedUser: User = { ...currentUser, isDefaultPassword: false };
      setCurrentUser(updatedUser);
      sessionStorage.setItem('lax_user', JSON.stringify(updatedUser));
    }
  };

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard': return <Dashboard />;
      case 'lab-1': return <LabRoom labName="Phòng Tin học 1" labId="lab-1" currentUser={currentUser || undefined} />;
      case 'lab-3': return <LabRoom labName="Phòng Tin học 3" labId="lab-3" currentUser={currentUser || undefined} />;
      case 'report': return <Report />;
      case 'account-list': return <AccountList currentUser={currentUser || undefined} />;
      case 'account-change-pass': return <ChangePasswordPage currentUser={currentUser || undefined} onLogout={handleLogout} />;
      case 'account-reset-pass': return <ResetPasswordPage currentUser={currentUser || undefined} />;
      case 'theme-selection': return <ThemeSelectionPage currentUser={currentUser || undefined} />;
      case 'update-management': return <UpdateManagementPage currentUser={currentUser || undefined} />;
      default: return <Dashboard />;
    }
  };

  // If update is required, block everything else
  if (updateConfig) return <UpdateRequiredModal config={updateConfig} />;

  if (!currentUser) return <Login onLogin={handleLogin} />;
  if (currentUser.isDefaultPassword) return <ChangePasswordModal currentUser={currentUser} onSuccess={handlePasswordUpdate} />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden relative">
      
      {/* --- CHRISTMAS THEME ELEMENTS --- */}
      {currentThemeId === 'christmas' && (
        <>
          <div className="santa-container">
            <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 60 C40 60 50 80 80 80 L 140 80 C 150 80 160 70 160 60 L 160 50 L 40 50 Z" fill="#991b1b" stroke="#fcd34d" strokeWidth="2"/>
                <path d="M30 85 L 170 85 C 180 85 185 75 180 70" stroke="#d4af37" strokeWidth="3" fill="none"/>
                <circle cx="100" cy="40" r="15" fill="#fecaca"/>
                <path d="M90 50 L 110 50 L 100 80 Z" fill="#991b1b"/>
                <path d="M85 30 L 115 30 L 100 10 Z" fill="#991b1b"/>
                <circle cx="100" cy="10" r="3" fill="white"/>
                <path d="M180 60 L 190 60" stroke="#78350f" strokeWidth="2"/>
            </svg>
          </div>
          <div className="bg-scene">
             <svg width="100%" height="100%" viewBox="0 0 1200 250" preserveAspectRatio="none">
                <path d="M0 250 L0 100 C 300 150 600 50 1200 120 L 1200 250 Z" fill="#e2e8f0" opacity="0.8"/>
                <path d="M0 250 L0 180 C 400 220 800 140 1200 200 L 1200 250 Z" fill="#f1f5f9" opacity="0.9"/>
             </svg>
             <div className="absolute bottom-0 w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 1200 250" preserveAspectRatio="xMidYMax slice">
                   <g className="tree-sway" style={{transformBox: 'fill-box', transformOrigin: '100px 220px'}}>
                      <path d="M80 220 L 120 220 L 100 150 Z" fill="#15803d" />
                      <path d="M85 180 L 115 180 L 100 130 Z" fill="#16a34a" />
                   </g>
                   <g className="tree-sway-delayed" style={{transformBox: 'fill-box', transformOrigin: '1100px 230px'}}>
                      <path d="M1080 230 L 1120 230 L 1100 160 Z" fill="#15803d" />
                      <path d="M1085 190 L 1115 190 L 1100 140 Z" fill="#16a34a" />
                   </g>
                   <g className="reindeer-run"><g transform="scale(-1, 1)"><path d="M20 40 Q 20 20 40 20 L 60 20 Q 70 20 70 30 L 70 50 L 65 70 L 60 70 L 60 50 L 30 50 L 25 70 L 20 70 L 20 40 Z" fill="#78350f"/><path d="M60 20 L 60 10 L 80 15 L 75 25 Z" fill="#78350f"/><path d="M65 10 L 60 0 M 65 10 L 75 0" stroke="#78350f" strokeWidth="2"/><circle cx="80" cy="15" r="2" fill="#ef4444"/></g></g>
                </svg>
             </div>
          </div>
        </>
      )}

      {/* --- TET THEME ELEMENTS --- */}
      {currentThemeId === 'tet' && (
        <>
          {/* Flying Golden Dragon */}
          <div className="dragon-container">
            <svg width="250" height="120" viewBox="0 0 250 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M220 60 Q 180 20 140 60 T 60 60 T 20 60" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M220 60 Q 180 20 140 60 T 60 60 T 20 60" stroke="#d97706" strokeWidth="4" strokeDasharray="10 5" strokeLinecap="round" fill="none" />
                <path d="M220 60 L 240 50 L 240 70 Z" fill="#fbbf24" />
                <circle cx="230" cy="55" r="3" fill="black" />
                <path d="M240 60 Q 250 50 245 40" stroke="#fbbf24" strokeWidth="2" fill="none" />
                <path d="M240 60 Q 250 70 245 80" stroke="#fbbf24" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Spring Scene Background */}
          <div className="bg-scene">
             <svg width="100%" height="100%" viewBox="0 0 1200 250" preserveAspectRatio="none">
                <path d="M0 250 L0 150 C 300 100 600 200 1200 120 L 1200 250 Z" fill="#86efac" opacity="0.8"/>
                <path d="M0 250 L0 200 C 400 180 800 220 1200 180 L 1200 250 Z" fill="#4ade80" opacity="0.9"/>
             </svg>
             <div className="absolute bottom-0 w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 1200 250" preserveAspectRatio="xMidYMax slice">
                   <g className="tree-sway" style={{transformBox: 'fill-box', transformOrigin: '150px 220px'}}>
                      <rect x="145" y="160" width="10" height="60" fill="#78350f" />
                      <circle cx="150" cy="150" r="30" fill="#fcd34d" opacity="0.9" />
                      <circle cx="130" cy="160" r="20" fill="#fbbf24" opacity="0.9" />
                      <circle cx="170" cy="160" r="20" fill="#fbbf24" opacity="0.9" />
                      <circle cx="150" cy="130" r="20" fill="#fcd34d" opacity="0.9" />
                      <line x1="170" y1="160" x2="170" y2="180" stroke="#b45309" strokeWidth="1" />
                      <rect x="165" y="180" width="10" height="15" fill="#ef4444" className="lantern-sway" style={{transformOrigin: '170px 180px'}}/>
                   </g>

                   <g className="tree-sway-delayed" style={{transformBox: 'fill-box', transformOrigin: '1000px 220px'}}>
                      <rect x="995" y="170" width="10" height="60" fill="#78350f" />
                      <circle cx="1000" cy="160" r="35" fill="#fca5a5" opacity="0.9" />
                      <circle cx="980" cy="170" r="25" fill="#f87171" opacity="0.9" />
                      <circle cx="1020" cy="170" r="25" fill="#f87171" opacity="0.9" />
                      <line x1="980" y1="170" x2="980" y2="200" stroke="#b45309" strokeWidth="1" />
                      <rect x="975" y="200" width="10" height="15" fill="#ef4444" className="lantern-sway" style={{transformOrigin: '980px 200px'}}/>
                   </g>
                </svg>
             </div>
          </div>
        </>
      )}

      {/* --- MID-AUTUMN THEME ELEMENTS --- */}
      {currentThemeId === 'mid_autumn' && (
        <div className="bg-scene">
           {/* Deep Blue Night Sky Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900 to-transparent opacity-90 z-0 pointer-events-none"></div>
           
           <svg width="100%" height="100%" viewBox="0 0 1200 250" preserveAspectRatio="none" className="z-10 relative">
              {/* Giant Full Moon */}
              <circle cx="1000" cy="100" r="120" fill="#fbbf24" filter="drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))" opacity="0.9" />
              <circle cx="1030" cy="80" r="15" fill="#fcd34d" opacity="0.5" /> {/* Moon crater */}
              <circle cx="960" cy="120" r="25" fill="#fcd34d" opacity="0.4" /> {/* Moon crater */}

              {/* Clouds */}
              <path d="M800 150 Q 850 120 900 150 T 1000 150 T 1100 160" stroke="white" strokeWidth="0" fill="white" opacity="0.1" />
              <path d="M0 250 L0 200 Q 300 220 600 180 Q 900 140 1200 180 L 1200 250 Z" fill="#1e1b4b" opacity="0.9" /> {/* Dark Hill */}
           </svg>

           {/* Moon Rabbit SVG */}
           <div className="absolute bottom-10 right-[15%] w-32 h-32 z-20 rabbit-container">
             <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M30 60 Q 20 50 30 40 Q 35 25 45 25 Q 55 25 60 40 L 60 60 Q 70 70 60 80 Q 50 90 30 80 Q 20 70 30 60" fill="white" />
               <path d="M45 25 L 40 5 L 50 20" fill="white" /> {/* Left Ear */}
               <path d="M50 25 L 55 5 L 55 20" fill="white" /> {/* Right Ear */}
               <circle cx="55" cy="45" r="2" fill="#ef4444" /> {/* Eye */}
             </svg>
           </div>
        </div>
      )}

      <Sidebar 
        currentPath={currentPath} 
        onNavigate={setCurrentPath} 
        currentUser={currentUser}
        onLogout={handleLogout}
        currentThemeId={currentThemeId}
      />
      
      <main className="flex-1 ml-[60px] md:ml-0 p-4 md:p-6 overflow-y-auto h-screen scroll-smooth print:ml-0 print:p-0 print:overflow-visible print:h-auto relative z-10">
        <div className="max-w-[1600px] mx-auto h-full print:max-w-none">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
