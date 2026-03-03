import React from 'react';
import GenerativePattern from './GenerativePattern';

const TYPE_COLORS = {
  conference: '#ff6b35',
  meetup: '#00d4aa',
  chapter: '#a78bfa',
  workshop: '#facc15',
  webinar: '#38bdf8',
  ctf: '#f472b6',
};

const TYPE_ICONS = {
  conference: '🎤',
  meetup: '👥',
  chapter: '🏛️',
  workshop: '🛠️',
  webinar: '💻',
  ctf: '🚩',
};

function formatEventDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minuteStr} ${ampm}`;
  };

  const startMonth = monthNames[start.getMonth()];
  const startDay = start.getDate();

  if (!end) {
    return `${startMonth} ${startDay} · ${formatTime(start)}`;
  }

  const endMonth = monthNames[end.getMonth()];
  const endDay = end.getDate();

  // Check if same day
  if (start.toDateString() === end.toDateString()) {
    return `${startMonth} ${startDay} · ${formatTime(start)} – ${formatTime(end)}`;
  }

  // Multi-day event
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}`;
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

export default function EventCard({ event, onClick }) {
  const {
    name,
    type,
    format,
    cost,
    date,
    endDate,
    location,
    image,
    url,
    category,
  } = event;

  const typeColor = TYPE_COLORS[type] || '#888';
  const typeIcon = TYPE_ICONS[type] || '📅';
  const isExternal = url && url.startsWith('http');

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const cardStyle = {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
  };

  const imageContainerStyle = {
    width: '100px',
    height: '100px',
    minWidth: '100px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    fontSize: '32px',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
  };

  const titleRowStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  };

  const titleStyle = {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#fff',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.3',
  };

  const externalIconStyle = {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    flexShrink: 0,
  };

  const metaStyle = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const badgeContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: 'auto',
  };

  const baseBadgeStyle = {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: '"JetBrains Mono", monospace',
    fontWeight: 500,
    textTransform: 'uppercase',
  };

  const typeBadgeStyle = {
    ...baseBadgeStyle,
    background: `${typeColor}20`,
    color: typeColor,
  };

  const formatBadgeStyle = {
    ...baseBadgeStyle,
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  };

  const costBadgeStyle = {
    ...baseBadgeStyle,
    background: cost === 'Free' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.1)',
    color: cost === 'Free' ? '#00d4aa' : 'rgba(255,255,255,0.7)',
  };

  const categoryPillStyle = {
    ...baseBadgeStyle,
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'none',
  };

  return (
    <div
      className="event-card"
      style={cardStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div style={imageContainerStyle}>
        {image ? (
          <img src={image} alt={name} style={imageStyle} width={100} height={100} loading="lazy" />
        ) : (
          <GenerativePattern seed={event.slug} size={100} />
        )}
      </div>

      <div style={contentStyle}>
        <div style={titleRowStyle}>
          <h3 style={titleStyle}>{name}</h3>
          {isExternal && <span style={externalIconStyle}>↗</span>}
        </div>

        <div style={metaStyle}>
          <span>{formatEventDate(date, endDate)}</span>
          {location && <span>{location}</span>}
        </div>

        <div style={badgeContainerStyle}>
          <span style={typeBadgeStyle}>{type}</span>
          {format && <span style={formatBadgeStyle}>{format}</span>}
          {cost && <span style={costBadgeStyle}>{cost}</span>}
          {category && <span style={categoryPillStyle}>{category}</span>}
        </div>
      </div>
    </div>
  );
}
