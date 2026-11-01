import React, { useState } from 'react';
import { Theme } from '../types/game';
import { X, Mail, Shield, BookOpen, Info, HelpCircle } from 'lucide-react';

interface InfoModalProps {
  theme: Theme;
  initialTab?: 'how-to-play' | 'about' | 'privacy' | 'terms' | 'contact';
  onClose: () => void;
}

type TabKey = 'how-to-play' | 'about' | 'privacy' | 'terms' | 'contact';

const SUPPORT_EMAIL = 'vishv971719kumar@gmail.com';

export const InfoModal: React.FC<InfoModalProps> = ({
  theme,
  initialTab = 'how-to-play',
  onClose,
}) => {
  const [tab, setTab] = useState<TabKey>(initialTab);

  const tabs: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: 'how-to-play', label: 'How to Play', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'terms', label: 'Terms', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-3xl border overflow-hidden flex flex-col max-h-[88vh] shadow-2xl animate-scaleUp"
        style={{
          background: `linear-gradient(180deg, ${theme.bgInner}f5, ${theme.bg})`,
          borderColor: `${theme.glow}44`,
          boxShadow: `0 10px 60px ${theme.glow}26`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
          <div className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
            <span>MindRush</span>
            <span style={{ color: theme.primary }}>IQ</span>
            <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest ml-1">
              Guide & Legal
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/15 transition-all active:scale-90"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-2.5 border-b border-white/5 overflow-x-auto no-scrollbar">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 border"
                style={{
                  background: active ? `${theme.primary}26` : 'transparent',
                  borderColor: active ? `${theme.primary}66` : 'transparent',
                  color: active ? theme.primary : 'rgba(255,255,255,0.6)',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto text-white/80 text-xs leading-relaxed space-y-3.5">
          {tab === 'how-to-play' && (
            <div className="space-y-3">
              <h3 className="text-base font-black text-white">How to Play & Rules</h3>
              <p>
                MindRush IQ tests rapid decision making under pressure. Tap to flap the bird upward while gravity pulls it down.
              </p>

              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white mb-0.5">1. Read the Question Pill</div>
                  <div className="text-white/70">
                    The question pill floats in the center gap between two neon answer boxes.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white mb-0.5">2. Choose Top or Bottom Box</div>
                  <div className="text-white/70">
                    Fly into the box displaying the <strong className="text-emerald-400">CORRECT answer</strong>. Hitting the wrong answer or dodging the gate will end your run!
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white mb-0.5">3. Maintain Combos</div>
                  <div className="text-white/70">
                    Consecutive correct answers trigger combo multipliers (x2, x3, x5+), granting bonus points and XP.
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'about' && (
            <div className="space-y-3">
              <h3 className="text-base font-black text-white">About MindRush IQ</h3>
              <p>
                MindRush IQ is an educational brain training arcade designed to turn daily mental exercise into an addictive, rewarding reflex game.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-emerald-400">⚡ Speed Math</div>
                  <div className="text-white/60 text-[10px] mt-0.5">Arithmetic reflex calibration</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-sky-400">📖 Vocabulary</div>
                  <div className="text-white/60 text-[10px] mt-0.5">Lexical recall & synonyms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-purple-400">🧬 Pattern IQ</div>
                  <div className="text-white/60 text-[10px] mt-0.5">Inductive logic sequences</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-rose-400">🎯 Working Memory</div>
                  <div className="text-white/60 text-[10px] mt-0.5">High-speed focus control</div>
                </div>
              </div>

              {/* Direct GitHub Ready ZIP Download Button */}
              <div className="pt-2">
                <a
                  href="/mindrush-iq-complete-game.zip"
                  download="mindrush-iq-complete-game.zip"
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md text-black"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #38bdf8)',
                  }}
                >
                  <span>⬇ Download Complete Source ZIP (for GitHub)</span>
                </a>
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-2.5">
              <h3 className="text-base font-black text-white">Privacy Policy</h3>
              <p>
                Your privacy is paramount. MindRush IQ operates entirely client-side for offline-first privacy.
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/70">
                <li>Gameplay progress, scores, and themes are stored locally on your device via HTML5 LocalStorage.</li>
                <li>No personal data or passwords are transmitted or sold to third-party brokers.</li>
                <li>Anonymous device telemetry may be used solely for crash diagnostic reports and performance optimizations.</li>
              </ul>
              <p className="text-[11px] text-white/50 pt-1">
                Questions or data deletion requests? Contact: <span className="text-white font-bold">{SUPPORT_EMAIL}</span>
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-2.5">
              <h3 className="text-base font-black text-white">Terms & Conditions</h3>
              <p>
                By accessing MindRush IQ, you agree to fair use and community safety guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/70">
                <li>MindRush IQ is provided free of charge for recreational and educational brain training.</li>
                <li>Automated botting, decompilation, and commercial redistribution are prohibited.</li>
                <li>All visual assets, audio synthesizer routines, and game mechanics are copyright MindRush IQ.</li>
              </ul>
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-3">
              <h3 className="text-base font-black text-white">Contact & Support</h3>
              <p>
                Have feedback, found a bug, or want to suggest new questions or themes? Reach out directly:
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=MindRush%20IQ%20Feedback`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-md"
                style={{
                  background: `${theme.primary}22`,
                  color: theme.primary,
                  border: `1px solid ${theme.primary}55`,
                }}
              >
                <Mail className="w-4 h-4" />
                <span>{SUPPORT_EMAIL}</span>
              </a>
              <p className="text-[11px] text-white/50">
                Typical response time: within 24–48 business hours.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 text-center text-[10px] text-white/40 bg-black/40">
          © {new Date().getFullYear()} MindRush IQ — All rights reserved.
        </div>
      </div>
    </div>
  );
};
