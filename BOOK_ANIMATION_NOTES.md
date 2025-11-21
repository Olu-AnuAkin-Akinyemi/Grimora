# Book Opening Animation - Implementation Notes

## Overview
The Grimora app now features a realistic book-opening animation that transitions from the closed cover view to the open hub view.

## Architecture Changes

### CoverView3D (Closed Book)
**File:** `client/JS/three/views/coverView3D.js`

**Structure:**
- `bookGroup` - Parent container for all book components
- `leftCover` - Left cover that rotates open
- `rightCover` - Right cover that rotates open  
- `spine` - Central spine (pivot point for rotation)
- `centralSigil` - Grimora symbol on front cover

**Animation Flow:**
1. Book starts closed (covers flat)
2. When user clicks "Enter the Grimora", `hide()` method is called
3. `animateBookOpening()` rotates covers ~100° apart (Math.PI * 0.55 radians each)
4. Covers pivot from their inner edge (spine side)
5. Central sigil fades out and floats up
6. Camera pulls back and up via `animateCameraOut()`

**Key Parameters:**
- Opening duration: 1500ms
- Left cover rotation: -Math.PI * 0.55 (counterclockwise)
- Right cover rotation: Math.PI * 0.55 (clockwise)
- Easing: Cubic ease-out for smooth, natural motion
- Camera end position: (0, 3, 10) looking down at open book

### HubView3D (Open Book)
**File:** `client/JS/three/views/hubView3D.js`

**Structure:**
- Left and right covers already in open position (Math.PI * 0.55)
- Spine in center
- Inner page layers for depth
- Four Hall sigils floating above pages

**Positioning:**
- Math Sanctum (top-left): (-2, 1, 0.5)
- Matter Lab (top-right): (2, 1, 0.5)
- Hall of Ma'at (bottom-left): (-2, -1, 0.5)
- Machina Workshop (bottom-right): (2, -1, 0.5)

## Transition Sequence

```
CLOSED STATE (CoverView3D)
    ↓
User clicks "Enter the Grimora"
    ↓
Commander.transitionToHub() called
    ↓
CoverView3D.hide() starts:
  - animateBookOpening() (covers rotate)
  - animateCameraOut() (camera pulls back)
    ↓
CoverView3D hidden
    ↓
HubView3D.show() called
    ↓
OPEN STATE (HubView3D)
```

## Visual Details

### Closed Book
- Dark stone texture (#0d0d0d)
- Glowing cyan sigil (#00d9ff) 
- Subtle embossing on title text
- Camera positioned at (0, 0, 5)

### Opening Animation
- Covers rotate symmetrically from center spine
- Smooth cubic easing for natural book feel
- Sigil fades during transition
- Camera lifts to bird's-eye view

### Open Book  
- Left and right covers spread wide
- Inner pages visible for depth
- Four glowing Hall sigils (math, chem, lore, physeng)
- Camera at elevated angle (0, 3, 10)

## Mobile Optimization
- Animation durations same across devices
- Easing functions optimized for 60fps
- Bloom effects automatically reduced on mobile
- Pixel ratio capped at 1.5 on mobile devices

## Testing
To test the book opening:
1. Start server: `python3 -m http.server 8000`
2. Open http://localhost:8000
3. Click "Enter the Grimora" button
4. Watch covers smoothly rotate open
5. Hub view should appear with four Hall sigils

## Customization

### To adjust opening speed:
In `coverView3D.js`, modify `animateBookOpening()`:
```javascript
const duration = 1500; // Change this value (milliseconds)
```

### To adjust opening angle:
```javascript
const endRotation = { 
  left: -Math.PI * 0.55,  // More negative = wider open
  right: Math.PI * 0.55   // More positive = wider open
};
```

### To change camera end position:
In `animateCameraOut()`:
```javascript
const endPosition = { x: 0, y: 3, z: 10 }; // Modify these values
```

## Future Enhancements
- Add subtle page-turning sound effect
- Implement close animation (reverse of opening)
- Add micro-animations for cover texture during open
- Consider adding shadow/lighting changes during transition
