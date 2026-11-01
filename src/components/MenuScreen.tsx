import React, { useState } from 'react';
import { Mode, SaveData, Theme } from '../types/game';
import {
  Volume2,
  VolumeX,
  Music,
  Flame,
  Award,
  Palette,
  BarChart2,
  Coins,
  Calculator,
  BookOpen,
  GitCommit,
  CheckCircle2,
  Sliders,
  Gift,
  Sparkles,
} from 'lucide-react';
import { xpForLevel } from '../services/storage';
import { adService } from '../services/ads';

interface MenuScreenProps {
  theme: Theme;
  save: SaveData;
  onStart: (mode: Mode) => void;
  onClaimDailyStreak: () => void;
  onClaimChallenge: () => void;
  onClaimFreeChest: () => void;
  onOpenLuckySpin: () => void;
  onOpenThemes: () => void;
  onOpenMissions: () => void;
  onOpenProgress: () => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onChangeMusicVolume: (v: number) => void;
  onOpenInfo: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  theme,
  save,
  onStart,
  onClaimDailyStreak,
  onClaimChallenge,
  onClaimFreeChest,
  onOpenLuckySpin,
  onOpenThemes,
  onOpenMissions,
  onOpenProgress,
  onToggleSfx,
  onToggleMusic,
  onChangeMusicVolume,
  onOpenInfo,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const xpNeeded = xpForLevel(save.level);
  const xpPct = Math.min(100, Math.floor((save.xp / xpNeeded) * 100));

  const today = new Date().toISOString().slice(0, 10);
  const dailyClaimed = save.dailyClaimedDate === today;
  const challenge = save.dailyChallenge;
  const challengeCompleted = challenge.progress >= challenge.goal;

  const MODES: { id: Mode; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'math',
      label: 'Speed Math',
      desc: '+, -, ×, ÷ mental arithmetic',
      icon: <Calculator className="w-5 h-5" />,
      color: '#10b981',
    },
    {
      id: 'vocab',
      label: 'Vocabulary',
      desc: 'Synonyms & semantic meanings',
      icon: <BookOpen className="w-5 h-5" />,
      color: '#38bdf8',
    },
    {
      id: 'pattern',
      label: 'Pattern IQ',
      desc: 'Next number sequence recognition',
      icon: <GitCommit className="w-5 h-5" />,
      color: '#c084fc',
    },
  ];

  return (
    <div
      className="absolute inset-0 flex flex-col p-4 sm:p-5 overflow-y-auto no-scrollbar z-20"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, ${theme.glow}18 0%, ${theme.bgInner} 75%)`,
      }}
    >
      {/* Top Bar: Profile / Coins / Quick Settings */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Level & XP */}
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}22, ${theme.glow}15)`,
              borderColor: `${theme.primary}66`,
              color: theme.primary,
            }}
          >
            {save.level}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white/90 leading-tight">
              Level {save.level}
            </span>
            <div className="w-20 sm:w-24 h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPct}%`, background: theme.primary }}
              />
            </div>
          </div>
        </div>

        {/* Right Action Icons: Streak, Coins, Audio */}
        <div className="flex items-center gap-1.5 relative">
          {/* Daily Streak */}
          <button
            onClick={onClaimDailyStreak}
            className="px-2.5 py-1 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
            style={{
              background: dailyClaimed ? 'rgba(255,255,255,0.04)' : `${theme.secondary}22`,
              borderColor: dailyClaimed ? 'rgba(255,255,255,0.1)' : `${theme.secondary}77`,
              color: dailyClaimed ? 'rgba(255,255,255,0.5)' : theme.secondary,
              boxShadow: dailyClaimed ? 'none' : `0 0 14px ${theme.secondary}33`,
            }}
            title={dailyClaimed ? 'Daily streak claimed' : 'Claim daily reward!'}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{save.streak}d</span>
          </button>

          {/* Coins Badge */}
          <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1 text-xs font-bold text-amber-300">
            <Coins className="w-3.5 h-3.5" />
            <span className="tabular-nums">{save.coins}</span>
          </div>

          {/* Volume toggle */}
          <button
            onClick={() => setShowVolumeSlider(v => !v)}
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition active:scale-90"
            aria-label="Sound settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Volume Dropdown Popover */}
          {showVolumeSlider && (
            <div
              className="absolute right-0 top-11 z-50 w-52 p-3.5 rounded-2xl border border-white/15 bg-black/90 backdrop-blur-xl shadow-2xl flex flex-col gap-3 animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-xs font-bold text-white/90">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Sound Effects
                </span>
                <button
                  onClick={onToggleSfx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-white/20"
                  style={{
                    color: save.sfxOn ? theme.primary : '#888',
                    background: save.sfxOn ? `${theme.primary}22` : 'transparent',
                  }}
                >
                  {save.sfxOn ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-white/90">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-sky-400" /> Background Music
                </span>
                <button
                  onClick={onToggleMusic}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-white/20"
                  style={{
                    color: save.musicOn ? theme.primary : '#888',
                    background: save.musicOn ? `${theme.primary}22` : 'transparent',
                  }}
                >
                  {save.musicOn ? 'ON' : 'OFF'}
                </button>
              </div>

              {save.musicOn && (
                <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px] text-white/60">
                    <span>Music Volume</span>
                    <span>{Math.round(save.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={save.musicVolume}
                    onChange={e => onChangeMusicVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              )}

              {/* No Ads VIP Pass Toggle */}
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-white/80">
                <span>Ad-Free VIP Pass</span>
                <button
                  onClick={() => {
                    const current = adService.getNoAds();
                    adService.setNoAds(!current);
                    setShowVolumeSlider(false);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-black border"
                  style={{
                    background: adService.getNoAds() ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                    borderColor: adService.getNoAds() ? '#10b981' : 'rgba(255,255,255,0.2)',
                    color: adService.getNoAds() ? '#34d399' : '#888',
                  }}
                >
                  {adService.getNoAds() ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Brand Title & Hero Banner */}
      <div className="text-center my-auto py-2">
        <h1
          className="text-4xl sm:text-5xl font-black tracking-tight leading-none uppercase"
          style={{
            background: `linear-gradient(135deg, #ffffff 10%, ${theme.primary} 60%, ${theme.glow} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 16px ${theme.primary}55)`,
          }}
        >
          MindRush<span style={{ WebkitTextStroke: `1.5px ${theme.secondary}` }}> IQ</span>
        </h1>
        <p className="text-[11px] font-semibold text-white/50 tracking-[0.2em] uppercase mt-2">
          Train · React · Conquer
        </p>

        {/* Game Mode Cards */}
        <div className="flex flex-col gap-2.5 mt-5 max-w-[340px] mx-auto w-full">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => onStart(m.id)}
              className="group relative w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 active:scale-97 hover:scale-[1.02] shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${m.color}15, rgba(255,255,255,0.03))`,
                borderColor: `${m.color}44`,
                boxShadow: `0 4px 20px ${m.color}18`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md"
                  style={{
                    background: `${m.color}22`,
                    color: m.color,
                    border: `1px solid ${m.color}55`,
                  }}
                >
                  {m.icon}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-2">
                    {m.label}
                    {save.highScores[m.id] > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                        Best: {save.highScores[m.id]}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/60">{m.desc}</div>
                </div>
              </div>
              <span
                className="text-xs font-black px-2.5 py-1 rounded-full transition-transform group-hover:translate-x-1"
                style={{
                  background: m.color,
                  color: '#06060c',
                }}
              >
                PLAY →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lucky Spin Wheel CTA Card */}
      <div
        className="rounded-2xl border p-2.5 mt-2.5 backdrop-blur-md max-w-[340px] mx-auto w-full flex items-center justify-between shadow-md"
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.08))',
          borderColor: 'rgba(168, 85, 247, 0.4)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1">
              <span>Lucky Spin Wheel</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-400/20 text-purple-300">
                Win up to 500◎
              </span>
            </div>
            <div className="text-[10px] text-white/50">Daily free spin + ad spins</div>
          </div>
        </div>

        <button
          onClick={onOpenLuckySpin}
          className="px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md text-white"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          }}
        >
          SPIN 🎡
        </button>
      </div>

      {/* Free Reward Chest (Rewarded Video Ad) */}
      <div
        className="rounded-2xl border p-2.5 mt-2 backdrop-blur-md max-w-[340px] mx-auto w-full flex items-center justify-between shadow-md"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(255, 255, 255, 0.02))',
          borderColor: 'rgba(245, 158, 11, 0.4)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Gift className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 flex items-center gap-1">
              <span>Free Coin Bounty</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">+150◎</span>
            </div>
            <div className="text-[10px] text-white/50">Watch video ad to claim</div>
          </div>
        </div>

        <button
          onClick={onClaimFreeChest}
          className="px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #facc15, #f59e0b)',
            color: '#06060c',
          }}
        >
          CLAIM
        </button>
      </div>

      {/* Daily Challenge Card */}
      <div
        className="rounded-2xl border p-3 mt-3 backdrop-blur-md max-w-[340px] mx-auto w-full"
        style={{
          background: `linear-gradient(135deg, ${theme.glow}0d, rgba(255,255,255,0.02))`,
          borderColor: challengeCompleted && !challenge.claimed ? `${theme.primary}88` : `${theme.glow}26`,
        }}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white/90">
            <CheckCircle2
              className="w-4 h-4"
              style={{ color: challengeCompleted ? theme.primary : 'rgba(255,255,255,0.4)' }}
            />
            <span>Daily Objective: {challenge.mode.toUpperCase()}</span>
          </div>

          {challengeCompleted && !challenge.claimed ? (
            <button
              onClick={onClaimChallenge}
              className="px-2.5 py-1 rounded-lg text-xs font-black transition-all animate-pulse shadow-md"
              style={{
                background: theme.primary,
                color: '#06060c',
              }}
            >
              CLAIM +{50 + save.level * 5}◎
            </button>
          ) : (
            <span className="text-[11px] font-bold text-white/50">
              {challenge.progress}/{challenge.goal}
            </span>
          )}
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (challenge.progress / challenge.goal) * 100)}%`,
              background: challengeCompleted ? theme.primary : theme.glow,
            }}
          />
        </div>
      </div>

      {/* Bottom Nav Bar: Themes, Missions, Stats, Info */}
      <div className="grid grid-cols-4 gap-2 pt-3 max-w-[340px] mx-auto w-full">
        <button
          onClick={onOpenThemes}
          className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-white/80 hover:text-white"
        >
          <Palette className="w-4 h-4" style={{ color: theme.primary }} />
          <span className="text-[10px] font-bold">Themes</span>
        </button>

        <button
          onClick={onOpenMissions}
          className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-white/80 hover:text-white"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold">Badges</span>
        </button>

        <button
          onClick={onOpenProgress}
          className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-white/80 hover:text-white"
        >
          <BarChart2 className="w-4 h-4 text-sky-400" />
          <span className="text-[10px] font-bold">Stats</span>
        </button>

        <button
          onClick={onOpenInfo}
          className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all text-white/80 hover:text-white"
        >
          <span className="text-sm font-bold italic" style={{ color: theme.secondary }}>
            ℹ
          </span>
          <span className="text-[10px] font-bold">About</span>
        </button>
      </div>

      {/* Trust & Legal Footer for Google AdSense & Play Store Reviewers */}
      <div className="pt-2 text-center text-[10px] text-white/40 flex items-center justify-center gap-2">
        <a
          href="/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/80 transition-colors underline"
        >
          Privacy Policy
        </a>
        <span>•</span>
        <a
          href="/terms.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/80 transition-colors underline"
        >
          Terms
        </a>
        <span>•</span>
        <a
          href="mailto:vishv971719kumar@gmail.com"
          className="hover:text-white/80 transition-colors underline"
        >
          Support
        </a>
      </div>
    </div>
  );
};
