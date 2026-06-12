# Color Theory Reference

## Core Principles

### Hue, Saturation, Lightness (HSL)
- **Hue**: The color itself (0–360° on the color wheel)
- **Saturation**: Intensity (0% = gray, 100% = pure color)
- **Lightness**: Light vs dark (0% = black, 100% = white)

Tip: Keep saturation between 40–70% for large areas. Reserve 100% saturation for accents only.

### Color Temperature
- **Warm** (0°–90° red-orange, 330°–360° magenta-red): Advances, energizes, urgency
- **Cool** (180°–270° cyan-blue): Recedes, calms, trust, reliability
- **Neutral** (90°–180° yellow-green, 270°–330° violet): Balanced, professional, calm

### Contrast
```
AA Standard:   4.5:1 for normal text, 3:1 for large text/UI
AAA Standard:  7:1 for normal text, 4.5:1 for large text/UI
```

Use `scaled-colors` or Figma's contrast checker. Never guess.

---

## Harmony Systems

### Complementary
- Colors opposite on the wheel (+180°)
- High tension, high energy
- Use for: toggle states, on/off, alerts
- **Warning**: Use with caution — can cause vibration if saturation is similar

### Analogous
- Colors adjacent on the wheel (30° apart)
- Harmonious, cohesive, professional
- Use for: full-color UI, data visualization
- **Warning**: Can feel flat if not broken with neutral

### Triadic
- Three colors equidistant (120° apart)
- Vibrant yet balanced
- Use for: brand identity, badges, category tags
- **Warning**: One color must dominate (60-30-10 split)

### Split-Complementary
- Base color + two colors adjacent to its complement
- Less tense than complementary, more distinct than analogous
- Use for: category selection, multi-state systems

### Monochromatic
- Single hue with varying lightness/saturation
- Cleanest, most professional
- Use for: data tables, form fields, neutral UI
- **Warning**: Can feel sterile — use texture or motion to add interest

---

## Dark Mode Color Shifting

Light mode: shadows are dark.
Dark mode: shadows are light.

```
Light mode surface:  #FFFFFF with shadow rgba(0,0,0,0.1)
Dark mode surface:   #1E293B with highlight rgba(255,255,255,0.05)
```

Never just invert colors. Shift hue toward the background color:
- Light gray in light mode → cool gray (#94A3B8) in dark mode
- Warm gray in light mode → warm gray (#A8A29E) in dark mode

---

## Status Colors

| Meaning | Light Mode | Dark Mode |
|---|---|---|
| Success | #10B981 | #34D399 |
| Warning | #F59E0B | #FBBF24 |
| Error | #EF4444 | #F87171 |
| Info | #3B82F6 | #60A5FA |

## Accessibility Reminders

- Never convey meaning by color alone
- 8% of men have red-green colorblindness
- Use icons + text for critical states
- Test with grayscale filter