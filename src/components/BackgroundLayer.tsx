import React, { useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BACKGROUND_PRESETS } from '../data/presets';

export const BackgroundLayer: React.FC = () => {
  const {
    backgroundId,
    customBackgroundData,
    customBackgroundUrl,
    dimLevel,
    blurLevel,
  } = useDashboard();

  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedPreset =
    BACKGROUND_PRESETS.find((b) => b.id === backgroundId) || BACKGROUND_PRESETS[0];

  const hasCustomUpload = Boolean(customBackgroundData);
  const hasCustomUrl = Boolean(customBackgroundUrl);

  // Guarantee that every video is strictly muted and autoplays smoothly
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.volume = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [backgroundId]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-black transition-colors duration-700">
      {/* Background Visual Surface (Video / Custom / CSS) */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-700 transform scale-[1.01]"
        style={{
          filter: blurLevel > 0 ? `blur(${blurLevel}px)` : undefined,
        }}
      >
        {hasCustomUpload ? (
          <img
            src={customBackgroundData!}
            alt="Custom wallpaper"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        ) : hasCustomUrl ? (
          <img
            src={customBackgroundUrl!}
            alt="Custom wallpaper"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : selectedPreset.type === 'video' && selectedPreset.videoUrl ? (
          <video
            ref={videoRef}
            key={selectedPreset.videoUrl}
            src={selectedPreset.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: selectedPreset.cssStyle || '#050505',
            }}
          />
        )}
      </div>

      {/* Dimmer Scrim for crisp clock legibility */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${dimLevel / 100})`,
        }}
      />

      {/* Subtle Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
    </div>
  );
};
