# UX Patterns Reference

## Navigation

### Tab Bar (Bottom)
- **Best for**: 3–5 equally important, always-accessible destinations
- **Height**: 56–64dp + safe area
- **Icons**: Outlined (inactive) → Filled (active) + label below
- **Badges**: Dot for notifications, number for count (max "99+")
- **Never**: More than 5 tabs, or tabs that aren't destinations

### Stack Navigation
- **Best for**: Linear flows (checkout, onboarding, drill-down lists)
- **Back button**: Always present, top-left, chevron + "Back" text
- **Title**: Top-center, single line, truncated if long
- **Actions**: Top-right, icon or text button

### Floating Action Button (FAB)
- **Best for**: Single primary action on a content screen (create, add, compose)
- **Position**: Bottom-right, 16dp margin from edges + safe area
- **Size**: 56dp diameter (Mini FAB: 40dp for secondary actions)
- **Never**: Use for navigation. Not for actions that aren't "create".

### Bottom Sheet / Modal
- **Best for**: One-time tasks that interrupt the current flow (filter, sort, quick actions)
- **Behavior**: Slide up from bottom, drag to dismiss
- **Handle**: 4dp × 32dp rounded bar at top, centered
- **Max height**: 90% of screen height — always show part of the underlying screen

### Drawer Navigation
- **Best for**: Settings, profile, secondary navigation
- **Width**: 80% of screen or 280dp (whichever is smaller)
- **Overlay**: Semi-transparent scrim (#000000 at 50% opacity)
- **Animation**: Slide in from left (LTR languages)
- **Trigger**: Hamburger icon in header OR swipe from left edge
- **Warning**: Rarely needed. Tab bar is almost always better.

---

## Lists

### Flat List
- **Item height**: 72dp minimum for touch targets
- **Padding**: 16dp horizontal
- **Dividers**: 1dp line, #E5E7EB, full-width or inset 16dp
- **Tap feedback**: Ripple (Android), highlight (iOS)
- **Swipe actions**: Delete, archive, or secondary action. Red = destructive.

### Expandable List
- **Chevron**: Rotates 180° on expand (300ms)
- **Animation**: Height expands with ease-out
- **Indentation**: Child items indented 24dp from parent

### Grouped List
- **Header**: 14sp, uppercase, primary color or gray
- **Footer**: 14sp, secondary gray, describes the section
- **Separator**: 8dp gap between groups, no border on last item

---

## Forms

### Input Fields
- **Height**: 48dp minimum
- **Label**: Above field, 12sp, secondary color
- **Border**: 1dp, gray → primary on focus
- **Padding**: 16dp horizontal, 12dp vertical
- **Error**: Red border + error message below (never inline in field)
- **Helper text**: 12sp, gray, disappears when user starts typing

### Buttons
| Type | Height | Radius | Use |
|---|---|---|---|
| Primary | 48dp | 8dp | Main action, filled |
| Secondary | 48dp | 8dp | Secondary action, outlined |
| Ghost | 40dp | 8dp | Tertiary, text only |
| Destructive | 48dp | 8dp | Delete, danger, red |

- **Tap area**: Full width on mobile
- **Loading**: Show spinner inside button, keep label
- **Disabled**: 50% opacity, no pointer events

---

## Empty States

Every list/screen with data must have an empty state:
- **Illustration**: Simple, single-color SVG (not emoji)
- **Headline**: 20sp, what the user should do
- **Body**: 14sp, why it matters
- **CTA**: Button to create the first item

---

## Onboarding

- **Screens**: 3 max, each with a single focus
- **Skip**: Text button, top-right
- **Progress**: Dot indicators, bottom-center
- **Final screen**: "Get Started" CTA
- **Storage**: Remember completion so it doesn't show again

---

## Error States

- **Network error**: Illustration + "No connection" + Retry button
- **Empty result**: "No [items] found" + suggestion to adjust filters
- **Server error**: "Something went wrong" + Retry button
- **Auth error**: "Session expired" → redirect to login

---

## Feedback Patterns

| Feedback | Duration | Use When |
|---|---|---|
| Snackbar / Toast | 3–5s | Confirmation after action, non-critical |
| Banner | Until dismissed | Warnings that block workflow |
| Dialog | User dismisses | Confirm destructive action |
| Inline error | Until fixed | Form field validation |
| Loading spinner | >1s wait | Non-blocking process |
| Skeleton | Any wait | Content loading — shows structure |