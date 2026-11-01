import React, { useState } from 'react';
import { Mode, SaveData, Theme } from '../types/game';
import { RotateCcw, Home, Trophy, Flame, Coins, Zap, PlaySquare, Check, Share2 } from 'lucide-react';
import { adService } from '../services/ads';
import { soundService } from '../services/sound';

interface GameOverScreenProps {
  theme: Theme;
  save: SaveData;
  score: number;
  combo: number;
  mode: Mode;
  reason: string;
  xpGain: number;
  coinGain: number;
  isNewHigh: boolean;
  onDoubleCoinsSuccess: (bonusCoins: number) => void;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  theme,
  score,
  combo,
  mode,
  reason,
  xpGain,
  coinGain,
  isNewHigh,
  onDoubleCoinsSuccess,
  onRetry,
  onMenu,
}) => {
  const [hasDoubled, setHasDoubled] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const modeNames: Record<Mode, string> = {
    math: 'Speed Math',
    vocab: 'Vocabulary',
    pattern: 'Pattern IQ',
  };

  const handleDoubleCoins = () => {
    if (hasDoubled || coinGain <= 0) return;
    setIsLoadingAd(true);
    adService.showRewardedVideo(
      'double_coins',
      () => {
        setIsLoadingAd(false);
        setHasDoubled(true);
        soundService.coin();
        onDoubleCoinsSuccess(coinGain);
      },
      () => {
        setIsLoadingAd(false);
      }
    );
  };

  const handleShareWhatsApp = () => {
    soundService.coin();
    const modeName = mode === 'math' ? 'Speed Math' : mode === 'vocab' ? 'Vocabulary' : 'Pattern IQ';
    const text = `🧠 I scored ${score} in MindRush IQ (${modeName} mode)! Can you beat my high score? Play free here: https://mindrush-iq-new.vercel.app`;
    
    if (navigator.share) {
      navigator.share({
        title: 'MindRush IQ Challenge',
        text: text,
        url: 'https://mindrush-iq-new.vercel.app',
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center p-5 z-40 animate-fadeIn"
      style={{
        background: `radial-gradient(ellipse at 50% 20%, ${theme.secondary}26 0%, ${theme.bgInner} 75%)`,
      }}
    >
      <div
        className="w-full max-w-[340px] rounded-3xl border p-6 flex flex-col items-center gap-4 backdrop-blur-xl shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${theme.bgInner}f0, ${theme.bg})`,
          borderColor: isNewHigh ? `${theme.primary}66` : `${theme.secondary}44`,
          boxShadow: `0 0 50px ${isNewHigh ? theme.primary : theme.secondary}26`,
        }}
      >
        {/* Run Over Header */}
        <div className="text-center">
          {isNewHigh ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-1">
              {reason || 'Run Finished'}
            </span>
          )}

          <h2
            className="text-5xl font-black tabular-nums tracking-tight"
            style={{
              color: isNewHigh ? theme.primary : '#ffffff',
              textShadow: `0 0 25px ${isNewHigh ? theme.primary : theme.secondary}66`,
            }}
          >
            {score}
          </h2>

          <div className="text-xs font-semibold text-white/60 mt-0.5">
            {modeNames[mode]}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full pt-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center">
            <div className="text-[10px] font-bold text-white/50 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Combo
            </div>
            <div className="text-sm font-black text-white mt-0.5">{combo}x</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center">
            <div className="text-[10px] font-bold text-white/50 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-sky-400" /> XP Earned
            </div>
            <div className="text-sm font-black text-sky-300 mt-0.5">+{xpGain}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-center">
            <div className="text-[10px] font-bold text-white/50 flex items-center justify-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> Coins
            </div>
            <div className="text-sm font-black text-amber-300 mt-0.5 tabular-nums">
              +{hasDoubled ? coinGain * 2 : coinGain}
            </div>
          </div>
        </div>

        {/* Rewarded Ad Option: 2X COINS */}
        {coinGain > 0 && (
          <button
            onClick={handleDoubleCoins}
            disabled={hasDoubled || isLoadingAd}
            className="w-full py-2.5 px-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all active:scale-95 disabled:opacity-60 shadow-md"
            style={{
              background: hasDoubled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              borderColor: hasDoubled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.5)',
              color: hasDoubled ? '#34d399' : '#fbbf24',
            }}
          >
            <div className="flex items-center gap-2">
              {hasDoubled ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <PlaySquare className="w-4 h-4 text-amber-400 animate-pulse" />
              )}
              <span>{hasDoubled ? 'Coins Doubled!' : `Double Coins (+${coinGain}◎)`}</span>
            </div>
            {!hasDoubled && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-black">
                Watch Ad
              </span>
            )}
          </button>
        )}

        {/* Primary CTA Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.glow})`,
              color: '#06060c',
              boxShadow: `0 8px 25px ${theme.primary}55`,
            }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          {/* Viral WhatsApp Share Challenge */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 px-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>CHALLENGE ON WHATSAPP</span>
          </button>

          <button
            onClick={onMenu}
            className="w-full py-2.5 rounded-2xl font-bold text-xs text-white/70 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>BACK TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
