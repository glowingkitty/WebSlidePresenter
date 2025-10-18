# ⚡ PresentPilot - Quick Start

Get up and running in 2 minutes!

## 🏃 Quick Setup

```bash
# Navigate to the app directory
cd app

# Install dependencies (one time only)
npm install

# Start development server
npm run dev
```

Then open: http://localhost:5173

## 🎯 Quick Test

1. **Load a PDF**
   - Click "Load PDF Presentation"
   - Select any PDF file
   - Wait for slides to load

2. **Open Audience View**
   - Click "Open Audience View" button
   - New window opens
   - Press F for fullscreen

3. **Navigate**
   - Press → or Space for next slide
   - Both windows update in sync! ✨

4. **Try Timer**
   - Click "Start" in timer panel
   - Watch the time count up
   - Elapsed time shows in minutes

## 📦 Quick Deploy

### To Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from app directory)
cd app
vercel
```

Follow the prompts, and you're live!

### To Any Static Host

```bash
# Build
npm run build

# Deploy the 'build' directory to:
# - Netlify
# - GitHub Pages
# - Firebase Hosting
# - AWS S3
# - Any static file host
```

## 🎓 Next Steps

1. **Read the User Guide** - `/USER_GUIDE.md`
   - Learn all features
   - Best practices
   - Tips & tricks

2. **Setup Timing**
   - Click "Setup Timing"
   - Try "Auto-fill Equal"
   - Export as YAML

3. **Add Speaker Notes**
   - Click in notes text area
   - Type your notes
   - Auto-saves!

4. **Practice**
   - Use keyboard shortcuts
   - Watch pacing indicators
   - Get comfortable

## 🆘 Quick Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Slides not syncing?**
- Refresh audience window
- Check both windows are same browser/origin

**Timer not starting?**
- Click "Start" button manually
- Or navigate to slide 1

## 💡 Pro Tips

1. **Keyboard shortcuts are faster** - Learn them!
2. **Export timing** - Reuse for next time
3. **Test your setup** - Before the big day
4. **Use fullscreen** - F key in audience view
5. **Don't stress over seconds** - Minutes-only display by design

## 📚 Full Documentation

- 📖 **USER_GUIDE.md** - Complete user manual
- 🚀 **DEPLOYMENT.md** - Deployment options
- 📋 **README.md** - Project overview
- 📊 **IMPLEMENTATION_SUMMARY.md** - Technical details

## 🎉 You're Ready!

That's it! You now have a professional presentation tool.

**Happy Presenting! 🎤**

---

**Questions?** Check the documentation files above.
**Issues?** Review IMPLEMENTATION_SUMMARY.md for troubleshooting.

