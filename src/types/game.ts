export type Mode = 'math' | 'vocab' | 'pattern';

export type Screen = 'menu' | 'play' | 'over' | 'progress' | 'themes' | 'missions';

export interface Question {
  q: string;
  correct: string;
  wrong: string;
  hint?: string;
}

export interface Theme {
  id: string;
  name: string;
  bg: string;
  bgInner: string;
  accent: string; // Bird color
  glow: string;   // Neon halo / gates
  primary: string; // Accent CTAs
  secondary: string; // Combo highlight
  unlockLevel: number;
  cost: number;
}

export interface Gate {
  x: number;
  gapY: number;
  topAnswer: string;
  bottomAnswer: string;
  correctSide: 'top' | 'bottom';
  question: string;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
}

export interface BgOrb {
  x: number;
  y: number;
  r: number;
  vy: number;
  phase: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  a: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  reward: number;
  check: (s: SaveData) => boolean;
}

export interface DailyChallenge {
  date: string;
  mode: Mode;
  goal: number;
  progress: number;
  claimed: boolean;
}

export interface SaveData {
  xp: number;
  level: number;
  coins: number;
  highScores: {
    math: number;
    vocab: number;
    pattern: number;
  };
  bestCombo: number;
  totalCorrect: number;
  totalRuns: number;
  themeId: string;
  unlockedThemes: string[];
  achievements: string[];
  lastPlayedDate: string;
  streak: number;
  dailyClaimedDate: string;
  dailyChallenge: DailyChallenge;
  sfxOn: boolean;
  musicOn: boolean;
  musicVolume: number;
  tutorialSeen: boolean;
}

export interface FloatText {
  id: number;
  text: string;
  color: string;
}
