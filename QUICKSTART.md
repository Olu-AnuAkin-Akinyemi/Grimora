# Grimora - Quick Start Guide

## 🎯 You're Ready to Test!

Everything has been built and is ready to run. Here's how to get started:

---

## 🚀 Run the App (3 Options)

### Option 1: Python HTTP Server (Recommended)
```bash
# Navigate to project root
cd /Users/reogalor/Documents_local/Code_Projects/Grimora

# Start server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/client
```

### Option 2: Node HTTP Server
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run from project root
http-server -p 8000

# Open in browser
http://localhost:8000/client
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `client/index.html`
3. Select "Open with Live Server"

---

## ✅ What to Test

### Cover View
1. Page loads with dark background
2. Cyan glowing emblem visible
3. "GRIMORA" title with tagline
4. Floating torus knot sigil (THREE.js)
5. Ambient particles drifting
6. "Open Grimora" button glows on hover

### Cover → Hub Transition
1. Click "Open Grimora"
2. Camera zooms out smoothly
3. Book "opens" (pages appear)
4. Four sigils scale up and begin animating
5. Hall cards become visible
6. Transition takes ~1.2 seconds

### Hub View
1. Four Hall cards visible:
   - Math Sanctum (cyan torus knot)
   - Matter Lab (orange octahedron)
   - Hall of Ma'at (gold feather)
   - Machina Workshop (green gear)
2. Each sigil rotates and floats
3. Cards glow on hover
4. "Sign In" button in header

### Auth Modal
1. Click "Sign In" button
2. Modal slides in with overlay
3. Discord and Google options visible
4. Click either → "Initiate" appears in header
5. Close modal with X or overlay click

### Mobile View
1. Resize browser to mobile width (<768px)
2. Hall cards stack vertically
3. Sigils remain visible and animated
4. Touch interactions work smoothly
5. Performance stays at 60fps

---

## 🔍 Check Console

You should see:
```
🔮 Initializing Grimora...
Initializing THREE.js scene...
[SceneManager] Initialized { isMobile: false, pixelRatio: 2, ... }
THREE.js scene initialized
[Commander] Initialized
[State] Loaded from storage
[Commander] Ready
✨ Grimora initialized successfully
[Commander] Transitioning to hub...
[State] View changed: cover → hub
```

---

## 🐛 Common Issues & Fixes

### Issue: "THREE.js not loading"
**Fix:** Check browser console for CORS errors. Must run from localhost, not `file://`

### Issue: "Sigils not visible"
**Fix:** Check WebGL support. Open console and type:
```javascript
window.Grimora.sceneManager.scene.children
// Should show multiple objects
```

### Issue: "Performance stuttering"
**Fix:** 
1. Check GPU acceleration enabled
2. Close other tabs
3. Try different browser (Chrome recommended)

### Issue: "Modal not appearing"
**Fix:**
1. Check console for errors
2. Verify DOM loaded completely
3. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

---

## 🎨 Visual Test Checklist

✅ **Colors:**
- Background: Very dark (#0d0d0d)
- Primary glow: Cyan (#00d9ff)
- Text: Light gray (#e0e0e0)

✅ **Animations:**
- Sigils rotate continuously
- Sigils float up/down gently
- Buttons glow on hover
- Smooth transitions (no jank)

✅ **Layout:**
- Desktop: 2x2 Hall grid
- Mobile: Single column stack
- Responsive at all sizes

---

## 🔬 Advanced Testing

### Test Sigil Factory Independently
```bash
# Open test.html
open client/test.html
# or
http://localhost:8000/client/test.html
```

Should show two sigils side-by-side (Math + Chem)

### Inspect Scene Graph
```javascript
// In browser console
window.Grimora.sceneManager.scene.traverse((obj) => {
  console.log(obj.type, obj.name || 'unnamed');
});
```

### Check Mobile Detection
```javascript
window.Grimora.sceneManager.isMobile
// Should return true/false
```

### Manually Trigger Transitions
```javascript
// Go to hub from cover
window.Grimora.commander.transitionToHub();

// Open auth modal
window.Grimora.commander.openAuthModal();

// Sign in (mock)
window.Grimora.commander.handleDiscordAuth();
```

---

## 📱 Mobile Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon (Cmd+Shift+M)
3. Select device: iPhone 12 Pro, Galaxy S21, etc.
4. Test touch interactions
5. Check performance tab (should maintain 60fps)

### Real Device Testing
1. Find your local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Make sure device on same WiFi
3. Visit `http://YOUR_IP:8000/client`
4. Test touch gestures, scrolling, performance

---

## 🎮 User Interaction Flow

```
1. Load Page
   ↓
2. Cover View
   - See glowing sigil
   - Read title
   ↓
3. Click "Open Grimora"
   ↓
4. Hub View
   - See 4 Hall cards
   - Each with animated sigil
   ↓
5. Click "Sign In"
   ↓
6. Auth Modal
   - Choose Discord or Google
   - Mock sign-in completes
   ↓
7. Back to Hub
   - "Initiate" shown in header
   - Progress saved to localStorage
```

---

## 📊 Performance Expectations

### Desktop (1080p, Modern GPU)
- **FPS:** 60fps solid
- **Load Time:** <2s
- **Transition:** Smooth, no drops

### Mobile (iPhone 12+, Galaxy S21+)
- **FPS:** 50-60fps
- **Load Time:** <3s
- **Transition:** Smooth with minor drops acceptable

### Mobile (Older Devices)
- **FPS:** 30-45fps
- **Load Time:** <5s
- **Transition:** May have brief stutter

---

## 🛠️ Next Steps If Everything Works

1. **Commit changes:**
```bash
git add .
git commit -m "feat: Implement THREE.js foundation with mobile optimization"
git push origin main
```

2. **Deploy to Vercel/Netlify (optional):**
   - Connect GitHub repo
   - Set build command: (none needed)
   - Set publish directory: `client`

3. **Start Phase 2:**
   - Build Hall detail view
   - Add lesson page layout
   - Implement progress tracking

---

## 🆘 Need Help?

### Check Files:
- `/BUILD_SUMMARY.md` - Complete build documentation
- Browser console - Error messages
- Network tab - Failed requests

### Debugging Tools:
```javascript
// Scene info
window.Grimora.sceneManager.scene

// Current view
window.Grimora.commander.state.currentView

// User data
window.Grimora.commander.auth.getCurrentUser()
```

---

## ✨ You're All Set!

If you see the cover with a glowing cyan sigil and can transition to the hub with 4 animated Hall sigils, **you're good to go!**

Enjoy building the rest of Grimora! 🔮📚

---

*Built for KemKnightRanger Academy - Where ancient wisdom meets modern technology*
