
import React, { useState, useRef } from 'react';
import { 
  Monitor, 
  AlertCircle, 
  Hammer, 
  ShieldCheck, 
  CheckCircle2, 
  PowerOff,
  WifiOff
} from 'lucide-react';
import { MachineStatus, MachineLog } from '../types';

interface ComputerIconProps {
  machineId?: number; // Optional for teacher
  status?: MachineStatus;
  userName?: string;
  onClick?: () => void;
  isTeacher?: boolean;
  logData?: MachineLog;
}

const ComputerIcon: React.FC<ComputerIconProps> = ({ 
  machineId, 
  status = MachineStatus.ONLINE, 
  userName, 
  onClick,
  isTeacher = false,
  logData
}) => {
  
  // State for Tooltip Positioning and Mobile Interaction
  const [tooltipPos, setTooltipPos] = useState<'top' | 'bottom'>('top');
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPressRef = useRef(false);
  const isTouchInteraction = useRef(false);

  // --- Logic to calculate tooltip position based on screen space ---
  const updateTooltipPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const distanceToTop = rect.top;
      // If closer than 180px to the top edge, flip tooltip to bottom
      setTooltipPos(distanceToTop < 180 ? 'bottom' : 'top');
    }
  };

  // --- Event Handlers ---

  const handleMouseEnter = () => {
    // Only update on hover if not interacting via touch
    if (!isTouchInteraction.current) {
      updateTooltipPosition();
    }
  };

  const handleTouchStart = () => {
    isTouchInteraction.current = true;
    updateTooltipPosition();
    
    // Start timer for long press (500ms)
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressActive(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    // Clear timer if released early
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If it was a long press, hide tooltip and block the subsequent click
    if (isLongPressActive) {
      wasLongPressRef.current = true;
      setIsLongPressActive(false);
      
      // Reset the block flag shortly after
      setTimeout(() => {
        wasLongPressRef.current = false;
      }, 200);
    }
  };

  const handleClick = () => {
    // Don't trigger click action if we just finished a long press interaction
    if (wasLongPressRef.current) return;
    if (onClick) onClick();
  };

  // CONFIGURATION LOGIC
  const getConfig = () => {
    switch (status) {
      case MachineStatus.ONLINE:
        return {
          wrapper: 'bg-emerald-50 border-emerald-200 shadow-emerald-100',
          icon: 'text-emerald-600',
          screen: 'bg-emerald-400',
          label: 'text-emerald-700 font-bold',
          BadgeIcon: CheckCircle2,
          badgeColor: 'bg-emerald-500 text-white',
          hoverShadow: 'hover:shadow-emerald-200'
        };
      case MachineStatus.OFFLINE:
        return {
          wrapper: 'bg-slate-100 border-slate-300 shadow-slate-200',
          icon: 'text-slate-400',
          screen: 'bg-slate-800',
          label: 'text-slate-500 font-medium',
          BadgeIcon: PowerOff,
          badgeColor: 'bg-slate-500 text-white',
          hoverShadow: 'hover:shadow-slate-300'
        };
      case MachineStatus.ERROR:
        return {
          wrapper: 'bg-red-50 border-red-200 shadow-red-100',
          icon: 'text-red-500',
          screen: 'bg-red-500',
          label: 'text-red-700 font-bold',
          BadgeIcon: AlertCircle,
          badgeColor: 'bg-red-500 text-white',
          hoverShadow: 'hover:shadow-red-200'
        };
      case MachineStatus.MAINTENANCE:
        return {
          wrapper: 'bg-amber-50 border-amber-200 shadow-amber-100',
          icon: 'text-amber-600',
          screen: 'bg-amber-400',
          label: 'text-amber-700 font-bold',
          BadgeIcon: Hammer,
          badgeColor: 'bg-amber-500 text-white',
          hoverShadow: 'hover:shadow-amber-200'
        };
      default:
        return {
          wrapper: 'bg-slate-100 border-slate-300',
          icon: 'text-slate-400',
          screen: 'bg-slate-300',
          label: 'text-slate-500',
          BadgeIcon: WifiOff,
          badgeColor: 'bg-slate-400 text-white',
          hoverShadow: ''
        };
    }
  };

  const config = getConfig();
  const Badge = config.BadgeIcon;
  const shouldShowTooltip = (status === MachineStatus.ERROR || status === MachineStatus.MAINTENANCE) && logData;

  const getTooltipContent = () => {
    if (!logData) return null;
    
    let issueText = '';
    if (logData.issues && logData.issues.length > 0) {
      issueText = `Máy lỗi ${logData.issues.join(', ')}.`;
    } else if (logData.note) {
      issueText = logData.note; 
    } else {
      issueText = 'Gặp sự cố kỹ thuật.';
    }

    // Use calc for precise offset
    const tooltipClasses = tooltipPos === 'top' 
      ? 'bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 origin-bottom' 
      : 'top-[calc(100%+10px)] left-1/2 -translate-x-1/2 origin-top';
      
    // Arrow Logic using Rotated Square for continuous border
    // "Bright Ash" Theme: white background, zinc-200 border
    const arrowClasses = tooltipPos === 'top'
      ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r border-zinc-200'
      : 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l border-zinc-200';

    return (
      <div className={`
        absolute ${tooltipClasses} w-60 bg-white text-zinc-800 text-xs p-3 rounded-xl shadow-xl shadow-zinc-200/50 z-50 pointer-events-none 
        transition-all duration-200 border border-zinc-200
        ${isLongPressActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 md:group-hover:opacity-100 md:group-hover:scale-100'}
      `}>
        {/* Content */}
        <div className="relative z-10">
          <p className="font-semibold mb-2 leading-relaxed text-zinc-800">
            {issueText}
          </p>
          <div className="border-t border-zinc-100 pt-2 mt-1 flex justify-between items-center">
            <span className="text-zinc-500 font-medium">Người ghi nhận:</span>
            <span className="text-zinc-700 font-bold bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
              {logData.updatedBy}
            </span>
          </div>
        </div>
        
        {/* Rotated Square Arrow */}
        <div className={`absolute w-3 h-3 bg-white rotate-45 ${arrowClasses} z-0`}></div>
      </div>
    );
  };

  // Special configuration for Teacher Machine
  // If status is ONLINE, we use the special Blue Gradient.
  // If status is ERROR/MAINTENANCE, we use the standard config (Red/Amber) but keep the Teacher label/icon
  if (isTeacher) {
    const isErrorOrMaint = status === MachineStatus.ERROR || status === MachineStatus.MAINTENANCE || status === MachineStatus.OFFLINE;
    
    const wrapperClass = isErrorOrMaint 
       ? `${config.wrapper} shadow-lg` // Use status color (Red/Amber)
       : `bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400 shadow-lg shadow-indigo-500/30`; // Default Teacher Blue

    const iconClass = isErrorOrMaint ? config.icon : 'text-white';
    const labelClass = isErrorOrMaint ? config.label : 'text-white';
    const screenClass = isErrorOrMaint ? config.screen : 'bg-blue-400';

    return (
      <div 
        ref={containerRef}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        className={`
          relative group flex flex-col items-center justify-center rounded-xl border-2 
          ${wrapperClass}
          cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95
          z-20
          
          /* Mobile Sizing */
          w-full aspect-[4/5] max-w-[40px] p-1
          /* Desktop Sizing */
          md:max-w-[85px] md:p-2
        `}
      >
        {shouldShowTooltip && getTooltipContent()}

        <div className="relative">
          {/* Mobile: 16px, Desktop: 40px */}
          <Monitor className={`${iconClass} mb-1 drop-shadow-md w-4 h-4 md:w-10 md:h-10`} strokeWidth={1.5} />
          
          {!isErrorOrMaint && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-5 bg-blue-400 opacity-50 blur-md rounded-sm"></div>}
          {isErrorOrMaint && <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-3 h-2 md:top-2.5 md:w-5 md:h-4 opacity-40 ${config.screen} blur-sm rounded-sm`}></div>}

          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1 shadow-sm ring-2 ring-indigo-600">
             {isErrorOrMaint ? <Badge size={10} strokeWidth={3} className="md:w-3 md:h-3" /> : <ShieldCheck size={10} strokeWidth={3} className="md:w-3 md:h-3" />}
          </div>
        </div>
        <div className="flex flex-col items-center leading-tight mt-1">
          <span className={`text-[7px] md:text-[10px] font-bold tracking-wide ${labelClass}`}>Giáo viên</span>
        </div>
      </div>
    );
  }

  // Standard Student Machine Render
  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      className={`
        relative group flex flex-col items-center justify-center rounded-lg border 
        ${config.wrapper}
        cursor-pointer transition-all duration-200 
        hover:scale-105 hover:shadow-lg hover:z-20
        active:scale-95
        w-full aspect-[4/5]
        
        /* Mobile Sizing: Compact */
        max-w-[40px] p-1
        /* Desktop Sizing: Standard */
        md:max-w-[72px] md:p-1.5
      `}
    >
      {/* Tooltip */}
      {shouldShowTooltip && getTooltipContent()}

      {/* Monitor Shape */}
      <div className="relative">
        {/* Mobile: 16px (size=4), Desktop: 32px (size=8) */}
        <Monitor className={`${config.icon} mb-1 w-3.5 h-3.5 md:w-8 md:h-8`} strokeWidth={1.5} />
        
        {/* Screen Status Indicator */}
        <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2 md:top-2.5 md:w-5 md:h-4 opacity-40 ${config.screen} blur-sm rounded-sm transition-colors duration-300`}></div>
        
        {/* Status Icon Badge */}
        <div className={`absolute -top-1.5 -right-1.5 ${config.badgeColor} rounded-full p-0.5 shadow-sm ring-1 ring-white z-10`}>
          <Badge size={8} strokeWidth={3} className="md:w-3 md:h-3" />
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center leading-tight mt-0.5 w-full">
        <span className={`text-[7px] md:text-[10px] ${config.label}`}>Máy {machineId}</span>
      </div>
    </div>
  );
};

export default ComputerIcon;
