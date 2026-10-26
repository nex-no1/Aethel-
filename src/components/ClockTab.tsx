import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

export const ClockTab: React.FC = () => {
  const {
    currentClockFont,
    currentAccent,
    is24Hour,
    setIs24Hour,
    showSeconds,
    setShowSeconds,
    showDate,
    setShowDate,
    timezone,
    isZenMode,
    setIsZenMode,
  } = useDashboard();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const timerId = setInterval(updateTime, 250);
    return () => clearInterval(timerId);
  }, []);

  const getTimeParts = () => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
      timeZone: timezone === 'local' ? undefined : timezone,
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(currentTime);

    let hour = '';
    let minute = '';
    let second = '';
    let dayPeriod = '';

    parts.forEach((p) => {
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
      if (p.type === 'second') second = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
    });

    return { hour, minute, second, dayPeriod };
  };

  const { hour, minute, second, dayPeriod } = getTimeParts();

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone === 'local' ? undefined : timezone,
    };
    return new Intl.DateTimeFormat('en-US', options).format(currentTime);
  };

  return (
    <div className="relative z-10 w-full min-h-[calc(100vh-120px)] flex flex-col justify-center items-center px-4 py-8 select-none">
      {/* Aesthetic Clock Display */}
      <div className="my-auto flex flex-col items-center justify-center text-center max-w-5xl w-full">
        {/* Main Digits */}
        <div className="relative flex items-center justify-center">
          <div
            className={`flex items-baseline justify-center tabular-nums text-white transition-all duration-300 ${currentClockFont.cssClass}`}
            style={{
              textShadow: `0 4px 30px rgba(0, 0, 0, 0.9), 0 0 35px ${currentAccent.glow}`,
            }}
          >
            {/* Hour */}
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[11.5rem] leading-none font-normal">
              {hour}
            </span>

            {/* Pulsing Colon */}
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-none px-1 sm:px-3 md:px-4 opacity-80 animate-pulse"
              style={{ color: currentAccent.primary }}
            >
              :
            </span>

            {/* Minute */}
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[11.5rem] leading-none font-normal">
              {minute}
            </span>

            {/* Optional Seconds */}
            {showSeconds && (
              <span
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl ml-2 sm:ml-4 opacity-75 font-light"
                style={{ color: currentAccent.primary }}
              >
                :{second}
              </span>
            )}

            {/* AM / PM in 12h mode */}
            {!is24Hour && dayPeriod && (
              <span className="ml-3 sm:ml-5 text-sm sm:text-lg md:text-xl font-mono tracking-widest uppercase opacity-60 self-start mt-2 sm:mt-6">
                {dayPeriod}
              </span>
            )}
          </div>
        </div>

        {/* Date line */}
        {showDate && (
          <div
            className="mt-4 md:mt-6 text-neutral-300 tracking-[0.25em] uppercase text-xs sm:text-sm font-medium drop-shadow-lg"
            style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}
          >
            {formatDate()}
          </div>
        )}
      </div>

      {/* Minimal Floating Bottom Bar */}
      {!isZenMode && (
        <div className="flex items-center gap-2 p-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-xl text-xs text-neutral-400">
          <button
            onClick={() => setIs24Hour((p) => !p)}
            className="px-3 py-1 rounded-full hover:text-white transition-colors"
          >
            {is24Hour ? '24H' : '12H'}
          </button>
          <span className="opacity-30">·</span>
          <button
            onClick={() => setShowSeconds((p) => !p)}
            className="px-3 py-1 rounded-full hover:text-white transition-colors"
          >
            {showSeconds ? 'Seconds On' : 'Seconds Off'}
          </button>
          <span className="opacity-30">·</span>
          <button
            onClick={() => setShowDate((p) => !p)}
            className="px-3 py-1 rounded-full hover:text-white transition-colors"
          >
            {showDate ? 'Date On' : 'Date Off'}
          </button>
          <span className="opacity-30">·</span>
          <button
            onClick={() => setIsZenMode(true)}
            className="px-3 py-1 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            Hide UI
          </button>
        </div>
      )}
    </div>
  );
};
