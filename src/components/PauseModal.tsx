import React, { useEffect } from 'react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenReticleConfig: () => void;
  onOpenProfile: () => void;
  onOpenDailyMissions: () => void;
  onOpenAdMobConfig: () => void;
  onOpenRewardedAd: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToTitle,
  isMuted,
  onToggleMute,
  onOpenReticleConfig,
  onOpenProfile,
  onOpenDailyMissions,
  onOpenAdMobConfig,
  onOpenRewardedAd,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        onResume();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        onOpenReticleConfig();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        onOpenProfile();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onOpenDailyMissions();
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        onOpenAdMobConfig();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume, onOpenReticleConfig, onOpenProfile, onOpenDailyMissions, onOpenAdMobConfig]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-lg p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(0,243,255,0.15)]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          <h2 className="font-cyber font-bold text-xl sm:text-2xl text-cyan-300 tracking-wider">
            SIMULATION SUSPENDED
          </h2>
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
        </div>

        <p className="text-slate-400 text-xs sm:text-sm font-sans mb-6">
          Neural link in standby. Re-engage when ready.
        </p>

        {/* Controls Reference */}
        <div className="bg-slate-950/70 border border-slate-800 rounded p-4 mb-6 text-left text-xs font-mono space-y-2 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">WASD / Arrow Keys</span>
            <span className="text-cyan-400">Tactical Maneuver</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Left Click / Trigger</span>
            <span className="text-cyan-400">Plasma Blade Slash</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Right Click / Grip</span>
            <span className="text-cyan-400">Energy Shield Deflect</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">F Key</span>
            <span className="text-cyan-400">Chrono Overdrive (Slow-Mo)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">R Key</span>
            <span className="text-cyan-400">Customize VR Reticle</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">M Key</span>
            <span className="text-cyan-400">Mute / Unmute Audio</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-cyber font-bold text-sm tracking-wider rounded transition cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            RESUME SIMULATION [ESC / SPACE]
          </button>

          <button
            onClick={onOpenReticleConfig}
            className="w-full py-2.5 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⌖</span> CUSTOMIZE VR RETICLE & CROSSHAIR
          </button>

          <button
            onClick={onOpenDailyMissions}
            className="w-full py-2.5 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/50 text-amber-300 font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <span>🎯</span> DAILY MISSIONS & REQUISITIONS [M]
          </button>

          <button
            onClick={onOpenProfile}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 text-cyan-300 font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>👑</span> OPERATIVE DOSSIER & BADGES [P]
          </button>

          <button
            onClick={onOpenRewardedAd}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500 text-amber-300 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <span>📢</span> WATCH ADMOB AD (+50🛡️ SHIELD & +350💎)
          </button>

          <button
            onClick={onOpenAdMobConfig}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚙️</span> ADMOB ACCOUNT SETTINGS [A]
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 font-cyber text-xs tracking-wider rounded transition cursor-pointer"
          >
            RESTART WAVE
          </button>

          <div className="flex gap-3">
            <button
              onClick={onToggleMute}
              className="flex-1 py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 font-cyber text-xs tracking-wider rounded transition cursor-pointer"
            >
              AUDIO: {isMuted ? 'MUTED' : 'ENABLED'}
            </button>

            <button
              onClick={onQuitToTitle}
              className="flex-1 py-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/60 text-rose-300 font-cyber text-xs tracking-wider rounded transition cursor-pointer"
            >
              ABORT TO TITLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
