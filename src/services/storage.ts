import { Achievement, Mode, SaveData, Theme } from '../types/game';

export const SAVE_KEY = 'mindrush-iq-save-v3';

export const THEMES: Theme[] = [
  {
    id: 'neon',
    name: 'Cyber Neon',
    bg: '#06060c',
    bgInner: '#0a0a14',
    accent: '#e6fbff',
    glow: '#38bdf8',
    primary: '#10b981',
    secondary: '#f43f5e',
    unlockLevel: 1,
    cost: 0,
  },
  {
    id: 'sunset',
    name: 'Electric Sunset',
    bg: '#0d0612',
    bgInner: '#170b1f',
    accent: '#fff0e6',
    glow: '#f97316',
    primary: '#fb923c',
    secondary: '#ec4899',
    unlockLevel: 3,
    cost: 150,
  },
  {
    id: 'matrix',
    name: 'Matrix Emerald',
    bg: '#030d06',
    bgInner: '#06170c',
    accent: '#eaffe8',
    glow: '#34d399',
    primary: '#10b981',
    secondary: '#06b6d4',
    unlockLevel: 5,
    cost: 250,
  },
  {
    id: 'aurora',
    name: 'Cosmic Violet',
    bg: '#08051a',
    bgInner: '#0e082b',
    accent: '#f3eaff',
    glow: '#a855f7',
    primary: '#c084fc',
    secondary: '#38bdf8',
    unlockLevel: 8,
    cost: 400,
  },
  {
    id: 'solarpunk',
    name: 'Solar Gold',
    bg: '#0c0a02',
    bgInner: '#171405',
    accent: '#fffdf0',
    glow: '#eab308',
    primary: '#facc15',
    secondary: '#f97316',
    unlockLevel: 10,
    cost: 600,
  },
  {
    id: 'stealth',
    name: 'Monochrome Stealth',
    bg: '#050505',
    bgInner: '#0f0f11',
    accent: '#ffffff',
    glow: '#94a3b8',
    primary: '#f8fafc',
    secondary: '#64748b',
    unlockLevel: 12,
    cost: 800,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Jump',
    desc: 'Answer 1 question correctly in any mode',
    reward: 15,
    check: s => s.totalCorrect >= 1,
  },
  {
    id: 'score_10',
    name: 'Warming Up',
    desc: 'Score 10 or more in a single run',
    reward: 35,
    check: s => Math.max(s.highScores.math, s.highScores.vocab, s.highScores.pattern) >= 10,
  },
  {
    id: 'score_25',
    name: 'Brain Maestro',
    desc: 'Score 25 in a single run',
    reward: 80,
    check: s => Math.max(s.highScores.math, s.highScores.vocab, s.highScores.pattern) >= 25,
  },
  {
    id: 'score_50',
    name: 'Cognitive Legend',
    desc: 'Score 50 in a single run',
    reward: 200,
    check: s => Math.max(s.highScores.math, s.highScores.vocab, s.highScores.pattern) >= 50,
  },
  {
    id: 'combo_5',
    name: 'Sync Flow x5',
    desc: 'Reach a 5x combo streak without errors',
    reward: 30,
    check: s => s.bestCombo >= 5,
  },
  {
    id: 'combo_10',
    name: 'Hyperspeed x10',
    desc: 'Reach a 10x combo streak',
    reward: 100,
    check: s => s.bestCombo >= 10,
  },
  {
    id: 'level_5',
    name: 'Rising Thinker',
    desc: 'Reach Account Level 5',
    reward: 60,
    check: s => s.level >= 5,
  },
  {
    id: 'level_10',
    name: 'Grandmaster IQ',
    desc: 'Reach Account Level 10',
    reward: 180,
    check: s => s.level >= 10,
  },
  {
    id: 'streak_3',
    name: 'Habit Forming',
    desc: 'Play 3 consecutive days',
    reward: 50,
    check: s => s.streak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Unbreakable Focus',
    desc: 'Play 7 consecutive days',
    reward: 250,
    check: s => s.streak >= 7,
  },
  {
    id: 'scholar_100',
    name: 'Centurion Scholar',
    desc: 'Answer 100 questions correctly across all runs',
    reward: 120,
    check: s => s.totalCorrect >= 100,
  },
  {
    id: 'polymath',
    name: 'True Polymath',
    desc: 'Score 15+ in Math, Vocab, and Pattern modes',
    reward: 150,
    check: s => s.highScores.math >= 15 && s.highScores.vocab >= 15 && s.highScores.pattern >= 15,
  },
];

export const xpForLevel = (lvl: number) => 50 + (lvl - 1) * 45;

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function defaultSave(): SaveData {
  const today = todayStr();
  return {
    xp: 0,
    level: 1,
    coins: 50, // Starting bonus
    highScores: { math: 0, vocab: 0, pattern: 0 },
    bestCombo: 0,
    totalCorrect: 0,
    totalRuns: 0,
    themeId: 'neon',
    unlockedThemes: ['neon'],
    achievements: [],
    lastPlayedDate: today,
    streak: 1,
    dailyClaimedDate: '',
    dailyChallenge: {
      date: today,
      mode: 'math',
      goal: 10,
      progress: 0,
      claimed: false,
    },
    sfxOn: true,
    musicOn: true,
    musicVolume: 0.45,
    tutorialSeen: false,
  };
}

export function loadSave(): SaveData {
  if (typeof window === 'undefined') return defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      const fallback = defaultSave();
      persistSave(fallback);
      return fallback;
    }
    const parsed = JSON.parse(raw);
    const defaults = defaultSave();
    const data: SaveData = {
      ...defaults,
      ...parsed,
      highScores: {
        ...defaults.highScores,
        ...(parsed.highScores || {}),
      },
      dailyChallenge: {
        ...defaults.dailyChallenge,
        ...(parsed.dailyChallenge || {}),
      },
    };

    // Update streak & daily challenge
    const today = todayStr();
    if (data.lastPlayedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (data.lastPlayedDate === yesterday) {
        data.streak += 1;
      } else if (data.lastPlayedDate) {
        data.streak = 1;
      }
      data.lastPlayedDate = today;
    }

    if (data.dailyChallenge.date !== today) {
      const modes: Mode[] = ['math', 'vocab', 'pattern'];
      const chosenMode = modes[Math.floor(Math.random() * modes.length)];
      data.dailyChallenge = {
        date: today,
        mode: chosenMode,
        goal: 8 + Math.min(data.level, 8) * 2,
        progress: 0,
        claimed: false,
      };
    }

    persistSave(data);
    return data;
  } catch (err) {
    console.error('Failed to load save data, resetting to defaults:', err);
    const defaults = defaultSave();
    persistSave(defaults);
    return defaults;
  }
}

export function persistSave(save: SaveData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (err) {
    console.error('Failed to persist save:', err);
  }
}
