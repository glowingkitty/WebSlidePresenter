# 🧭 PresentPilot — Web Presenter App Requirements

## 🎯 Goal
Cross-platform web app for giving presentations from PDFs with dual-window mode:
- **Audience view:** fullscreen slides on external display  
- **Presenter view:** current + next slide, notes, timer, and pacing indicators

## ⚙️ Core Features
- Load and render PDFs using **PDF.js**
- Dual-window sync via **BroadcastChannel API**
- Keyboard navigation (← → space)
- Global and per-slide timers with pacing feedback
- Progress bar / color cue for on-time tracking
- Editable speaker notes and checkpoints
- Save per-slide timing in **localStorage**
- Optional PWA for offline use

## 🧱 Tech Stack
- **Framework:** React or Svelte  
- **Styling:** Tailwind CSS  
- **State Management:** Zustand (React) or Svelte stores  
- **Communication:** BroadcastChannel  
- **Rendering:** PDF.js  
- **Optional AI:** OpenAI API for timing and note generation

## 💡 Future Ideas
- Remote control from phone  
- Export/import timing plans  
- Dark/light themes  
- Post-presentation analytics