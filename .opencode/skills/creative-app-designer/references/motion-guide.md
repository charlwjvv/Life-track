# Motion Design Guide

## Why Motion Matters

Motion communicates state faster than text:
- **Fade + scale in** = "arrived / created / appeared"
- **Fade + scale out** = "left / deleted / dismissed"
- **Slide up** = "modal / overlay / new context"
- **Shake** = "error / rejected / invalid"

Every animation should answer: "What changed?" If you can't answer that, remove the animation.

---

## Easing Curves

### iOS (CAMediaTimingFunction)
```
Standard:    ease-in-out (default for most transitions)
Ease out:    ease-out (content entering — feels natural)
Snappy:      ease-in (quick departure — feels responsive)
Bounce:      spring (interactive feedback)

React Native: useTiming / useSpring from react-native-reanimated
CSS:         cubic-bezier(0.4, 0, 0.2, 1)
```

### Material Design 3
```
Standard:     300ms, easing: 0.2, 0, 1, 1
Entering:     250ms, easing: 0, 0, 1, 1
Exiting:      200ms, easing: 0.4, 0, 1, 1
```

### Standard Timing
```
Duration    Use
─────────────────────────────────────────────────────
50ms        Micro-interactions (hover, press feedback)
150ms       Small transitions (icon change, state toggle)
300ms       Standard transitions (screen open, modal appear)
500ms       Large transitions (page navigation, complex animations)
```

---

## Screen/Modal Animations

### Enter
```tsx
// Modal / screen appearing
opacity: 0 → 1
scale: 0.95 → 1.0
duration: 300ms
easing: ease-out

React Native: enteringStyle={{ opacity: 0, scale: 0.95 }}
              entering={FadeIn.duration(300)}
```

### Exit
```tsx
// Modal / screen disappearing
opacity: 1 → 0
scale: 1.0 → 0.95
duration: 200ms
easing: ease-in (faster exit = snappier)
```

---

## Micro-interactions

### Button Press
```tsx
// On press in
scale: 1 → 0.96
duration: 100ms

// On press out
scale: 0.96 → 1 (spring back)
duration: 200ms
```

### Toggle Switch
```tsx
// Track color change + thumb slide
duration: 200ms
easing: ease-in-out

Thumb: translateX follows track width with spring
Track: background color crossfades
```

### Pull to Refresh
```tsx
// Pull down
Icon rotates, opacity increases with distance

// Release triggers refresh
Icon spins continuously
// Done: checkmark appears briefly, then fades out
```

---

## Loading States

### Skeleton Shimmer
```css
/* Gradient sweeps across skeleton surfaces */
background: linear-gradient(
  90deg,
  #f0f0f0 0%,
  #e0e0e0 50%,
  #f0f0f0 100%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Spinner
- Use only when the expected wait is >1s
- Centered, 20–24dp diameter, 2px stroke
- Matches primary color or accent
- For <1s waits: skeleton or no loading indicator

---

## Error Animations

### Shake
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-10px); }
  40%       { transform: translateX(10px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}
duration: 400ms
```

### Success Check
```tsx
// Green circle draws in
stroke-dashoffset animates from full → 0
// Checkmark draws second
// Then fade out after 1.5s
```

---

## Accessibility

`prefers-reduced-motion`: When enabled:
- Remove all animations except functional transitions (screen navigation)
- Keep transition duration to 0ms (instant)
- Check system settings via `AccessibilityInfo.isReduceMotionEnabled()`

```tsx
const [reduceMotion, setReduceMotion] = useState(false);
AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
```