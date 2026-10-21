import React from 'react';
import { Achievement } from '../game/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  onOpenProfile: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  onOpenProfile,
}) => {
  if (!achievement) return null;

  const tierColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    BRONZE: {
      border: 'border-amber-700/80',
      bg: 'from-amber-950/90 to-slate-950/95',
      text: 'text-amber-500',
      glow: 'shadow-[0_0_25px_rgba(205,127,50,0.35)]',
    },
    SILVER: {
      border: 'border-slate-400/80',
      bg: 'from-slate-800/90 to-slate-950/95',
      text: 'text-slate-300',
      glow: 'shadow-[0_0_25px_rgba(148,163,184,0.35)]',
    },
    GOLD: {
      border: 'border-amber-400',
      bg: 'from-amber-950/90 to-slate-950/95',
      text: 'text-amber-300',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.45)]',
    },
    PLATINUM: {
      border: 'border-cyan-400',
      bg: 'from-cyan-950/90 to-slate-950/95',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_30px_rgba(56,189,248,0.5)]',
    },
  };

  const style = tierColors[achievement.tier] || tierColors.GOLD;

  return (
    <div
      onClick={() => {
        onOpenProfile();
        onDismiss();
      }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 cursor-pointer pointer-events-auto animate-bounce-short transition-all duration-300 select-none"
    >
      <div
        className={`flex items-center gap-3.5 px-5 py-3 rounded-xl border bg-gradient-to-r ${style.bg} ${style.border} ${style.glow} backdrop-blur-md max-w-md`}
      >
        {/* Animated Badge Icon Hexagon */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 shrink-0 shadow-inner">
          <div className="absolute inset-0 rounded-lg animate-ping opacity-20 bg-white" />
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            {achievement.badgeSymbol}
          </span>
          <span
            className="absolute -bottom-1 -right-1 text-[9px] font-cyber font-black px-1 rounded bg-black/80 border border-slate-700 text-white"
          >
            {achievement.tier[0]}
          </span>
        </div>

        {/* Text info */}
        <div className="flex flex-col min-w-[190px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-cyber font-extrabold text-[10px] tracking-widest text-cyan-400 uppercase flex items-center gap-1">
              <span>★</span> MILESTONE UNLOCKED <span>★</span>
            </span>
            <span className={`text-[10px] font-cyber font-bold px-1.5 py-0.2 rounded border bg-black/40 ${style.border} ${style.text}`}>
              +{achievement.xpReward} XP
            </span>
          </div>

          <h4 className="font-cyber font-bold text-sm text-white tracking-wide leading-tight mt-0.5">
            {achievement.title}
          </h4>

          <p className="text-slate-300 text-xs font-sans truncate max-w-[260px] mt-0.5">
            {achievement.description}
          </p>
        </div>

        {/* Dismiss / Inspect icon */}
        <div className="text-slate-400 hover:text-white pl-1 shrink-0 text-xs font-cyber flex flex-col items-center">
          <span className="text-[10px] tracking-tighter text-cyan-400">VIEW</span>
          <span className="text-xs">→</span>
        </div>
      </div>
    </div>
  );
};
