import React, { useEffect, useRef, useState } from 'react';

interface ComboMultiplierDisplayProps {
  combo: number;
  maxCombo: number;
  comboTimer: number; // 0 to 3.5s
}

export const ComboMultiplierDisplay: React.FC<ComboMultiplierDisplayProps> = ({
  combo,
  maxCombo,
  comboTimer,
}) => {
  const [isPopping, setIsPopping] = useState(false);
  const prevComboRef = useRef(combo);

  // Trigger pulse/pop on hit
  useEffect(() => {
    if (combo > prevComboRef.current) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 220);
      prevComboRef.current = combo;
      return () => clearTimeout(timer);
    }
    prevComboRef.current = combo;
  }, [combo]);

  if (combo <= 0) return null;

  // Multiplier calculation (1x to 8x)
  const multiplier = Math.min(8, Math.floor(combo / 4) + 1);
  const pipsFilled = multiplier >= 8 ? 4 : combo % 4;
  const timerPercent = Math.max(0, Math.min(100, (comboTimer / 3.5) * 100));

  // Determine Rank, styling, glow and tier
  const getTierConfig = (c: number, mult: number) => {
    if (mult >= 7 || c >= 24) {
      return {
        rank: 'SSS',
        title: 'MATRIX GODLIKE',
        badgeBg: 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400',
        textColor: 'text-amber-300',
        numberColor: 'from-amber-200 via-yellow-300 to-amber-500',
        borderColor: 'border-amber-400/80',
        glowStyle: 'shadow-[0_0_35px_rgba(245,158,11,0.7),inset_0_0_15px_rgba(245,158,11,0.3)]',
        accentBar: 'bg-gradient-to-r from-amber-400 to-yellow-300',
        scaleClass: 'scale-115',
        pulseClass: 'animate-pulse',
      };
    }
    if (mult >= 5 || c >= 16) {
      return {
        rank: 'SS',
        title: 'HYPER OVERDRIVE',
        badgeBg: 'bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500',
        textColor: 'text-pink-300',
        numberColor: 'from-pink-300 via-rose-300 to-pink-500',
        borderColor: 'border-pink-500/70',
        glowStyle: 'shadow-[0_0_28px_rgba(255,0,85,0.6),inset_0_0_12px_rgba(255,0,85,0.25)]',
        accentBar: 'bg-gradient-to-r from-pink-500 to-purple-400',
        scaleClass: 'scale-110',
        pulseClass: '',
      };
    }
    if (mult >= 3 || c >= 10) {
      return {
        rank: 'S',
        title: 'SONIC SLICER',
        badgeBg: 'bg-gradient-to-r from-fuchsia-600 to-cyan-500',
        textColor: 'text-fuchsia-300',
        numberColor: 'from-fuchsia-300 via-pink-200 to-cyan-300',
        borderColor: 'border-fuchsia-500/60',
        glowStyle: 'shadow-[0_0_22px_rgba(217,70,239,0.5),inset_0_0_10px_rgba(217,70,239,0.2)]',
        accentBar: 'bg-gradient-to-r from-fuchsia-400 to-cyan-400',
        scaleClass: 'scale-105',
        pulseClass: '',
      };
    }
    if (mult >= 2 || c >= 5) {
      return {
        rank: 'A',
        title: 'CYBER STRIKER',
        badgeBg: 'bg-gradient-to-r from-cyan-600 to-emerald-500',
        textColor: 'text-cyan-300',
        numberColor: 'from-cyan-200 via-teal-200 to-emerald-400',
        borderColor: 'border-cyan-500/50',
        glowStyle: 'shadow-[0_0_18px_rgba(0,243,255,0.4)]',
        accentBar: 'bg-gradient-to-r from-cyan-400 to-emerald-400',
        scaleClass: 'scale-100',
        pulseClass: '',
      };
    }
    return {
      rank: 'B',
      title: 'CHAIN INITIATED',
      badgeBg: 'bg-slate-700',
      textColor: 'text-slate-300',
      numberColor: 'from-slate-200 to-cyan-200',
      borderColor: 'border-slate-700',
      glowStyle: 'shadow-[0_0_12px_rgba(0,243,255,0.2)]',
      accentBar: 'bg-cyan-500',
      scaleClass: 'scale-95',
      pulseClass: '',
    };
  };

  const cfg = getTierConfig(combo, multiplier);

  return (
    <div
      className={`relative pointer-events-none select-none transition-all duration-200 origin-right ${
        cfg.scaleClass
      } ${isPopping ? 'scale-125 !duration-75' : ''}`}
    >
      {/* Outer energy frame */}
      <div
        className={`bg-slate-950/90 backdrop-blur-md border ${cfg.borderColor} rounded-lg p-3 min-w-[210px] ${cfg.glowStyle} ${cfg.pulseClass} transition-shadow duration-300 relative overflow-hidden`}
      >
        {/* Subtle diagonal background scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:8px_8px] opacity-40 pointer-events-none" />

        {/* Pop impact flash */}
        {isPopping && (
          <div className="absolute inset-0 bg-white/20 pointer-events-none animate-ping duration-200" />
        )}

        {/* Top Header: Rank Tag & Streak Title */}
        <div className="flex items-center justify-between gap-2 mb-1 relative z-10">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-cyber font-black text-xs px-2 py-0.5 rounded text-white shadow-sm ${cfg.badgeBg}`}
            >
              RANK {cfg.rank}
            </span>
            <span className="text-[10px] font-cyber font-bold tracking-wider text-slate-300 uppercase truncate max-w-[110px]">
              {cfg.title}
            </span>
          </div>

          <span className="text-[9px] font-mono text-slate-400">
            MAX {maxCombo}
          </span>
        </div>

        {/* Main Centerpiece: Giant Multiplier + Streak Count */}
        <div className="flex items-baseline justify-between gap-2 my-1 relative z-10">
          {/* Streak count */}
          <div className="flex flex-col">
            <span className="font-cyber font-black text-2xl tracking-tighter text-white tabular-nums leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {combo}
            </span>
            <span className="text-[9px] font-cyber tracking-widest text-slate-400 uppercase -mt-0.5">
              HITS CHAIN
            </span>
          </div>

          {/* Glowing Multiplier badge */}
          <div className="flex items-baseline">
            <span className="font-cyber font-extrabold text-xs text-slate-400 mr-0.5">
              BONUS
            </span>
            <span
              className={`font-cyber font-black text-3xl tracking-tight bg-gradient-to-b ${cfg.numberColor} bg-clip-text text-transparent tabular-nums leading-none drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]`}
            >
              x{multiplier}
            </span>
            {multiplier >= 8 && (
              <span className="ml-1 text-[8px] font-cyber font-extrabold text-amber-400 px-1 py-0.2 border border-amber-400/60 rounded bg-amber-950/60">
                MAX
              </span>
            )}
          </div>
        </div>

        {/* Multiplier Progress Pips (4 hits per multiplier) */}
        <div className="mt-1 relative z-10">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-0.5">
            <span>MULTIPLIER CHARGE</span>
            <span className="tabular-nums">
              {multiplier >= 8 ? 'MAXED' : `${pipsFilled}/4`}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-900/90 rounded p-0.5 border border-slate-800">
            {[0, 1, 2, 3].map((index) => {
              const active = multiplier >= 8 || index < pipsFilled;
              return (
                <div
                  key={index}
                  className={`h-full rounded-sm transition-all duration-150 ${
                    active
                      ? `${cfg.accentBar} shadow-[0_0_6px_currentColor]`
                      : 'bg-slate-800/80'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Combo Timer Urgency Decay Bar */}
        <div className="mt-2 pt-1 border-t border-slate-800/60 relative z-10">
          <div className="flex justify-between items-center text-[9px] font-mono mb-0.5">
            <span
              className={`font-semibold tracking-wider ${
                comboTimer <= 1.0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {comboTimer <= 1.0 ? 'COMBO DECAY CRITICAL' : 'CHAIN TIMER'}
            </span>
            <span
              className={`tabular-nums ${
                comboTimer <= 1.0 ? 'text-rose-400 font-bold' : 'text-slate-300'
              }`}
            >
              {comboTimer.toFixed(1)}s
            </span>
          </div>
          <div className="w-full h-1 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-75 ${
                comboTimer <= 1.0
                  ? 'bg-gradient-to-r from-rose-500 to-red-400 animate-pulse'
                  : comboTimer <= 2.0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : cfg.accentBar
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
