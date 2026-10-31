import React, { useRef, useState } from 'react';
import {
  Upload,
  Link,
  Check,
  Trash2,
  Sliders,
  Play,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { BACKGROUND_PRESETS, CLOCK_FONTS, ACCENT_THEMES } from '../data/presets';
import { BackgroundOption } from '../types';

interface WallpaperCardProps {
  wallpaper: BackgroundOption;
  isSelected: boolean;
  accentPrimary: string;
  onSelect: () => void;
}

const WallpaperVideoCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  isSelected,
  accentPrimary,
  onSelect,
}) => {
  const thumbVideoRef = useRef<HTMLVideoElement>(null);
  const matchedFont = CLOCK_FONTS.find((f) => f.id === wallpaper.recommendedFont);
  const matchedAccent = wallpaper.recommendedAccent
    ? ACCENT_THEMES[wallpaper.recommendedAccent]
    : null;

  const handleMouseEnter = () => {
    if (thumbVideoRef.current) {
      thumbVideoRef.current.muted = true;
      thumbVideoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (thumbVideoRef.current) {
      thumbVideoRef.current.pause();
    }
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-colors ${
        isSelected
          ? 'border-white/70 ring-2 ring-white/40 shadow-2xl'
          : 'border-white/10 hover:border-white/35 bg-black/50'
      }`}
    >
      {/* Video thumbnail: pauses when not hovered so main background video keeps 100% 4K GPU bandwidth */}
      <div className="relative w-full h-44 bg-neutral-950 overflow-hidden">
        <video
          ref={thumbVideoRef}
          src={`${wallpaper.videoUrl}#t=0.1`}
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Bottom Title Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

        {/* Selected checkmark */}
        {isSelected && (
          <div
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-black font-bold shadow-lg"
            style={{ backgroundColor: accentPrimary }}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <span className="block text-sm font-semibold text-white drop-shadow-md">
            {wallpaper.name}
          </span>
          <span className="block text-[11px] text-neutral-300 line-clamp-1">
            {wallpaper.description}
          </span>
        </div>
      </div>

      {/* Footer with Matched Font & Accent info */}
      <div className="p-2.5 bg-black/75 backdrop-blur-sm border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5 truncate">
          <span>Matched:</span>
          <span className="text-white font-medium truncate">{matchedFont?.name}</span>
        </div>

        {matchedAccent && (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: matchedAccent.primary }}
            />
            <span>{matchedAccent.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const WallpapersTab: React.FC = () => {
  const {
    backgroundId,
    selectWallpaper,
    customBackgroundData,
    setCustomBackgroundData,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    setCustomBackgroundIsVideo,
    dimLevel,
    setDimLevel,
    blurLevel,
    setBlurLevel,
    currentAccent,
  } = useDashboard();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState<string>(customBackgroundUrl || '');
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCustomBackgroundIsVideo(file.type.startsWith('video/'));
    setCustomBackgroundData(objectUrl);
    setCustomBackgroundUrl(null);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput.trim());
      setCustomBackgroundUrl(urlInput.trim());
      setCustomBackgroundData(null);
      setUrlError(null);
    } catch {
      setUrlError('Please enter a valid image/video URL.');
    }
  };

  const clearCustom = () => {
    setCustomBackgroundData(null);
    setCustomBackgroundUrl(null);
    setCustomBackgroundIsVideo(false);
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    selectWallpaper('video-gojo-void');
  };

  const videoWallpapers = BACKGROUND_PRESETS.filter((b) => b.type === 'video');

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 select-none">
      {/* 16 Looping Video Wallpapers Showcase */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" style={{ color: currentAccent.primary }} />
            <h2 className="text-base font-semibold text-white tracking-wide">
              4K & HD Looping Video Wallpapers ({videoWallpapers.length})
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Hover card to preview · Click to apply in full 4K/HD quality
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoWallpapers.map((wallpaper) => {
            const isSelected =
              backgroundId === wallpaper.id && !customBackgroundData && !customBackgroundUrl;

            return (
              <WallpaperVideoCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                isSelected={isSelected}
                accentPrimary={currentAccent.primary}
                onSelect={() => selectWallpaper(wallpaper.id, true)}
              />
            );
          })}
        </div>
      </div>

      {/* Atmospheric Overlays & Scrim Tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" style={{ color: currentAccent.primary }} />
              <span className="text-sm font-medium text-white">Background Dimmer</span>
            </div>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">{dimLevel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={dimLevel}
            onChange={(e) => setDimLevel(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: currentAccent.primary }}
          />
          <p className="text-[11px] text-neutral-500 mt-2">
            0% keeps 100% original video brightness & vibrancy.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" style={{ color: currentAccent.primary }} />
              <span className="text-sm font-medium text-white">Soft Focus Blur</span>
            </div>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">{blurLevel}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            value={blurLevel}
            onChange={(e) => setBlurLevel(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: currentAccent.primary }}
          />
          <p className="text-[11px] text-neutral-500 mt-2">
            0px keeps 100% original crystal-clear sharpness.
          </p>
        </div>
      </div>

      {/* Custom Upload */}
      <div className="p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: currentAccent.primary }} />
            <span className="text-sm font-medium text-white">Custom Wallpaper</span>
          </div>
          {(customBackgroundData || customBackgroundUrl) && (
            <button
              onClick={clearCustom}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Custom</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (Video / Image)</span>
          </button>

          <form onSubmit={handleApplyUrl} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Link className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="Or paste video/image URL"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-black transition-all"
              style={{ backgroundColor: currentAccent.primary }}
            >
              Apply
            </button>
          </form>
        </div>
        {urlError && <p className="text-xs text-red-400 mt-2">{urlError}</p>}
      </div>
    </div>
  );
};
