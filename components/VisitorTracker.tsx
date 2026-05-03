'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'hl_visitor_track_day';

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

export default function VisitorTracker() {
  useEffect(() => {
    const today = getTodayKey();
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === today) {
      return;
    }

    const fingerprint = buildFingerprint();
    if (!fingerprint) return;

    fetch('/api/visitors/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint }),
    })
      .then((res) => {
        if (res.ok) {
          window.localStorage.setItem(STORAGE_KEY, today);
        }
      })
      .catch(() => {
        // Visitor analytics should not break UX.
      });
  }, []);

  return null;
}
