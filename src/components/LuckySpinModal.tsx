import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types/game';
import { X, Sparkles, Coins, PlaySquare, Gift } from 'lucide-react';
import { soundService } from '../services/sound';
import { adService } from '../services/ads';

interface LuckySpinModalProps {
  theme: Theme;
  onAwardCoins: (coins: number) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

interface WheelSlice {
  coins: number;
  label: string;
  color: string;
  isJackpot?: boolean;
}

const SLICES: WheelSlice[] = [
  { coins: 50, label: '50', color: '#38bdf8' },
  { coins: 150, label: '150', color: '#a855f7' },
  { coins: 75, label: '75', color: '#10b981' },
  { coins: 500, label: '500★', color: '#f59e0b', isJackpot: true },
  { coins: 100, label: '100', color: '#06b6d4' },
  { coins: 250, label: '250', color: '#ec4899' },
  { coins: 120, label: '120', color: '#8b5cf6' },
  { coins: 300, label: '300', color: '#14b8a6' },
];

const LAST_SPIN_KEY = 'mindrush_last_spin_date';

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  theme,
  onAwardCoins,
  onClose,
  showToast,
}) => {
  const [canFreeSpin, setCanFreeSpin] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSlice, setWonSlice] = useState<WheelSlice | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check if player has already used free spin today
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const last = localStorage.getItem(LAST_SPIN_KEY);
      setCanFreeSpin(last !== today);
    } catch {
      setCanFreeSpin(true);
    }
  }, []);

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const numSlices = SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, size, size);

    // Slices
    SLICES.forEach((slice, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      ctx.strokeStyle = '#06060c';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = slice.isJackpot ? 'bold 15px sans-serif' : 'bold 13px sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.label, radius - 16, 5);
      ctx.restore();
    });

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#06060c';
    ctx.fill();
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [theme.primary]);

  // Execute spin animation
  const executeSpin = (isFree: boolean) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonSlice(null);

    // Pick random target slice (weighted)
    const targetIdx = Math.floor(Math.random() * SLICES.length);
    const sliceAngleDeg = 360 / SLICES.length;

    // Canvas 0 deg is at 3 o'clock (right). Pointer is at top (270 deg / -90 deg).
    // Target offset calculation so top needle lands on target slice
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const targetSliceCenterDeg = targetIdx * sliceAngleDeg + sliceAngleDeg / 2;
    const targetDeg = extraSpins * 360 + (270 - targetSliceCenterDeg) + (Math.random() * 12 - 6);

    const totalDeg = rotation + targetDeg;
    setRotation(totalDeg);

    // Play ticking audio
    const tickInterval = window.setInterval(() => {
      soundService.playTone(850, 0.02, 'sine', 0.08);
    }, 140);

    setTimeout(() => {
      clearInterval(tickInterval);
      const chosen = SLICES[targetIdx];
      setWonSlice(chosen);
      setIsSpinning(false);
      soundService.victory();
      soundService.coin();

      // Record daily free spin
      if (isFree) {
        try {
          const today = new Date().toISOString().slice(0, 10);
          localStorage.setItem(LAST_SPIN_KEY, today);
          setCanFreeSpin(false);
        } catch {}
      }
    }, 3600);
  };

  const handleFreeSpin = () => {
    soundService.playTone(520, 0.06, 'triangle', 0.2);
    executeSpin(true);
  };

  const handleAdSpin = () => {
    setIsLoadingAd(true);
    adService.showRewardedVideo(
      'free_coins',
      () => {
        setIsLoadingAd(false);
        showToast('Ad watched! Spinning wheel...');
        executeSpin(false);
      },
      (msg) => {
        setIsLoadingAd(false);
        showToast(msg || 'Please watch the full ad to spin');
      }
    );
  };

  const handleClaim = () => {
    if (!wonSlice) return;
    onAwardCoins(wonSlice.coins);
    soundService.coin();
    showToast(`Claimed +${wonSlice.coins} Coins!`);
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-[#0d101d] p-5 shadow-2xl flex flex-col items-center relative animate-scaleUp overflow-hidden"
        style={{
          boxShadow: `0 12px 50px ${theme.glow}33`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/5 active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-black text-white tracking-tight uppercase">
            Lucky Spin Wheel
          </h2>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-[11px] text-white/50 text-center mb-4">
          Spin for coins & unlock premium neon themes!
        </p>

        {/* Wheel Container */}
        <div className="relative w-[260px] h-[260px] flex items-center justify-center my-2">
          {/* Top Indicator Pointer */}
          <div className="absolute -top-1 z-20 flex flex-col items-center pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 animate-pulse" />
          </div>

          {/* Canvas Wheel */}
          <div
            className="w-[240px] h-[240px] rounded-full transition-transform duration-[3500ms] ease-[cubic-bezier(0.15,0.9,0.2,1)]"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <canvas
              ref={canvasRef}
              width={240}
              height={240}
              className="w-full h-full rounded-full drop-shadow-[0_0_20px_rgba(56,189,248,0.25)]"
            />
          </div>

          {/* Center Badge */}
          <div
            className="absolute z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
            style={{
              background: `radial-gradient(circle, ${theme.primary}, #06060c)`,
            }}
          >
            <Gift className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Reward Result or Spin Buttons */}
        <div className="w-full mt-4 flex flex-col items-center">
          {wonSlice ? (
            <div className="w-full space-y-2 text-center animate-bounce">
              <div className="text-xs text-white/70 font-semibold">You Won:</div>
              <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1.5 tabular-nums">
                <Coins className="w-6 h-6 text-amber-400" />
                <span>+{wonSlice.coins} COINS</span>
              </div>
              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl text-black"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #38bdf8)',
                }}
              >
                <span>COLLECT REWARD</span>
              </button>
            </div>
          ) : canFreeSpin ? (
            <button
              onClick={handleFreeSpin}
              disabled={isSpinning}
              className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl text-black disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSpinning ? 'SPINNING...' : 'FREE DAILY SPIN'}</span>
            </button>
          ) : (
            <button
              onClick={handleAdSpin}
              disabled={isSpinning || isLoadingAd}
              className="w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl text-black disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                boxShadow: '0 8px 30px rgba(168, 85, 247, 0.4)',
              }}
            >
              <PlaySquare className="w-4 h-4 animate-pulse" />
              <span>{isSpinning ? 'SPINNING...' : isLoadingAd ? 'LOADING AD...' : 'SPIN AGAIN (WATCH AD)'}</span>
            </button>
          )}

          {!wonSlice && (
            <div className="text-[10px] text-white/40 mt-2 text-center">
              {canFreeSpin
                ? '★ 1 Free Spin Available Every Day!'
                : 'Free spin used today. Watch an ad to spin unlimited times!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
