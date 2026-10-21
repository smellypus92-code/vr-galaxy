import React, { useEffect, useState } from 'react';
import { fetchLeaderboard, LeaderboardItem } from '../game/firebase';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [scores, setScores] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLeaderboard()
      .then((data) => {
        if (active) {
          setScores(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load leaderboard:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-xl p-6 sm:p-7 shadow-[0_0_40px_rgba(0,243,255,0.2)] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏆</span>
            <div>
              <h2 className="font-cyber font-bold text-lg sm:text-xl text-white tracking-wider">
                CYBER BEACH // HALL OF FAME
              </h2>
              <p className="text-xs text-slate-400">
                Global high scores verified with Firebase Authentication & Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer text-sm font-cyber"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Scores List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2 mb-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-cyber text-sm tracking-wider animate-pulse">
              FETCHING FIRESTORE MATRIX SCORES...
            </div>
          ) : scores.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-cyber text-sm tracking-wider">
              NO HIGH SCORES RECORDED YET. BE THE FIRST TO CLAIM THE CROWN!
            </div>
          ) : (
            scores.map((entry, idx) => {
              const rankColor =
                idx === 0
                  ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
                  : idx === 1
                  ? 'text-slate-300 border-slate-600/40 bg-slate-800/30'
                  : idx === 2
                  ? 'text-amber-600 border-amber-700/40 bg-amber-950/20'
                  : 'text-slate-400 border-slate-800 bg-slate-950/40';

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${rankColor}`}
                >
                  {/* Left: Rank & Player info */}
                  <div className="flex items-center gap-3">
                    <span className="font-cyber font-black text-base w-6 text-center tabular-nums">
                      #{idx + 1}
                    </span>

                    {entry.photoURL ? (
                      <img
                        src={entry.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-cyber text-xs text-cyan-400">
                        {entry.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-cyber font-bold text-sm text-slate-200">
                        {entry.displayName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Wave {entry.wave}</span>
                        <span>·</span>
                        <span className="text-pink-400">{entry.maxCombo}x Combo</span>
                        <span>·</span>
                        <span className="text-cyan-400">{entry.champion || 'Solar Blade'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right">
                    <div className="font-cyber font-bold text-lg text-white tabular-nums">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-cyber text-slate-500 uppercase">
                      POINTS
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-200 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer"
          >
            BACK TO GAME
          </button>
        </div>
      </div>
    </div>
  );
};
