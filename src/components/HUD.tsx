import React from 'react';
import { Theme } from '../types/game';
import { Pause, Flame } from 'lucide-react';

interface HUDProps {
  score: number;
  combo: number;
  level: number;
  streak: number;
  theme: Theme;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  combo,
  level,
  streak,
  theme,
  onPause,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-auto z-30">
        <div className="flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/90 font-bold flex items-center gap-1 shadow-sm">
            <span>Lv</span>
            <span style={{ color: theme.primary }}>{level}</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{streak}</span>
          </div>
        </div>

        {/* Live Score Counter with Theme Glow */}
        <div
          className="px-4 py-1 rounded-full bg-black/75 backdrop-blur-md border text-white font-black text-lg tracking-wider tabular-nums"
          style={{
            borderColor: `${theme.primary}66`,
            boxShadow: `0 0 16px ${theme.primary}44`,
          }}
        >
          {score}
        </div>

        {/* Pause Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onPause();
          }}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all shadow-md"
          title="Pause game (Esc)"
          aria-label="Pause game"
        >
          <Pause className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Combo Indicator */}
      {combo >= 2 && (
        <div
          key={combo}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full text-xs font-black pointer-events-none z-30 whitespace-nowrap animate-bounce shadow-lg flex items-center gap-1.5"
          style={{
            background: `${theme.secondary}26`,
            color: theme.secondary,
            border: `1.5px solid ${theme.secondary}88`,
            boxShadow: `0 0 20px ${theme.secondary}44`,
          }}
        >
          <Flame className="w-4 h-4 fill-current animate-pulse" />
          <span>COMBO x{combo}</span>
        </div>
      )}
    </>
  );
};
