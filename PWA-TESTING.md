# PWA Testing Guide 🧪

Quick guide to test your Dicebound PWA implementation.

## 🚀 Quick Start

### 1. Generate Icons (5 minutes)
```bash
# Open the icon generator in your browser
open scripts/generate-placeholder-icons.html

# Or navigate to it manually
# Click "Download All" and save icons to public/icons/
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test in Browser

#### Chrome/Edge (Desktop)
1. Open http://localhost:3000
2. Press F12 → Application tab
3. Check "Manifest" section - should show all icons
4. Check "Service Workers" - should show registered worker
5. Look for install button in address bar (⊕ icon)
6. Click to install

#### Mobile Testing (Real Device)
1. Deploy to production (Vercel/Netlify)
2. Open in mobile browser (Chrome/Safari)
3. Look for "Add to Home Screen" prompt
4. Install and test

## ✅ Checklist

### Manifest
- [ ] Manifest loads at `/manifest.json`
- [ ] All icon paths are correct
- [ ] Theme color shows in browser UI
- [ ] App name displays correctly

### Service Worker
- [ ] Registers successfully (check console)
- [ ] Caches essential assets
- [ ] Works offline (DevTools → Network → Offline)
- [ ] Updates automatically

### Install Prompt
- [ ] Shows after 30 seconds
- [ ] Can be dismissed
- [ ] Remembers dismissal for 7 days
- [ ] Install button works

### Offline Mode
- [ ] App loads when offline
- [ ] Cached pages work
- [ ] Fallback page shows for uncached routes
- [ ] Online/offline transitions smoothly

### Icons
- [ ] All sizes present in public/icons/
- [ ] Icons display in install prompt
- [ ] Home screen icon looks good
- [ ] Splash screen shows icon

## 🔍 Debugging

### Service Worker Not Registering?
```javascript
// Check console for errors
// Common issues:
// - Not on HTTPS (use localhost for dev)
// - sw.js not in public folder
// - Browser cache (hard refresh: Ctrl+Shift+R)
```

### Install Prompt Not Showing?
```javascript
// Check:
localStorage.getItem('pwa-install-dismissed') // Should be null or old
// Clear if needed:
localStorage.removeItem('pwa-install-dismissed')
```

### Icons Not Loading?
```bash
# Verify files exist:
ls -la public/icons/

# Check manifest paths match filenames
# Check browser Network tab for 404s
```

## 📱 Platform-Specific Testing

### iOS (Safari)
- No install prompt (manual only)
- User must: Share → Add to Home Screen
- Test standalone mode
- Check status bar styling

### Android (Chrome)
- Install prompt should show
- Test "Add to Home Screen"
- Check notification permission
- Test app shortcuts

### Desktop (Chrome/Edge)
- Install button in address bar
- Test window controls
- Check app icon in taskbar
- Test uninstall

## 🎯 Lighthouse Audit

```bash
# Run Lighthouse PWA audit
# Chrome DevTools → Lighthouse → Progressive Web App
# Target score: 90+

# Key metrics:
# - Installable
# - Fast and reliable
# - Optimized
```

## 🐛 Common Issues

### "Service Worker registration failed"
- Check sw.js is in public/ folder
- Verify HTTPS or localhost
- Clear browser cache

### "Manifest not found"
- Check manifest.json in public/
- Verify path in layout.tsx
- Check Content-Type header

### "Icons not displaying"
- Verify all icon files exist
- Check sizes match manifest
- Use absolute paths (/icons/...)

### "Install prompt never shows"
- Only works on HTTPS in production
- Chrome/Edge only (not Firefox)
- Check beforeinstallprompt event
- Clear dismissal from localStorage

## 🎮 Test Scenarios

1. **First Visit**
   - App loads
   - Service worker registers
   - Assets cache
   - Install prompt shows (after 30s)

2. **Return Visit**
   - Loads from cache (faster)
   - No install prompt if dismissed
   - Updates check in background

3. **Offline**
   - App still loads
   - Cached pages work
   - Fallback for uncached routes
   - Graceful error handling

4. **Update Available**
   - New service worker detected
   - Prompt to reload
   - Seamless update

## 📊 Success Criteria

✅ Lighthouse PWA score: 90+
✅ Installable on all platforms
✅ Works offline after first load
✅ Fast loading (< 3s)
✅ Responsive on all devices
✅ No console errors
✅ Icons display correctly
✅ Updates work smoothly

## 🚢 Production Deployment

Before deploying:
1. ✅ Replace placeholder icons with custom designs
2. ✅ Add real screenshots
3. ✅ Test on real devices
4. ✅ Run Lighthouse audit
5. ✅ Verify HTTPS
6. ✅ Test install flow
7. ✅ Check offline mode
8. ✅ Monitor service worker updates

## 📚 Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Need Help?**
- Check browser console for errors
- Use DevTools Application tab
- Test in incognito mode
- Clear cache and try again
