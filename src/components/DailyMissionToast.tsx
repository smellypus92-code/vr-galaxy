import React from 'react';
import { DailyMission } from '../game/dailyMissions';

interface DailyMissionToastProps {
  mission: DailyMission | null;
  onDismiss: () => void;
  onOpenMissions: () => void;
}

export const DailyMissionToast: React.FC<DailyMissionToastProps> = ({
  mission,
  onDismiss,
  onOpenMissions,
}) => {
  if (!mission) return null;

  return (
    <aside
      aria-label="Daily mission objective completed notification"
      className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md w-full px-4 animate-in fade-in slide-in-from-top-6 duration-300"
    >
      <div className="relative p-4 rounded-xl border border-amber-400 bg-slate-950/95 shadow-[0_0_35px_rgba(251,191,36,0.35)] backdrop-blur-md overflow-hidden flex items-center gap-4">
        {/* Animated Scanline accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Icon Emblem */}
        <div className="relative w-12 h-12 rounded-lg border-2 border-amber-400 bg-amber-950/40 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
          <span>{mission.icon}</span>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-cyber font-bold text-[10px] tracking-widest text-amber-400 uppercase">
              DAILY OBJECTIVE COMPLETE!
            </span>
            <span className="font-cyber font-bold text-[10px] px-1.5 py-0.2 rounded border border-amber-500/50 bg-amber-950/60 text-amber-300">
              +{mission.rewardCurrency} 💎
            </span>
          </div>

          <h4 className="font-cyber font-black text-sm text-white tracking-wide truncate mt-0.5">
            {mission.title}
          </h4>

          <p className="text-xs text-slate-300/90 font-sans truncate mt-0.5">
            {mission.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => {
              onDismiss();
              onOpenMissions();
            }}
            className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-bold text-xs tracking-wider transition cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95"
          >
            CLAIM [M]
          </button>
          <button
            onClick={onDismiss}
            className="text-[10px] text-slate-400 hover:text-slate-200 font-cyber tracking-wider text-center cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </aside>
  );
};
