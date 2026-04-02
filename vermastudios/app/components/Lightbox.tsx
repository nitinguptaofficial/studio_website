'use client';

import { useEffect } from 'react';

import { getImageUrl } from '@/app/lib/api';

interface LightboxProps {
  images: { url: string; title: string; type?: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onPrev, onNext]);

  const current = images[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}>
        {current.type === 'video' ? (
          <video
            src={getImageUrl(current.url)}
            controls
            autoPlay
            className="lightbox-img"
            style={{
              display: 'block',
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={getImageUrl(current.url)}
            alt={current.title}
            className="lightbox-img"
            style={{
              display: 'block',
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
            }}
          />
        )}

        {/* Caption */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: '#fafafa',
          whiteSpace: 'nowrap',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{current.title}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Close button */}
      <button className="lightbox-btn lightbox-close" onClick={onClose}>✕</button>

      {/* Prev/Next */}
      {images.length > 1 && (
        <>
          <button className="lightbox-btn lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>
          <button className="lightbox-btn lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>
        </>
      )}
    </div>
  );
}
