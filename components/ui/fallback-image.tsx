'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  hideBroken?: boolean;
}

export function FallbackImage({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc,
  hideBroken = false
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else if (hideBroken) {
      setHasError(true);
    }
  };

  if (hasError) {
    return null;
  }

  // Use Next.js Image if width and height are provided
  if (width && height) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onError={handleError}
      />
    );
  }

  // Use regular img tag if dimensions are not provided
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
