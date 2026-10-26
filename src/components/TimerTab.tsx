import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer as TimerIcon,
  Clock as StopwatchIcon,
  Sliders,
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { soundEngine } from '../services/soundEngine';
import { PomodoroPhase, TimerMode } from '../types';

export const TimerTab: React.FC = () => {
  const { currentAccent, currentClockFont } = useDashboard();

  const [mode, setMode] = useState<TimerMode>('pomodoro');

  // Pomodoro
  const [pomoPhase, setPomoPhase] = useState<PomodoroPhase>('work');
  const [pomoRound, setPomoRound] = useState<number>(1);
  const workMinutes = 25;
  const shortBreakMinutes = 5;
  const longBreakMinutes = 15;

  // Countdown & Timer state
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [totalDuration, setTotalDuration] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Custom Timer
  const [customMins, setCustomMins] = useState<number>(30);

  // Stopwatch
  const [swTimeMs, setSwTimeMs] = useState<number>(0);
  const [swIsRunning, setSwIsRunning] = useState<boolean>(false);
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const swStartTimeRef = useRef<number>(0);
  const swSavedTimeRef = useRef<number>(0);

  // Pomodoro tick
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft <= 0) {
      setIsRunning(false);
      soundEngine.playChime();

      if (mode === 'pomodoro') {
        if (pomoPhase === 'work') {
          if (pomoRound % 4 === 0) {
            setPomoPhase('longBreak');
            setTimeLeft(longBreakMinutes * 60);
            setTotalDuration(longBreakMinutes * 60);
          } else {
            setPomoPhase('shortBreak');
            setTimeLeft(shortBreakMinutes * 60);
            setTotalDuration(shortBreakMinutes * 60);
          }
        } else {
          setPomoPhase('work');
          setPomoRound((prev) => prev + 1);
          setTimeLeft(workMinutes * 60);
          setTotalDuration(workMinutes * 60);
        }
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, pomoPhase, pomoRound]);

  // Stopwatch tick
  useEffect(() => {
    let animFrame: number;
    if (swIsRunning) {
      const updateSw = () => {
        const now = performance.now();
        const elapsed = now - swStartTimeRef.current + swSavedTimeRef.current;
        setSwTimeMs(elapsed);
        animFrame = requestAnimationFrame(updateSw);
      };
      animFrame = requestAnimationFrame(updateSw);
    }
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [swIsRunning]);

  const switchPhase = (phase: PomodoroPhase) => {
    setIsRunning(false);
    setPomoPhase(phase);
    let dur = workMinutes * 60;
    if (phase === 'shortBreak') dur = shortBreakMinutes * 60;
    if (phase === 'longBreak') dur = longBreakMinutes * 60;
    setTimeLeft(dur);
    setTotalDuration(dur);
  };

  const applyCustomMinutes = (minutes: number) => {
    setIsRunning(false);
    setCustomMins(minutes);
    const sec = minutes * 60;
    setTimeLeft(sec);
    setTotalDuration(sec);
  };

  const toggleTimer = () => setIsRunning((p) => !p);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      let dur = workMinutes * 60;
      if (pomoPhase === 'shortBreak') dur = shortBreakMinutes * 60;
      if (pomoPhase === 'longBreak') dur = longBreakMinutes * 60;
      setTimeLeft(dur);
      setTotalDuration(dur);
    } else {
      setTimeLeft(customMins * 60);
      setTotalDuration(customMins * 60);
    }
  };

  const skipPhase = () => {
    setIsRunning(false);
    if (pomoPhase === 'work') {
      if (pomoRound % 4 === 0) switchPhase('longBreak');
      else switchPhase('shortBreak');
    } else {
      setPomoRound((p) => p + 1);
      switchPhase('work');
    }
  };

  // Stopwatch handlers
  const handleSwToggle = () => {
    if (swIsRunning) {
      swSavedTimeRef.current = swTimeMs;
      setSwIsRunning(false);
    } else {
      swStartTimeRef.current = performance.now();
      setSwIsRunning(true);
    }
  };

  const handleSwReset = () => {
    setSwIsRunning(false);
    swSavedTimeRef.current = 0;
    setSwTimeMs(0);
    setSwLaps([]);
  };

  const handleSwLap = () => {
    if (swTimeMs > 0) {
      setSwLaps((prev) => [swTimeMs, ...prev]);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const progressRatio = totalDuration > 0 ? Math.max(0, Math.min(1, timeLeft / totalDuration)) : 1;
  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center select-none min-h-[calc(100vh-120px)] justify-center">
      {/* Mode Selector Tabs */}
      <div className="flex items-center p-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full mb-8">
        <button
          onClick={() => {
            setMode('pomodoro');
            setIsRunning(false);
            switchPhase('work');
          }}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
            mode === 'pomodoro' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <TimerIcon className="w-3.5 h-3.5" />
          <span>Pomodoro</span>
        </button>

        <button
          onClick={() => {
            setMode('custom');
            setIsRunning(false);
            applyCustomMinutes(30);
          }}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
            mode === 'custom' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Timer</span>
        </button>

        <button
          onClick={() => {
            setMode('stopwatch');
            setIsRunning(false);
          }}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
            mode === 'stopwatch' ? 'bg-white/20 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <StopwatchIcon className="w-3.5 h-3.5" />
          <span>Stopwatch</span>
        </button>
      </div>

      {/* Pomodoro View */}
      {mode === 'pomodoro' && (
        <div className="flex flex-col items-center">
          {/* Phase Switcher */}
          <div className="flex items-center gap-2 mb-6 text-xs text-neutral-400">
            <button
              onClick={() => switchPhase('work')}
              className={`px-3 py-1 rounded-full transition-all ${
                pomoPhase === 'work' ? 'text-white bg-white/15 font-medium' : 'hover:text-white'
              }`}
            >
              Focus 25m
            </button>
            <span>·</span>
            <button
              onClick={() => switchPhase('shortBreak')}
              className={`px-3 py-1 rounded-full transition-all ${
                pomoPhase === 'shortBreak' ? 'text-white bg-white/15 font-medium' : 'hover:text-white'
              }`}
            >
              Short Break 5m
            </button>
            <span>·</span>
            <button
              onClick={() => switchPhase('longBreak')}
              className={`px-3 py-1 rounded-full transition-all ${
                pomoPhase === 'longBreak' ? 'text-white bg-white/15 font-medium' : 'hover:text-white'
              }`}
            >
              Long Break 15m
            </button>
          </div>

          {/* Circular Countdown */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
              <circle
                cx="150"
                cy="150"
                r="130"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="150"
                cy="150"
                r="130"
                stroke={currentAccent.primary}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500 ease-linear"
                style={{ filter: `drop-shadow(0 0 10px ${currentAccent.glow})` }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`text-6xl sm:text-7xl text-white font-normal tabular-nums ${currentClockFont.cssClass}`}
                style={{
                  textShadow: `0 4px 20px rgba(0, 0, 0, 0.9), 0 0 30px ${currentAccent.glow}`,
                }}
              >
                {formatTime(timeLeft)}
              </span>
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 mt-2 uppercase">
                {pomoPhase === 'work' ? `Round ${pomoRound} / 4` : 'Break'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-neutral-400 hover:text-white transition-all"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className="px-8 py-3 rounded-full flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-all shadow-xl"
              style={{
                backgroundColor: currentAccent.primary,
                color: '#0a0a0c',
                boxShadow: `0 0 20px ${currentAccent.glow}`,
              }}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={skipPhase}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-neutral-400 hover:text-white transition-all"
              title="Skip"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Timer View */}
      {mode === 'custom' && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            {[5, 10, 15, 25, 30, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => applyCustomMinutes(m)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  customMins === m && !isRunning
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-black/40 text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="my-6">
            <span
              className={`text-7xl sm:text-8xl text-white font-normal tabular-nums ${currentClockFont.cssClass}`}
              style={{
                textShadow: `0 4px 20px rgba(0, 0, 0, 0.9), 0 0 30px ${currentAccent.glow}`,
              }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={resetTimer}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-neutral-400 hover:text-white transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className="px-8 py-3 rounded-full flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-all shadow-xl"
              style={{
                backgroundColor: currentAccent.primary,
                color: '#0a0a0c',
                boxShadow: `0 0 20px ${currentAccent.glow}`,
              }}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Stopwatch View */}
      {mode === 'stopwatch' && (
        <div className="flex flex-col items-center">
          <div className="my-8">
            <span
              className={`text-6xl sm:text-7xl md:text-8xl text-white font-normal tabular-nums ${currentClockFont.cssClass}`}
              style={{
                textShadow: `0 4px 20px rgba(0, 0, 0, 0.9), 0 0 30px ${currentAccent.glow}`,
              }}
            >
              {formatStopwatch(swTimeMs)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSwReset}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-neutral-400 hover:text-white transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleSwToggle}
              className="px-8 py-3 rounded-full flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-all shadow-xl"
              style={{
                backgroundColor: currentAccent.primary,
                color: '#0a0a0c',
                boxShadow: `0 0 20px ${currentAccent.glow}`,
              }}
            >
              {swIsRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{swIsRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={handleSwLap}
              disabled={!swIsRunning}
              className="px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-xs text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all uppercase tracking-wider"
            >
              Lap
            </button>
          </div>

          {swLaps.length > 0 && (
            <div className="mt-6 w-64 max-h-40 overflow-y-auto rounded-xl bg-black/50 border border-white/10 p-2 text-xs font-mono">
              {swLaps.map((lap, i) => (
                <div key={i} className="flex justify-between py-1 px-2 text-neutral-300">
                  <span className="text-neutral-500">Lap {swLaps.length - i}</span>
                  <span className="text-white">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
