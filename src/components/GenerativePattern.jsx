import React from 'react';

// Hash function that converts a string to a consistent number
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Seeded random number generator for deterministic values
const seededRandom = (seed, index = 0) => {
  const x = Math.sin(seed + index * 9999) * 10000;
  return x - Math.floor(x);
};

// Color palette - red monochrome
const colors = {
  dark: ['#1a0505', '#2d0a0a', '#3d1010'],
  mid: ['#6b1c1c', '#8b2525', '#a53030'],
  bright: ['#cc4040', '#e05555', '#ff6b6b'],
};

// Get colors based on hash
const getColors = (hash) => {
  const darkIdx = hash % 3;
  const midIdx = (hash >> 2) % 3;
  const brightIdx = (hash >> 4) % 3;

  return {
    dark: colors.dark[darkIdx],
    mid: colors.mid[midIdx],
    bright: colors.bright[brightIdx],
  };
};

// Pattern 0: Vertical lines with circle cutout
const Pattern0 = ({ size, hash, palette }) => {
  const lineCount = 8 + (hash % 8);
  const circleSize = size * (0.3 + seededRandom(hash, 1) * 0.2);
  const circleX = size * 0.5;
  const circleY = size * 0.5;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-0-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <circle cx={circleX} cy={circleY} r={circleSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-0-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={(size / lineCount) * i}
            y={0}
            width={size / lineCount / 2}
            height={size}
            fill={i % 2 === 0 ? palette.mid : palette.bright}
          />
        ))}
      </g>
      <circle cx={circleX} cy={circleY} r={circleSize} fill="none" stroke={palette.bright} strokeWidth={2} />
    </svg>
  );
};

// Pattern 1: Vertical lines with offset circle cutout
const Pattern1 = ({ size, hash, palette }) => {
  const lineCount = 10 + (hash % 6);
  const circleSize = size * (0.25 + seededRandom(hash, 2) * 0.15);
  const circleX = size * (0.3 + seededRandom(hash, 3) * 0.4);
  const circleY = size * (0.3 + seededRandom(hash, 4) * 0.4);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-1-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <circle cx={circleX} cy={circleY} r={circleSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-1-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={(size / lineCount) * i}
            y={0}
            width={size / lineCount * 0.6}
            height={size}
            fill={palette.bright}
          />
        ))}
      </g>
      <circle cx={circleX} cy={circleY} r={circleSize} fill={palette.mid} fillOpacity={0.5} />
    </svg>
  );
};

// Pattern 2: Vertical lines with square cutout
const Pattern2 = ({ size, hash, palette }) => {
  const lineCount = 12 + (hash % 8);
  const squareSize = size * (0.3 + seededRandom(hash, 5) * 0.2);
  const squareX = (size - squareSize) / 2;
  const squareY = (size - squareSize) / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-2-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <rect x={squareX} y={squareY} width={squareSize} height={squareSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-2-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={(size / lineCount) * i}
            y={0}
            width={size / lineCount * 0.4}
            height={size}
            fill={i % 3 === 0 ? palette.bright : palette.mid}
          />
        ))}
      </g>
      <rect x={squareX} y={squareY} width={squareSize} height={squareSize} fill="none" stroke={palette.bright} strokeWidth={2} />
    </svg>
  );
};

// Pattern 3: Vertical lines with triangle cutout
const Pattern3 = ({ size, hash, palette }) => {
  const lineCount = 8 + (hash % 10);
  const triSize = size * (0.35 + seededRandom(hash, 6) * 0.2);
  const cx = size / 2;
  const cy = size / 2;
  const points = `${cx},${cy - triSize / 2} ${cx - triSize / 2},${cy + triSize / 2} ${cx + triSize / 2},${cy + triSize / 2}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-3-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <polygon points={points} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-3-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={(size / lineCount) * i}
            y={0}
            width={size / lineCount * 0.5}
            height={size}
            fill={palette.mid}
          />
        ))}
      </g>
      <polygon points={points} fill="none" stroke={palette.bright} strokeWidth={2} />
    </svg>
  );
};

// Pattern 4: Horizontal lines with circle cutout
const Pattern4 = ({ size, hash, palette }) => {
  const lineCount = 10 + (hash % 8);
  const circleSize = size * (0.25 + seededRandom(hash, 7) * 0.2);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-4-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <circle cx={size / 2} cy={size / 2} r={circleSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-4-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={0}
            y={(size / lineCount) * i}
            width={size}
            height={size / lineCount * 0.5}
            fill={i % 2 === 0 ? palette.bright : palette.mid}
          />
        ))}
      </g>
      <circle cx={size / 2} cy={size / 2} r={circleSize} fill={palette.dark} stroke={palette.bright} strokeWidth={2} />
    </svg>
  );
};

// Pattern 5: Horizontal lines with corner square cutout
const Pattern5 = ({ size, hash, palette }) => {
  const lineCount = 12 + (hash % 6);
  const squareSize = size * (0.3 + seededRandom(hash, 8) * 0.2);
  const corner = hash % 4;
  const positions = [
    { x: 0, y: 0 },
    { x: size - squareSize, y: 0 },
    { x: 0, y: size - squareSize },
    { x: size - squareSize, y: size - squareSize },
  ];
  const pos = positions[corner];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-5-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <rect x={pos.x} y={pos.y} width={squareSize} height={squareSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-5-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={0}
            y={(size / lineCount) * i}
            width={size}
            height={size / lineCount * 0.6}
            fill={palette.mid}
          />
        ))}
      </g>
      <rect x={pos.x} y={pos.y} width={squareSize} height={squareSize} fill={palette.bright} fillOpacity={0.3} />
    </svg>
  );
};

// Pattern 6: Horizontal lines with diamond cutout
const Pattern6 = ({ size, hash, palette }) => {
  const lineCount = 8 + (hash % 10);
  const diamondSize = size * (0.3 + seededRandom(hash, 9) * 0.2);
  const cx = size / 2;
  const cy = size / 2;
  const points = `${cx},${cy - diamondSize} ${cx + diamondSize},${cy} ${cx},${cy + diamondSize} ${cx - diamondSize},${cy}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-6-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <polygon points={points} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-6-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <rect
            key={i}
            x={0}
            y={(size / lineCount) * i}
            width={size}
            height={size / lineCount * 0.4}
            fill={palette.bright}
          />
        ))}
      </g>
      <polygon points={points} fill="none" stroke={palette.mid} strokeWidth={3} />
    </svg>
  );
};

// Pattern 7: Diagonal lines with circle
const Pattern7 = ({ size, hash, palette }) => {
  const lineCount = 10 + (hash % 8);
  const circleSize = size * (0.2 + seededRandom(hash, 10) * 0.15);
  const spacing = (size * 2) / lineCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-7-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <circle cx={size / 2} cy={size / 2} r={circleSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-7-${hash})`}>
        {Array.from({ length: lineCount * 2 }).map((_, i) => (
          <line
            key={i}
            x1={-size + spacing * i}
            y1={0}
            x2={spacing * i}
            y2={size}
            stroke={palette.mid}
            strokeWidth={2}
          />
        ))}
      </g>
      <circle cx={size / 2} cy={size / 2} r={circleSize} fill={palette.bright} />
    </svg>
  );
};

// Pattern 8: Crosshatch with square
const Pattern8 = ({ size, hash, palette }) => {
  const lineCount = 8 + (hash % 6);
  const squareSize = size * (0.25 + seededRandom(hash, 11) * 0.15);
  const spacing = size / lineCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-8-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <rect x={(size - squareSize) / 2} y={(size - squareSize) / 2} width={squareSize} height={squareSize} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-8-${hash})`}>
        {Array.from({ length: lineCount * 2 }).map((_, i) => (
          <React.Fragment key={i}>
            <line
              x1={-size + spacing * i}
              y1={0}
              x2={spacing * i}
              y2={size}
              stroke={palette.mid}
              strokeWidth={1.5}
            />
            <line
              x1={spacing * i}
              y1={0}
              x2={-size + spacing * i + size}
              y2={size}
              stroke={palette.mid}
              strokeWidth={1.5}
            />
          </React.Fragment>
        ))}
      </g>
      <rect
        x={(size - squareSize) / 2}
        y={(size - squareSize) / 2}
        width={squareSize}
        height={squareSize}
        fill={palette.bright}
        fillOpacity={0.8}
      />
    </svg>
  );
};

// Pattern 9: Diagonal lines with triangle
const Pattern9 = ({ size, hash, palette }) => {
  const lineCount = 12 + (hash % 8);
  const triSize = size * (0.3 + seededRandom(hash, 12) * 0.15);
  const cx = size / 2;
  const cy = size / 2;
  const points = `${cx},${cy - triSize / 2} ${cx - triSize / 2},${cy + triSize / 2} ${cx + triSize / 2},${cy + triSize / 2}`;
  const spacing = (size * 2) / lineCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={`mask-9-${hash}`}>
          <rect width={size} height={size} fill="white" />
          <polygon points={points} fill="black" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={palette.dark} />
      <g mask={`url(#mask-9-${hash})`}>
        {Array.from({ length: lineCount * 2 }).map((_, i) => (
          <line
            key={i}
            x1={spacing * i}
            y1={0}
            x2={spacing * i - size}
            y2={size}
            stroke={palette.bright}
            strokeWidth={2}
          />
        ))}
      </g>
      <polygon points={points} fill={palette.mid} stroke={palette.bright} strokeWidth={2} />
    </svg>
  );
};

// Pattern 10: Concentric circles centered
const Pattern10 = ({ size, hash, palette }) => {
  const ringCount = 4 + (hash % 4);
  const maxRadius = size * 0.45;
  const ringWidth = maxRadius / ringCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: ringCount }).map((_, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={maxRadius - ringWidth * i}
          fill="none"
          stroke={i % 2 === 0 ? palette.bright : palette.mid}
          strokeWidth={ringWidth * 0.8}
        />
      ))}
      <circle cx={size / 2} cy={size / 2} r={ringWidth * 0.5} fill={palette.bright} />
    </svg>
  );
};

// Pattern 11: Concentric circles offset
const Pattern11 = ({ size, hash, palette }) => {
  const ringCount = 5 + (hash % 4);
  const maxRadius = size * 0.5;
  const ringWidth = maxRadius / ringCount;
  const offsetX = size * (0.3 + seededRandom(hash, 13) * 0.4);
  const offsetY = size * (0.3 + seededRandom(hash, 14) * 0.4);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      <clipPath id={`clip-11-${hash}`}>
        <rect width={size} height={size} />
      </clipPath>
      <g clipPath={`url(#clip-11-${hash})`}>
        {Array.from({ length: ringCount }).map((_, i) => (
          <circle
            key={i}
            cx={offsetX}
            cy={offsetY}
            r={maxRadius - ringWidth * i}
            fill="none"
            stroke={i % 2 === 0 ? palette.mid : palette.bright}
            strokeWidth={ringWidth * 0.7}
          />
        ))}
      </g>
    </svg>
  );
};

// Pattern 12: Concentric circles with filled center
const Pattern12 = ({ size, hash, palette }) => {
  const ringCount = 3 + (hash % 3);
  const maxRadius = size * 0.42;
  const ringWidth = maxRadius / (ringCount + 1);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: ringCount }).map((_, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={maxRadius - ringWidth * i}
          fill="none"
          stroke={palette.mid}
          strokeWidth={2}
        />
      ))}
      <circle cx={size / 2} cy={size / 2} r={ringWidth * 1.5} fill={palette.bright} />
      <circle cx={size / 2} cy={size / 2} r={ringWidth * 0.8} fill={palette.dark} />
    </svg>
  );
};

// Pattern 13: Dot grid with circle overlay
const Pattern13 = ({ size, hash, palette }) => {
  const gridSize = 5 + (hash % 4);
  const dotSize = size / gridSize / 4;
  const circleSize = size * (0.25 + seededRandom(hash, 15) * 0.15);
  const spacing = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: gridSize }).map((_, i) =>
        Array.from({ length: gridSize }).map((_, j) => (
          <circle
            key={`${i}-${j}`}
            cx={spacing / 2 + spacing * i}
            cy={spacing / 2 + spacing * j}
            r={dotSize}
            fill={palette.mid}
          />
        ))
      )}
      <circle cx={size / 2} cy={size / 2} r={circleSize} fill="none" stroke={palette.bright} strokeWidth={3} />
    </svg>
  );
};

// Pattern 14: Dot grid with square overlay
const Pattern14 = ({ size, hash, palette }) => {
  const gridSize = 6 + (hash % 3);
  const dotSize = size / gridSize / 5;
  const squareSize = size * (0.3 + seededRandom(hash, 16) * 0.2);
  const spacing = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: gridSize }).map((_, i) =>
        Array.from({ length: gridSize }).map((_, j) => (
          <circle
            key={`${i}-${j}`}
            cx={spacing / 2 + spacing * i}
            cy={spacing / 2 + spacing * j}
            r={dotSize}
            fill={palette.bright}
          />
        ))
      )}
      <rect
        x={(size - squareSize) / 2}
        y={(size - squareSize) / 2}
        width={squareSize}
        height={squareSize}
        fill="none"
        stroke={palette.mid}
        strokeWidth={4}
      />
    </svg>
  );
};

// Pattern 15: Dot grid with diagonal line
const Pattern15 = ({ size, hash, palette }) => {
  const gridSize = 4 + (hash % 4);
  const dotSize = size / gridSize / 3;
  const spacing = size / gridSize;
  const lineOffset = seededRandom(hash, 17) * size * 0.3;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: gridSize }).map((_, i) =>
        Array.from({ length: gridSize }).map((_, j) => (
          <circle
            key={`${i}-${j}`}
            cx={spacing / 2 + spacing * i}
            cy={spacing / 2 + spacing * j}
            r={dotSize}
            fill={(i + j) % 2 === 0 ? palette.mid : palette.bright}
          />
        ))
      )}
      <line x1={0} y1={lineOffset} x2={size - lineOffset} y2={size} stroke={palette.bright} strokeWidth={4} />
      <line x1={lineOffset} y1={0} x2={size} y2={size - lineOffset} stroke={palette.mid} strokeWidth={4} />
    </svg>
  );
};

// Pattern 16: Sine waves
const Pattern16 = ({ size, hash, palette }) => {
  const waveCount = 3 + (hash % 4);
  const amplitude = size * (0.08 + seededRandom(hash, 18) * 0.06);
  const frequency = 2 + (hash % 3);

  const createWavePath = (yOffset) => {
    let path = `M 0 ${yOffset}`;
    for (let x = 0; x <= size; x += 2) {
      const y = yOffset + Math.sin((x / size) * Math.PI * frequency * 2) * amplitude;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: waveCount }).map((_, i) => (
        <path
          key={i}
          d={createWavePath((size / (waveCount + 1)) * (i + 1))}
          fill="none"
          stroke={i % 2 === 0 ? palette.bright : palette.mid}
          strokeWidth={3}
        />
      ))}
    </svg>
  );
};

// Pattern 17: Radial lines from center
const Pattern17 = ({ size, hash, palette }) => {
  const lineCount = 12 + (hash % 12);
  const innerRadius = size * (0.1 + seededRandom(hash, 19) * 0.1);
  const outerRadius = size * 0.48;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: lineCount }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / lineCount;
        const x1 = size / 2 + Math.cos(angle) * innerRadius;
        const y1 = size / 2 + Math.sin(angle) * innerRadius;
        const x2 = size / 2 + Math.cos(angle) * outerRadius;
        const y2 = size / 2 + Math.sin(angle) * outerRadius;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 2 === 0 ? palette.bright : palette.mid}
            strokeWidth={2}
          />
        );
      })}
      <circle cx={size / 2} cy={size / 2} r={innerRadius} fill={palette.mid} />
    </svg>
  );
};

// Pattern 18: Radial lines from corner
const Pattern18 = ({ size, hash, palette }) => {
  const lineCount = 16 + (hash % 8);
  const corner = hash % 4;
  const corners = [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: 0, y: size },
    { x: size, y: size },
  ];
  const origin = corners[corner];
  const maxRadius = size * 1.5;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      <clipPath id={`clip-18-${hash}`}>
        <rect width={size} height={size} />
      </clipPath>
      <g clipPath={`url(#clip-18-${hash})`}>
        {Array.from({ length: lineCount }).map((_, i) => {
          const angle = (Math.PI * 0.5 * i) / lineCount + (corner * Math.PI / 2);
          const x2 = origin.x + Math.cos(angle) * maxRadius;
          const y2 = origin.y + Math.sin(angle) * maxRadius;
          return (
            <line
              key={i}
              x1={origin.x}
              y1={origin.y}
              x2={x2}
              y2={y2}
              stroke={i % 3 === 0 ? palette.bright : palette.mid}
              strokeWidth={2}
            />
          );
        })}
      </g>
    </svg>
  );
};

// Pattern 19: Concentric waves
const Pattern19 = ({ size, hash, palette }) => {
  const ringCount = 5 + (hash % 4);
  const maxRadius = size * 0.5;
  const waveAmplitude = size * (0.02 + seededRandom(hash, 20) * 0.02);
  const waveFrequency = 8 + (hash % 8);

  const createWaveCirclePath = (radius) => {
    let path = '';
    const points = 100;
    for (let i = 0; i <= points; i++) {
      const angle = (Math.PI * 2 * i) / points;
      const waveOffset = Math.sin(angle * waveFrequency) * waveAmplitude;
      const r = radius + waveOffset;
      const x = size / 2 + Math.cos(angle) * r;
      const y = size / 2 + Math.sin(angle) * r;
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return path + ' Z';
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={palette.dark} />
      {Array.from({ length: ringCount }).map((_, i) => (
        <path
          key={i}
          d={createWaveCirclePath(maxRadius - (maxRadius / ringCount) * i)}
          fill="none"
          stroke={i % 2 === 0 ? palette.bright : palette.mid}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
};

// Pattern components array
const patterns = [
  Pattern0, Pattern1, Pattern2, Pattern3,
  Pattern4, Pattern5, Pattern6,
  Pattern7, Pattern8, Pattern9,
  Pattern10, Pattern11, Pattern12,
  Pattern13, Pattern14, Pattern15,
  Pattern16, Pattern17, Pattern18, Pattern19,
];

// Main component
const GenerativePattern = ({ seed = 'default', size = 100 }) => {
  const hash = hashString(seed);
  const patternIndex = hash % 20;
  const palette = getColors(hash);

  const PatternComponent = patterns[patternIndex];

  return <PatternComponent size={size} hash={hash} palette={palette} />;
};

export default React.memo(GenerativePattern);
