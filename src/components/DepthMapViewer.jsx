import React, { useState } from 'react';
import { Layers, Maximize2, Activity, Info, BarChart2 } from 'lucide-react';
import { COLORMAPS } from '../lib/depthPipeline';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function DepthMapViewer({
  depthDataUrl,
  depthStats,
  activeColormap,
  onColormapChange
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colormaps = [
    { id: COLORMAPS.INFERNO, label: 'INFERNO' },
    { id: COLORMAPS.TURBO, label: 'TURBO' },
    { id: COLORMAPS.HYPSOMETRIC, label: 'HYPSO' },
    { id: COLORMAPS.GRAYSCALE, label: 'GRAYSCALE' },
  ];

  return (
    <div className="rounded-xl glass-panel p-3.5 space-y-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-border/60 pb-2">
        <span className="flex items-center gap-2 text-telemetry-text font-bold">
          <Layers className="w-3.5 h-3.5 text-cyan-glow" />
          <span>ELEVATION DEPTH MAP</span>
        </span>
        <span className="text-[10px] text-signal-green flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" /> 256×256 GRID
        </span>
      </div>

      {/* Depth Map Preview Thumbnail */}
      <div className="relative rounded-lg overflow-hidden border border-space-border bg-space-bg aspect-square group">
        {depthDataUrl ? (
          <img 
            src={depthDataUrl} 
            alt="Synthesized Elevation Depth Map" 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-telemetry-dim">
            Generating depth map...
          </div>
        )}

        {/* Scanline Sweep overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 scanlines" />
      </div>

      {/* Colormap Switcher */}
      <div>
        <div className="text-[10px] text-telemetry-dim uppercase mb-1.5 flex justify-between">
          <span>COLORMAP PALETTE</span>
          <span className="text-cyan-glow uppercase">{activeColormap}</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {colormaps.map((cmap) => (
            <button
              key={cmap.id}
              onClick={() => {
                telemetryAudio.playClick();
                onColormapChange(cmap.id);
              }}
              className={`py-1 text-[10px] rounded border transition-colors ${
                activeColormap === cmap.id
                  ? 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow font-bold shadow-cyan-sm'
                  : 'bg-space-elevated/60 border-space-border text-telemetry-muted hover:text-telemetry-text'
              }`}
            >
              {cmap.label}
            </button>
          ))}
        </div>
      </div>

      {/* Elevation Statistics Grid */}
      {depthStats && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-lg bg-space-bg/60 border border-space-border">
            <span className="text-[9px] text-telemetry-dim block">MIN ELEVATION</span>
            <span className="text-cyan-glow font-bold text-xs">{depthStats.minElevationMeters}m</span>
          </div>
          <div className="p-2 rounded-lg bg-space-bg/60 border border-space-border">
            <span className="text-[9px] text-telemetry-dim block">PEAK SUMMIT</span>
            <span className="text-amber-glow font-bold text-xs">{depthStats.maxElevationMeters}m</span>
          </div>
          <div className="p-2 rounded-lg bg-space-bg/60 border border-space-border">
            <span className="text-[9px] text-telemetry-dim block">RELIEF DELTA</span>
            <span className="text-signal-green font-bold text-xs">+{depthStats.peakHeightDelta}m</span>
          </div>
          <div className="p-2 rounded-lg bg-space-bg/60 border border-space-border">
            <span className="text-[9px] text-telemetry-dim block">SPATIAL GSD</span>
            <span className="text-telemetry-text font-bold text-xs">{depthStats.resolutionGSD}</span>
          </div>
        </div>
      )}
    </div>
  );
}
