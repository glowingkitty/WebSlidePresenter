# 🚀 PresentPilot Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via GitHub

1. **Push to GitHub**:
   ```bash
   cd /home/superdev/projects/WebSlidePresenter/app
   git init
   git add .
   git commit -m "Initial commit: PresentPilot"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect SvelteKit
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
cd /home/superdev/projects/WebSlidePresenter/app

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Deploy to Other Static Hosts

### Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `build` directory:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

### GitHub Pages

1. Install the GitHub Pages adapter:
   ```bash
   npm install -D @sveltejs/adapter-static
   ```

2. Update `svelte.config.js` paths property to match your repo name:
   ```javascript
   kit: {
     adapter: adapter(),
     paths: {
       base: '/your-repo-name'
     }
   }
   ```

3. Build and deploy:
   ```bash
   npm run build
   # Push the build directory to gh-pages branch
   ```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting
```

## Environment Variables

No environment variables needed! PresentPilot is a fully static app with no backend dependencies.

## Build Configuration

The project is configured for static export in `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true
    })
  }
};
```

## Post-Deployment Checklist

- [ ] Test PDF upload functionality
- [ ] Test dual-window synchronization (open presenter + audience views)
- [ ] Test keyboard navigation
- [ ] Test timing setup and YAML export/import
- [ ] Test speaker notes persistence (localStorage)
- [ ] Test PWA installation (if served over HTTPS)
- [ ] Test offline functionality

## Troubleshooting

### Build Fails

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. Check Node.js version (requires Node 18+):
   ```bash
   node --version
   ```

### PDF.js Worker Not Loading

The app uses PDF.js from CDN. Ensure your deployment platform allows loading external scripts:
- Vercel: No issues
- Netlify: No issues
- GitHub Pages: May need CSP headers

### BroadcastChannel Not Working

BroadcastChannel requires:
- Same origin for both windows
- Modern browser (Chrome 54+, Firefox 38+, Safari 15.4+, Edge 79+)
- No cross-origin restrictions

## Performance Optimization

1. **Enable gzip compression** on your hosting platform
2. **Add CDN** for global distribution (most platforms do this automatically)
3. **Set proper cache headers** for static assets

## Security

PresentPilot is a client-side only app with:
- ✅ No backend
- ✅ No external API calls
- ✅ No tracking
- ✅ No data collection
- ✅ All data stored locally in browser

Perfect for presentations with sensitive content!

