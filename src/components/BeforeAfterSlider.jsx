import React, { useState, useRef, useCallback } from 'react';
import { Columns, Eye, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { COLORMAPS } from '../lib/depthPipeline';

export default function BeforeAfterSlider({
  leftImage,
  rightImage,
  leftLabel = 'ORIGINAL 2D ORTHOPHOTO',
  rightLabel = 'SYNTHESIZED 3D ELEVATION',
  diffMap = null,
  showDiffHighlight = false
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-full overflow-hidden bg-space-bg select-none rounded-xl border border-space-border/80"
    >
      {/* Left Layer (Original 2D Photo) */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={leftImage} 
          alt="Before view" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-space-panel/80 backdrop-blur-md border border-space-border text-xs font-mono text-cyan-glow flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" />
          <span>{leftLabel}</span>
        </div>
      </div>

      {/* Right Layer (Synthesized Elevation / After Photo) clipped by slider */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
      >
        <img 
          src={rightImage} 
          alt="After view" 
          className="w-full h-full object-cover"
        />
        
        {/* Optional Red Hazard Overlay for disaster mode */}
        {showDiffHighlight && (
          <div className="absolute inset-0 bg-coral-glow/15 mix-blend-color-burn pointer-events-none" />
        )}

        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-md bg-space-panel/80 backdrop-blur-md border border-amber-glow/40 text-xs font-mono text-amber-glow flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{rightLabel}</span>
        </div>
      </div>

      {/* Draggable Divider Line & Handle */}
      <div 
        onPointerDown={handlePointerDown}
        className="absolute top-0 bottom-0 z-20 w-1 bg-cyan-glow shadow-[0_0_12px_#3ED6FF] cursor-ew-resize flex items-center justify-center -translate-x-1/2"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="w-9 h-9 rounded-full bg-space-panel border-2 border-cyan-glow shadow-[0_0_15px_rgba(62,214,255,0.6)] flex items-center justify-center text-cyan-glow transition-transform hover:scale-110 active:scale-95">
          <Columns className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom Comparison Helper Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-space-panel/80 backdrop-blur-md border border-space-border text-[11px] font-mono text-telemetry-muted flex items-center gap-3">
        <span>DRAG DIVIDER TO REVEAL ELEVATION CHANGE</span>
        <span className="text-cyan-glow font-bold">{sliderPos.toFixed(0)}% SPLIT</span>
      </div>
    </div>
  );
}
