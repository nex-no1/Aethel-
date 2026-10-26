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

export const WallpapersTab: React.FC = () => {
  const {
    backgroundId,
    selectWallpaper,
    customBackgroundData,
    setCustomBackgroundData,
    customBackgroundUrl,
    setCustomBackgroundUrl,
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
      alert('Please select an image or video file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomBackgroundData(result);
      setCustomBackgroundUrl(null);
    };
    reader.readAsDataURL(file);
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
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    selectWallpaper('video-spirit-dragon');
  };

  const videoWallpapers = BACKGROUND_PRESETS.filter((b) => b.type === 'video');

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 select-none">
      {/* 7 Looping Video Wallpapers Showcase */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4" style={{ color: currentAccent.primary }} />
            <h2 className="text-base font-semibold text-white tracking-wide">
              Looping Video Wallpapers ({videoWallpapers.length})
            </h2>
          </div>
          <span className="text-xs text-neutral-400">All videos muted & looping</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoWallpapers.map((wallpaper) => {
            const isSelected =
              backgroundId === wallpaper.id && !customBackgroundData && !customBackgroundUrl;
            const matchedFont = CLOCK_FONTS.find((f) => f.id === wallpaper.recommendedFont);
            const matchedAccent = wallpaper.recommendedAccent
              ? ACCENT_THEMES[wallpaper.recommendedAccent]
              : null;

            return (
              <div
                key={wallpaper.id}
                onClick={() => selectWallpaper(wallpaper.id, true)}
                className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-white/60 ring-2 ring-white/40 shadow-2xl scale-[1.02]'
                    : 'border-white/10 hover:border-white/30 bg-black/40 hover:scale-[1.01]'
                }`}
              >
                {/* Looping video thumbnail (strictly muted) */}
                <div className="relative w-full h-44 bg-neutral-900 overflow-hidden">
                  <video
                    src={wallpaper.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-black font-bold shadow-lg"
                      style={{ backgroundColor: currentAccent.primary }}
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
                <div className="p-2.5 bg-black/70 backdrop-blur-sm border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
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
            Darkens video wallpaper so clock numbers remain ultra-readable.
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
            Adds cinematic soft focus blur behind the clock numbers.
          </p>
        </div>
      </div>

      {/* Minimalist Presets & Custom Upload */}
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
