import React from 'react';
import { resolveMediaUrl } from '../lib/mediaAssets';

interface LogoProps {
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

export function YummyTummyLogo({ logoUrl, size = 'md', variant = 'default' }: LogoProps) {
  const iconDimensions = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const textClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
        ? 'text-2xl'
        : 'text-xl';

  if (logoUrl) {
    return (
      <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <img
          src={resolveMediaUrl(logoUrl)}
          alt="Yummy Tummy"
          referrerPolicy="no-referrer"
          className={`${iconDimensions} rounded-full object-contain`}
        />
        <span
          className={`font-display font-extrabold tracking-tight ${textClass} ${
            variant === 'light' ? 'text-white' : 'text-[#35170D]'
          }`}
        >
          Yummy <span className="text-[#F15A00]">Tummy</span>
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 64 64"
        className={`${iconDimensions} shrink-0`}
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="31" fill="#F15A00" />
        <circle cx="32" cy="32" r="27" fill="none" stroke="#FFF5E9" strokeWidth="1.75" strokeOpacity="0.85" />
        <path
          d="M17 24c4-5 10-7.5 15-7.5s11 2.5 15 7.5"
          fill="none"
          stroke="#35170D"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <text
          x="32"
          y="33"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Bricolage Grotesque, sans-serif"
          fontWeight="800"
          fontSize="13.5"
          letterSpacing="-0.5"
        >
          YUMMY
        </text>
        <text
          x="32"
          y="46"
          textAnchor="middle"
          fill="#35170D"
          fontFamily="Bricolage Grotesque, sans-serif"
          fontWeight="800"
          fontSize="10.5"
          letterSpacing="0.4"
        >
          TUMMY
        </text>
      </svg>
      <span
        className={`font-display font-extrabold tracking-tight ${textClass} ${
          variant === 'light' ? 'text-white' : 'text-[#35170D]'
        }`}
      >
        Yummy <span className="text-[#F15A00]">Tummy</span>
      </span>
    </span>
  );
}
