import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Mode, SaveData, Screen, FloatText } from './types/game';
import {
  loadSave,
  persistSave,
  THEMES,
  ACHIEVEMENTS,
  xpForLevel,
  todayStr,
} from './services/storage';
import { soundService } from './services/sound';
import { adService } from './services/ads';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { ReviveDialog } from './components/ReviveDialog';
import { MenuScreen } from './components/MenuScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ThemesScreen } from './components/ThemesScreen';
import { MissionsScreen } from './components/MissionsScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { InfoModal } from './components/InfoModal';
import { LuckySpinModal } from './components/LuckySpinModal';

export default function App() {
  const [save, setSave] = useState<SaveData>(loadSave);
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<Mode>('math');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Revive / Second Chance state
  const [canReviveThisRun, setCanReviveThisRun] = useState(true);
  const [reviveCount, setReviveCount] = useState(0);
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [crashData, setCrashData] = useState<{ score: number; combo: number; reason: string } | null>(null);

  const [gameOverStats, setGameOverStats] = useState({
    score: 0,
    combo: 0,
    mode: 'math' as Mode,
    reason: '',
    xpGain: 0,
    coinGain: 0,
    isNewHigh: false,
  });

  const [toast, setToast] = useState<string | null>(null);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLuckySpin, setShowLuckySpin] = useState(false);
  const floatIdRef = useRef(0);

  // Active Theme
  const theme = useMemo(() => {
    return THEMES.find(t => t.id === save.themeId) || THEMES[0];
  }, [save.themeId]);

  // Sync sound settings with service
  useEffect(() => {
    soundService.setSfx(save.sfxOn);
    soundService.setMusic(save.musicOn);
    soundService.setMusicVolume(save.musicVolume);

    // Modern browsers require a user gesture (pointerdown/touchstart) to unlock audio
    const unlockAudio = () => {
      soundService.unlockAudioOnUserGesture();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [save.sfxOn, save.musicOn, save.musicVolume]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  const addFloatText = useCallback((text: string, color: string) => {
    const id = ++floatIdRef.current;
    setFloatTexts(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatTexts(prev => prev.filter(f => f.id !== id));
    }, 950);
  }, []);

  // Check achievements after game actions
  const evaluateAchievements = useCallback((currentSave: SaveData): SaveData => {
    let updated = { ...currentSave };
    let coinsEarned = 0;
    const unlockedNames: string[] = [];

    for (const a of ACHIEVEMENTS) {
      if (!updated.achievements.includes(a.id) && a.check(updated)) {
        updated.achievements = [...updated.achievements, a.id];
        updated.coins += a.reward;
        coinsEarned += a.reward;
        unlockedNames.push(a.name);
      }
    }

    if (unlockedNames.length > 0) {
      setTimeout(() => {
        showToast(`🏆 Badge: ${unlockedNames[0]} (+${coinsEarned}◎)`);
        soundService.victory();
      }, 450);
    }

    return updated;
  }, [showToast]);

  // Start new run
  const handleStartGame = (selectedMode: Mode) => {
    soundService.unlockAudioOnUserGesture();
    setMode(selectedMode);
    setScore(0);
    setCombo(0);
    setIsPaused(false);
    setCanReviveThisRun(true);
    setReviveCount(0);
    setShowReviveModal(false);
    setCrashData(null);
    setScreen('play');
  };

  // Correct answer callback
  const handleCorrect = useCallback((newScore: number, newCombo: number) => {
    setScore(newScore);
    setCombo(newCombo);
  }, []);

  // Final game over calculation
  const finalizeGameOver = useCallback((finalScore: number, finalCombo: number, reason: string) => {
    setShowReviveModal(false);
    setCrashData(null);

    setSave(prev => {
      let updated = { ...prev };
      updated.totalRuns += 1;
      updated.totalCorrect += finalScore;
      updated.bestCombo = Math.max(updated.bestCombo, finalCombo);

      const prevBest = (updated.highScores as Record<Mode, number>)[mode] || 0;
      const isNewHigh = finalScore > prevBest;
      if (isNewHigh) {
        (updated.highScores as Record<Mode, number>)[mode] = finalScore;
      }

      // XP & Coin rewards
      const xpGain = finalScore * 6 + Math.floor(finalCombo * 1.5) + 5;
      const coinGain = finalScore * 2 + Math.floor(finalCombo / 2);
      updated.xp += xpGain;
      updated.coins += coinGain;

      // Level progression check
      let leveledUp = false;
      while (updated.xp >= xpForLevel(updated.level)) {
        updated.xp -= xpForLevel(updated.level);
        updated.level += 1;
        leveledUp = true;
      }

      // Daily challenge progress
      if (updated.dailyChallenge.mode === mode && !updated.dailyChallenge.claimed) {
        updated.dailyChallenge.progress = Math.min(
          updated.dailyChallenge.goal,
          updated.dailyChallenge.progress + finalScore
        );
      }

      // Check level theme unlocks
      for (const t of THEMES) {
        if (updated.level >= t.unlockLevel && !updated.unlockedThemes.includes(t.id)) {
          updated.unlockedThemes = [...updated.unlockedThemes, t.id];
          setTimeout(() => showToast(`✨ Unlocked Theme: ${t.name}!`), 600);
        }
      }

      if (leveledUp) {
        setTimeout(() => {
          showToast(`🌟 Level Up! Reached Level ${updated.level}!`);
          soundService.victory();
        }, 200);
      }

      updated = evaluateAchievements(updated);
      persistSave(updated);

      setGameOverStats({
        score: finalScore,
        combo: finalCombo,
        mode,
        reason,
        xpGain,
        coinGain,
        isNewHigh,
      });

      return updated;
    });

    // Check frequency capped interstitial ad (e.g. every 3 runs)
    if (adService.shouldShowInterstitial()) {
      adService.showInterstitial(() => {
        setScreen('over');
      });
    } else {
      setTimeout(() => {
        setScreen('over');
      }, 700);
    }
  }, [mode, evaluateAchievements, showToast]);

  // Crash callback: offer Revive if eligible, otherwise finalize game over
  const handleCrash = useCallback((currentScore: number, currentCombo: number, reason: string) => {
    // Only offer Revive if player has scored >= 2 and hasn't used revive yet in this run
    if (canReviveThisRun && currentScore >= 2) {
      setCrashData({ score: currentScore, combo: currentCombo, reason });
      setShowReviveModal(true);
    } else {
      finalizeGameOver(currentScore, currentCombo, reason);
    }
  }, [canReviveThisRun, finalizeGameOver]);

  // Handle successful revive
  const handleReviveSuccess = () => {
    setShowReviveModal(false);
    setCanReviveThisRun(false); // Only 1 revive per run
    setReviveCount(c => c + 1); // Triggers safe reposition & shield in GameCanvas
    showToast('⚡ Revived with Shield Protection!');
    soundService.victory();
  };

  // Daily Streak Claim
  const handleClaimStreak = () => {
    if (save.dailyClaimedDate === todayStr()) return;
    const reward = 25 + Math.min(save.streak, 7) * 10;
    const updated = {
      ...save,
      coins: save.coins + reward,
      dailyClaimedDate: todayStr(),
    };
    persistSave(updated);
    setSave(updated);
    showToast(`⚡ Daily Streak Claimed: +${reward} Coins!`);
    soundService.coin();
  };

  // Daily Challenge Claim
  const handleClaimChallenge = () => {
    if (save.dailyChallenge.claimed || save.dailyChallenge.progress < save.dailyChallenge.goal) return;
    const reward = 50 + save.level * 5;
    let updated = {
      ...save,
      coins: save.coins + reward,
      dailyChallenge: {
        ...save.dailyChallenge,
        claimed: true,
      },
    };
    updated = evaluateAchievements(updated);
    persistSave(updated);
    setSave(updated);
    showToast(`🎯 Challenge Completed: +${reward} Coins!`);
    soundService.victory();
  };

  // Rewarded Video: Claim Free Coin Bounty in Menu
  const handleClaimFreeChest = () => {
    adService.showRewardedVideo(
      'free_coins',
      () => {
        setSave(prev => {
          const updated = { ...prev, coins: prev.coins + 150 };
          persistSave(updated);
          return updated;
        });
        soundService.coin();
        showToast('🎁 Claimed +150 Free Coins!');
      },
      msg => {
        showToast(msg || 'Could not load reward ad');
      }
    );
  };

  // Rewarded Video: Double Coins in GameOver
  const handleDoubleCoinsSuccess = (bonusCoins: number) => {
    setSave(prev => {
      const updated = { ...prev, coins: prev.coins + bonusCoins };
      persistSave(updated);
      return updated;
    });
    showToast(`💰 Rewarded +${bonusCoins} Extra Coins!`);
  };

  // Theme Shop actions
  const handleSelectTheme = (id: string) => {
    if (!save.unlockedThemes.includes(id)) return;
    const updated = { ...save, themeId: id };
    persistSave(updated);
    setSave(updated);
    soundService.playTone(880, 0.06, 'triangle', 0.18);
    showToast(`Equipped ${THEMES.find(t => t.id === id)?.name || id}`);
  };

  const handleBuyTheme = (id: string) => {
    if (save.unlockedThemes.includes(id)) return;
    const t = THEMES.find(x => x.id === id);
    if (!t) return;

    if (save.coins < t.cost) {
      showToast('Not enough coins!');
      soundService.triggerHaptic(20);
      return;
    }

    const updated = {
      ...save,
      coins: save.coins - t.cost,
      unlockedThemes: [...save.unlockedThemes, id],
      themeId: id,
    };
    persistSave(updated);
    setSave(updated);
    showToast(`🎉 Unlocked ${t.name}!`);
    soundService.coin();
  };

  // Sound toggles
  const handleToggleSfx = () => {
    const updated = { ...save, sfxOn: !save.sfxOn };
    persistSave(updated);
    setSave(updated);
    if (updated.sfxOn) {
      soundService.playTone(880, 0.06, 'triangle', 0.18);
    }
  };

  const handleToggleMusic = () => {
    const updated = { ...save, musicOn: !save.musicOn };
    persistSave(updated);
    setSave(updated);
  };

  const handleChangeMusicVolume = (v: number) => {
    const updated = { ...save, musicVolume: v };
    persistSave(updated);
    setSave(updated);
  };

  // Keyboard shortcut for Pause (Escape)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && screen === 'play') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 10%, ${theme.bgInner}, ${theme.bg})`,
      }}
    >
      {/* Mobile Device Frame Container (9:16 aspect ratio like arcade screen) */}
      <div
        className="relative w-full max-w-[430px] h-[92vh] max-h-[860px] rounded-3xl overflow-hidden border border-white/10 select-none shadow-2xl flex flex-col justify-between"
        style={{
          background: theme.bgInner,
          boxShadow: `0 0 70px ${theme.glow}1f, 0 0 0 1px ${theme.glow}15 inset`,
        }}
      >
        {/* GAME CANVAS */}
        {screen === 'play' && (
          <GameCanvas
            theme={theme}
            mode={mode}
            level={save.level}
            isPaused={isPaused}
            reviveCount={reviveCount}
            onCorrect={handleCorrect}
            onCrash={handleCrash}
            onAddFloatText={addFloatText}
          />
        )}

        {/* IN-GAME HUD */}
        {screen === 'play' && (
          <HUD
            score={score}
            combo={combo}
            level={save.level}
            streak={save.streak}
            theme={theme}
            onPause={() => setIsPaused(true)}
          />
        )}

        {/* FLOATING TEXT NOTIFICATIONS IN PLAY */}
        {screen === 'play' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
            {floatTexts.map(f => (
              <div
                key={f.id}
                className="absolute text-2xl font-black animate-floatUp"
                style={{
                  color: f.color,
                  textShadow: `0 0 16px ${f.color}`,
                }}
              >
                {f.text}
              </div>
            ))}
          </div>
        )}

        {/* SECOND CHANCE / REVIVE DIALOG (REWARDED AD) */}
        {screen === 'play' && showReviveModal && crashData && (
          <ReviveDialog
            score={crashData.score}
            combo={crashData.combo}
            reason={crashData.reason}
            theme={theme}
            onReviveSuccess={handleReviveSuccess}
            onSkip={() => finalizeGameOver(crashData.score, crashData.combo, crashData.reason)}
          />
        )}

        {/* PAUSE MODAL */}
        {screen === 'play' && isPaused && !showReviveModal && (
          <PauseModal
            theme={theme}
            sfxOn={save.sfxOn}
            musicOn={save.musicOn}
            onResume={() => setIsPaused(false)}
            onRestart={() => {
              setIsPaused(false);
              handleStartGame(mode);
            }}
            onQuit={() => {
              setIsPaused(false);
              setScreen('menu');
            }}
            onToggleSfx={handleToggleSfx}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* MAIN MENU */}
        {screen === 'menu' && (
          <MenuScreen
            theme={theme}
            save={save}
            onStart={handleStartGame}
            onClaimDailyStreak={handleClaimStreak}
            onClaimChallenge={handleClaimChallenge}
            onClaimFreeChest={handleClaimFreeChest}
            onOpenLuckySpin={() => setShowLuckySpin(true)}
            onOpenThemes={() => setScreen('themes')}
            onOpenMissions={() => setScreen('missions')}
            onOpenProgress={() => setScreen('progress')}
            onToggleSfx={handleToggleSfx}
            onToggleMusic={handleToggleMusic}
            onChangeMusicVolume={handleChangeMusicVolume}
            onOpenInfo={() => setShowInfoModal(true)}
          />
        )}

        {/* GAME OVER */}
        {screen === 'over' && (
          <GameOverScreen
            theme={theme}
            save={save}
            score={gameOverStats.score}
            combo={gameOverStats.combo}
            mode={gameOverStats.mode}
            reason={gameOverStats.reason}
            xpGain={gameOverStats.xpGain}
            coinGain={gameOverStats.coinGain}
            isNewHigh={gameOverStats.isNewHigh}
            onDoubleCoinsSuccess={handleDoubleCoinsSuccess}
            onRetry={() => handleStartGame(mode)}
            onMenu={() => setScreen('menu')}
          />
        )}

        {/* THEMES SCREEN */}
        {screen === 'themes' && (
          <ThemesScreen
            theme={theme}
            save={save}
            onSelect={handleSelectTheme}
            onBuy={handleBuyTheme}
            onBack={() => setScreen('menu')}
          />
        )}

        {/* MISSIONS & BADGES */}
        {screen === 'missions' && (
          <MissionsScreen
            theme={theme}
            save={save}
            onBack={() => setScreen('menu')}
          />
        )}

        {/* PROGRESS & STATS */}
        {screen === 'progress' && (
          <ProgressScreen
            theme={theme}
            save={save}
            onBack={() => setScreen('menu')}
          />
        )}

        {/* INFO & LEGAL MODAL */}
        {showInfoModal && (
          <InfoModal
            theme={theme}
            onClose={() => setShowInfoModal(false)}
          />
        )}

        {/* LUCKY SPIN WHEEL MODAL */}
        {showLuckySpin && (
          <LuckySpinModal
            theme={theme}
            onAwardCoins={(won) => {
              setSave(prev => {
                const updated = { ...prev, coins: prev.coins + won };
                persistSave(updated);
                return updated;
              });
              addFloatText(`+${won} COINS!`, '#fbbf24');
            }}
            onClose={() => setShowLuckySpin(false)}
            showToast={showToast}
          />
        )}

        {/* FLOATING TOAST NOTIFICATION */}
        {toast && (
          <div
            className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl border text-xs font-black shadow-2xl backdrop-blur-xl animate-scaleUp text-center whitespace-nowrap"
            style={{
              background: 'rgba(10, 10, 18, 0.92)',
              borderColor: `${theme.primary}88`,
              color: '#ffffff',
              boxShadow: `0 8px 30px ${theme.primary}44`,
            }}
          >
            {toast}
          </div>
        )}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-70px); opacity: 0; }
        }
        .animate-floatUp {
          animation: floatUp 950ms ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 200ms ease-out forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
