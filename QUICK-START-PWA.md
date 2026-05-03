# 🚀 Quick Start - PWA Setup (5 Minutes)

Get your Dicebound PWA running in 5 minutes!

## Step 1: Generate Icons (2 minutes)

### Option A: Quick Placeholders
```bash
# Open the icon generator
open scripts/generate-placeholder-icons.html

# Click "Download All"
# Save all files to public/icons/
```

### Option B: Online Generator
1. Go to https://realfavicongenerator.net/
2. Upload a 512x512 image (dice emoji works!)
3. Download the package
4. Extract to `public/icons/`

## Step 2: Test Locally (1 minute)

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

### Verify in DevTools:
1. Press F12
2. Go to "Application" tab
3. Check "Manifest" - should show your icons
4. Check "Service Workers" - should show "activated"

## Step 3: Test Install (1 minute)

### Desktop:
- Look for ⊕ icon in address bar
- Click to install
- App opens in standalone window

### Mobile (requires production):
- Deploy to Vercel/Netlify
- Open on phone
- Look for "Add to Home Screen"
- Install and test

## Step 4: Test Offline (1 minute)

1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh page
4. App should still load! ✅

## ✅ Done!

Your PWA is ready! 🎉

### What You Get:
- ✅ Installable on all devices
- ✅ Works offline
- ✅ Fast loading
- ✅ App-like experience

### Next Steps:
- Replace placeholder icons with custom designs
- Add screenshots to `public/screenshots/`
- Deploy to production
- Share with players!

---

**Need help?** Check:
- `PWA-IMPLEMENTATION-COMPLETE.md` - Full guide
- `PWA-TESTING.md` - Testing details
- `PWA-SETUP.md` - Setup instructions
