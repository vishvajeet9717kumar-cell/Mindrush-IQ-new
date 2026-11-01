import React from 'react';
import { SaveData, Theme } from '../types/game';
import { THEMES } from '../services/storage';
import { ArrowLeft, Check, Lock, Coins } from 'lucide-react';

interface ThemesScreenProps {
  theme: Theme;
  save: SaveData;
  onSelect: (id: string) => void;
  onBuy: (id: string) => void;
  onBack: () => void;
}

export const ThemesScreen: React.FC<ThemesScreenProps> = ({
  theme,
  save,
  onSelect,
  onBuy,
  onBack,
}) => {
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

        <h2 className="text-lg font-black tracking-tight text-white">THEME GALLERY</h2>

        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Coins className="w-3.5 h-3.5" />
          <span className="tabular-nums">{save.coins}</span>
        </div>
      </div>

      {/* Themes List */}
      <div className="flex flex-col gap-3 max-w-[340px] mx-auto w-full my-auto pb-4">
        {THEMES.map(t => {
          const isUnlocked = save.unlockedThemes.includes(t.id);
          const isEquipped = save.themeId === t.id;
          const levelReached = save.level >= t.unlockLevel;
          const canAfford = save.coins >= t.cost;

          return (
            <div
              key={t.id}
              className="rounded-2xl border p-3.5 flex items-center justify-between transition-all"
              style={{
                background: isEquipped
                  ? `linear-gradient(135deg, ${t.glow}20, rgba(255,255,255,0.03))`
                  : 'rgba(255,255,255,0.03)',
                borderColor: isEquipped ? `${t.glow}77` : 'rgba(255,255,255,0.08)',
                boxShadow: isEquipped ? `0 0 25px ${t.glow}26` : 'none',
              }}
            >
              {/* Color Swatch & Title */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl border flex items-center justify-center relative overflow-hidden shadow-md"
                  style={{
                    background: t.bgInner,
                    borderColor: `${t.glow}55`,
                    boxShadow: `0 0 12px ${t.glow}33`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-lg"
                    style={{
                      background: t.accent,
                      boxShadow: `0 0 12px ${t.glow}`,
                    }}
                  />
                </div>

                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-2">
                    {t.name}
                    {isEquipped && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${t.primary}33`, color: t.primary }}
                      >
                        EQUIPPED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/50">
                    {t.unlockLevel > 1 ? `Unlocks at Level ${t.unlockLevel}` : 'Default Theme'}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isUnlocked ? (
                  isEquipped ? (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                      style={{ color: t.primary }}
                    >
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelect(t.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-black border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
                    >
                      EQUIP
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onBuy(t.id)}
                    disabled={!canAfford && !levelReached}
                    className="px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: canAfford ? t.primary : 'rgba(255,255,255,0.06)',
                      borderColor: canAfford ? `${t.primary}88` : 'rgba(255,255,255,0.1)',
                      color: canAfford ? '#06060c' : '#fff',
                    }}
                  >
                    {!levelReached && !canAfford && <Lock className="w-3 h-3 text-white/50" />}
                    <span>{t.cost}◎</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
