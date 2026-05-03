// components/ViewCounter.tsx
'use client';

import { useEffect } from 'react';

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function buildFingerprint() {
  if (typeof window === 'undefined') return '';
  return [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    window.screen.width,
    window.screen.height,
  ].join('|');
}

export default function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    const today = getTodayKey();
    const storageKey = `hl_article_view_${articleId}`;
    if (window.localStorage.getItem(storageKey) === today) {
      return;
    }

    // Increment view count when article is loaded (unique per article per day per browser)
    const incrementView = async () => {
      try {
        const fingerprint = buildFingerprint();
        await fetch('/api/articles/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, fingerprint }),
        });
        window.localStorage.setItem(storageKey, today);
      } catch (error) {
        // Silently fail — view tracking is non-critical
        console.error('Failed to track view:', error);
      }
    };

    incrementView();
  }, [articleId]);

  return null; // This component renders nothing
}
