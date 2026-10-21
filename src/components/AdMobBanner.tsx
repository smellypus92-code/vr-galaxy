import React, { useState } from 'react';
import { admobManager } from '../game/admob';

interface AdMobBannerProps {
  onOpenSettings?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ onOpenSettings }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const config = admobManager.getConfig();

  if (!config.bannerEnabled || isDismissed) return null;

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none max-w-lg w-[95%] sm:w-auto animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-lg p-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4">
        {/* Banner ad creative placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-slate-950 font-cyber">
            Ad
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-cyber text-amber-400 font-bold tracking-wider">
                GOOGLE ADMOB BANNER
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {config.isTestMode ? '[TEST AD]' : config.publisherId.substring(0, 16) + '...'}
              </span>
            </div>
            <span className="text-xs font-sans text-slate-300 truncate max-w-[240px] sm:max-w-[320px]">
              CyberStrike Arena Pro Blade Skins &amp; Tactical Overdrive
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="AdMob Settings"
              className="text-[10px] font-cyber text-slate-400 hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
            >
              ⚙
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            title="Hide Banner"
            className="text-[10px] font-cyber text-slate-500 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
