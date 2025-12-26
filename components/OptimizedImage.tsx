'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized Image Component
 * 
 * Wrapper cho Next.js Image component với lazy loading và error handling
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback image nếu load lỗi
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=0F172A&color=fff&size=128`;

  if (error) {
    return (
      <div
        className={`bg-slate-200 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-slate-400 text-xs">Không tải được ảnh</span>
      </div>
    );
  }

  const imageProps: any = {
    src: src || fallbackSrc,
    alt,
    className: `${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: () => setError(true),
    onLoad: () => setLoading(false),
    loading: priority ? undefined : 'lazy',
    quality: 85, // Balance between quality and file size
  };

  if (fill) {
    imageProps.fill = true;
    imageProps.sizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    imageProps.style = { objectFit };
  } else {
    imageProps.width = width || 100;
    imageProps.height = height || 100;
  }

  return <Image {...imageProps} />;
}

