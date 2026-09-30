'use client';

import * as React from 'react';
import { Eye, Search, Volume2, VolumeX, Maximize2, Sparkles } from 'lucide-react';

interface HorologicalLoupeProps {
  imageSrc: string;
  alt: string;
  movementType?: string;
  movementCaliber?: string;
}

export function HorologicalLoupe({
  imageSrc,
  alt,
  movementType = 'Automatic',
  movementCaliber = 'In-House Calibre',
}: HorologicalLoupeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoupeActive, setIsLoupeActive] = React.useState(false);
  const [loupePos, setLoupePos] = React.useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPlayingSound, setIsPlayingSound] = React.useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const intervalRef = React.useRef<any>(null);

  const LOUPE_SIZE = 180;
  const ZOOM_FACTOR = 3;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setIsHovered(false);
      return;
    }

    setIsHovered(true);
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;

    setLoupePos({ x, y, bgX, bgY });
  };

  // Escapement Acoustic Tick Generator (Web Audio API)
  const toggleCalibreAcoustics = () => {
    if (isPlayingSound) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
      setIsPlayingSound(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 28,800 vph = 8 ticks per second = 125ms per tick
      const isVintage = movementType.toLowerCase().includes('manual') || movementCaliber.includes('1861');
      const intervalMs = isVintage ? 166 : 125; // 21,600 vph vs 28,800 vph

      const playTick = () => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;

        // Jewel tick 1: pallet stone entry
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(3200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.015);
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.015);

        // Jewel tick 2: pallet stone exit (escapement micro-resonance)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(5400, now + 0.004);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.02);
        gain2.gain.setValueAtTime(0.04, now + 0.004);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.004);
        osc2.stop(now + 0.02);
      };

      playTick();
      intervalRef.current = setInterval(playTick, intervalMs);
      setIsPlayingSound(true);
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Loupe Toolbar */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setIsLoupeActive(!isLoupeActive)}
          className={`font-mono text-xs px-3 py-1.5 rounded-[2px] border transition-all flex items-center gap-1.5 cursor-pointer ${
            isLoupeActive
              ? 'border-[#B08D57] bg-[rgba(176,141,87,0.15)] text-[#EDE6D6] shadow-[0_0_12px_rgba(176,141,87,0.2)]'
              : 'border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.6)] hover:border-[#B08D57] hover:text-[#EDE6D6]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>{isLoupeActive ? '3x Loupe Inspection Active' : 'Inspect Dial (3x Loupe)'}</span>
        </button>

        {/* Calibre Sound Trigger */}
        <button
          type="button"
          onClick={toggleCalibreAcoustics}
          className={`font-mono text-xs px-3 py-1.5 rounded-[2px] border transition-all flex items-center gap-1.5 cursor-pointer ${
            isPlayingSound
              ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
              : 'border-[rgba(176,141,87,0.20)] text-[rgba(237,230,214,0.6)] hover:border-[#B08D57] hover:text-[#EDE6D6]'
          }`}
          title="Listen to the escapement frequency of this mechanical calibre"
        >
          {isPlayingSound ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                28,800 vph Calibre
              </span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>Listen to Movement</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative aspect-square bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] overflow-hidden group cursor-crosshair select-none"
      >
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-contain p-4 transition-transform duration-300"
        />

        {/* Instruction Badge when Loupe active */}
        {isLoupeActive && !isHovered && (
          <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm border border-[#B08D57]/40 px-3 py-1.5 rounded text-[11px] font-mono text-[#EDE6D6] flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
            Hover to magnify dial, guilloché & indices
          </div>
        )}

        {/* Optical Brass Horological Loupe Lens */}
        {isLoupeActive && isHovered && (
          <div
            style={{
              position: 'absolute',
              left: `${loupePos.x - LOUPE_SIZE / 2}px`,
              top: `${loupePos.y - LOUPE_SIZE / 2}px`,
              width: `${LOUPE_SIZE}px`,
              height: `${LOUPE_SIZE}px`,
              backgroundImage: `url(${imageSrc})`,
              backgroundPosition: `${loupePos.bgX}% ${loupePos.bgY}%`,
              backgroundSize: `${containerRef.current ? containerRef.current.clientWidth * ZOOM_FACTOR : 1500}px ${
                containerRef.current ? containerRef.current.clientHeight * ZOOM_FACTOR : 1500
              }px`,
            }}
            className="pointer-events-none rounded-full border-4 border-[#B08D57] shadow-[0_0_25px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(176,141,87,0.3)] overflow-hidden z-20"
          >
            {/* Loupe Optical Glare & Reticle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-[1px] bg-[#B08D57]/40"></div>
              <div className="h-6 w-[1px] bg-[#B08D57]/40"></div>
            </div>
            <div className="absolute bottom-2 inset-x-0 text-center font-mono text-[9px] tracking-widest uppercase text-[#B08D57] font-semibold">
              3X MACRO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
