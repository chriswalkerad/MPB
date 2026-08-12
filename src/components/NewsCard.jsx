import React from 'react';
import GenerativePattern from './GenerativePattern';

const NEWS_CATEGORY_COLORS = {
  threats: '#f87171',
  vulnerabilities: '#fb923c',
  'msp-channel': '#60a5fa',
  'ai-security': '#c084fc',
  defense: '#4ade80',
  industry: '#94a3b8',
};

const NEWS_CATEGORY_LABELS = {
  threats: 'Threats',
  vulnerabilities: 'Vulnerabilities',
  'msp-channel': 'MSP & Channel',
  'ai-security': 'AI Security',
  defense: 'Defense',
  industry: 'Industry',
};

function formatRelativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsCard({ item }) {
  const { slug, title, summary, url, source, altSources, category, publishedAt } = item;
  const categoryColor = NEWS_CATEGORY_COLORS[category] || '#888';

  const cardStyle = {
    display: 'flex',
    gap: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
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

  const summaryStyle = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    lineHeight: '1.5',
  };

  const altSourcesStyle = {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  };

  const badgeContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
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

  const categoryBadgeStyle = {
    ...baseBadgeStyle,
    background: `${categoryColor}20`,
    color: categoryColor,
  };

  const sourceBadgeStyle = {
    ...baseBadgeStyle,
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'none',
  };

  const timeStyle = {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    fontFamily: '"JetBrains Mono", monospace',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="event-card"
      style={cardStyle}
    >
      <div style={imageContainerStyle}>
        <GenerativePattern seed={slug} size={100} />
      </div>

      <div style={contentStyle}>
        <div style={titleRowStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <span style={externalIconStyle}>↗</span>
        </div>

        <p style={summaryStyle}>{summary}</p>

        {altSources && altSources.length > 0 && (
          <span style={altSourcesStyle}>
            also on {altSources.map(s => s.name).join(', ')}
          </span>
        )}

        <div style={badgeContainerStyle}>
          <span style={categoryBadgeStyle}>{NEWS_CATEGORY_LABELS[category] || category}</span>
          <span style={sourceBadgeStyle}>{source.name}</span>
          <span style={timeStyle}>{formatRelativeTime(publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}
