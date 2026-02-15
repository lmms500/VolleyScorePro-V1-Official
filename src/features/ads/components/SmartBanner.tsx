
import React from 'react';
import { usePlatform } from '@lib/platform/usePlatform';

interface SmartBannerProps {
  isVisible: boolean;
}

export const SmartBanner: React.FC<SmartBannerProps> = ({ isVisible }) => {
  const { isNative } = usePlatform();

  if (!isVisible) return null;

  return (
    <div 
      className="w-full h-[50px] shrink-0 z-50 transition-all duration-300 ease-in-out"
      style={{ 
        // Force hardware layer to prevent repaint of parent
        transform: 'translateZ(0)',
        willChange: 'height'
      }}
    >
      {isNative ? (
        // Native: Transparent spacer. The AdMob plugin draws OVER the webview at this location.
        <div className="w-full h-full bg-transparent" />
      ) : (
        // Web: Mock visualization
        <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center border-t border-slate-300 dark:border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ad Space (Mock)</span>
          <span className="text-[8px] text-slate-300 dark:text-slate-600">Google AdMob Banner</span>
        </div>
      )}
    </div>
  );
};
