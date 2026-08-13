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
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  // Jika src kosong, langsung render fallback sebagai <img> lokal
  if (!imgSrc || imgSrc === fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
      />
    );
  }

  // Gunakan next/image untuk semua URL eksternal (Supabase) agar di-cache Vercel
  if (fill) {
    return (
      <NextImage
        src={imgSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        onError={() => setImgSrc(fallbackSrc)}
      />
    );
  }

  return (
    <NextImage
      src={imgSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 450}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
