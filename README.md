# 🧭 WebSlidePresenter

Professional web-based presentation tool with dual-window mode, intelligent timing management, and speaker notes. Built with SvelteKit for a seamless, offline-capable experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with SvelteKit](https://img.shields.io/badge/Made%20with-SvelteKit-FF3E00?logo=svelte)](https://kit.svelte.dev/)

**[🚀 Try it Live](https://web-slide-presenter-five.vercel.app/)** 
---

## ⚡ Quick Start (5 Minutes)

### Installation

```bash
git clone https://github.com/glowingkitty/WebSlidePresenter.git
cd WebSlidePresenter/app
npm install
npm run dev
```

Open http://localhost:5173

### Basic Usage

1. **Load PDF**: Click "📁 Load PDF Presentation"
2. **Quick Timing**: Click "Auto-fill" → Enter duration (e.g., `30` minutes)
3. **Open Audience View**: Click "Open Audience View" → Press `F` for fullscreen
4. **Present**: Click "Start" → Use `→` or `Space` to advance

### Pro Tips

- **Pause & Adjust**: Click "Pause" during presentation to adjust timing on the fly
- **Save Config**: Click "💾 Save Config" to save timing + notes for reuse
- **Keyboard**: `→`/`Space` next, `←` previous, `Home` first, `End` last

---

## ✨ Features

### 🎯 Smart Timing System
- **Milestone-Based Timing**: Set target times only for key slides, others auto-calculate via interpolation
- **Edit & Present Modes**: Clean separation between setup and presentation
- **Pause & Adjust**: Pause during presentation to fine-tune timing without losing progress
- **Real-Time Pacing**: Color-coded indicators (⚠️ Too Fast / ✓ Ahead / ≈ On Time / ⚠ Behind)
- **Timing Overview**: See all slide timings at a glance with milestone indicators (📍 vs 🔄)
- **Minutes-Only Display**: Shows minutes during presentation, countdown in last minute

### 🖥️ Dual-Window Presentation
- **Presenter View**: Full control with slide preview, notes, timer, and timing info
- **Audience View**: Clean, distraction-free slide display
- **Synchronized Navigation**: BroadcastChannel API keeps windows in sync
- **Mini Next-Slide Preview**: PowerPoint-style preview in presenter view

### 📝 Speaker Notes
- **Per-Slide Notes**: Editable speaker notes for each slide
- **Auto-Save**: Notes save automatically to localStorage
- **Persistent**: Notes persist across sessions

### 💾 Configuration Management
- **YAML Export/Import**: Save timing and notes together
- **Config Files**: Reuse configurations across presentations
- **Easy Sharing**: Share timing plans with collaborators

### 🎨 User Experience
- **Keyboard Navigation**: Full keyboard control (arrows, space, home, end)
- **Responsive Design**: Adapts to different screen sizes
- **Progress Tracking**: Visual progress bar with slide counter
- **Boundary Protection**: Can't navigate beyond first/last slide

### 📱 Progressive Web App (PWA)
- **Installable**: Install as desktop/mobile app
- **Offline Support**: Works without internet connection
- **Service Worker**: Caches assets for fast loading

### 🔒 Privacy & Security
- **No Tracking**: Zero analytics or external connections
- **Fully Static**: No backend server required
- **Local Storage**: All data stays on your device
- **No External CDNs**: All dependencies bundled

---

## 📖 Usage Guide

### 1. Load Your Presentation
1. Click **"Load PDF Presentation"** button
2. Select your PDF file
3. Wait for slides to render (progress indicator shows status)

### 2. Set Up Timing

#### Option A: Quick Setup - Auto-fill (Fastest)
1. Click **"Auto-fill"** button
2. Enter total presentation duration (e.g., 30 minutes)
3. System automatically distributes timing evenly

#### Option B: Smart Setup - Milestones (Best)
1. Navigate to key slides (section starts, transitions)
2. For each key slide, enter target time in the **Target** input field
3. Other slides auto-calculate between milestones
4. Indicators: 📍 = Milestone (you set), 🔄 = Auto-calculated

**Example:**
```
Slide 1:  0 min   📍 (you set)
Slide 2:  2 min   🔄 (auto)
Slide 3:  5 min   🔄 (auto)
Slide 4:  10 min  📍 (you set)
Slide 5:  15 min  🔄 (auto)
```

#### Save Your Configuration
1. Click **"💾 Save Config"** button
2. Downloads YAML file with timing and notes
3. Reuse later with **"📂 Load Config"**

### 3. Present

#### Open Audience View
1. Click **"Open Audience View"** button
2. Move window to second screen/projector
3. Press `F` for fullscreen

#### Start Presenting
1. Click **"Start"** button to begin timer
2. Navigate slides:
   - `→` or `Space`: Next slide
   - `←`: Previous slide  
   - `Home`: First slide
   - `End`: Last slide

#### Monitor Your Pacing
- **⚠️ Slow down!** - More than 2 min ahead (orange)
- **✓ Ahead of schedule** - 0.5-2 min ahead (green)
- **≈ On schedule** - Within ±0.5 min (yellow)
- **⚠ Behind schedule** - More than 0.5 min behind (red)

#### Pause to Adjust (Pro Tip!)
1. Click **"Pause"** during presentation
2. Returns to edit mode but **keeps elapsed time**
3. Adjust target times if needed
4. Click **"Resume"** to continue from where you paused
5. Or **"Stop"** to reset timer to 0

### 4. Manage Speaker Notes
- Click in notes area below slide
- Type your notes (auto-saves as you type)
- Notes persist across sessions

---

## ⌨️ Keyboard Shortcuts

### Presenter View
| Key | Action |
|-----|--------|
| `→` or `Space` | Next slide |
| `←` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `?` | Show keyboard shortcuts |

### Audience View
| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |

---

## 🎨 UI Modes Explained

### ✏️ Edit Mode (Fresh Start)
- Timer at 0
- Can edit target times
- Available: Auto-fill, Clear All (if times set), Start

### ⏱️ Presenting
- Timer running
- Target times locked
- Shows: Elapsed, Target, Remaining, Pacing
- Available: Pause

### ✏️ Edit Mode (Paused)
- Timer paused at current time
- Can edit target times (fine-tune on the fly!)
- Shows: Elapsed time preserved
- Available: Auto-fill, Clear All, Resume, Stop

---

## 🐛 Troubleshooting

### PDF Not Loading
- Check file size (very large PDFs may take time)
- Ensure file is a valid PDF
- Check browser console for errors

### Audience View Not Syncing
- Ensure both windows are from same origin
- Check that BroadcastChannel is supported
- Refresh both windows

### Timer Pacing Issues
- Set target times for at least 2 slides
- Ensure times increase sequentially
- Use Auto-fill for quick setup

### Storage Quota Exceeded
- IndexedDB is used for large data
- Clear browser data if needed
- Check available storage in DevTools

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- PDF rendering by [PDF.js](https://mozilla.github.io/pdf.js/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/glowingkitty/WebSlidePresenter)

1. Click the button above or push to GitHub
2. Import project in Vercel
3. Deploy (configuration is automatic via `vercel.json`)

### Other Platforms

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides for Netlify, static hosting, and self-hosting.

---

## 💻 Development

```bash
cd app
npm install         # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/glowingkitty/WebSlidePresenter/issues)
- 💡 [Request Features](https://github.com/glowingkitty/WebSlidePresenter/issues)
- 📖 [Documentation](DEPLOYMENT.md)

---

**Made with ❤️ for presenters who value timing and professionalism**
