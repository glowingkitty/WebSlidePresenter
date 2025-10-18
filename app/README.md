# 🧭 PresentPilot

Professional web-based presentation tool with dual-window mode, timing management, and speaker notes.

## Features

- **Dual-Window Mode**: Separate presenter and audience views synchronized via BroadcastChannel
- **Timing Management**: Set target times for each slide with visual pacing indicators
- **Speaker Notes**: Editable notes per slide with auto-save to localStorage
- **Keyboard Navigation**: Arrow keys, Space, Home, End for easy slide control
- **YAML Import/Export**: Save and load timing configurations
- **PWA Support**: Install as a desktop app and work offline
- **No External Dependencies**: No tracking, no external servers, fully static

## Technology Stack

- **Framework**: SvelteKit with static adapter
- **Styling**: Tailwind CSS
- **PDF Rendering**: PDF.js
- **Communication**: BroadcastChannel API
- **PWA**: Service Worker for offline support

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. **Load a PDF**: Click "Load PDF Presentation" and select your PDF file
2. **Setup Timing** (optional):
   - Click "Setup Timing" to configure target times for each slide
   - Use "Auto-fill Equal" to distribute time evenly
   - Export to YAML file for reuse
3. **Open Audience View**: Click "Open Audience View" to open a second window
4. **Present**:
   - Navigate with arrow keys or space bar
   - Timer starts automatically on first slide
   - Monitor pacing with color-coded indicators (green=ahead, yellow=on-time, red=behind)
   - Edit speaker notes as needed

### Keyboard Shortcuts

- `→` or `Space`: Next slide
- `←`: Previous slide
- `Home`: First slide
- `End`: Last slide
- `?`: Show keyboard shortcuts
- `F` (audience view): Toggle fullscreen

### Time Display

- Shows **minutes only** during most of presentation (e.g., "15 min")
- Switches to **seconds countdown** in the last minute (e.g., "0:45")
- Color coding:
  - **Green**: Ahead of schedule
  - **Yellow**: On schedule
  - **Red**: Behind schedule

## Deployment

### Vercel

1. Push code to GitHub repository
2. Import project in Vercel
3. Deploy (no additional configuration needed)

### Static Hosting

Build the project and deploy the `build` directory to any static hosting service:

```bash
npm run build
# Deploy the 'build' directory
```

## File Structure

```
app/
├── src/
│   ├── lib/
│   │   ├── components/    # Svelte components
│   │   ├── services/      # Core services (PDF, broadcast, storage)
│   │   └── stores/        # Svelte stores (state management)
│   ├── routes/
│   │   ├── +page.svelte        # Presenter view
│   │   └── audience/
│   │       └── +page.svelte    # Audience view
│   └── app.html           # HTML template
├── static/                # Static assets (icons, manifest, SW)
└── package.json
```

## Browser Compatibility

- Modern browsers with ES6+ support
- BroadcastChannel API support (Chrome, Firefox, Edge, Safari 15.4+)
- PDF.js compatible browsers

## License

MIT

## Contributing

Issues and pull requests welcome!
