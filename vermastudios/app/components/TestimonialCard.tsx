'use client';

import { getImageUrl } from '@/app/lib/api';

interface TestimonialCardProps {
  quote: string;
  name: string;
  event: string;
  rating?: number;
  videoUrl?: string;
}

export default function TestimonialCard({ quote, name, event, rating = 5, videoUrl }: TestimonialCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-white)',
        padding: '40px 32px',
        border: '1px solid var(--color-gray-200)',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-gold)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-gray-200)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Video */}
      {videoUrl && (
        <div style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
          <video
            src={getImageUrl(videoUrl)}
            controls
            style={{ width: '100%', display: 'block', maxHeight: '250px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Quote Icon */}
      <div style={{
        fontSize: '48px',
        lineHeight: 1,
        color: 'var(--color-gold)',
        opacity: 0.3,
        fontFamily: 'Georgia, serif',
        marginBottom: '16px',
      }}>
        &ldquo;
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < rating ? 'var(--color-gold)' : 'var(--color-gray-300)', fontSize: '14px' }}>
            ★
          </span>
        ))}
      </div>

      {/* Quote */}
      <p style={{
        fontSize: '15px',
        lineHeight: 1.8,
        color: 'var(--color-gray-600)',
        marginBottom: '24px',
        fontStyle: 'italic',
      }}>
        {quote}
      </p>

      {/* Author */}
      <div style={{
        borderTop: '1px solid var(--color-gray-200)',
        paddingTop: '16px',
      }}>
        <p style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-black)',
          marginBottom: '4px',
        }}>
          {name}
        </p>
        <p style={{
          fontSize: '13px',
          color: 'var(--color-gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {event}
        </p>
      </div>
    </div>
  );
}
