import React from 'react';
import { ReticleConfig, ReticleStyle } from '../game/types';

interface ReticleCustomizerProps {
  config: ReticleConfig;
  onChange: (newConfig: Partial<ReticleConfig>) => void;
  onClose: () => void;
}

const STYLES: { id: ReticleStyle; label: string; icon: string }[] = [
  { id: 'CYBER_RING', label: 'Cyber Ring', icon: '◎' },
  { id: 'TACTICAL_CROSS', label: 'Tactical Cross', icon: '✛' },
  { id: 'TRI_CHEVRON', label: 'Tri-Chevron', icon: '▲' },
  { id: 'DIAMOND', label: 'Diamond Lock', icon: '◇' },
];

const IDLE_COLORS = [
  { hex: '#00f3ff', name: 'Cyber Cyan' },
  { hex: '#10b981', name: 'Matrix Green' },
  { hex: '#fbbf24', name: 'Solar Gold' },
  { hex: '#a855f7', name: 'Plasma Violet' },
  { hex: '#ffffff', name: 'Polar White' },
];

const TARGET_COLORS = [
  { hex: '#ff0055', name: 'Laser Red' },
  { hex: '#ff5500', name: 'Neon Orange' },
  { hex: '#e11d48', name: 'Crimson Rose' },
  { hex: '#facc15', name: 'Electric Yellow' },
];

const SIZES = [
  { value: 0.8, label: '0.8x Compact' },
  { value: 1.0, label: '1.0x Standard' },
  { value: 1.3, label: '1.3x Large' },
  { value: 1.6, label: '1.6x Expanded' },
];

export const ReticleCustomizer: React.FC<ReticleCustomizerProps> = ({
  config,
  onChange,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/50 rounded-xl p-6 sm:p-7 shadow-[0_0_40px_rgba(0,243,255,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <h2 className="font-cyber font-bold text-lg sm:text-xl text-white tracking-wider">
              VR RETICLE & TARGET LOCK SETUP
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer text-sm font-cyber"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Live Interactive Reticle Preview (Idle vs Drone Targeted) */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 mb-5 flex items-center justify-around">
          {/* Idle Preview */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-cyber text-slate-400 tracking-wider uppercase">
              IDLE SCAN
            </span>
            <div className="w-20 h-20 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
              <ReticlePreview
                style={config.style}
                color={config.idleColor}
                size={config.size}
                isLocked={false}
              />
            </div>
          </div>

          <div className="text-slate-600 font-cyber text-xs">➔</div>

          {/* Locked Preview */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-cyber text-pink-400 tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              DRONE TARGET LOCKED
            </span>
            <div className="w-20 h-20 rounded bg-slate-900/60 border border-pink-900/40 flex items-center justify-center relative overflow-hidden">
              <ReticlePreview
                style={config.style}
                color={config.targetColor}
                size={config.size}
                isLocked={true}
              />
            </div>
          </div>
        </div>

        {/* Setting 1: Reticle Geometry Style */}
        <div className="mb-4">
          <label className="block text-xs font-cyber text-slate-300 uppercase tracking-wider mb-2">
            Reticle Geometry Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => onChange({ style: st.id })}
                className={`p-2.5 rounded border text-xs font-cyber tracking-wider transition cursor-pointer flex flex-col items-center gap-1 ${
                  config.style === st.id
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{st.icon}</span>
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Idle Color */}
        <div className="mb-4">
          <label className="block text-xs font-cyber text-slate-300 uppercase tracking-wider mb-2">
            Idle Color
          </label>
          <div className="flex items-center gap-2">
            {IDLE_COLORS.map((col) => (
              <button
                key={col.hex}
                onClick={() => onChange({ idleColor: col.hex })}
                title={col.name}
                className={`w-8 h-8 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                  config.idleColor === col.hex
                    ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                    : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>
        </div>

        {/* Setting 3: Target Drone Locked Color */}
        <div className="mb-4">
          <label className="block text-xs font-cyber text-pink-400 uppercase tracking-wider mb-2">
            Target Locked Color (When Aiming at Drones)
          </label>
          <div className="flex items-center gap-2">
            {TARGET_COLORS.map((col) => (
              <button
                key={col.hex}
                onClick={() => onChange({ targetColor: col.hex })}
                title={col.name}
                className={`w-8 h-8 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                  config.targetColor === col.hex
                    ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,0,85,0.6)]'
                    : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}
          </div>
        </div>

        {/* Setting 4: Reticle Size */}
        <div className="mb-5">
          <label className="block text-xs font-cyber text-slate-300 uppercase tracking-wider mb-2">
            Reticle Scale
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => onChange({ size: s.value })}
                className={`py-1.5 px-2 rounded border text-xs font-cyber tracking-wider text-center transition cursor-pointer ${
                  config.size === s.value
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 5: VR Laser Pointer Beam Toggle */}
        <div className="flex items-center justify-between p-3 rounded bg-slate-950/60 border border-slate-800 mb-6">
          <div>
            <div className="font-cyber text-xs text-slate-200 tracking-wider">
              VR CONTROLLER LASER AIM BEAM
            </div>
            <div className="text-[11px] text-slate-400">
              Projects a glowing targeting beam from your hand in VR
            </div>
          </div>
          <button
            onClick={() => onChange({ showLaserPointer: !config.showLaserPointer })}
            className={`px-3 py-1 rounded text-xs font-cyber font-bold tracking-wider border transition cursor-pointer ${
              config.showLaserPointer
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {config.showLaserPointer ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Apply CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-200 font-cyber font-bold text-xs sm:text-sm tracking-wider rounded transition cursor-pointer shadow-[0_0_20px_rgba(0,243,255,0.25)]"
        >
          CONFIRM & RETURN TO SIMULATION
        </button>
      </div>
    </div>
  );
};

// Mini SVG preview renderer for reticles
export const ReticlePreview: React.FC<{
  style: ReticleStyle;
  color: string;
  size: number;
  isLocked: boolean;
}> = ({ style, color, size, isLocked }) => {
  const scale = size * (isLocked ? 1.08 : 0.95);

  return (
    <svg
      className="w-14 h-14"
      viewBox="0 0 100 100"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.15s ease, filter 0.15s ease',
        filter: isLocked ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 3px ${color})`,
      }}
    >
      {/* Central Aiming Dot */}
      <circle cx="50" cy="50" r="3" fill={color} />

      {/* Style Mesh */}
      {style === 'CYBER_RING' && (
        <>
          <circle cx="50" cy="50" r="24" stroke={color} strokeWidth="2.5" fill="none" strokeDasharray="18 6" />
          <line x1="50" y1="16" x2="50" y2="24" stroke={color} strokeWidth="2" />
          <line x1="50" y1="76" x2="50" y2="84" stroke={color} strokeWidth="2" />
          <line x1="16" y1="50" x2="24" y2="50" stroke={color} strokeWidth="2" />
          <line x1="76" y1="50" x2="84" y2="50" stroke={color} strokeWidth="2" />
        </>
      )}

      {style === 'TACTICAL_CROSS' && (
        <>
          <circle cx="50" cy="50" r="16" stroke={color} strokeWidth="1.5" fill="none" />
          <line x1="50" y1="14" x2="50" y2="30" stroke={color} strokeWidth="2.5" />
          <line x1="50" y1="70" x2="50" y2="86" stroke={color} strokeWidth="2.5" />
          <line x1="14" y1="50" x2="30" y2="50" stroke={color} strokeWidth="2.5" />
          <line x1="70" y1="50" x2="86" y2="50" stroke={color} strokeWidth="2.5" />
        </>
      )}

      {style === 'TRI_CHEVRON' && (
        <>
          {/* Top chevron */}
          <path d="M42 22 L50 28 L58 22" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Bottom right */}
          <path d="M72 68 L66 60 L76 56" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Bottom left */}
          <path d="M28 68 L34 60 L24 56" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {style === 'DIAMOND' && (
        <>
          <polygon points="50,18 82,50 50,82 18,50" stroke={color} strokeWidth="2" fill="none" />
          <polygon points="50,32 68,50 50,68 32,50" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
        </>
      )}

      {/* 4 Corner Targeting Lock Brackets [ ] */}
      <g
        style={{
          transform: isLocked ? 'scale(0.85)' : 'scale(1.0)',
          transformOrigin: '50px 50px',
          transition: 'transform 0.15s ease',
        }}
      >
        <path d="M20 30 L20 20 L30 20" stroke={color} strokeWidth="2" fill="none" />
        <path d="M80 30 L80 20 L70 20" stroke={color} strokeWidth="2" fill="none" />
        <path d="M20 70 L20 80 L30 80" stroke={color} strokeWidth="2" fill="none" />
        <path d="M80 70 L80 80 L70 80" stroke={color} strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
};
