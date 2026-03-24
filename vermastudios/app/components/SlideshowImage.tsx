'use client';

import { useState, useEffect } from 'react';

interface SlideshowImageProps {
  images: { id: number; url: string }[];
  fallbackUrl: string;
}

export default function SlideshowImage({ images, fallbackUrl }: SlideshowImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    // Offset the start time slightly so grid items don't shift all at once
    const randomOffset = Math.random() * 2000;
    
    let interval: NodeJS.Timeout;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, 3500);
    }, randomOffset);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [images]);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  if (!images || images.length === 0) {
    return (
      <div
        className="portfolio-img"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${getImageUrl(fallbackUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.5s ease',
        }}
      />
    );
  }

  return (
    <div
      className="portfolio-img"
      style={{
        position: 'absolute',
        inset: 0,
        transition: 'transform 0.5s ease',
      }}
    >
      {images.map((img, index) => (
        <div
          key={img.id || index}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${getImageUrl(img.url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentIndex === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        />
      ))}
      
      {/* Slideshow Progress Indicators */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '4px',
          zIndex: 10,
        }}>
          {images.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: currentIndex === idx ? 'var(--color-gold)' : 'rgba(255,255,255,0.4)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
