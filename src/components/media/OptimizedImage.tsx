import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://via.placeholder.com/400x400?text=Image+not+available'
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  // Function to try to convert the image if needed
  const handleImageError = () => {
    if (imgSrc === fallbackSrc) {
      // Already on fallback, nothing else to do
      setError(true);
      setLoading(false);
      return;
    }

    // Try converting the image via proxy
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
    
    // Check if the current URL is already a proxy
    if (imgSrc.includes('/api/image-proxy')) {
      // If already using the proxy and still failed, use the fallback
      setImgSrc(fallbackSrc);
      return;
    }
    
    // Try using the proxy
    setImgSrc(proxyUrl);
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4h6v6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4l-8 8" />
          </svg>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}

export default OptimizedImage;