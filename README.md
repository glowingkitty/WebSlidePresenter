# 🧭 WebSlidePresenter

Professional web-based presentation tool with dual-window mode, intelligent timing management, and speaker notes. Built with SvelteKit for a seamless, offline-capable experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with SvelteKit](https://img.shields.io/badge/Made%20with-SvelteKit-FF3E00?logo=svelte)](https://kit.svelte.dev/)

**[🚀 Try it Live](https://webslidepresenter.vercel.app/)** 

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

1. **Load PDF**: Click "📁 Load PDF" or drag & drop a PDF file onto the preview area
2. **Quick Timing**: Click "Auto-fill" → Enter duration (e.g., `30` minutes)
3. **Open Audience View**: Click "👥 Audience" → Press `F` for fullscreen
4. **Present**: Click "Start" → Use `→` / `Space` / navigation buttons to advance

### Pro Tips

- **Drag & Drop**: Simply drag a PDF file onto the app to load it instantly
- **Persistence**: Your presentation persists across page reloads automatically
- **Pause & Adjust**: Click "Pause" during presentation to adjust timing on the fly
- **Save Config**: Click "💾 Save" to save timing + notes for reuse
- **Navigation Buttons**: Use on-screen buttons for touch/mouse control
- **Clear Data**: Click "🗑️ Clear All" to reset everything when starting fresh

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
- **Drag & Drop Upload**: Drag PDF files directly onto the app to load them
- **Navigation Buttons**: On-screen buttons for mouse/touch navigation (⏮️ ◀️ ▶️ ⏭️)
- **Keyboard Navigation**: Full keyboard control (arrows, space, home, end)
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Persistent State**: Presentations automatically restore after page reload
- **Progress Tracking**: Visual progress bar with slide counter
- **Boundary Protection**: Can't navigate beyond first/last slide
- **Clear All Data**: One-click button to reset all data and start fresh

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

**Option A: Click to Upload**
1. Click **"📁 Load PDF"** button in the top toolbar
2. Select your PDF file from the dialog
3. Wait for slides to render (progress indicator shows status)

**Option B: Drag & Drop (Recommended)**
1. Drag your PDF file from your file explorer
2. Drop it onto the slide preview area (highlighted in blue when dragging)
3. Watch as the app processes your slides with a progress bar

**Note**: Your presentation will automatically persist across page reloads, so you can close and reopen your browser without losing your slides.

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
1. Click **"💾 Save"** button
2. Downloads YAML file with timing and notes
3. Reuse later with **"📂 Config"** button

#### Clear All Data
Need to start fresh? Click **"🗑️ Clear All"** to remove:
- All slides
- Speaker notes
- Timing configuration
- Persistent state

### 3. Present

#### Open Audience View
1. Click **"👥 Audience"** button
2. Move window to second screen/projector
3. Press `F` for fullscreen

#### Start Presenting
1. Click **"Start"** button to begin timer
2. Navigate slides using either:
   - **Keyboard**: `→` or `Space` (Next), `←` (Previous), `Home` (First), `End` (Last)
   - **On-Screen Buttons**: ⏮️ (First), ◀️ Prev, Next ▶️, ⏭️ (Last)
   - **Timing Overview**: Click any slide in the sidebar to jump directly to it

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
- Try drag & drop instead of file dialog
- Check browser console for errors

### Presentation Not Persisting
- Check if IndexedDB is enabled in your browser
- Ensure you're not in private/incognito mode
- Try clicking "💾 Save" to export configuration as backup

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
- Click "🗑️ Clear All" to free up space
- Check available storage in DevTools

### Mobile/Tablet Issues
- App is fully responsive and should work on all devices
- Use on-screen navigation buttons instead of keyboard
- Rotate to landscape for better slide visibility

---

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- PDF rendering by [PDF.js](https://mozilla.github.io/pdf.js/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
