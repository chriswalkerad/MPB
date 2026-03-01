import { Link } from 'react-router-dom';

export default function CategoryCard({ category, eventCount }) {
  return (
    <Link
      to={`/events/category/${category.slug}`}
      style={{
        display: 'block',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        textDecoration: 'none',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'white',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        {category.name}
      </div>
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'Outfit, sans-serif',
          marginTop: '4px',
        }}
      >
        {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
      </div>
    </Link>
  );
}
