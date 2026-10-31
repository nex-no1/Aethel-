import React, { useRef, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BACKGROUND_PRESETS } from '../data/presets';

export const BackgroundLayer: React.FC = () => {
  const {
    backgroundId,
    customBackgroundData,
    customBackgroundUrl,
    customBackgroundIsVideo,
    dimLevel,
    blurLevel,
  } = useDashboard();

  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedPreset =
    BACKGROUND_PRESETS.find((b) => b.id === backgroundId) || BACKGROUND_PRESETS[0];

  const hasCustomUpload = Boolean(customBackgroundData);
  const hasCustomUrl = Boolean(customBackgroundUrl);

  const isUrlVideo =
    hasCustomUrl &&
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(customBackgroundUrl || '');

  // Guarantee that every video is strictly muted and autoplays at full native hardware quality
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.volume = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [backgroundId, customBackgroundData, customBackgroundUrl]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-black">
      {/* Background Visual Surface: 1:1 native pixel mapping with zero sub-pixel scale blur */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          filter: blurLevel > 0 ? `blur(${blurLevel}px)` : 'none',
          transform: blurLevel > 0 ? 'scale(1.03)' : 'none',
        }}
      >
        {hasCustomUpload ? (
          customBackgroundIsVideo ? (
            <video
              ref={videoRef}
              key={customBackgroundData}
              src={customBackgroundData!}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={customBackgroundData!}
              alt="Custom wallpaper"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          )
        ) : hasCustomUrl ? (
          isUrlVideo ? (
            <video
              ref={videoRef}
              key={customBackgroundUrl}
              src={customBackgroundUrl!}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={customBackgroundUrl!}
              alt="Custom wallpaper"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )
        ) : selectedPreset.type === 'video' && selectedPreset.videoUrl ? (
          <video
            ref={videoRef}
            key={selectedPreset.videoUrl}
            src={selectedPreset.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
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

      {/* Optional User-Controlled Dimmer (0% by default so video stays 100% crisp & vibrant) */}
      {dimLevel > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${dimLevel / 100})`,
          }}
        />
      )}
    </div>
  );
};
