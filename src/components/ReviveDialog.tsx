import React, { useEffect, useState } from 'react';
import { Theme } from '../types/game';
import { Flame, Play, X, Zap } from 'lucide-react';
import { adService } from '../services/ads';

interface ReviveDialogProps {
  score: number;
  combo: number;
  reason: string;
  theme: Theme;
  onReviveSuccess: () => void;
  onSkip: () => void;
}

export const ReviveDialog: React.FC<ReviveDialogProps> = ({
  score,
  combo,
  reason,
  theme,
  onReviveSuccess,
  onSkip,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  useEffect(() => {
    if (isLoadingAd) return;
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoadingAd, onSkip]);

  const handleWatchAd = () => {
    setIsLoadingAd(true);
    adService.showRewardedVideo(
      'revive',
      () => {
        setIsLoadingAd(false);
        onReviveSuccess();
      },
      () => {
        setIsLoadingAd(false);
        onSkip();
      }
    );
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onSkip}
    >
      <div
        className="w-full max-w-[320px] rounded-3xl border p-5 flex flex-col items-center gap-4 text-center shadow-2xl animate-scaleUp"
        style={{
          background: `linear-gradient(180deg, ${theme.bgInner}f2, ${theme.bg})`,
          borderColor: '#facc15',
          boxShadow: '0 0 50px rgba(250, 204, 21, 0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
            ⚡ SECOND CHANCE
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            SAVE YOUR RUN?
          </h2>
          <p className="text-xs text-white/60 mt-0.5">{reason}</p>
        </div>

        {/* Current Run Highlights */}
        <div className="flex items-center justify-center gap-4 w-full py-1 border-y border-white/10">
          <div className="text-center">
            <span className="text-[10px] font-bold text-white/50 uppercase block">Score</span>
            <span className="text-lg font-black text-white tabular-nums">{score}</span>
          </div>
          {combo >= 2 && (
            <div className="text-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 fill-current" /> Combo
              </span>
              <span className="text-lg font-black text-rose-400 tabular-nums">{combo}x</span>
            </div>
          )}
        </div>

        {/* Animated Countdown Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full border-2 border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-xl font-black text-amber-300 tabular-nums animate-pulse"
          >
            {secondsLeft}s
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-1">
          <button
            onClick={handleWatchAd}
            disabled={isLoadingAd}
            className="w-full py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #facc15, #f59e0b)',
              color: '#06060c',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.45)',
            }}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>WATCH AD TO REVIVE</span>
          </button>

          <button
            onClick={onSkip}
            className="w-full py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white transition flex items-center justify-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>No thanks, end run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
