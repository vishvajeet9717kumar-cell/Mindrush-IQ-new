import React, { useEffect, useRef, useCallback } from 'react';
import { BgOrb, Gate, Mode, Particle, Ring, Theme, TrailPoint } from '../types/game';
import { genQuestion } from '../services/questions';
import { soundService } from '../services/sound';

interface GameCanvasProps {
  theme: Theme;
  mode: Mode;
  level: number;
  isPaused: boolean;
  reviveCount: number; // Incrementing this triggers an in-place safe revive
  onCorrect: (score: number, combo: number, bonus: number) => void;
  onCrash: (currentScore: number, currentCombo: number, reason: string) => void;
  onAddFloatText: (text: string, color: string) => void;
}

const GATE_WIDTH = 92;
const ANSWER_HEIGHT = 114;
const GAP = 76;
const BIRD_R = 13;
const BASE_GRAVITY = 0.28;
const FLAP_VY = -5.4;
const MAX_VY = 8.5;
const BASE_SPEED = 2.4;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  theme,
  mode,
  level,
  isPaused,
  reviveCount,
  onCorrect,
  onCrash,
  onAddFloatText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game physics & state
  const stateRef = useRef({
    birdY: 0,
    birdVy: 0,
    birdRot: 0,
    gates: [] as Gate[],
    particles: [] as Particle[],
    rings: [] as Ring[],
    trail: [] as TrailPoint[],
    bgOrbs: [] as BgOrb[],
    speed: BASE_SPEED,
    width: 360,
    height: 640,
    running: true,
    score: 0,
    combo: 0,
    runCorrect: 0,
    flashAlpha: 0,
    flashColor: '#10b981',
    shake: 0,
    t: 0,
    lastTime: 0,
    invulnerableTimer: 0,
  });

  const spawnGate = useCallback((x: number) => {
    const s = stateRef.current;
    const q = genQuestion(mode, level);
    const correctTop = Math.random() < 0.5;
    const minY = 135;
    const maxY = Math.max(minY + 20, s.height - 135);
    const gapY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    s.gates.push({
      x,
      gapY,
      topAnswer: correctTop ? q.correct : q.wrong,
      bottomAnswer: correctTop ? q.wrong : q.correct,
      correctSide: correctTop ? 'top' : 'bottom',
      question: q.q,
      passed: false,
    });
  }, [mode, level]);

  const burstParticles = useCallback((x: number, y: number, color: string, count = 18) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 1.2 + Math.random() * 3.5;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 26 + Math.random() * 14,
        color,
        size: 2 + Math.random() * 3.5,
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.birdY = s.height / 2;
    s.birdVy = 0;
    s.birdRot = 0;
    s.gates = [];
    s.particles = [];
    s.rings = [];
    s.trail = [];
    s.speed = BASE_SPEED + Math.min(level - 1, 6) * 0.12;
    s.score = 0;
    s.combo = 0;
    s.runCorrect = 0;
    s.flashAlpha = 0;
    s.shake = 0;
    s.running = true;
    s.lastTime = 0;

    // Ambient orbs
    s.bgOrbs = Array.from({ length: 10 }, () => ({
      x: Math.random() * s.width,
      y: Math.random() * s.height,
      r: 30 + Math.random() * 65,
      vy: 0.08 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    // Spawn 3 forward gates
    spawnGate(s.width + 120);
    spawnGate(s.width + 120 + 290);
    spawnGate(s.width + 120 + 580);
  }, [level, spawnGate]);

  // Handle revive trigger
  useEffect(() => {
    if (reviveCount > 0) {
      const s = stateRef.current;
      s.birdY = s.height / 2;
      s.birdVy = -2.5;
      s.birdRot = -0.2;
      s.invulnerableTimer = 3.0; // 3 seconds of shield protection
      s.running = true;
      s.lastTime = performance.now();
      // Push any active gate forward so player has breathing room
      s.gates.forEach(g => {
        if (g.x < s.width * 0.45) {
          g.x = s.width * 0.45 + 130;
        }
      });
      burstParticles(s.width * 0.28, s.birdY, '#facc15', 28);
      onAddFloatText('⚡ REVIVED!', '#facc15');
    }
  }, [reviveCount, burstParticles, onAddFloatText]);

  // Handle flap input
  const flap = useCallback(() => {
    const s = stateRef.current;
    if (!s.running || isPaused) return;

    soundService.unlockAudioOnUserGesture();
    s.birdVy = FLAP_VY;
    s.birdRot = -0.42;

    const bx = s.width * 0.28;
    for (let i = 0; i < 4; i++) {
      s.particles.push({
        x: bx - 5,
        y: s.birdY,
        vx: -Math.random() * 2.5 - 1,
        vy: (Math.random() - 0.5) * 2,
        life: 0,
        maxLife: 20,
        color: theme.glow,
        size: 2 + Math.random() * 2,
      });
    }

    soundService.flap();
    soundService.triggerHaptic(8);
  }, [theme.glow, isPaused]);

  // Handle Pointer & Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flap]);

  // Game Loop with Delta Time and Anti-Cheat Missed Gate Detection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 360;
      const h = rect.height || 640;

      stateRef.current.width = w;
      stateRef.current.height = h;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    resetGame();

    const triggerGameOver = (reason: string) => {
      const s = stateRef.current;
      if (s.invulnerableTimer > 0) return; // Protected by shield

      s.running = false;
      s.shake = 18;

      const bx = s.width * 0.28;
      burstParticles(bx, s.birdY, theme.secondary, 32);
      s.rings.push({
        x: bx,
        y: s.birdY,
        r: 10,
        maxR: 90,
        life: 0,
        maxLife: 30,
        color: theme.secondary,
        width: 3,
      });

      soundService.wrong();
      soundService.triggerHaptic(45);
      onAddFloatText(reason, theme.secondary);
      onCrash(s.score, s.combo, reason);
    };

    const triggerCorrect = (gate: Gate, bx: number) => {
      const s = stateRef.current;
      gate.passed = true;
      s.score += 1;
      s.combo += 1;
      s.runCorrect += 1;

      const bonus = s.combo >= 3 ? Math.floor(s.combo / 3) : 0;
      s.score += bonus;

      s.flashAlpha = Math.min(0.32, 0.15 + s.combo * 0.02);
      s.flashColor = theme.primary;

      // Speed progression
      if (s.score % 4 === 0) {
        s.speed = Math.min(s.speed + 0.18, 5.5);
      }

      const pColor = s.combo >= 5 ? theme.secondary : theme.primary;
      const count = 14 + Math.min(s.combo, 8) * 2;
      burstParticles(bx, s.birdY, pColor, count);

      s.rings.push({
        x: bx,
        y: s.birdY,
        r: BIRD_R + 2,
        maxR: 40 + Math.min(s.combo, 10) * 3,
        life: 0,
        maxLife: 22,
        color: pColor,
        width: 2.5,
      });

      if (s.combo >= 3 && s.combo % 3 === 0) {
        s.shake = Math.max(s.shake, 4);
      }

      const floatLabel = bonus > 0 ? `+${1 + bonus} (${s.combo}x)` : '+1';
      onAddFloatText(floatLabel, theme.primary);

      soundService.correct(s.combo);
      soundService.triggerHaptic(6);
      onCorrect(s.score, s.combo, bonus);
    };

    const loop = (timestamp: number) => {
      const s = stateRef.current;
      const W = s.width;
      const H = s.height;

      // Delta time in 60fps units (1.0 = exactly 1/60s)
      if (!s.lastTime) s.lastTime = timestamp;
      const rawDt = (timestamp - s.lastTime) / 16.667;
      s.lastTime = timestamp;
      // Cap dt to prevent massive jumps when switching tabs
      const dt = Math.max(0.2, Math.min(rawDt, 2.2));

      if (s.running && !isPaused) {
        if (s.invulnerableTimer > 0) {
          s.invulnerableTimer -= dt * 0.016;
          if (s.invulnerableTimer < 0) s.invulnerableTimer = 0;
        }

        // Apply physics scaled by dt
        s.birdVy += BASE_GRAVITY * dt;
        if (s.birdVy > MAX_VY) s.birdVy = MAX_VY;
        s.birdY += s.birdVy * dt;
        s.birdRot = Math.max(-0.6, Math.min(1.1, s.birdVy * 0.08));

        // Approaching gate slow-mo buffer for reading clarity
        const bxPhys = W * 0.28;
        let slow = 1;
        for (const g of s.gates) {
          if (!g.passed && g.x + GATE_WIDTH > bxPhys - 8) {
            const dx = g.x - bxPhys;
            if (dx > 0 && dx < 140) {
              slow = 0.65 + (dx / 140) * 0.35;
            }
            break;
          }
        }

        const moveSpeed = s.speed * slow * dt;
        s.gates.forEach(g => {
          g.x -= moveSpeed;
        });

        // Spawn next gate
        const lastGate = s.gates[s.gates.length - 1];
        if (lastGate && lastGate.x < W - 280) {
          spawnGate(W + 90);
        }

        // Ceiling / Floor bounds check
        if (s.birdY < BIRD_R) {
          s.birdY = BIRD_R;
          triggerGameOver('Out of bounds!');
        } else if (s.birdY > H - BIRD_R) {
          s.birdY = H - BIRD_R;
          triggerGameOver('Fell down!');
        }

        // Collision & Gap-bypass checks
        const bx = W * 0.28;
        for (const g of s.gates) {
          const insideX = bx + BIRD_R > g.x && bx - BIRD_R < g.x + GATE_WIDTH;
          const topBoxBottom = g.gapY - GAP / 2;
          const bottomBoxTop = g.gapY + GAP / 2;
          const topBoxTop = topBoxBottom - ANSWER_HEIGHT;
          const bottomBoxBottom = bottomBoxTop + ANSWER_HEIGHT;

          if (insideX) {
            // Check top box hit
            if (s.birdY - BIRD_R < topBoxBottom && s.birdY + BIRD_R > topBoxTop) {
              if (g.correctSide === 'top' && !g.passed) {
                triggerCorrect(g, bx);
              } else if (g.correctSide !== 'top') {
                triggerGameOver('Wrong Answer!');
                break;
              }
            }
            // Check bottom box hit
            else if (s.birdY + BIRD_R > bottomBoxTop && s.birdY - BIRD_R < bottomBoxBottom) {
              if (g.correctSide === 'bottom' && !g.passed) {
                triggerCorrect(g, bx);
              } else if (g.correctSide !== 'bottom') {
                triggerGameOver('Wrong Answer!');
                break;
              }
            }
          }

          // Anti-cheat / Missing Gate detection:
          // If the gate has moved past the bird's tail without the bird hitting either box,
          // the player dodged/missed the question!
          if (!g.passed && g.x + GATE_WIDTH < bx - BIRD_R) {
            triggerGameOver('Missed Question!');
            break;
          }
        }

        // Cleanup offscreen gates
        if (s.gates.length && s.gates[0].x + GATE_WIDTH < -30) {
          s.gates.shift();
        }
      }

      // Update particles
      for (const p of s.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.08 * dt;
        p.life += dt;
      }
      s.particles = s.particles.filter(p => p.life < p.maxLife);

      // Update rings
      for (const r of s.rings) {
        r.life += dt;
        const progress = r.life / r.maxLife;
        r.r += (r.maxR - r.r) * 0.18 * (1 - progress * 0.5) * dt;
      }
      s.rings = s.rings.filter(r => r.life < r.maxLife);

      // Update trail
      if (s.running && !isPaused) {
        const bxT = W * 0.28;
        s.trail.push({ x: bxT, y: s.birdY, a: 1 });
        if (s.trail.length > 10) s.trail.shift();
      }
      for (const tr of s.trail) {
        tr.a *= Math.pow(0.86, dt);
      }

      // Drift background orbs
      s.t += dt;
      for (const o of s.bgOrbs) {
        o.y -= o.vy * dt;
        o.phase += 0.012 * dt;
        if (o.y < -o.r) {
          o.y = H + o.r;
          o.x = Math.random() * W;
        }
      }

      // Screen shake decay
      let sx = 0;
      let sy = 0;
      if (s.shake > 0) {
        sx = (Math.random() - 0.5) * s.shake;
        sy = (Math.random() - 0.5) * s.shake;
        s.shake *= Math.pow(0.85, dt);
        if (s.shake < 0.4) s.shake = 0;
      }

      // ----------------------------- RENDER PASS -----------------------------
      ctx.save();
      ctx.translate(sx, sy);

      // Deep cyber background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, theme.bgInner);
      grad.addColorStop(1, theme.bg);
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, W + 40, H + 40);

      // Ambient radial neon orbs
      for (const o of s.bgOrbs) {
        const pulse = Math.sin(o.phase) * 0.15 + 0.85;
        const rg = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        rg.addColorStop(0, `${theme.glow}26`);
        rg.addColorStop(1, `${theme.glow}00`);
        ctx.fillStyle = rg;
        ctx.globalAlpha = 0.55 * pulse;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Perspective Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Render Gates
      const neutral = theme.glow;
      for (const g of s.gates) {
        const topBoxBottom = g.gapY - GAP / 2;
        const bottomBoxTop = g.gapY + GAP / 2;

        // Question pill in the center gap
        const qx = g.x + GATE_WIDTH / 2;
        const qy = g.gapY;
        ctx.font = '800 16px ui-sans-serif, system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const qw = Math.max(ctx.measureText(g.question).width + 24, 76);
        const qh = 28;

        // Pill glow & background
        ctx.shadowBlur = 12;
        ctx.shadowColor = `${theme.glow}aa`;
        ctx.fillStyle = 'rgba(10, 10, 18, 0.85)';
        drawRoundedRect(ctx, qx - qw / 2, qy - qh / 2, qw, qh, 14);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = `${theme.glow}aa`;
        ctx.lineWidth = 1.4;
        drawRoundedRect(ctx, qx - qw / 2, qy - qh / 2, qw, qh, 14);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(g.question, qx, qy);
        ctx.textBaseline = 'alphabetic';

        // Top and bottom answer boxes
        drawAnswerBox(
          ctx,
          g.x,
          topBoxBottom - ANSWER_HEIGHT,
          GATE_WIDTH,
          ANSWER_HEIGHT,
          neutral,
          g.topAnswer
        );
        drawAnswerBox(
          ctx,
          g.x,
          bottomBoxTop,
          GATE_WIDTH,
          ANSWER_HEIGHT,
          neutral,
          g.bottomAnswer
        );
      }

      // Draw particle effects
      for (const p of s.particles) {
        const a = Math.max(0, 1 - p.life / p.maxLife);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw expanding impact rings
      for (const r of s.rings) {
        const t = Math.max(0, 1 - r.life / r.maxLife);
        ctx.globalAlpha = t;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = r.width * (1 - (1 - t) * 0.5);
        ctx.shadowBlur = 14;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Draw speed trail
      const bx = W * 0.28;
      for (let i = 0; i < s.trail.length; i++) {
        const tr = s.trail[i];
        const progress = (i + 1) / s.trail.length;
        ctx.globalAlpha = tr.a * 0.45 * progress;
        ctx.fillStyle = theme.glow;
        ctx.beginPath();
        ctx.arc(
          tr.x - (s.trail.length - i) * 1.6,
          tr.y,
          BIRD_R * (0.35 + 0.65 * progress),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Bird / Neon Orb
      ctx.save();
      ctx.translate(bx, s.birdY);
      ctx.rotate(s.birdRot);

      // High combo aura
      if (s.combo >= 4) {
        const pulse = 1 + Math.sin(s.t * 0.25) * 0.14;
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = theme.secondary;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 18;
        ctx.shadowColor = theme.secondary;
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_R * 1.65 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Golden Revive Invulnerability Shield
      if (s.invulnerableTimer > 0) {
        const shieldPulse = 1 + Math.sin(s.t * 0.45) * 0.12;
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_R * 1.85 * shieldPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Outer glow
      ctx.shadowBlur = 24;
      ctx.shadowColor = theme.glow;
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eye
      ctx.fillStyle = theme.bg;
      ctx.beginPath();
      ctx.arc(4, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Wing glow flap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-2, 2, 4.5, 2.5, s.birdRot * 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Screen Flash Effect
      if (s.flashAlpha > 0.005) {
        ctx.fillStyle = s.flashColor;
        ctx.globalAlpha = s.flashAlpha;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        s.flashAlpha *= Math.pow(0.85, dt);
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [theme, mode, level, isPaused, spawnGate, resetGame, burstParticles, onCorrect, onCrash, onAddFloatText]);

  return (
    <div
      className="absolute inset-0 w-full h-full cursor-pointer touch-none select-none"
      onPointerDown={e => {
        e.preventDefault();
        flap();
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};

// ----------------------------- Helper Draw Routines -----------------------------
function drawAnswerBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  label: string
) {
  // Soft glowing neon card fill
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, `${color}38`);
  g.addColorStop(1, `${color}12`);

  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = g;
  drawRoundedRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner subtle border highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x + 2, y + 2, w - 4, h - 4, 12);
  ctx.stroke();

  // Typography auto-fit
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';

  const maxTextW = w - 12;
  let fontSize = 21;
  ctx.font = `800 ${fontSize}px ui-sans-serif, system-ui`;
  while (fontSize > 10 && ctx.measureText(label).width > maxTextW) {
    fontSize -= 1;
    ctx.font = `800 ${fontSize}px ui-sans-serif, system-ui`;
  }

  ctx.fillText(label, x + w / 2, y + h / 2);
  ctx.shadowBlur = 0;
  ctx.textBaseline = 'alphabetic';
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
