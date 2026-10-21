import React from 'react';
import { CHAMPIONS, ChampionId } from '../game/proceduralModels';

interface ChampionSelectorProps {
  selectedId: ChampionId;
  onSelect: (id: ChampionId) => void;
  onClose: () => void;
}

export const ChampionSelector: React.FC<ChampionSelectorProps> = ({
  selectedId,
  onSelect,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,243,255,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping" />
            <div>
              <h2 className="font-cyber font-bold text-lg sm:text-2xl text-white tracking-wider">
                BIKINI CYBER-SQUAD CO-PILOTS
              </h2>
              <p className="text-xs text-slate-400">
                Select your beach champion co-pilot for specialized combat perks and squad cheer support!
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

        {/* Champion Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {(Object.values(CHAMPIONS) as typeof CHAMPIONS[ChampionId][]).map((champ) => {
            const isSelected = selectedId === champ.id;
            return (
              <div
                key={champ.id}
                onClick={() => onSelect(champ.id)}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(0,243,255,0.3)] scale-[1.02]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Active Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-cyan-400 text-slate-950 text-[10px] font-cyber font-bold tracking-wider">
                    ACTIVE
                  </div>
                )}

                {/* Champion Visual Avatar Preview */}
                <div className="w-full h-36 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center mb-3 relative overflow-hidden">
                  {/* Neon Glow backdrop */}
                  <div
                    className="absolute w-24 h-24 rounded-full blur-2xl opacity-40"
                    style={{ backgroundColor: `#${champ.bikiniColor.toString(16).padStart(6, '0')}` }}
                  />

                  {/* Stylized Cyber Silhouette / Bikini Icon */}
                  <svg className="w-16 h-16 z-10" viewBox="0 0 64 64" fill="none">
                    {/* Head & Sunglasses */}
                    <circle cx="32" cy="14" r="8" fill={`#${champ.skinColor.toString(16).padStart(6, '0')}`} />
                    <rect x="25" y="12" width="14" height="4" rx="1.5" fill="#0f172a" />
                    {/* Hair */}
                    <path d="M24 12 C24 6, 40 6, 40 12 L38 20 L26 20 Z" fill={`#${champ.hairColor.toString(16).padStart(6, '0')}`} />
                    <path d="M38 12 Q46 16 42 24" stroke={`#${champ.hairColor.toString(16).padStart(6, '0')}`} strokeWidth="3" strokeLinecap="round" />
                    {/* Neon Bikini Top */}
                    <circle cx="28" cy="28" r="5" fill={`#${champ.bikiniColor.toString(16).padStart(6, '0')}`} />
                    <circle cx="36" cy="28" r="5" fill={`#${champ.bikiniColor.toString(16).padStart(6, '0')}`} />
                    <line x1="28" y1="28" x2="36" y2="28" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Waist & Bikini Bottom */}
                    <path d="M26 38 L38 38 L34 46 L30 46 Z" fill={`#${champ.bikiniColor.toString(16).padStart(6, '0')}`} />
                    <line x1="23" y1="38" x2="41" y2="38" stroke={`#${champ.bikiniColor.toString(16).padStart(6, '0')}`} strokeWidth="2" />
                  </svg>

                  <div className="z-10 text-[10px] font-cyber text-slate-400 mt-1 uppercase tracking-wider">
                    {champ.title}
                  </div>
                </div>

                {/* Champion Info */}
                <div>
                  <h3 className="font-cyber font-bold text-base text-white mb-1">
                    {champ.name}
                  </h3>
                  <div className="p-2 rounded bg-slate-900/90 border border-slate-800/80 text-[11px] font-mono text-cyan-300 leading-tight mb-2">
                    {champ.perkDescription}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(champ.id);
                  }}
                  className={`w-full py-1.5 rounded text-xs font-cyber font-bold tracking-wider transition ${
                    isSelected
                      ? 'bg-cyan-500/40 text-cyan-200 border border-cyan-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'CHOOSE CHAMPION'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info & CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-sans">
            Champions cheer you from the observation decks in full 3D and activate passive perks!
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-200 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
