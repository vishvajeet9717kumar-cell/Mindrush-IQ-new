import React from 'react';
import { SaveData, Theme } from '../types/game';
import { ArrowLeft, Brain, Zap, Flame, Target, RotateCcw, Award } from 'lucide-react';

interface ProgressScreenProps {
  theme: Theme;
  save: SaveData;
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  theme,
  save,
  onBack,
}) => {
  // Estimated Cognitive Index (IQ metric) based on high scores, combos, and accuracy
  const totalScore = save.highScores.math + save.highScores.vocab + save.highScores.pattern;
  const brainIndex = Math.min(165, Math.floor(95 + totalScore * 1.2 + save.bestCombo * 1.5 + save.level * 2));

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
          <Brain className="w-4 h-4" style={{ color: theme.primary }} />
          <span>COGNITIVE STATS</span>
        </h2>

        <div className="w-9" />
      </div>

      <div className="flex flex-col gap-3.5 max-w-[340px] mx-auto w-full my-auto pb-6">
        {/* Brain IQ Index Card */}
        <div
          className="rounded-3xl border p-5 text-center backdrop-blur-xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}22, ${theme.glow}12)`,
            borderColor: `${theme.primary}55`,
            boxShadow: `0 0 40px ${theme.primary}26`,
          }}
        >
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
            Brain Performance Index
          </div>
          <div
            className="text-5xl font-black tabular-nums my-1"
            style={{
              color: theme.primary,
              textShadow: `0 0 20px ${theme.primary}88`,
            }}
          >
            {brainIndex}
          </div>
          <p className="text-xs text-white/70 font-semibold">
            {brainIndex >= 140
              ? '⚡ Genius Tier — Phenomenal reaction & recall'
              : brainIndex >= 120
              ? '🔥 High Agility — Sharp working memory'
              : '🌱 Focused Brain — Continual cognitive training'}
          </p>
        </div>

        {/* High Scores By Mode */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/50 mb-1">
            Personal Bests By Mode
          </h3>

          <div className="flex items-center justify-between text-xs font-bold text-white py-1 border-b border-white/5">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Speed Math
            </span>
            <span className="text-sm font-black tabular-nums">{save.highScores.math} pts</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-white py-1 border-b border-white/5">
            <span className="flex items-center gap-2 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Vocabulary
            </span>
            <span className="text-sm font-black tabular-nums">{save.highScores.vocab} pts</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-white py-1">
            <span className="flex items-center gap-2 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Pattern IQ
            </span>
            <span className="text-sm font-black tabular-nums">{save.highScores.pattern} pts</span>
          </div>
        </div>

        {/* Lifetime Record Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase">Best Combo</div>
              <div className="text-base font-black text-white">{save.bestCombo}x</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase">Total Solved</div>
              <div className="text-base font-black text-white">{save.totalCorrect}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase">Total Runs</div>
              <div className="text-base font-black text-white">{save.totalRuns}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase">Badges</div>
              <div className="text-base font-black text-white">{save.achievements.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
