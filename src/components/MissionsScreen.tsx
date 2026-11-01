import React from 'react';
import { SaveData, Theme } from '../types/game';
import { ACHIEVEMENTS } from '../services/storage';
import { ArrowLeft, CheckCircle2, Lock, Coins, Trophy } from 'lucide-react';

interface MissionsScreenProps {
  theme: Theme;
  save: SaveData;
  onBack: () => void;
}

export const MissionsScreen: React.FC<MissionsScreenProps> = ({
  theme,
  save,
  onBack,
}) => {
  const completedCount = save.achievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      className="absolute inset-0 flex flex-col p-4 sm:p-5 overflow-y-auto no-scrollbar z-30 animate-fadeIn"
      style={{
        background: `radial-gradient(ellipse at 50% 10%, ${theme.glow}18 0%, ${theme.bgInner} 80%)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>BADGES & MISSIONS</span>
        </h2>

        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Coins className="w-3.5 h-3.5" />
          <span className="tabular-nums">{save.coins}</span>
        </div>
      </div>

      {/* Progress Card */}
      <div
        className="rounded-2xl border p-4 mb-4 backdrop-blur-md max-w-[340px] mx-auto w-full"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}18, rgba(255,255,255,0.02))`,
          borderColor: `${theme.primary}44`,
        }}
      >
        <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
          <span>Overall Mastery</span>
          <span style={{ color: theme.primary }}>
            {completedCount} / {totalCount} ({completionPct}%)
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%`, background: theme.primary }}
          />
        </div>
      </div>

      {/* Achievements List */}
      <div className="flex flex-col gap-2.5 max-w-[340px] mx-auto w-full pb-6">
        {ACHIEVEMENTS.map(a => {
          const isDone = save.achievements.includes(a.id);

          return (
            <div
              key={a.id}
              className="rounded-2xl border p-3 flex items-center justify-between transition-all"
              style={{
                background: isDone
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: isDone
                  ? 'rgba(16, 185, 129, 0.35)'
                  : 'rgba(255, 255, 255, 0.07)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: isDone ? '#10b981' : 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div>
                  <div className="text-xs font-extrabold text-white">{a.name}</div>
                  <div className="text-[11px] text-white/55 leading-tight">{a.desc}</div>
                </div>
              </div>

              <div
                className="text-[11px] font-black px-2 py-1 rounded-lg shrink-0"
                style={{
                  background: isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                  color: isDone ? '#34d399' : '#fbbf24',
                }}
              >
                +{a.reward}◎
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
