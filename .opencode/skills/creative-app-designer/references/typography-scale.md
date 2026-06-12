# Typography Scale

## The Golden Ratio Scale

Base: 16px (body)

| Name | Size | Weight | Use Case |
|---|---|---|---|
| Display | 57px | Bold (700) | Hero numbers, large stats |
| Heading 1 | 32px | Bold (700) | Screen titles |
| Heading 2 | 24px | SemiBold (600) | Section headers |
| Heading 3 | 20px | SemiBold (600) | Card titles, subsection |
| Body Large | 18px | Regular (400) | Lead paragraphs, intro text |
| Body | 16px | Regular (400) | Primary text |
| Body Small | 14px | Regular (400) | Secondary text, captions |
| Label | 12px | Medium (500) | Chips, badges, button text |
| Overline | 10px | Medium (500) | Category labels, timestamps |

Multiply by 1.250 (Major Third) or 1.333 (Perfect Fourth) for modular scale.

---

## Font Stack

### Primary (system fonts — fastest loading)
```
iOS:    -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif
Android: 'Roboto', 'Noto Sans', sans-serif
Web:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Display (for headlines and brand moments)
```
'Playfair Display' — Elegant, editorial, luxury
'Space Grotesk' — Modern, technical, sharp
'Poppins' — Friendly, rounded, approachable
```

---

## Line Height Rules

| Font Size | Min | Optimal | Max |
|---|---|---|---|
| 10–14px | 1.3 | 1.4–1.5 | 1.6 |
| 16–20px | 1.4 | 1.5–1.6 | 1.7 |
| 24–32px | 1.2 | 1.25–1.4 | 1.5 |
| 40–57px | 1.1 | 1.15–1.25 | 1.3 |

Small text needs more line height for readability. Large text can be tighter.

---

## Letter Spacing

| Use | Value |
|---|---|
| Display (32px+) | -0.5px to -1px (tighter) |
| Headings | -0.25px to 0 |
| Body | 0 (default) |
| Labels / Overline | 0.5px to 1px (wider, uppercase) |
| Buttons | 0.5px |

---

## Reading Width

Target: **45–75 characters per line** (≈300–500px on mobile)

```
300px container  → ~35 chars (short paragraphs)
360px container  → ~45 chars (ideal)
480px container  → ~60 chars (desktop)
```

Lines too short = choppy reading. Lines too long = eye fatigue tracking back.

---

## Accessibility

- Minimum: **12sp** for non-critical (captions, hints)
- Minimum: **14sp** for body text
- Minimum: **16sp** for user-generated content
- Never use font sizes below **10sp**
- Line height below 1.2 makes text feel cramped