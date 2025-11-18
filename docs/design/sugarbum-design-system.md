# Sugarbum Design System
## "Soft Organic Modern" Aesthetic

---

## Design Philosophy

**Vibe**: Intimate, calming, playful but sophisticated
**Inspiration**: Meditation apps meet couples journaling
**Key Principle**: Make data feel warm and personal, not clinical

---

## Color Palette

### Primary Colors
```
Dusty Rose:     #E8A89A  (main brand color, warm and inviting)
Deep Navy:      #3D3B5E  (text, important CTAs, grounding)
Sage Green:     #5C8D7E  (active states, "online" indicators)
Cream:          #FFF9F5  (background, soft white)
```

### Secondary Colors
```
Coral Pink:     #F5B5A8  (lighter accent, music/activity)
Teal:           #4A9B8E  (location, movement)
Light Lavender: #C8BFE7  (rest states, evening modes)
Warm Yellow:    #F5D491  (sunshine, weather, energy)
```

### Neutrals
```
Charcoal:       #2D2D2D  (primary text)
Medium Gray:    #6B6B6B  (secondary text)
Light Gray:     #E5E5E5  (borders, dividers)
Off-White:      #FEFEFE  (cards, elevated surfaces)
```

### Status Colors
```
Active/Online:  #5C8D7E  (sage green)
Away:           #F5D491  (warm yellow)
Busy/Work:      #E8A89A  (dusty rose)
Sleeping:       #C8BFE7  (lavender)
```

---

## Typography

### Font Families
```css
/* Headers & Display */
font-family: 'Circular', 'Sofia Pro', 'Nunito', system-ui;
/* Rounded, friendly, approachable */

/* Body & UI */
font-family: 'Inter', 'DM Sans', -apple-system, system-ui;
/* Clean, readable, professional */

/* Data/Stats */
font-family: 'Space Mono', 'SF Mono', monospace;
/* For numbers, timestamps, coordinates */
```

### Type Scale
```css
/* Mobile */
H1: 32px / 600 weight / -0.5px letter-spacing
H2: 24px / 600 weight / -0.3px letter-spacing
H3: 20px / 600 weight / 0px letter-spacing
Body Large: 18px / 400 weight / 0px letter-spacing
Body: 16px / 400 weight / 0px letter-spacing
Body Small: 14px / 400 weight / 0.1px letter-spacing
Caption: 12px / 500 weight / 0.5px letter-spacing (all caps)
```

---

## Spacing System

Based on 4px grid:
```
4px   - xs   (tight spacing, icon padding)
8px   - sm   (compact elements)
12px  - md   (default gap between elements)
16px  - lg   (section padding)
24px  - xl   (card padding, major sections)
32px  - 2xl  (screen margins)
48px  - 3xl  (major section breaks)
```

---

## Border Radius

```css
Small components: 12px   (buttons, chips)
Medium cards: 20px        (status cards, modules)
Large surfaces: 28px      (full screen cards)
Avatars: 50%              (circular)
Blob shapes: organic SVG  (custom curves)
```

---

## Shadows & Elevation

```css
/* Subtle, soft shadows (no harsh drops) */
Level 1 (cards):
  box-shadow: 0 2px 8px rgba(61, 59, 94, 0.08);

Level 2 (floating):
  box-shadow: 0 4px 16px rgba(61, 59, 94, 0.12);

Level 3 (modals):
  box-shadow: 0 8px 32px rgba(61, 59, 94, 0.16);
```

---

## Component Styles

### Status Cards
```
- Organic blob-shaped backgrounds (SVG)
- Soft gradients (subtle, not aggressive)
- Illustrated icons (not Material/Feather)
- 24px padding
- 20px border radius
- Soft shadow (Level 1)
```

### Buttons

**Primary (CTA)**
```css
background: #3D3B5E (navy)
color: #FEFEFE
padding: 16px 32px
border-radius: 24px
font-weight: 600
shadow: Level 1
hover: slightly darker, lift shadow
```

**Secondary**
```css
background: transparent
border: 2px solid #E8A89A (dusty rose)
color: #3D3B5E
padding: 14px 30px
border-radius: 24px
```

**Icon Buttons**
```css
background: #FFF9F5 (cream)
size: 48px × 48px
border-radius: 50%
shadow: Level 1
icon-color: #3D3B5E
```

### Input Fields
```css
background: #FEFEFE
border: 2px solid #E5E5E5
border-radius: 16px
padding: 16px 20px
font-size: 16px
focus-border: #5C8D7E (sage)
```

---

## Illustrations & Icons

### Style Guide
- **Flat, geometric illustrations** (like your meditation app references)
- **Simple human figures** with no facial details
- **Organic plant/leaf motifs** as decorative elements
- **Rounded, friendly icon style** (not sharp/angular)
- **Consistent line weight**: 2-3px strokes

### Icon Library
Use: Phosphor Icons (rounded variant) or custom illustrated icons

---

## Animation & Motion

### Principles
- **Smooth & organic** (no harsh snaps)
- **Subtle spring physics** (slight bounce on interactions)
- **300-400ms duration** for most transitions
- **Stagger animations** for lists (50ms delay between items)

### Examples
```css
/* Button press */
transform: scale(0.95);
transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);

/* Card appear */
opacity: 0 → 1;
transform: translateY(20px) → translateY(0);
transition: 400ms ease-out;

/* Status pulse (when partner updates) */
animation: gentle-pulse 2s infinite;
@keyframes gentle-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
```

---

## Patterns & Textures

### Background Patterns
```
- Subtle organic wave patterns (like meditation app examples)
- Light line illustrations (plants, abstract shapes)
- Opacity: 5-10% (very subtle, not distracting)
- Used in headers and empty states
```

### Blob Shapes
```svg
<!-- Organic blob for status cards -->
<svg viewBox="0 0 200 200">
  <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.8,87.6,-7.2,87.4C-23.2,87.2,-38.4,83.8,-51.8,75.8C-65.2,67.8,-76.8,55.2,-83.6,40.2C-90.4,25.2,-92.4,7.8,-89.8,-8.4C-87.2,-24.6,-80,-39.6,-69.4,-51.8C-58.8,-64,-44.8,-73.4,-29.6,-79.8C-14.4,-86.2,1.8,-89.6,17.2,-87.4C32.6,-85.2,47.2,-77.4,44.7,-76.4Z" />
</svg>
```

---

## Screen-Specific Design

### Home Screen: "Adam's Now"

**Layout:**
```
┌─────────────────────────────┐
│  👤 Your Profile    ⚙️ Settings│
│                              │
│  ┌───────────────────────┐  │
│  │   [Large Status Card] │  │
│  │                       │  │
│  │   Adam's avatar       │  │
│  │   📍 At the gym       │  │
│  │   🎵 Spotify playing  │  │
│  │   ☀️ 18°C, Sunny      │  │
│  │   ⏰ Last seen 2m ago │  │
│  │                       │  │
│  └───────────────────────┘  │
│                              │
│  Quick Actions:              │
│  ┌────────┐  ┌────────┐     │
│  │ 💌 Miss│  │ 📸 Send│     │
│  │   You  │  │  Photo │     │
│  └────────┘  └────────┘     │
│                              │
│  Today's Moments:            │
│  ○ ○ ○ ○ ○ (timeline dots)  │
└─────────────────────────────┘
```

**Visual Style:**
- Large organic blob shape behind Adam's status
- Subtle plant illustration in background (faded)
- Soft gradient overlay (cream → light pink)
- Avatar has soft shadow
- Icons are illustrated style, not generic

### Daily Capsule Screen

**Layout:**
```
┌─────────────────────────────┐
│  ← Back      Daily Capsule  │
│                              │
│  📅 January 18, 2025         │
│                              │
│  ┌───────────────────────┐  │
│  │  Auto-Generated       │  │
│  │  Summary Card         │  │
│  │                       │  │
│  │  "You both crushed it │  │
│  │   today! 🎉"          │  │
│  │                       │  │
│  │  🏃 Combined: 15km    │  │
│  │  🎵 Both listened to  │  │
│  │     The xx            │  │
│  │  💬 Exchanged 47 msgs │  │
│  └───────────────────────┘  │
│                              │
│  Timeline:                   │
│  ├─ 8:00 AM: Adam at gym    │
│  ├─ 9:30 AM: Lauren at work │
│  ├─ 2:00 PM: Both climbing! │
│  └─ 8:00 PM: Movie sync     │
│                              │
└─────────────────────────────┘
```

### Miss You Button

**States:**

1. **Default State:**
   - Large circular button (120px diameter)
   - Dusty rose background with subtle gradient
   - Heart icon (illustrated, not emoji)
   - Soft pulsing animation
   - Text below: "Miss You"

2. **Pressed State:**
   - Quick scale down (0.9)
   - Ripple effect outward
   - Haptic feedback (strong)
   - Confetti burst animation

3. **Sent State:**
   - Check mark replaces heart (500ms)
   - Text changes: "Sent! 💕"
   - Shows count: "3 times this week"

### Analytics Screen

**Layout:**
```
┌─────────────────────────────┐
│  Your Journey Together       │
│                              │
│  This Week:                  │
│  ┌───────────────────────┐  │
│  │  📊 Insights Card     │  │
│  │                       │  │
│  │  Distance Traveled:   │  │
│  │  [Progress bar]       │  │
│  │  1,247 km             │  │
│  │                       │  │
│  │  Time Together:       │  │
│  │  [Curved graph]       │  │
│  │  12.5 hours           │  │
│  └───────────────────────┘  │
│                              │
│  Streaks:                    │
│  ┌────┐ ┌────┐ ┌────┐       │
│  │ 🔥 │ │ 💪 │ │ 🎵 │       │
│  │ 14 │ │ 7  │ │ 21 │       │
│  └────┘ └────┘ └────┘       │
└─────────────────────────────┘
```

**Graph Style:**
- Organic curved lines (not sharp angles)
- Soft gradient fills under curves
- Multiple colors (dusty rose, sage, coral)
- Dot markers on data points
- Smooth animations when loading

---

## Implementation Notes

### React Native Components

**Use these libraries:**
```json
{
  "react-native-svg": "For blob shapes and illustrations",
  "react-native-reanimated": "For smooth animations",
  "react-native-linear-gradient": "For soft gradients",
  "expo-haptics": "For tactile feedback",
  "lottie-react-native": "For complex animations (if needed)"
}
```

### Custom Components to Build
1. `BlobCard` - Organic shaped status container
2. `StatusAvatar` - Partner avatar with activity ring
3. `GentleButton` - Rounded button with haptics
4. `OrganicGraph` - Curved line charts
5. `PlantIllustration` - Decorative SVG backgrounds
6. `TimelineDot` - Activity timeline markers

---

## Brand Voice

**Visual Tone:** Warm, intimate, playful but not childish
**When in doubt:** Choose softer over harder, rounder over sharper, warmer over cooler

This is an app for two people who love each other across distance. Every pixel should feel like a hug.

---

## Examples from Reference

Your meditation app references show:
✅ Soft color palettes (dusty pinks, navy, sage)
✅ Illustrated characters with no facial features
✅ Plant motifs as decorative elements
✅ Organic blob shapes
✅ Clean typography hierarchy
✅ Generous white space
✅ Subtle patterns in backgrounds

We're applying ALL of this to Sugarbum.
