'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleUp';
  delay?: number;
  style?: React.CSSProperties;
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.animationDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(`sr-animate-${animation}`, 'sr-visible');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animation, delay]);

  return (
    <div
      ref={ref}
      className={`sr-hidden ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
