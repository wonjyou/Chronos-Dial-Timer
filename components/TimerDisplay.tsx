
import React from 'react';

interface TimerDisplayProps {
  seconds: number;
  isActive: boolean;
  isAlarming?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, isActive, isAlarming = false }) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const { minutes, seconds: secStr } = formatTime(seconds);

  const getTextColor = () => {
    if (isAlarming) return 'text-white animate-pulse';
    if (isActive) return 'text-orange-500';
    return 'text-zinc-200';
  };

  const getSecColor = () => {
    if (isAlarming) return 'text-white/80 animate-pulse';
    if (isActive) return 'text-orange-400';
    return 'text-zinc-400';
  };

  return (
    <div className={`relative w-full transition-all duration-700 ${isActive || isAlarming ? 'scale-105' : 'scale-100'}`}>
      {/* Glow Effect */}
      {(isActive || isAlarming) && (
        <div className={`absolute inset-0 blur-[120px] rounded-full pulse-glow ${isAlarming ? 'bg-white/10' : 'bg-orange-500/10'}`} />
      )}
      
      <div className="relative digital-font flex items-baseline justify-center w-full px-4 overflow-visible">
        <div className="flex flex-col items-center">
          <span className={`text-[22vw] leading-none font-bold tracking-tighter transition-colors duration-300 ${getTextColor()}`}>
            {minutes}
          </span>
          <span className={`text-[1.5vw] min-text-[10px] font-bold tracking-[0.5em] uppercase -mt-[2vw] transition-colors duration-300 ${isAlarming ? 'text-white/40' : 'text-zinc-600'}`}>
            Minutes
          </span>
        </div>
        
        <span className={`text-[15vw] leading-none font-light mx-[2vw] mb-[4vw] transition-colors duration-300 ${isAlarming ? 'text-white/20' : isActive ? 'text-orange-500/50' : 'text-zinc-700'}`}>
          :
        </span>

        <div className="flex flex-col items-center">
          <span className={`text-[22vw] leading-none font-bold tracking-tighter transition-colors duration-300 ${getSecColor()}`}>
            {secStr}
          </span>
          <span className={`text-[1.5vw] min-text-[10px] font-bold tracking-[0.5em] uppercase -mt-[2vw] transition-colors duration-300 ${isAlarming ? 'text-white/40' : 'text-zinc-600'}`}>
            Seconds
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
