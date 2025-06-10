import React, { useState, useRef } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

export function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc,
  onError,
  loading = 'lazy' 
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Detectar se é GIF
  const isGif = (url: string): boolean => {
    return url.toLowerCase().includes('.gif') || url.toLowerCase().includes('gif');
  };

  // Função para tentar diferentes formatos de URL
  const tryImageUrl = (url: string): string => {
    // Se a URL já está completa, use como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se começa com /uploads, use diretamente
    if (url.startsWith('/uploads')) {
      return url;
    }
    
    // Se não tem protocolo, adicione o path relativo
    if (url.startsWith('uploads/')) {
      return `/${url}`;
    }
    
    // Fallback: tente como path relativo
    return `/uploads/${url}`;
  };

  const handleImageError = () => {
    console.warn(`Erro ao carregar imagem: ${src}`);
    setImageError(true);
    setIsLoading(false);
    
    if (onError) {
      onError();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Se teve erro e não tem fallback, mostrar placeholder
  if (imageError && !fallbackSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center p-4">
          <svg 
            className="w-8 h-8 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-xs">Imagem indisponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
      
      <img
        ref={imgRef}
        src={imageError && fallbackSrc ? fallbackSrc : tryImageUrl(src)}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={loading}
        crossOrigin="anonymous"
      />
    </div>
  );
}

export default SafeImage;