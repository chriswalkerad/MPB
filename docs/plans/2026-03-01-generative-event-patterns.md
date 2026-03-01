# Generative Event Patterns Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a GenerativePattern component that renders deterministic SVG patterns for events without images.

**Architecture:** A single React component with ~20 pattern generator functions. Each pattern is selected via a hash of the event slug. Patterns use red monochrome palette and mix line-based, shape-based, and grid styles.

**Tech Stack:** React, inline SVG

---

### Task 1: Create GenerativePattern Component with Hash Function

**Files:**
- Create: `src/components/GenerativePattern.jsx`

**Step 1: Create the component with hash function and color palette**

```jsx
const COLORS = {
  dark: ['#1a0505', '#2d0a0a', '#3d1010'],
  mid: ['#6b1c1c', '#8b2525', '#a53030'],
  bright: ['#cc4040', '#e05555', '#ff6b6b']
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export default function GenerativePattern({ seed = 'default', size = 100 }) {
  const hash = hashString(seed)
  const patternIndex = hash % 20

  // Deterministic color selection based on hash
  const colorHash = hashString(seed + 'color')
  const bgColor = COLORS.dark[colorHash % 3]
  const fgColor = COLORS.bright[(colorHash >> 2) % 3]
  const midColor = COLORS.mid[(colorHash >> 4) % 3]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ borderRadius: '8px' }}
    >
      <rect width="100" height="100" fill={bgColor} />
      {renderPattern(patternIndex, { fgColor, midColor, bgColor, hash })}
    </svg>
  )
}

function renderPattern(index, colors) {
  const patterns = [
    // Will add pattern functions
  ]
  return patterns[index]?.(colors) || null
}
```

**Step 2: Verify component renders without errors**

Run: `npm run dev`
Visit: http://localhost:5175
Expected: No console errors

**Step 3: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: scaffold GenerativePattern component with hash function"
```

---

### Task 2: Add Vertical Line Patterns (Patterns 0-3)

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Add vertical line pattern functions**

Add before `renderPattern`:

```jsx
// Pattern 0: Vertical lines with center circle cutout
function verticalLinesCircle({ fgColor, bgColor, hash }) {
  const lineCount = 20 + (hash % 10)
  const circleSize = 25 + (hash % 15)
  return (
    <>
      <defs>
        <mask id={`mask-circle-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r={circleSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-circle-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1={i * (100 / lineCount)}
            y1="0"
            x2={i * (100 / lineCount)}
            y2="100"
            stroke={fgColor}
            strokeWidth={2}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r={circleSize} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}

// Pattern 1: Vertical lines with offset circle
function verticalLinesOffsetCircle({ fgColor, bgColor, hash }) {
  const lineCount = 25 + (hash % 8)
  const cx = 25 + (hash % 50)
  const cy = 25 + ((hash >> 3) % 50)
  const r = 20 + (hash % 10)
  return (
    <>
      <defs>
        <mask id={`mask-offset-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx={cx} cy={cy} r={r} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-offset-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1={i * (100 / lineCount)}
            y1="0"
            x2={i * (100 / lineCount)}
            y2="100"
            stroke={fgColor}
            strokeWidth={1.5}
          />
        ))}
      </g>
    </>
  )
}

// Pattern 2: Vertical lines with square cutout
function verticalLinesSquare({ fgColor, bgColor, hash }) {
  const lineCount = 18 + (hash % 12)
  const squareSize = 30 + (hash % 20)
  const offset = (100 - squareSize) / 2
  return (
    <>
      <defs>
        <mask id={`mask-square-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <rect x={offset} y={offset} width={squareSize} height={squareSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-square-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1={i * (100 / lineCount)}
            y1="0"
            x2={i * (100 / lineCount)}
            y2="100"
            stroke={fgColor}
            strokeWidth={2}
          />
        ))}
      </g>
      <rect x={offset} y={offset} width={squareSize} height={squareSize} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}

// Pattern 3: Vertical lines with triangle cutout
function verticalLinesTriangle({ fgColor, bgColor, hash }) {
  const lineCount = 22 + (hash % 8)
  const triangleSize = 35 + (hash % 15)
  const points = `50,${50 - triangleSize / 2} ${50 + triangleSize / 2},${50 + triangleSize / 2} ${50 - triangleSize / 2},${50 + triangleSize / 2}`
  return (
    <>
      <defs>
        <mask id={`mask-tri-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <polygon points={points} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-tri-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1={i * (100 / lineCount)}
            y1="0"
            x2={i * (100 / lineCount)}
            y2="100"
            stroke={fgColor}
            strokeWidth={1.5}
          />
        ))}
      </g>
      <polygon points={points} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}
```

Update `renderPattern`:

```jsx
function renderPattern(index, colors) {
  const patterns = [
    verticalLinesCircle,
    verticalLinesOffsetCircle,
    verticalLinesSquare,
    verticalLinesTriangle,
  ]
  return patterns[index % patterns.length]?.(colors) || null
}
```

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: add vertical line patterns 0-3"
```

---

### Task 3: Add Horizontal Line Patterns (Patterns 4-6)

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Add horizontal line pattern functions**

Add after vertical patterns:

```jsx
// Pattern 4: Horizontal lines with circle
function horizontalLinesCircle({ fgColor, bgColor, hash }) {
  const lineCount = 20 + (hash % 10)
  const circleSize = 28 + (hash % 12)
  return (
    <>
      <defs>
        <mask id={`mask-hcircle-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r={circleSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-hcircle-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * (100 / lineCount)}
            x2="100"
            y2={i * (100 / lineCount)}
            stroke={fgColor}
            strokeWidth={2}
          />
        ))}
      </g>
    </>
  )
}

// Pattern 5: Horizontal lines with corner square
function horizontalLinesCornerSquare({ fgColor, midColor, hash }) {
  const lineCount = 15 + (hash % 10)
  const squareSize = 40 + (hash % 20)
  const corner = hash % 4 // 0: TL, 1: TR, 2: BL, 3: BR
  const x = corner % 2 === 0 ? 0 : 100 - squareSize
  const y = corner < 2 ? 0 : 100 - squareSize
  return (
    <>
      <defs>
        <mask id={`mask-csquare-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <rect x={x} y={y} width={squareSize} height={squareSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-csquare-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * (100 / lineCount)}
            x2="100"
            y2={i * (100 / lineCount)}
            stroke={fgColor}
            strokeWidth={2.5}
          />
        ))}
      </g>
      <rect x={x} y={y} width={squareSize} height={squareSize} fill={midColor} fillOpacity="0.3" />
    </>
  )
}

// Pattern 6: Horizontal lines with diamond
function horizontalLinesDiamond({ fgColor, bgColor, hash }) {
  const lineCount = 18 + (hash % 8)
  const size = 25 + (hash % 15)
  const points = `50,${50 - size} ${50 + size},50 50,${50 + size} ${50 - size},50`
  return (
    <>
      <defs>
        <mask id={`mask-diamond-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <polygon points={points} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-diamond-${hash})`}>
        {Array.from({ length: lineCount }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * (100 / lineCount)}
            x2="100"
            y2={i * (100 / lineCount)}
            stroke={fgColor}
            strokeWidth={2}
          />
        ))}
      </g>
      <polygon points={points} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}
```

Update patterns array to include new patterns.

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: add horizontal line patterns 4-6"
```

---

### Task 4: Add Diagonal Grid Patterns (Patterns 7-9)

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Add diagonal grid pattern functions**

```jsx
// Pattern 7: Diagonal grid with circle
function diagonalGridCircle({ fgColor, bgColor, hash }) {
  const spacing = 8 + (hash % 6)
  const circleSize = 25 + (hash % 15)
  const lines = []
  for (let i = -100; i <= 200; i += spacing) {
    lines.push(<line key={`d1-${i}`} x1={i} y1="0" x2={i + 100} y2="100" stroke={fgColor} strokeWidth="1" />)
    lines.push(<line key={`d2-${i}`} x1={i} y1="100" x2={i + 100} y2="0" stroke={fgColor} strokeWidth="1" />)
  }
  return (
    <>
      <defs>
        <mask id={`mask-dgrid-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r={circleSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-dgrid-${hash})`}>{lines}</g>
      <circle cx="50" cy="50" r={circleSize} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}

// Pattern 8: Single diagonal lines with triangle
function diagonalLinesTriangle({ fgColor, midColor, hash }) {
  const spacing = 6 + (hash % 5)
  const lines = []
  for (let i = -100; i <= 200; i += spacing) {
    lines.push(<line key={i} x1={i} y1="0" x2={i - 100} y2="100" stroke={fgColor} strokeWidth="1.5" />)
  }
  const size = 30 + (hash % 20)
  const rotation = (hash % 4) * 90
  return (
    <>
      <g>{lines}</g>
      <polygon
        points={`50,${50 - size * 0.6} ${50 + size * 0.6},${50 + size * 0.4} ${50 - size * 0.6},${50 + size * 0.4}`}
        fill={midColor}
        fillOpacity="0.5"
        transform={`rotate(${rotation}, 50, 50)`}
      />
    </>
  )
}

// Pattern 9: Crosshatch with square
function crosshatchSquare({ fgColor, bgColor, hash }) {
  const spacing = 10 + (hash % 5)
  const squareSize = 35 + (hash % 15)
  const offset = (100 - squareSize) / 2
  const lines = []
  for (let i = -100; i <= 200; i += spacing) {
    lines.push(<line key={`a-${i}`} x1={i} y1="0" x2={i + 100} y2="100" stroke={fgColor} strokeWidth="1" strokeOpacity="0.7" />)
    lines.push(<line key={`b-${i}`} x1={i} y1="100" x2={i + 100} y2="0" stroke={fgColor} strokeWidth="1" strokeOpacity="0.7" />)
  }
  return (
    <>
      <defs>
        <mask id={`mask-xsquare-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <rect x={offset} y={offset} width={squareSize} height={squareSize} fill="black" transform={`rotate(45, 50, 50)`} />
        </mask>
      </defs>
      <g mask={`url(#mask-xsquare-${hash})`}>{lines}</g>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: add diagonal grid patterns 7-9"
```

---

### Task 5: Add Concentric Circle Patterns (Patterns 10-12)

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Add concentric circle pattern functions**

```jsx
// Pattern 10: Concentric circles centered
function concentricCircles({ fgColor, midColor, hash }) {
  const ringCount = 5 + (hash % 4)
  const maxRadius = 45
  return (
    <>
      {Array.from({ length: ringCount }, (_, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={maxRadius - i * (maxRadius / ringCount)}
          fill="none"
          stroke={i % 2 === 0 ? fgColor : midColor}
          strokeWidth={2 + (hash % 3)}
        />
      ))}
    </>
  )
}

// Pattern 11: Concentric circles offset
function concentricCirclesOffset({ fgColor, midColor, hash }) {
  const ringCount = 6 + (hash % 3)
  const cx = 30 + (hash % 40)
  const cy = 30 + ((hash >> 2) % 40)
  const maxRadius = 50
  return (
    <>
      {Array.from({ length: ringCount }, (_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={maxRadius - i * (maxRadius / ringCount)}
          fill="none"
          stroke={fgColor}
          strokeWidth={1.5}
          strokeOpacity={1 - i * 0.1}
        />
      ))}
    </>
  )
}

// Pattern 12: Concentric with filled center
function concentricFilledCenter({ fgColor, midColor, bgColor, hash }) {
  const ringCount = 4 + (hash % 3)
  const maxRadius = 42
  const centerRadius = 12 + (hash % 8)
  return (
    <>
      {Array.from({ length: ringCount }, (_, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={maxRadius - i * ((maxRadius - centerRadius) / ringCount)}
          fill="none"
          stroke={fgColor}
          strokeWidth={3}
        />
      ))}
      <circle cx="50" cy="50" r={centerRadius} fill={midColor} />
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: add concentric circle patterns 10-12"
```

---

### Task 6: Add Dot Grid Patterns (Patterns 13-15)

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Add dot grid pattern functions**

```jsx
// Pattern 13: Dot grid with circle cutout
function dotGridCircle({ fgColor, bgColor, hash }) {
  const spacing = 10 + (hash % 5)
  const dotSize = 2 + (hash % 2)
  const circleSize = 25 + (hash % 15)
  const dots = []
  for (let x = spacing / 2; x < 100; x += spacing) {
    for (let y = spacing / 2; y < 100; y += spacing) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={dotSize} fill={fgColor} />)
    }
  }
  return (
    <>
      <defs>
        <mask id={`mask-dotcircle-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r={circleSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-dotcircle-${hash})`}>{dots}</g>
      <circle cx="50" cy="50" r={circleSize} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}

// Pattern 14: Dot grid with varying sizes
function dotGridVarying({ fgColor, midColor, hash }) {
  const spacing = 12 + (hash % 4)
  const dots = []
  for (let x = spacing / 2; x < 100; x += spacing) {
    for (let y = spacing / 2; y < 100; y += spacing) {
      const dist = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2)
      const size = Math.max(1, 4 - dist / 20)
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={size} fill={dist < 30 ? midColor : fgColor} />)
    }
  }
  return <>{dots}</>
}

// Pattern 15: Dot grid with square overlay
function dotGridSquare({ fgColor, midColor, hash }) {
  const spacing = 8 + (hash % 4)
  const squareSize = 40 + (hash % 15)
  const offset = (100 - squareSize) / 2
  const dots = []
  for (let x = spacing / 2; x < 100; x += spacing) {
    for (let y = spacing / 2; y < 100; y += spacing) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill={fgColor} />)
    }
  }
  return (
    <>
      {dots}
      <rect x={offset} y={offset} width={squareSize} height={squareSize} fill={midColor} fillOpacity="0.4" />
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: add dot grid patterns 13-15"
```

---

### Task 7: Add Wave and Radial Patterns (Patterns 16-19)

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Add wave and radial pattern functions**

```jsx
// Pattern 16: Wave lines
function waveLines({ fgColor, midColor, hash }) {
  const waveCount = 8 + (hash % 5)
  const amplitude = 5 + (hash % 8)
  const paths = []
  for (let i = 0; i < waveCount; i++) {
    const y = (i + 1) * (100 / (waveCount + 1))
    const d = `M 0 ${y} Q 25 ${y - amplitude} 50 ${y} Q 75 ${y + amplitude} 100 ${y}`
    paths.push(<path key={i} d={d} fill="none" stroke={fgColor} strokeWidth="2" />)
  }
  return <>{paths}</>
}

// Pattern 17: Wave lines with circle
function waveLinesCircle({ fgColor, bgColor, hash }) {
  const waveCount = 10 + (hash % 4)
  const amplitude = 8 + (hash % 5)
  const circleSize = 22 + (hash % 12)
  const paths = []
  for (let i = 0; i < waveCount; i++) {
    const y = (i + 1) * (100 / (waveCount + 1))
    const d = `M 0 ${y} Q 25 ${y - amplitude} 50 ${y} Q 75 ${y + amplitude} 100 ${y}`
    paths.push(<path key={i} d={d} fill="none" stroke={fgColor} strokeWidth="1.5" />)
  }
  return (
    <>
      <defs>
        <mask id={`mask-wave-${hash}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r={circleSize} fill="black" />
        </mask>
      </defs>
      <g mask={`url(#mask-wave-${hash})`}>{paths}</g>
      <circle cx="50" cy="50" r={circleSize} fill="none" stroke={fgColor} strokeWidth="1" />
    </>
  )
}

// Pattern 18: Radial lines from center
function radialLinesCenter({ fgColor, midColor, hash }) {
  const lineCount = 16 + (hash % 12)
  const lines = []
  for (let i = 0; i < lineCount; i++) {
    const angle = (i * 360) / lineCount
    const rad = (angle * Math.PI) / 180
    const x2 = 50 + Math.cos(rad) * 50
    const y2 = 50 + Math.sin(rad) * 50
    lines.push(<line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke={fgColor} strokeWidth="1.5" />)
  }
  const innerRadius = 10 + (hash % 10)
  return (
    <>
      {lines}
      <circle cx="50" cy="50" r={innerRadius} fill={midColor} />
    </>
  )
}

// Pattern 19: Radial lines from corner
function radialLinesCorner({ fgColor, bgColor, hash }) {
  const lineCount = 20 + (hash % 10)
  const corner = hash % 4
  const cx = corner % 2 === 0 ? 0 : 100
  const cy = corner < 2 ? 0 : 100
  const lines = []
  for (let i = 0; i < lineCount; i++) {
    const angle = (i * 90) / lineCount + (corner * 90) + 180
    const rad = (angle * Math.PI) / 180
    const x2 = cx + Math.cos(rad) * 150
    const y2 = cy + Math.sin(rad) * 150
    lines.push(<line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={fgColor} strokeWidth="1.5" />)
  }
  return <>{lines}</>
}
```

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: add wave and radial patterns 16-19"
```

---

### Task 8: Finalize Pattern Array and Export

**Files:**
- Modify: `src/components/GenerativePattern.jsx`

**Step 1: Update renderPattern with all 20 patterns**

```jsx
function renderPattern(index, colors) {
  const patterns = [
    verticalLinesCircle,        // 0
    verticalLinesOffsetCircle,  // 1
    verticalLinesSquare,        // 2
    verticalLinesTriangle,      // 3
    horizontalLinesCircle,      // 4
    horizontalLinesCornerSquare,// 5
    horizontalLinesDiamond,     // 6
    diagonalGridCircle,         // 7
    diagonalLinesTriangle,      // 8
    crosshatchSquare,           // 9
    concentricCircles,          // 10
    concentricCirclesOffset,    // 11
    concentricFilledCenter,     // 12
    dotGridCircle,              // 13
    dotGridVarying,             // 14
    dotGridSquare,              // 15
    waveLines,                  // 16
    waveLinesCircle,            // 17
    radialLinesCenter,          // 18
    radialLinesCorner,          // 19
  ]
  return patterns[index % patterns.length]?.(colors) || null
}
```

**Step 2: Commit**

```bash
git add src/components/GenerativePattern.jsx
git commit -m "feat: finalize pattern array with 20 variations"
```

---

### Task 9: Integrate into EventCard

**Files:**
- Modify: `src/components/EventCard.jsx`

**Step 1: Import GenerativePattern**

Add at top of file:
```jsx
import GenerativePattern from './GenerativePattern'
```

**Step 2: Replace emoji fallback with GenerativePattern**

Change this section (around line 217-223):
```jsx
<div style={imageContainerStyle}>
  {image ? (
    <img src={image} alt={name} style={imageStyle} />
  ) : (
    <span>{typeIcon}</span>
  )}
</div>
```

To:
```jsx
<div style={imageContainerStyle}>
  {image ? (
    <img src={image} alt={name} style={imageStyle} />
  ) : (
    <GenerativePattern seed={event.slug} size={100} />
  )}
</div>
```

**Step 3: Remove unused background color from imageContainerStyle**

Change line 109:
```jsx
background: image ? 'transparent' : '#1a1a1a',
```
To:
```jsx
background: 'transparent',
```

**Step 4: Verify in browser**

Run: `npm run dev`
Visit: http://localhost:5175/events
Expected: Events without images show red geometric patterns instead of emojis

**Step 5: Commit**

```bash
git add src/components/EventCard.jsx
git commit -m "feat: integrate GenerativePattern into EventCard"
```

---

### Task 10: Build and Verify

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete generative event pattern implementation"
```
