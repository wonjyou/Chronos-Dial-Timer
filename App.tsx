
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dial from './components/Dial';
import TimerDisplay from './components/TimerDisplay';
import { TimerState } from './types';

const App: React.FC = () => {
  const [timer, setTimer] = useState<TimerState>({ 
    seconds: 0, 
    isActive: false,
    isAlarming: false 
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context on user interaction to satisfy browser policies
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playAlarmSound = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Create a high-end rhythmic digital chime
    const playTone = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.2);
      
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.3);
    };

    const now = ctx.currentTime;
    playTone(now, 880);
    playTone(now + 0.2, 880);
    playTone(now + 0.4, 1320);
  }, []);

  const startTimer = useCallback(() => {
    initAudio();
    if (timer.seconds > 0) {
      setTimer(prev => ({ ...prev, isActive: true, isAlarming: false }));
    }
  }, [timer.seconds, initAudio]);

  const stopTimer = useCallback(() => {
    setTimer(prev => ({ ...prev, isActive: false, isAlarming: false }));
  }, []);

  const toggleTimer = useCallback(() => {
    initAudio();
    if (timer.isAlarming) {
      setTimer(prev => ({ ...prev, isAlarming: false }));
      return;
    }
    if (timer.isActive) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [timer.isActive, timer.isAlarming, startTimer, stopTimer, initAudio]);

  const resetTimer = useCallback(() => {
    setTimer({ seconds: 0, isActive: false, isAlarming: false });
  }, []);

  const addTime = useCallback((increment: number) => {
    initAudio();
    setTimer(prev => ({
      ...prev,
      seconds: Math.max(0, prev.seconds + increment),
      isAlarming: false // Interaction resets alarming state
    }));
  }, [initAudio]);

  // Alarm Loop Logic
  useEffect(() => {
    let alarmInterval: ReturnType<typeof setInterval> | null = null;
    if (timer.isAlarming) {
      playAlarmSound();
      alarmInterval = setInterval(playAlarmSound, 1500);
    }
    return () => {
      if (alarmInterval) clearInterval(alarmInterval);
    };
  }, [timer.isAlarming, playAlarmSound]);

  // Timer Tick Logic
  useEffect(() => {
    if (timer.isActive && timer.seconds > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, seconds: 0, isActive: false, isAlarming: true };
          }
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer.isActive, timer.seconds]);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-between transition-colors duration-500 py-8 px-4 overflow-hidden ${timer.isAlarming ? 'bg-orange-900/20' : 'bg-black'}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] rounded-full border transition-colors duration-500 ${timer.isAlarming ? 'border-orange-500/50 scale-110' : 'border-zinc-800'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full border transition-colors duration-500 ${timer.isAlarming ? 'border-orange-400/30' : 'border-zinc-700'}`} />
      </div>

      <header className="z-20 text-center space-y-2">
        <h1 className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Chronos Elite</h1>
        <div className={`h-0.5 w-12 mx-auto rounded-full transition-colors duration-300 ${timer.isAlarming ? 'bg-white animate-pulse' : 'bg-orange-500'}`} />
      </header>

      <main className="z-10 w-full flex flex-col items-center justify-center flex-1 space-y-10 md:space-y-20">
        <div className="flex flex-col items-center w-full space-y-4 md:space-y-8">
          {/* Status Display Above Timer */}
          <p className={`text-xs md:text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${timer.isAlarming ? 'text-orange-400 animate-bounce' : 'text-zinc-500'}`}>
              {timer.isAlarming ? "Time's Up" : timer.isActive ? "Running" : timer.seconds > 0 ? "Ready" : "Standby"}
          </p>

          {/* Rounded Rectangle Frame */}
          <div className={`
            relative w-full max-w-[95vw] p-6 md:p-10 border-[6px] transition-all duration-500 
            rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center
            ${timer.isAlarming ? 'border-orange-400 shadow-[0_0_50px_rgba(251,146,60,0.3)]' : 'border-zinc-800 shadow-2xl'}
            bg-zinc-950/50 backdrop-blur-sm
          `}>
            <TimerDisplay 
              seconds={timer.seconds} 
              isActive={timer.isActive} 
              isAlarming={timer.isAlarming}
            />
          </div>
        </div>

        {/* Increased Spacing to Dial */}
        <div className="pt-4">
          <Dial 
            isActive={timer.isActive || timer.isAlarming}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onRotate={addTime}
          />
        </div>
      </main>

      <footer className="z-20 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 md:gap-6 text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
              <span>Drag to Adjust</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>Tap to {timer.isAlarming ? 'Stop' : 'Start'}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>Hold to Reset</span>
          </div>
      </footer>
    </div>
  );
};

export default App;
