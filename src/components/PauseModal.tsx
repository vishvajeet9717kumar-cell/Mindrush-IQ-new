import React from 'react';
import { Theme } from '../types/game';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { soundService } from '../services/sound';

interface PauseModalProps {
  theme: Theme;
  sfxOn: boolean;
  musicOn: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  theme,
  sfxOn,
  musicOn,
  onResume,
  onRestart,
  onQuit,
  onToggleSfx,
  onToggleMusic,
}) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onResume}
    >
      <div
        className="w-full max-w-[320px] rounded-3xl border p-6 flex flex-col items-center gap-5 shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${theme.bgInner}, ${theme.bg})`,
          borderColor: `${theme.glow}44`,
          boxShadow: `0 0 50px ${theme.glow}33`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <h2
            className="text-2xl font-black tracking-tight"
            style={{
              color: theme.primary,
              textShadow: `0 0 16px ${theme.primary}66`,
            }}
          >
            GAME PAUSED
          </h2>
          <p className="text-xs text-white/50 mt-0.5">Take a breath, champion</p>
        </div>

        {/* Audio Quick Toggles */}
        <div className="flex items-center gap-3 py-1">
          <button
            onClick={onToggleSfx}
            className="px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            style={{
              background: sfxOn ? `${theme.primary}22` : 'rgba(255,255,255,0.05)',
              borderColor: sfxOn ? `${theme.primary}66` : 'rgba(255,255,255,0.1)',
              color: sfxOn ? theme.primary : 'rgba(255,255,255,0.5)',
            }}
          >
            {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>SFX</span>
          </button>

          <button
            onClick={onToggleMusic}
            className="px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all active:scale-95"
            style={{
              background: musicOn ? `${theme.primary}22` : 'rgba(255,255,255,0.05)',
              borderColor: musicOn ? `${theme.primary}66` : 'rgba(255,255,255,0.1)',
              color: musicOn ? theme.primary : 'rgba(255,255,255,0.5)',
            }}
          >
            <Music className="w-4 h-4" />
            <span>Music</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.glow})`,
              color: '#06060c',
              boxShadow: `0 8px 24px ${theme.primary}55`,
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTART RUN</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-white/60 hover:text-white border border-transparent hover:border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
