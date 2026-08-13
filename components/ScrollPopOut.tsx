// components/ScrollPopOut.tsx
'use client';

import { useEffect, useRef } from 'react';

interface ScrollPopOutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollPopOut({ children, className = '' }: ScrollPopOutProps) {
  const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only apply on mobile (< 768px)
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      // Ensure desktop always visible regardless of CSS initial state
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`scroll-pop-out ${className}`}>
      {children}
    </div>
  );
}
