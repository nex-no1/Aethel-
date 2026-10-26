import React, { createContext, useContext, useEffect, useState } from 'react';
import { ACCENT_THEMES, BACKGROUND_PRESETS, CLOCK_FONTS } from '../data/presets';
import {
  AccentColorId,
  AccentThemeOption,
  ClockFontId,
  ClockFontOption,
  TabId,
} from '../types';

interface DashboardContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  clockFontId: ClockFontId;
  setClockFontId: (id: ClockFontId) => void;
  currentClockFont: ClockFontOption;

  accentId: AccentColorId;
  setAccentId: (id: AccentColorId) => void;
  currentAccent: AccentThemeOption;

  is24Hour: boolean;
  setIs24Hour: (val: boolean | ((prev: boolean) => boolean)) => void;
  showSeconds: boolean;
  setShowSeconds: (val: boolean | ((prev: boolean) => boolean)) => void;
  showDate: boolean;
  setShowDate: (val: boolean | ((prev: boolean) => boolean)) => void;
  timezone: string;
  setTimezone: (tz: string) => void;

  backgroundId: string;
  selectWallpaper: (id: string, autoMatchStyles?: boolean) => void;
  customBackgroundUrl: string | null;
  setCustomBackgroundUrl: (url: string | null) => void;
  customBackgroundData: string | null;
  setCustomBackgroundData: (data: string | null) => void;

  dimLevel: number; // 0 to 80
  setDimLevel: (val: number) => void;
  blurLevel: number; // 0 to 16
  setBlurLevel: (val: number) => void;

  isZenMode: boolean;
  setIsZenMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

const STORAGE_KEY = 'minimal_aesthetic_clock_prefs_v3';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabId>('clock');

  // Preferences
  const [clockFontId, setClockFontIdState] = useState<ClockFontId>('cormorant');
  const [accentId, setAccentIdState] = useState<AccentColorId>('red');
  const [is24Hour, setIs24HourState] = useState<boolean>(false);
  const [showSeconds, setShowSecondsState] = useState<boolean>(true);
  const [showDate, setShowDateState] = useState<boolean>(true);
  const [timezone, setTimezoneState] = useState<string>('local');

  const [backgroundId, setBackgroundIdState] = useState<string>('video-spirit-dragon');
  const [customBackgroundUrl, setCustomBackgroundUrlState] = useState<string | null>(null);
  const [customBackgroundData, setCustomBackgroundDataState] = useState<string | null>(null);
  const [dimLevel, setDimLevelState] = useState<number>(20);
  const [blurLevel, setBlurLevelState] = useState<number>(0);

  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clockFontId) setClockFontIdState(parsed.clockFontId);
        if (parsed.accentId) setAccentIdState(parsed.accentId);
        if (typeof parsed.is24Hour === 'boolean') setIs24HourState(parsed.is24Hour);
        if (typeof parsed.showSeconds === 'boolean') setShowSecondsState(parsed.showSeconds);
        if (typeof parsed.showDate === 'boolean') setShowDateState(parsed.showDate);
        if (parsed.timezone) setTimezoneState(parsed.timezone);
        if (parsed.backgroundId) setBackgroundIdState(parsed.backgroundId);
        if (parsed.customBackgroundUrl) setCustomBackgroundUrlState(parsed.customBackgroundUrl);
        if (parsed.customBackgroundData) setCustomBackgroundDataState(parsed.customBackgroundData);
        if (typeof parsed.dimLevel === 'number') setDimLevelState(parsed.dimLevel);
        if (typeof parsed.blurLevel === 'number') setBlurLevelState(parsed.blurLevel);
      }
    } catch (e) {
      console.warn('Error reading preferences', e);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    try {
      const dataToSave = {
        clockFontId,
        accentId,
        is24Hour,
        showSeconds,
        showDate,
        timezone,
        backgroundId,
        customBackgroundUrl,
        customBackgroundData: customBackgroundData ? customBackgroundData.slice(0, 1000000) : null,
        dimLevel,
        blurLevel,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed saving preferences', e);
    }
  }, [
    clockFontId,
    accentId,
    is24Hour,
    showSeconds,
    showDate,
    timezone,
    backgroundId,
    customBackgroundUrl,
    customBackgroundData,
    dimLevel,
    blurLevel,
  ]);

  // Handle Fullscreen events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ESC exits Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const selectWallpaper = (id: string, autoMatchStyles = true) => {
    setBackgroundIdState(id);
    setCustomBackgroundDataState(null);
    setCustomBackgroundUrlState(null);

    if (autoMatchStyles) {
      const preset = BACKGROUND_PRESETS.find((b) => b.id === id);
      if (preset?.recommendedFont) {
        setClockFontIdState(preset.recommendedFont);
      }
      if (preset?.recommendedAccent) {
        setAccentIdState(preset.recommendedAccent);
      }
    }
  };

  const currentClockFont =
    CLOCK_FONTS.find((f) => f.id === clockFontId) || CLOCK_FONTS[0];
  const currentAccent =
    ACCENT_THEMES[accentId] || ACCENT_THEMES.red;

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        clockFontId,
        setClockFontId: setClockFontIdState,
        currentClockFont,
        accentId,
        setAccentId: setAccentIdState,
        currentAccent,
        is24Hour,
        setIs24Hour: setIs24HourState,
        showSeconds,
        setShowSeconds: setShowSecondsState,
        showDate,
        setShowDate: setShowDateState,
        timezone,
        setTimezone: setTimezoneState,
        backgroundId,
        selectWallpaper,
        customBackgroundUrl,
        setCustomBackgroundUrl: setCustomBackgroundUrlState,
        customBackgroundData,
        setCustomBackgroundData: setCustomBackgroundDataState,
        dimLevel,
        setDimLevel: setDimLevelState,
        blurLevel,
        setBlurLevel: setBlurLevelState,
        isZenMode,
        setIsZenMode,
        isFullscreen,
        toggleFullscreen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
};
