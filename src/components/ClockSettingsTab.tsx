import React from 'react';
import { Type, Palette, Clock, Globe, Eye, Check } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { ACCENT_THEMES, CLOCK_FONTS } from '../data/presets';
import { AccentColorId, ClockFontId } from '../types';

export const ClockSettingsTab: React.FC = () => {
  const {
    clockFontId,
    setClockFontId,
    accentId,
    setAccentId,
    currentAccent,
    is24Hour,
    setIs24Hour,
    showSeconds,
    setShowSeconds,
    showDate,
    setShowDate,
    timezone,
    setTimezone,
    setActiveTab,
  } = useDashboard();

  const previewTime = '10:42';

  const timezones = [
    { id: 'local', label: 'Local Device Time' },
    { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { id: 'America/New_York', label: 'New York (EDT/EST)' },
    { id: 'Europe/London', label: 'London (GMT/BST)' },
    { id: 'Europe/Paris', label: 'Paris (CEST/CET)' },
    { id: 'America/Los_Angeles', label: 'Los Angeles (PDT/PST)' },
  ];

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 select-none">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Clock Settings
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize typography, accent hues, and time format.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('clock')}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-black transition-all shadow-lg hover:scale-105"
          style={{ backgroundColor: currentAccent.primary }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Clock</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Clock Font Typography Selector */}
        <div className="p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-4 h-4" style={{ color: currentAccent.primary }} />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Clock Typography
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLOCK_FONTS.map((font) => {
              const isSelected = clockFontId === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => setClockFontId(font.id as ClockFontId)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-white/50 bg-white/10 shadow-md ring-1 ring-white/30'
                      : 'border-white/10 hover:border-white/20 bg-black/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{font.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                        {font.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {font.description}
                    </span>
                  </div>

                  <div
                    className={`text-2xl text-white ml-2 shrink-0 tabular-nums ${font.cssClass}`}
                    style={{
                      color: isSelected ? currentAccent.primary : undefined,
                    }}
                  >
                    {previewTime}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4" style={{ color: currentAccent.primary }} />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Accent Theme
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(ACCENT_THEMES) as AccentColorId[]).map((themeKey) => {
              const theme = ACCENT_THEMES[themeKey];
              const isSelected = accentId === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => setAccentId(themeKey)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'border-white/50 bg-white/15 shadow-sm ring-1 ring-white/30'
                      : 'border-white/10 hover:border-white/20 bg-black/40'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-white">{theme.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Format Options */}
        <div className="p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" style={{ color: currentAccent.primary }} />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Display Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setIs24Hour((p) => !p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                is24Hour
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/10 bg-black/40 text-neutral-300 hover:text-white'
              }`}
            >
              <span className="block text-xs font-medium">Time Format</span>
              <span className="block text-[11px] text-neutral-400 mt-1">
                {is24Hour ? '24-Hour (14:30)' : '12-Hour (02:30 PM)'}
              </span>
            </button>

            <button
              onClick={() => setShowSeconds((p) => !p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                showSeconds
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/10 bg-black/40 text-neutral-300 hover:text-white'
              }`}
            >
              <span className="block text-xs font-medium">Seconds Counter</span>
              <span className="block text-[11px] text-neutral-400 mt-1">
                {showSeconds ? 'Visible (:45)' : 'Hidden'}
              </span>
            </button>

            <button
              onClick={() => setShowDate((p) => !p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                showDate
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/10 bg-black/40 text-neutral-300 hover:text-white'
              }`}
            >
              <span className="block text-xs font-medium">Calendar Date</span>
              <span className="block text-[11px] text-neutral-400 mt-1">
                {showDate ? 'Visible' : 'Hidden'}
              </span>
            </button>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-300">Timezone</span>
            </div>

            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="bg-neutral-900 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              {timezones.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
