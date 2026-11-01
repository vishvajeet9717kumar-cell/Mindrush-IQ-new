import { Mode, Question } from '../types/game';

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ----------------------------- Math Generator -----------------------------
export function genMath(level: number): Question {
  // Level scaling: introduces operations and scales numbers
  let ops: ('+' | '-' | '×' | '÷')[];
  if (level < 2) ops = ['+', '-'];
  else if (level < 4) ops = ['+', '-', '×'];
  else ops = ['+', '-', '×', '÷'];

  const op = pick(ops);
  let a = 0;
  let b = 0;
  let correct = 0;
  let qText = '';

  if (op === '+') {
    const maxVal = Math.min(8 + level * 3, 40);
    a = randInt(2, maxVal);
    b = randInt(2, maxVal);
    correct = a + b;
    qText = `${a} + ${b}`;
  } else if (op === '-') {
    const maxVal = Math.min(10 + level * 4, 50);
    a = randInt(5, maxVal);
    b = randInt(2, a);
    correct = a - b;
    qText = `${a} - ${b}`;
  } else if (op === '×') {
    const maxA = Math.min(3 + level, 12);
    const maxB = Math.min(3 + level, 12);
    a = randInt(2, maxA);
    b = randInt(2, maxB);
    correct = a * b;
    qText = `${a} × ${b}`;
  } else {
    // Division: pick result and divisor to ensure integer division
    const maxDivisor = Math.min(2 + Math.floor(level / 2), 12);
    const divisor = randInt(2, maxDivisor);
    const quotient = randInt(2, Math.min(4 + level, 12));
    const dividend = divisor * quotient;
    correct = quotient;
    qText = `${dividend} ÷ ${divisor}`;
  }

  // Create an authentic, deceptive distractor
  const drift = Math.max(2, Math.floor(correct * 0.15) + 2);
  const offset = (Math.random() < 0.5 ? -1 : 1) * randInt(1, drift);
  let wrong = correct + offset;

  if (wrong === correct || wrong < 0) {
    wrong = correct + drift + 1;
  }

  return {
    q: qText,
    correct: String(correct),
    wrong: String(wrong),
  };
}

// ----------------------------- Vocab Question Bank -----------------------------
const VOCAB_BANK: Question[][] = [
  // Tier 0: Beginner synonyms & meanings
  [
    { q: 'Happy means…', correct: 'Joyful', wrong: 'Gloomy' },
    { q: 'Big means…', correct: 'Large', wrong: 'Tiny' },
    { q: 'Fast means…', correct: 'Swift', wrong: 'Sluggish' },
    { q: 'Cold means…', correct: 'Chilly', wrong: 'Scorching' },
    { q: 'Begin means…', correct: 'Start', wrong: 'Cease' },
    { q: 'Brave means…', correct: 'Courageous', wrong: 'Fearful' },
    { q: 'Smart means…', correct: 'Clever', wrong: 'Foolish' },
    { q: 'Quiet means…', correct: 'Silent', wrong: 'Rowdy' },
    { q: 'Rich means…', correct: 'Wealthy', wrong: 'Destitute' },
    { q: 'Neat means…', correct: 'Tidy', wrong: 'Messy' },
    { q: 'Calm means…', correct: 'Peaceful', wrong: 'Frantic' },
    { q: 'Tired means…', correct: 'Exhausted', wrong: 'Energetic' },
  ],
  // Tier 1: Intermediate
  [
    { q: 'Vivid means…', correct: 'Bright', wrong: 'Faded' },
    { q: 'Eager means…', correct: 'Keen', wrong: 'Reluctant' },
    { q: 'Stern means…', correct: 'Strict', wrong: 'Lenient' },
    { q: 'Frail means…', correct: 'Fragile', wrong: 'Robust' },
    { q: 'Ancient means…', correct: 'Historic', wrong: 'Modern' },
    { q: 'Sparse means…', correct: 'Scattered', wrong: 'Dense' },
    { q: 'Nimble means…', correct: 'Agile', wrong: 'Clumsy' },
    { q: 'Dusk means…', correct: 'Twilight', wrong: 'Dawn' },
    { q: 'Abundant means…', correct: 'Plentiful', wrong: 'Scarce' },
    { q: 'Candid means…', correct: 'Frank', wrong: 'Deceitful' },
    { q: 'Humble means…', correct: 'Modest', wrong: 'Arrogant' },
    { q: 'Vast means…', correct: 'Immense', wrong: 'Minute' },
  ],
  // Tier 2: Advanced
  [
    { q: 'Lucid means…', correct: 'Clear', wrong: 'Obscure' },
    { q: 'Austere means…', correct: 'Severe', wrong: 'Lavish' },
    { q: 'Pragmatic means…', correct: 'Practical', wrong: 'Idealistic' },
    { q: 'Tenacious means…', correct: 'Persistent', wrong: 'Fickle' },
    { q: 'Vigilant means…', correct: 'Watchful', wrong: 'Careless' },
    { q: 'Resilient means…', correct: 'Tough', wrong: 'Delicate' },
    { q: 'Obsolete means…', correct: 'Outdated', wrong: 'Current' },
    { q: 'Eloquent means…', correct: 'Articulate', wrong: 'Incoherent' },
    { q: 'Mundane means…', correct: 'Ordinary', wrong: 'Exotic' },
    { q: 'Fervent means…', correct: 'Passionate', wrong: 'Apathetic' },
    { q: 'Dubious means…', correct: 'Doubtful', wrong: 'Certain' },
    { q: 'Affable means…', correct: 'Friendly', wrong: 'Hostile' },
  ],
  // Tier 3: Master level
  [
    { q: 'Ephemeral means…', correct: 'Fleeting', wrong: 'Permanent' },
    { q: 'Surreptitious means…', correct: 'Secretive', wrong: 'Blatant' },
    { q: 'Ineffable means…', correct: 'Indescribable', wrong: 'Expressible' },
    { q: 'Lugubrious means…', correct: 'Mournful', wrong: 'Cheerful' },
    { q: 'Cacophony means…', correct: 'Harsh noise', wrong: 'Harmony' },
    { q: 'Sycophant means…', correct: 'Flatterer', wrong: 'Critic' },
    { q: 'Pernicious means…', correct: 'Harmful', wrong: 'Beneficial' },
    { q: 'Esoteric means…', correct: 'Cryptic', wrong: 'Commonplace' },
    { q: 'Equanimity means…', correct: 'Composure', wrong: 'Agitation' },
    { q: 'Ubiquitous means…', correct: 'Omnipresent', wrong: 'Rare' },
    { q: 'Alacrity means…', correct: 'Eagerness', wrong: 'Reluctance' },
    { q: 'Fastidious means…', correct: 'Meticulous', wrong: 'Careless' },
  ],
];

export function genVocab(level: number): Question {
  const maxTier = Math.min(VOCAB_BANK.length - 1, Math.floor(level / 3));
  const tier = randInt(0, maxTier);
  return pick(VOCAB_BANK[tier]);
}

// ----------------------------- Pattern Generator -----------------------------
export function genPattern(level: number): Question {
  // Variants:
  // 0: Arithmetic progression (+step)
  // 1: Multiplicative sequence (×ratio)
  // 2: Fibonacci-like series
  // 3: Squares sequence
  // 4: Decreasing sequence (-step)
  const maxVariant = level < 3 ? 0 : level < 5 ? 1 : level < 8 ? 2 : 4;
  const variant = randInt(0, maxVariant);

  if (variant === 0) {
    // Arithmetic progression
    const start = randInt(1, 10);
    const step = randInt(2, 6);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const correct = start + 4 * step;
    let wrong = correct + pick([-step, step + 1, -1, 2]);
    if (wrong === correct) wrong = correct + 3;
    return {
      q: `${seq.join(', ')}, ?`,
      correct: String(correct),
      wrong: String(wrong),
    };
  }

  if (variant === 1) {
    // Geometric / Multiplicative
    const start = randInt(2, 4);
    const ratio = randInt(2, 3);
    const seq = [start, start * ratio, start * ratio * ratio];
    const correct = start * ratio * ratio * ratio;
    const diff = pick([-start, start, ratio * 2, -ratio]);
    let wrong = correct + diff;
    if (wrong === correct || wrong <= 0) wrong = correct + ratio + 2;
    return {
      q: `${seq.join(', ')}, ?`,
      correct: String(correct),
      wrong: String(wrong),
    };
  }

  if (variant === 2) {
    // Fibonacci-like (a, b, a+b, b+(a+b))
    const a = randInt(1, 4);
    const b = randInt(2, 5);
    const c = a + b;
    const d = b + c;
    const correct = c + d;
    let wrong = correct + pick([-2, -1, 1, 2, 3]);
    if (wrong === correct) wrong = correct + 4;
    return {
      q: `${a}, ${b}, ${c}, ${d}, ?`,
      correct: String(correct),
      wrong: String(wrong),
    };
  }

  if (variant === 3) {
    // Square numbers
    const start = randInt(1, 3);
    const seq = [start ** 2, (start + 1) ** 2, (start + 2) ** 2];
    const correct = (start + 3) ** 2;
    let wrong = correct + pick([-3, 3, -5, 5]);
    if (wrong === correct) wrong = correct + 4;
    return {
      q: `${seq.join(', ')}, ?`,
      correct: String(correct),
      wrong: String(wrong),
    };
  }

  // Decreasing arithmetic sequence
  const step = randInt(2, 5);
  const start = randInt(25, 45);
  const seq = [start, start - step, start - 2 * step, start - 3 * step];
  const correct = start - 4 * step;
  let wrong = correct + pick([-step, step - 1, 2, -2]);
  if (wrong === correct || wrong < 0) wrong = correct + 3;
  return {
    q: `${seq.join(', ')}, ?`,
    correct: String(correct),
    wrong: String(wrong),
  };
}

export function genQuestion(mode: Mode, level: number): Question {
  if (mode === 'math') return genMath(level);
  if (mode === 'vocab') return genVocab(level);
  return genPattern(level);
}
