# 📖 PresentPilot User Guide

## Getting Started

### 1. Load Your Presentation

1. Open PresentPilot in your browser
2. Click **"Load PDF Presentation"**
3. Select your PDF file
4. Wait for the slides to load (progress indicator shown)

### 2. Setup Timing (Optional but Recommended)

1. Click **"Setup Timing"** button in the top bar
2. Choose one of these methods:

   **Method A: Auto-fill Equal Distribution**
   - Click "Auto-fill Equal"
   - Enter total presentation duration (e.g., 30 minutes)
   - Times are distributed evenly across all slides

   **Method B: Manual Entry**
   - Enter target cumulative time for each slide
   - Example: Slide 1 = 2 min, Slide 2 = 5 min, Slide 3 = 8 min
   - (These are cumulative times from the start)

3. Click **"Save"** to apply timing

### 3. Export/Import Timing (Save for Later)

**Export:**
1. Setup your timing
2. Click "Export YAML" in the timing modal
3. File downloads as `your-presentation.yml`
4. Keep this file with your PDF

**Import:**
1. Click "Setup Timing"
2. Click "Import YAML"
3. Select your previously exported `.yml` file
4. Timing is restored instantly

### 4. Open Audience View

1. Click **"Open Audience View"** button (top right)
2. A new window opens with fullscreen slide display
3. Move this window to your external display/projector
4. Press **F** in audience view to enter fullscreen

**Pro Tip:** Arrange windows BEFORE your presentation:
- Presenter view on your laptop screen
- Audience view on external display (fullscreen)

### 5. Present!

**Navigation:**
- Press `→` or `Space` to go to next slide
- Press `←` to go to previous slide
- Press `Home` to jump to first slide
- Press `End` to jump to last slide

**Timer:**
- Timer starts automatically when you go to the first slide
- Or click "Start" button manually
- Use "Pause" to take breaks
- "Reset" to start over

**Speaker Notes:**
- Add notes in the text area at bottom
- Notes auto-save as you type
- Persists across browser sessions (localStorage)
- View notes while presenting

## Understanding the Presenter View

### Layout

```
┌─────────────────────────────────────────────────────┐
│  PresentPilot | [PDF] [Timing] [Open Audience View] │ Top Bar
├─────────────────────────────────────────────────────┤
│  Progress: ████████░░░░░░ 60%  (Slide 6/10)        │ Progress Bar
├───────────────────────────┬─────────────────────────┤
│  [Mini Current] [Mini Next]│      Timer Panel        │
│                           │  ⏱️ 15 min              │
│   ┌─────────────────┐    │  Target: 18 min         │
│   │                 │    │  Remaining: 3 min       │
│   │  Large Current  │    │  ✓ Ahead of schedule   │
│   │     Slide       │    ├─────────────────────────┤
│   │                 │    │  Navigation Help        │
│   └─────────────────┘    │  →/Space = Next         │
│                           │  ← = Previous           │
│  ┌─────────────────┐    │  Home/End = First/Last  │
│  │ Speaker Notes   │    ├─────────────────────────┤
│  │ (editable)      │    │  Presentation Info      │
│  └─────────────────┘    │  File: slides.pdf       │
│                           │  Slides: 10             │
└───────────────────────────┴─────────────────────────┘
```

### Time Display

**During Most of Presentation:**
- Shows minutes only (e.g., "15 min")
- Less distracting
- Keeps you focused

**Last Minute:**
- Switches to seconds (e.g., "0:45")
- Countdown for final moments

### Pacing Indicators

**Color Coding:**
- 🟢 **Green** (Ahead): You're ahead of schedule - great!
- 🟡 **Yellow** (On Time): Right on track - keep going
- 🔴 **Red** (Behind): Behind schedule - speed up

**Threshold:** ±30 seconds tolerance

## Features in Detail

### Dual-Window Synchronization

- Uses BroadcastChannel API (modern browsers)
- Zero latency between windows
- Works even without internet (after first load)
- Both windows must be same origin (same browser)

### Speaker Notes

- Per-slide notes
- Rich text editing
- Auto-save (500ms debounce)
- Persists in localStorage
- Tied to PDF file name

### Progress Bar

- Visual progress indicator
- Color matches pacing status
- Shows current slide / total slides
- Percentage complete

### Keyboard Shortcuts

Press `?` to see full list:
- `→` / `Space`: Next slide
- `←`: Previous slide  
- `Home`: First slide
- `End`: Last slide
- `F` (audience): Toggle fullscreen
- `?`: Show shortcuts overlay

## Tips & Best Practices

### Before Your Presentation

1. ✅ Load PDF and test all slides render correctly
2. ✅ Setup timing and export YAML file as backup
3. ✅ Add speaker notes for key slides
4. ✅ Test dual-window sync on your actual setup
5. ✅ Practice navigation with keyboard shortcuts
6. ✅ Verify fullscreen works on projector

### During Your Presentation

1. 🎯 Keep presenter view visible to you only
2. ⏱️ Glance at timer occasionally, don't obsess
3. 📝 Use speaker notes as reminders
4. 🎨 Watch pacing color for timing guidance
5. 🖱️ Use keyboard shortcuts (faster than mouse)

### After Your Presentation

1. 💾 Export timing if you want to reuse
2. 📊 Note which slides took longer (for next time)
3. 📝 Update notes based on audience questions

## Troubleshooting

### Audience View Not Updating

1. Check both windows are from same origin
2. Refresh audience view
3. Check browser console for errors
4. Try re-opening audience view

### Timer Not Starting

- Click "Start" button manually
- Or navigate to first slide (auto-starts)

### PDF Won't Load

- Check file is valid PDF
- Try re-exporting PDF from source
- Check file size (very large PDFs may be slow)

### Notes Not Saving

- Check browser allows localStorage
- Try private/incognito mode
- Clear browser cache and reload

### Fullscreen Not Working

- Try pressing F11 (browser fullscreen)
- Check browser permissions
- Some browsers require user gesture

## Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 15.4+

**Partially Supported:**
- Older Safari (no BroadcastChannel)
- Older Firefox (no BroadcastChannel)

**Workaround:** Use same browser for both windows.

## Privacy & Security

- ✅ **100% Client-side** - No data sent to servers
- ✅ **No tracking** - No analytics or telemetry
- ✅ **Local storage only** - Notes/timing stay on your device
- ✅ **Offline capable** - PWA works without internet
- ✅ **Open source** - Fully transparent code

Perfect for confidential presentations!

## Advanced Usage

### Custom Timing Patterns

Example YAML file structure:
```yaml
presentation: "quarterly-review.pdf"
slides:
  - slide: 1
    target_time: 1
  - slide: 2
    target_time: 3
  - slide: 5
    target_time: 10
```

You can edit YAML files manually for precise control.

### Multiple Presentations

PresentPilot stores notes/timing per PDF file name. To manage multiple presentations:
1. Use descriptive PDF names
2. Keep matching YAML files organized
3. Each PDF gets independent notes in localStorage

### Presentation Templates

Create timing templates:
1. Setup timing for common durations (5 min, 10 min, 30 min talks)
2. Export as YAML templates
3. Import and adjust for each presentation

## Support

For issues or feature requests:
- Check the README.md
- Review DEPLOYMENT.md for hosting issues
- Check browser console for errors

---

**Happy Presenting! 🎤📊**

