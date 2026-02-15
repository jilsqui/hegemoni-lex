// components/ViewCounter.tsx
'use client';

import { useEffect } from 'react';

export default function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Increment view count when article is loaded
    const incrementView = async () => {
      try {
        await fetch('/api/articles/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        });
      } catch (error) {
        // Silently fail — view tracking is non-critical
        console.error('Failed to track view:', error);
      }
    };

    incrementView();
  }, [articleId]);

  return null; // This component renders nothing
}
