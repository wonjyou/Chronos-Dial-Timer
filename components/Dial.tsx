
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DialProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onRotate: (increment: number) => void;
}

const LONG_PRESS_THRESHOLD = 800;
const TICK_INCREMENT = 10; // Seconds per 'notch'
const DEGREES_PER_TICK = 15; // Degrees of rotation to trigger a tick

const Dial: React.FC<DialProps> = ({ isActive, onToggle, onReset, onRotate }) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedRotationRef = useRef<number>(0);

  const getAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsPressing(true);
    lastAngleRef.current = getAngle(clientX, clientY);
    
    // Start long press timer
    pressTimerRef.current = setTimeout(() => {
      onReset();
      setIsPressing(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_THRESHOLD);
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isPressing && !isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    const currentAngle = getAngle(clientX, clientY);
    if (lastAngleRef.current !== null) {
      let delta = currentAngle - lastAngleRef.current;
      
      // Handle wrap-around
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // If they move significantly, it's a drag, not a press
      if (Math.abs(delta) > 2) {
        setIsDragging(true);
        if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current);
          pressTimerRef.current = null;
        }
      }

      accumulatedRotationRef.current += delta;
      
      // Calculate how many 10s intervals we've crossed
      const ticks = Math.floor(accumulatedRotationRef.current / DEGREES_PER_TICK);
      if (ticks !== 0) {
        onRotate(ticks * TICK_INCREMENT);
        accumulatedRotationRef.current %= DEGREES_PER_TICK;
        if (navigator.vibrate) navigator.vibrate(10);
      }

      setRotation(prev => prev + delta);
    }
    lastAngleRef.current = currentAngle;
  }, [isPressing, isDragging, onRotate]);

  const handleEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      // It was a short press
      if (!isDragging) {
        onToggle();
        if (navigator.vibrate) navigator.vibrate(20);
      }
    }
    
    setIsPressing(false);
    setIsDragging(false);
    lastAngleRef.current = null;
    accumulatedRotationRef.current = 0;
  }, [isDragging, onToggle]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <div className="relative group">
      {/* Outer Ring Indicators */}
      <div className="absolute inset-0 -m-8 pointer-events-none opacity-20">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-zinc-500 -translate-x-1/2 -translate-y-[110px]"
            style={{ transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-100px)` }}
          />
        ))}
      </div>

      {/* Main Dial */}
      <div
        ref={dialRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{ transform: `rotate(${rotation}deg)` }}
        className={`
          relative w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-shadow duration-300
          bg-gradient-to-br from-zinc-800 to-zinc-950 border-4 border-zinc-900
          shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)]
          ${isPressing ? 'scale-95 shadow-inner' : 'scale-100'}
          ${isActive ? 'border-orange-500/50' : 'border-zinc-900'}
        `}
      >
        {/* Dial Surface Texture */}
        <div className="absolute inset-0 rounded-full opacity-30 pointer-events-none" 
             style={{ background: 'conic-gradient(from 0deg, #555, #222, #555, #222, #555)' }} />

        {/* Center Knob */}
        <div className="w-8 h-8 rounded-full bg-zinc-900 shadow-xl border border-zinc-800 flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-zinc-700'}`} />
        </div>

        {/* Indicator Dot */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-600" />
        
        {/* Tactile Grooves */}
        <div className="absolute inset-0 rounded-full border-[6px] border-zinc-900/50 pointer-events-none" />
        
        {/* Glow when active */}
        {isActive && (
            <div className="absolute inset-0 rounded-full bg-orange-500/5 blur-xl pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default Dial;
