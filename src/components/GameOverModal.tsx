import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, saveUserProfile, submitLeaderboardScore } from '../game/firebase';
import { PlayerStats } from '../game/types';

interface GameOverModalProps {
  isVictory: boolean;
  stats: PlayerStats;
  user: User | null;
  selectedChampion: string;
  onRestart: () => void;
  onQuitToTitle: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenDailyMissions: () => void;
  onOpenAdMobConfig: () => void;
  onOpenRewardedAd: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  stats,
  user,
  selectedChampion,
  onRestart,
  onQuitToTitle,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenDailyMissions,
  onOpenAdMobConfig,
  onOpenRewardedAd,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
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
  }, [onRestart, onOpenProfile, onOpenDailyMissions, onOpenAdMobConfig]);

  // Auto-submit score to Firebase if user is logged in
  useEffect(() => {
    if (user && !submitted && !submitting && stats.score > 0) {
      setSubmitting(true);
      Promise.all([
        saveUserProfile({
          highScore: stats.score,
          maxCombo: stats.maxCombo,
          totalKills: stats.kills,
          selectedChampion,
        }),
        submitLeaderboardScore(stats.score, stats.wave, stats.maxCombo, selectedChampion),
      ])
        .then(() => {
          setSubmitted(true);
          setSubmitting(false);
        })
        .catch((err) => {
          console.error('Failed to submit score:', err);
          setSubmitting(false);
        });
    }
  }, [user, submitted, submitting, stats, selectedChampion]);

  const handleSignInAndSubmit = async () => {
    const loggedUser = await loginWithGoogle();
    if (loggedUser) {
      setSubmitting(true);
      await Promise.all([
        saveUserProfile({
          highScore: stats.score,
          maxCombo: stats.maxCombo,
          totalKills: stats.kills,
          selectedChampion,
        }),
        submitLeaderboardScore(stats.score, stats.wave, stats.maxCombo, selectedChampion),
      ]);
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  // Performance Rating
  const getRating = () => {
    if (isVictory && stats.score > 25000) return 'SSS - APEX CYBER OPERATIVE';
    if (isVictory || stats.score > 15000) return 'SS - ELITE SENTINEL';
    if (stats.score > 8000) return 'S - VETERAN BLADE';
    if (stats.score > 3000) return 'A - RECON UNIT';
    return 'B - INITIATE';
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/90 pointer-events-auto">
      <div
        className={`w-full max-w-lg bg-slate-900 border rounded-lg p-6 sm:p-8 text-center ${
          isVictory
            ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
            : 'border-pink-500/50 shadow-[0_0_40px_rgba(255,0,85,0.2)]'
        }`}
      >
        <div className="mb-2">
          <span
            className={`font-cyber text-xs uppercase tracking-widest px-3 py-1 rounded border inline-block mb-3 ${
              isVictory
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400'
                : 'border-pink-500/40 bg-pink-950/40 text-pink-400'
            }`}
          >
            {isVictory ? 'MISSION ACCOMPLISHED' : 'INTEGRITY DEPLETED'}
          </span>

          <h2
            className={`font-cyber font-black text-2xl sm:text-3xl tracking-wider ${
              isVictory ? 'text-emerald-300' : 'text-pink-400'
            }`}
          >
            {isVictory ? 'CYBER BEACH LIBERATED' : 'NEURAL LINK SEVERED'}
          </h2>
        </div>

        <p className="text-slate-400 text-xs sm:text-sm font-sans mb-6">
          {isVictory
            ? 'All rogue combat drones and the Chrono Sentinel have been purged from the grid.'
            : 'Combat frame suffered fatal chassis compromise. Uploading flight recorder data.'}
        </p>

        {/* Combat Stats Grid */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 mb-4 grid grid-cols-2 gap-4 text-left font-cyber">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">TOTAL SCORE</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">COMBAT RANK</div>
            <div className={`text-base font-bold ${isVictory ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {getRating()}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">MAX COMBO</div>
            <div className="text-lg font-bold text-pink-400 tabular-nums">
              {stats.maxCombo} HITS
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">DRONES DESTROYED</div>
            <div className="text-lg font-bold text-cyan-400 tabular-nums">
              {stats.kills} UNITS
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">PROJECTILES DEFLECTED</div>
            <div className="text-base font-bold text-slate-200 tabular-nums">
              {stats.deflections}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">CO-PILOT CHAMPION</div>
            <div className="text-base font-bold text-cyan-300">
              {selectedChampion}
            </div>
          </div>
        </div>

        {/* Firebase Leaderboard Sync Banner */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 mb-5 text-xs flex items-center justify-between">
          <div className="text-left">
            {submitted ? (
              <span className="text-emerald-400 font-cyber flex items-center gap-1.5">
                <span>✓</span> SCORE SYNCED TO FIRESTORE LEADERBOARD!
              </span>
            ) : submitting ? (
              <span className="text-cyan-400 font-cyber animate-pulse">
                SYNCING SCORE TO FIRESTORE...
              </span>
            ) : user ? (
              <span className="text-slate-300">Logged in as {user.displayName}</span>
            ) : (
              <span className="text-slate-400">Save score to global Firebase leaderboard</span>
            )}
          </div>

          {!user ? (
            <button
              onClick={handleSignInAndSubmit}
              className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-cyber text-xs tracking-wider transition cursor-pointer"
            >
              SIGN IN & SAVE
            </button>
          ) : (
            <button
              onClick={onOpenLeaderboard}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-cyber text-xs tracking-wider transition cursor-pointer"
            >
              VIEW BOARD
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className={`w-full py-3.5 font-cyber font-bold text-sm tracking-wider rounded transition cursor-pointer active:scale-95 shadow-lg ${
              isVictory
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500 text-pink-300 shadow-[0_0_20px_rgba(255,0,85,0.3)]'
            }`}
          >
            RE-ENGAGE MATRIX [ENTER / SPACE]
          </button>

          <button
            onClick={onOpenDailyMissions}
            className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-300 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <span>🎯</span> DAILY MISSIONS & OBJECTIVES [M]
          </button>

          <button
            onClick={onOpenProfile}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
          >
            <span>👑</span> VIEW OPERATIVE DOSSIER & BADGES [P]
          </button>

          <button
            onClick={onOpenRewardedAd}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500 text-amber-300 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <span>📢</span> WATCH ADMOB AD (+350 CREDITS 💎)
          </button>

          <button
            onClick={onOpenAdMobConfig}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚙️</span> ADMOB ACCOUNT & ADS [A]
          </button>

          <button
            onClick={onQuitToTitle}
            className="w-full py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 font-cyber text-xs tracking-wider rounded transition cursor-pointer"
          >
            RETURN TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
