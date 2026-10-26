export type ClockFontId =
  | 'cinzel'
  | 'cormorant'
  | 'outfit'
  | 'mono'
  | 'bodoni'
  | 'orbitron'
  | 'syne'
  | 'jakarta';

export interface ClockFontOption {
  id: ClockFontId;
  name: string;
  cssClass: string;
  category: 'Serif' | 'Modern' | 'Monospace' | 'Cyber' | 'Display';
  description: string;
}

export type AccentColorId = 'gold' | 'red' | 'monochrome' | 'amber';

export interface AccentThemeOption {
  id: AccentColorId;
  name: string;
  primary: string;
  hover: string;
  glow: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  ringClass: string;
}

export type BackgroundType = 'video' | 'css' | 'image' | 'custom';

export interface BackgroundOption {
  id: string;
  name: string;
  type: BackgroundType;
  videoUrl?: string;
  imageUrl?: string;
  cssStyle?: string;
  description: string;
  recommendedFont?: ClockFontId;
  recommendedAccent?: AccentColorId;
}

export type TabId = 'clock' | 'timer' | 'wallpapers' | 'settings';
export type TimerMode = 'pomodoro' | 'custom' | 'stopwatch';
export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';
