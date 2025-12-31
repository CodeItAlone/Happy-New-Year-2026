# New Year 2026 — Interactive Web Experience

A polished, two-page interactive web experience celebrating New Year 2026. Built with pure HTML, CSS, and Vanilla JavaScript — no external libraries.

![Theme: Midnight Violet](https://img.shields.io/badge/Theme-Midnight%20Violet-a78bfa)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-green)
![Responsive](https://img.shields.io/badge/Responsive-Yes-blue)

---

## 🎯 Concept

**"Build anticipation. Don't dump effects. Control attention."**

This project creates a moment of reflection as one year ends and another begins. Rather than overwhelming visitors with effects, it uses **controlled reveals** and **intentional animations** to build emotional engagement.

### Page 1: The Countdown
A minimalist countdown to midnight with:
- Smooth digit transitions (no jarring jumps)
- Elegant hero text with staggered fade-up animation
- Disabled CTA button that enables at midnight
- Animated gradient background with floating orbs

### Page 2: Message to the Future
A reflective experience featuring:
- Typewriter animation revealing a New Year message
- Mouse-reactive parallax background
- Blinking cursor effect
- Smooth page transitions

---

## 🛠 Tech Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure, accessibility |
| **CSS3** | Custom properties, keyframe animations, responsive design |
| **Vanilla JS** | DOM manipulation, requestAnimationFrame, modular IIFE pattern |
| **Google Fonts** | Inter (body) + Space Grotesk (display) |

### No External Libraries
- No jQuery
- No GSAP
- No Three.js
- No particle.js
- 100% hand-crafted

---

## 🧠 Key Challenges Solved

### 1. Smooth Digit Transitions
**Problem:** Countdown timers often feel janky with abrupt number changes.

**Solution:** Each digit is animated independently using CSS keyframes with a subtle flip effect. The animation only triggers on digits that actually change.

```javascript
if (char !== lastChar) {
  digit.classList.add('changing');
  setTimeout(() => digit.classList.remove('changing'), 400);
}
```

### 2. Page Transition Without Flash
**Problem:** Browser navigation causes a visible white flash.

**Solution:** Overlay-based transition — a full-screen black div fades in before navigation, then fades out on the new page, creating a seamless experience.

### 3. Natural Typing Animation
**Problem:** Constant-speed typing feels robotic.

**Solution:** Variable delays based on punctuation:
- Periods/exclamations: 8× delay
- Commas/semicolons: 4× delay
- Newlines: 6× delay

### 4. Performant Background Animation
**Problem:** Animated backgrounds can destroy performance.

**Solution:** 
- CSS-only gradient animation (GPU-accelerated)
- Static radial gradients for "stars" (no JavaScript)
- `filter: blur()` on orbs (hardware-accelerated)
- Orb animations use `transform` only (no repaints)

### 5. Mouse Parallax Without Jank
**Problem:** Direct mouse tracking creates choppy movement.

**Solution:** Linear interpolation (lerp) with `requestAnimationFrame`:
```javascript
state.mouseX = lerp(state.mouseX, state.targetX, 0.05);
```

---

## ♿ Accessibility Features

- **Reduced Motion:** Respects `prefers-reduced-motion` media query
- **Keyboard Support:** Enter key triggers CTA, Escape returns to countdown
- **Screen Readers:** Semantic HTML, ARIA labels on timer
- **Focus Management:** Button receives focus when enabled

---

## 📱 Responsive Design

- **Mobile-first** approach
- **Fluid typography** using `clamp()`
- **Flexible spacing** system (8px base)
- Tested on 320px, 768px, 1024px, 1440px viewports

---

## 🚀 Deployment

This is a **fully static project** — no build step required.

### GitHub Pages
1. Push to a GitHub repository
2. Go to Settings → Pages
3. Select main branch, root folder
4. Done!

### Vercel / Netlify
Simply drag and drop the folder or connect your repo.

---

## 📁 Project Structure

```
Happy new year/
├── index.html          # Page 1: Countdown landing
├── celebration.html    # Page 2: Message to the Future
├── css/
│   └── styles.css      # Complete design system
├── js/
│   ├── animations.js   # Shared animation utilities
│   ├── countdown.js    # Countdown + page transition
│   └── message.js      # Typing effect + parallax
└── README.md
```

---

## 🎨 Design Tokens

```css
--bg-primary: #0a0a0f      /* Main background */
--accent: #a78bfa          /* Primary accent (violet) */
--accent-glow: #7c3aed     /* Hover/glow states */
--text-primary: #f8f8ff    /* Main text */
--text-secondary: #9ca3af  /* Secondary text */
```

---

## 📝 License

MIT — Feel free to use, modify, and share.

---

**Happy New Year 2026! 🎉**
