---
name: creative-app-designer
description: Use when designing or improving mobile app UI/UX, crafting visually striking interfaces, understanding human behavior and attention patterns, and making apps that stand out to the human eye.
---

# Creative App Designer

A master of visual design and human behavior, specialized in mobile interfaces that captivate and convert.

## Core Philosophy

**Humans are visual hunters.** We process images 60,000x faster than text. We notice movement before meaning. We trust faces over fonts. Design that ignores this is invisible.

**Two rules:**
1. If it doesn't guide the eye, remove it.
2. If it doesn't serve the user, cut it.

---

## Human Behavior Principles

### Attention
- **F-pattern**: Users scan top-left to bottom-right in an F-shape. Place critical actions along this path.
- **Saccade suppression**: Rapid eye movements cause visual drops. Large, slow transitions feel more intentional.
- **Contrast hierarchy**: The brightest/darkest/most saturated element gets looked at first. Only one per screen.
- **The "blink" moment**: On first impression (1.5–2s), users decide trust and quality. Design for that moment.

### Pattern Recognition
- **Familiarity breeds speed**: Use established patterns (tab bars, pull-to-refresh, floating buttons) — don't reinvent navigation.
- **Faces override everything**: A single human face draws more attention than any CTA button.
- **Motion carries meaning**: Opacity fades = "gone". Scale up = "arrived". Parallax = "depth". Use motion to communicate, not decorate.
- **Thumb zones**: 60% of mobile interaction happens with one thumb. Primary actions within the bottom 60% of the screen.

### Color & Contrast
- **60-30-10 rule**: 60% dominant color, 30% secondary, 10% accent.
- **Dark mode is not inverted light mode**: Shadows become light. Depth reverses. Grays shift toward the background hue.
- **Never rely on color alone**: 8% of men are colorblind. Use shape, texture, and label alongside color signals.
- **Warm colors advance, cool colors recede**: Use warm for CTAs, cool for backgrounds.

### Typography
- **Scale, don't weight**: `fontSize` is the strongest hierarchy signal. Bold is a complement, not a substitute.
- **Line height = 1.2–1.5× font size**: Tighter feels cramped. Looser feels premium.
- **Reading width**: 45–75 characters per line (roughly 300–500px on mobile). Longer = fatigue.

---

## UI/UX Checklist

### Before designing a screen, ask:
- [ ] What is the ONE thing the user must do on this screen?
- [ ] What is the visual "anchor" — the element that draws the eye first?
- [ ] What can be removed without losing function?

### Anatomy of a great mobile screen:
- **Header**: No more than 3 words. Title-case or ALL CAPS.
- **Primary action**: Large, colored, isolated — impossible to miss.
- **Secondary elements**: Below the fold or behind a tap. Never competing with primary.
- **Whitespace**: At least 40% empty space. Crowding signals low quality.

### Motion design:
- **Entry**: Fade in + scale from 0.95→1.0 (300ms ease-out) for screens/modal.
- **Exit**: Fade out + scale to 0.95 (200ms ease-in) — faster than entry feels snappy.
- **Micro-interactions**: Button press = scale to 0.96 (100ms). Release = spring back (200ms).
- **Loading**: Skeleton shimmer beats spinner. Skeleton mirrors content shape.
- **Error**: Shake animation (CSS keyframe: translateX ±10px, 3 cycles, 300ms) beats red text.

---

## Color Palettes

### Approachable (most apps):
```
Primary:    #6366F1 (indigo — trust + energy)
Secondary:  #F1F5F9 (slate-100 — neutral, breathable)
Accent:     #10B981 (emerald — success, growth, positive)
Surface:    #FFFFFF (pure white)
Text:       #1E293B (slate-800 — not pure black, softer)
Error:      #EF4444 (red-500 — attention without aggression)
```

### Dark mode base:
```
Surface:    #0F172A (slate-900)
Elevated:   #1E293B (slate-800)
Border:     #334155 (slate-700)
Text:       #F8FAFC (slate-50)
```

---

## Navigation Patterns (When to Use)

| Pattern | Use When |
|---|---|
| **Tab bar (bottom)** | 3–5 equally important destinations. Always visible. |
| **Stack navigation** | Linear flows (checkout, onboarding). Drill-down lists. |
| **Modal / Bottom sheet** | One-time tasks that interrupt (create, filter, scan). Slide up from bottom. |
| **Floating action button** | Single primary action on a content screen. Not for navigation. |
| **Drawer** | Settings, profiles, secondary nav. Rarely needed — tab bar usually better. |

---

## Iconography

- Use **outlined icons** for inactive, **filled** for active. Consistent stroke weight (2px).
- Size: 20–24dp for inline, 28–32dp for standalone tap targets.
- Never mix icon styles (Feather + Material) on the same screen.
- If you need to label an icon, the icon has failed. Icons should be self-explanatory.

---

## Accessibility

- Minimum touch target: **48×48dp**
- Contrast ratio: **4.5:1** for text, **3:1** for UI components (WCAG AA)
- Never disable pinch-to-zoom
- Reduce motion option: respect `prefers-reduced-motion` for animations
- Minimum font size: **14sp** for body, **12sp** for captions

---

## Creative Process

1. **Empathy first**: Who is using this? Under what conditions? (bright sunlight? one hand? poor connectivity?)
2. **Constraint clarity**: What's the single most important action?
3. **Sketches (rough)**: Draw 3 different layouts. Pick the most surprising one that still works.
4. **Hierarchy**: Define the visual anchor. Everything else is support.
5. **Test with distance**: Hold the design at arm's length. What do you notice first? Should it be that?
6. **Iterate with empathy**: Show real users. Watch where their eyes go.

---

## Reference Files

| File | Purpose |
|---|---|
| `references/color-theory.md` | Advanced color relationships, harmony, accessibility |
| `references/typography-scale.md` | Type scale systems, responsive sizing |
| `references/motion-guide.md` | Animation principles, easing curves, implementation |
| `references/ux-patterns.md` | Common pattern libraries with best-use guidance |

---

## Output Format

When designing, provide:
1. **Layout sketch** (ASCII or description)
2. **Visual hierarchy** — what's the anchor, what's secondary
3. **Color decisions** — why each color was chosen
4. **Motion notes** — entry, exit, micro-interactions
5. **What makes it "human"** — the insight that makes this design feel right