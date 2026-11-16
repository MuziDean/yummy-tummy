import React, { useEffect, useState } from 'react';

export function Preloader() {
  const [isPreloading, setIsPreloading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const preloadAsset = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const isVideo = url.endsWith('.mp4');
        const el = isVideo
          ? document.createElement('video')
          : document.createElement('img');
        if (isVideo) (el as HTMLVideoElement).preload = 'auto';
        el.src = url;
        el.onload = () => resolve();
        el.onerror = () => resolve();
        if (isVideo) {
          (el as HTMLVideoElement).onloadeddata = () => resolve();
          (el as HTMLVideoElement).muted = true;
          (el as HTMLVideoElement).playsInline = true;
        }
      });
    };

    const init = async () => {
      // Critical assets to preload before revealing the site
      const assets = [
        '/vid final.mp4',   // hero background video
        '/preloader.mp4',   // preloader video itself
        '/logo 1.png',      // brand logo
        '/about.jpg',       // our story background
      ];
      await Promise.all(assets.map(preloadAsset));

      // Keep preloader visible for a minimum duration so it isn't a flash
      await new Promise((r) => setTimeout(r, 1200));

      setFadeOut(true);
      await new Promise((r) => setTimeout(r, 600)); // fade-out duration
      setIsPreloading(false);
    };

    init();
  }, []);

  if (!isPreloading) return null;

  return (
    <div
      style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 0.6s ease' }}
      className="fixed inset-0 z-[100] bg-[#35170D] flex flex-col items-center justify-center text-white"
      aria-hidden="true"
    >
      {/* Full-screen looping preloader video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/preloader.mp4"
        aria-hidden="true"
      />
      {/* Dark overlay so text pops */}
      <div className="absolute inset-0 bg-[#35170D]/40" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium tracking-widest uppercase text-[#FFF5E9]">
          Please wait, still loading
        </p>
        <p className="text-xs text-[#FFF5E9]/60 uppercase tracking-[0.2em]">
          getting everything ready for you
        </p>
      </div>
    </div>
  );
}