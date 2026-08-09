'use client';

import { useState } from 'react';

interface ArticleImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function ArticleImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackSrc = '/logohl.png',
}: ArticleImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
