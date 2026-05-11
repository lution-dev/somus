# SOMUS — APP DESIGN SYSTEM

## Official Product UI System

For:
- Developers
- Designers
- Product Team
- AI Agents
- Frontend Systems

---

# 1. Product Philosophy

Somus is a calm financial experience.

The interface should feel:
- breathable
- emotionally safe
- elegant
- intelligent
- minimal
- human
- atmospheric

Never:
- aggressive
- overloaded
- noisy
- hyperactive
- fintech-generic

---

# 2. Platform Experience

# Mobile Experience

Mobile should feel:
- immersive
- calm
- fluid
- intimate
- focused

The app should prioritize:
- one primary action per screen
- breathing spaces
- thumb-friendly layouts
- visual hierarchy

---

# Desktop Experience

Desktop should feel:
- organized
- productive
- premium
- spacious
- contextual

Desktop layouts should:
- use larger spacing
- prioritize dashboard clarity
- support deeper analysis
- preserve atmospheric depth

---

# 3. Color System

## Primary Colors

```css
--somus-blue: #2563EB;
--somus-cyan: #22D3EE;
--somus-background: #0B1220;
--somus-surface: #111827;
--somus-white: #FFFFFF;
```

---

## Desktop Layout Colors

### Main Background

```css
background: #070F1F;
```

### Sidebar Background

```css
background: #0D1528;
```

Sidebar should feel:
- slightly deeper
- more focused
- structured
- elegant

Never pure black.

---

## Surface Colors

```css
--surface-primary: rgba(14, 22, 42, 0.58);
--surface-secondary: rgba(16, 25, 48, 0.78);
--surface-border: rgba(255,255,255,0.08);
```

---

# 4. Atmospheric Material System

## Philosophy

Somus uses atmospheric materials to create calm and emotionally intelligent interfaces.

The UI should feel:
- layered
- breathable
- elegant
- soft
- contextual

---

## Blur System

```css
backdrop-filter: blur(24px) saturate(140%);
```

---

## Glow System

Glow should be:
- atmospheric
- indirect
- subtle
- premium

Never dominant.

---

## Shadows

```css
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.06),
  0 10px 40px rgba(0,0,0,0.35);
```

---

# 5. Typography

## Primary Font

```txt
Satoshi
```

---

## Font Weights

```txt
Regular
Medium
Semibold
```

---

## Typography Direction

- elegant spacing
- large breathing room
- readability first
- avoid aggressive bold

---

# 6. Border Radius

## Main Radius

```css
border-radius: 20px;
```

---

## Large Surfaces

```css
border-radius: 28px;
```

---

## Pills

```css
border-radius: 999px;
```

---

# 7. Grid & Layout

## Mobile Padding

```css
padding: 20px;
```

---

## Desktop Padding

```css
padding: 32px;
```

---

## Grid Spacing

```css
gap: 24px;
```

---

# 8. Navigation System

## Mobile Navigation

Should feel:
- minimal
- thumb-friendly
- calm
- clean

Use:
- floating navigation
- atmospheric surfaces
- soft glow

---

## Desktop Sidebar

Sidebar should:
- feel stable
- create structure
- maintain calm depth
- support focus

Use:
- darker surface
- subtle transparency
- elegant hierarchy

---

# 9. Component System

# Buttons

Buttons should feel:
- soft
- premium
- accessible
- calm

Avoid:
- aggressive gradients
- excessive glow
- hard shadows

---

# Cards

Cards should:
- separate information clearly
- use subtle depth
- maintain breathing room
- feel lightweight

---

# Inputs

Inputs should feel:
- breathable
- lightweight
- readable
- calm

---

# Charts

Charts should:
- explain
- guide
- reduce anxiety
- show healthy evolution

Never:
- resemble trading platforms
- create urgency

---

# 10. Motion System

## Motion Philosophy

Motion should feel:
- smooth
- continuous
- soft
- almost invisible

---

## Hover States

Hover should:
- elevate subtly
- improve focus
- maintain calmness

---

## Transition Timing

```css
transition: all 0.35s ease;
```

---

# 11. Official Icons

## Icon Style

Icons should be:
- rounded
- minimal
- lightweight
- readable
- emotionally soft

---

# Essential Division Icon

```svg
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 46L32 20L46 46"
        stroke="#22D3EE"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

Represents:
- foundation
- stability
- structure

---

# Financial Freedom Icon

```svg
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 40C20 28 28 28 32 40C36 52 44 52 50 24"
        stroke="#4DE2E2"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"/>

  <path d="M46 28L50 24L54 28"
        stroke="#4DE2E2"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

Represents:
- growth
- upward construction
- financial evolution

---

# Goals Icon

```svg
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="16"
          stroke="#8B5CF6"
          stroke-width="2.5"/>

  <circle cx="32" cy="32" r="7"
          stroke="#8B5CF6"
          stroke-width="2.5"/>
</svg>
```

Represents:
- direction
- focus
- objectives

---

# Education Icon

```svg
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 22C18 20.9 18.9 20 20 20H30C33.3 20 36 22.7 36 26V44H24C20.7 44 18 41.3 18 38V22Z"
        stroke="#F59E0B"
        stroke-width="2.5"
        stroke-linejoin="round"/>

  <path d="M46 22C46 20.9 45.1 20 44 20H34C30.7 20 28 22.7 28 26V44H40C43.3 44 46 41.3 46 38V22Z"
        stroke="#F59E0B"
        stroke-width="2.5"
        stroke-linejoin="round"/>
</svg>
```

Represents:
- learning
- wisdom
- continuous growth

---

# Tithing Icon

```svg
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 16V48"
        stroke="#10B981"
        stroke-width="2.5"
        stroke-linecap="round"/>

  <path d="M20 28H44"
        stroke="#10B981"
        stroke-width="2.5"
        stroke-linecap="round"/>
</svg>
```

Represents:
- purpose
- generosity
- spiritual balance

---

# 12. Allowed Styles

- atmospheric depth
- subtle glass
- premium minimalism
- emotional clarity
- elegant hierarchy
- soft glow
- calm transitions
- breathable layouts

---

# 13. Forbidden Styles

Never use:
- cyberpunk
- excessive blur
- neon overload
- aggressive gradients
- cluttered layouts
- futuristic excess
- dominant glow
- hyperactive animations

---

# 14. AI Generation Rules

## NEVER GENERATE
- aggressive fintech visuals
- noisy dashboards
- trading aesthetics
- overloaded interfaces
- exaggerated glass effects

## ALWAYS PRIORITIZE
- calm technology
- emotional clarity
- organization
- continuity
- subtle sophistication
- premium atmosphere

---

# 15. Experience Goal

Every Somus interface should make users feel:

> “Minha vida financeira parece mais organizada, clara e equilibrada.”

Not:

> “Preciso correr atrás.”

