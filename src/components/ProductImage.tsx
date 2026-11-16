import React, { useState } from 'react';
import { Cookie } from 'lucide-react';
import { resolveMediaUrl } from '../lib/mediaAssets';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveMediaUrl(src);

  if (failed || !resolved) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5E9] to-[#F7F6F3] text-[#35170D]/60 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Cookie className="w-10 h-10 text-[#F15A00]/60 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}
