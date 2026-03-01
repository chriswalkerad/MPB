# Generative Event Patterns

## Overview

Create a `<GenerativePattern />` React component that renders deterministic SVG patterns for events without custom images. Replaces the current emoji fallback with visually distinctive abstract art.

## Requirements

- **20+ pattern variations** to provide visual variety across ~800 events
- **Deterministic assignment** - same event slug always produces same pattern
- **Monochromatic red palette** - fits MPB's brand identity
- **SVG-based** - crisp at any size, no external assets

## Color Palette

Red monochrome shades:

| Level | Hex Values |
|-------|------------|
| Dark | `#1a0505`, `#2d0a0a`, `#3d1010` |
| Mid | `#6b1c1c`, `#8b2525`, `#a53030` |
| Bright | `#cc4040`, `#e05555`, `#ff6b6b` |

## Pattern Types

Mix of styles, each with 2-4 variations for 20+ total:

| Style | Description |
|-------|-------------|
| Vertical lines + circle | Parallel vertical lines with circular cutout |
| Horizontal lines + square | Horizontal stripes with square negative space |
| Diagonal grid + triangle | 45° crosshatch with triangular shape |
| Concentric circles | Nested rings with varying thickness |
| Dot grid + shape | Regular dot pattern with geometric overlay |
| Wave lines | Sinusoidal waves with shape cutout |
| Radial lines | Lines emanating from corner or center |

## Component API

```jsx
<GenerativePattern seed="owasp-socal-monthly" size={100} />
```

**Props:**
- `seed` (string, required) - Event slug used to deterministically select pattern
- `size` (number, optional) - Width/height in pixels, defaults to 100

## Hash Function

Simple string-to-number hash, modulo pattern count:

```js
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

const patternIndex = hashString(seed) % PATTERNS.length
```

## Integration

In `EventCard.jsx`, replace emoji fallback:

```jsx
// Before
{image ? (
  <img src={image} alt={name} style={imageStyle} />
) : (
  <span>{typeIcon}</span>
)}

// After
{image ? (
  <img src={image} alt={name} style={imageStyle} />
) : (
  <GenerativePattern seed={event.slug} size={100} />
)}
```

## Files

| File | Action |
|------|--------|
| `src/components/GenerativePattern.jsx` | Create - new component |
| `src/components/EventCard.jsx` | Modify - use GenerativePattern |
