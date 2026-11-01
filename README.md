# MindRush IQ — Neon Brain Training Arcade Game

A high-octane neon brain-training arcade game built with React 19, TypeScript, Vite, Tailwind CSS v4, and HTML5 Canvas.

## 🚀 Quick Start (Local Setup)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📦 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - MindRush IQ"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mindrush-iq.git
git push -u origin main
```

---

## 🌐 Free Deployment (Cloudflare Pages)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com/) and create a free account.
2. Click **Create a project** > **Connect to Git** > select your `mindrush-iq` repository.
3. Configuration:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**!

---

## 🎮 Game Features & Monetization

- **Modes:** Speed Math, Vocabulary Synonyms, Pattern IQ.
- **Physics:** Delta-time frame-rate independent canvas physics (smooth on 60Hz and 120Hz/144Hz displays).
- **Anti-Cheat:** Missed gate penalty stops players from skipping questions.
- **Audio Engine:** Web Audio synthesizer + Looping background music with smooth ducking.
- **Shop & Themes:** 6 Neon themes with color preview and coin purchase system.
- **Rewarded Ad Hooks (AdMob Ready):**
  - Second Chance Revive with 3s invulnerability shield
  - Double Coins (2x) on Game Over
  - Free +150 Coins Chest in menu
  - Ad-Free VIP Pass toggle
- **Progression:** Daily streak tracker, daily challenges, 12 badges, cognitive performance index meter.
