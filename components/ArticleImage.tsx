'use client';

import { useState } from 'react';
import NextImage from 'next/image';

interface ArticleImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

export default function ArticleImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackSrc = '/logohl.png',
  fill = true,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  priority = false,
}: ArticleImageProps) {
  const [error, setError] = useState(false);
  const resolvedSrc = (!src || error) ? null : src;

  // Jika src kosong atau error, render fallback lokal
  if (!resolvedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
      />
    );
  }

  // Gunakan next/image untuk semua URL agar di-cache & di-optimize Vercel
  if (fill) {
    return (
      <NextImage
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        onError={() => setError(true)}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <NextImage
      src={resolvedSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 450}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
