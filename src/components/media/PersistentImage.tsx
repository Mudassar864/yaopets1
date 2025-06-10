import React, { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

interface PersistentImageProps {
  src: string;
  alt: string;
  className?: string;
  onImageLoad?: (permanentUrl: string) => void;
}

/**
 * Component that ensures an image is handled for permanent storage.
 * Automatically handles blob URLs (used directly in browser).
 * No conversion is attempted for blobs; upload to server should be handled elsewhere.
 */
export default function PersistentImage({
  src,
  alt,
  className = '',
  onImageLoad
}: PersistentImageProps) {
  const [finalSrc, setFinalSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If it's a blob URL, use it directly in the browser (no conversion)
    if (src && typeof src === 'string') {
      setFinalSrc(src);
      // No attempt to convert blobs; users should upload for persistence
    } else {
      setFinalSrc(src || '');
    }
  }, [src, onImageLoad]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-100 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Processing image...
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className={`bg-gray-100 ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Image not available
        </div>
      </div>
    );
  }

  // Render the optimized image with final URL
  return (
    <OptimizedImage 
      src={finalSrc} 
      alt={alt} 
      className={className}
    />
  );
}