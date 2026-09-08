import React from 'react';
import { Ruler, Crosshair, ArrowUpRight, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function MeasurementTool({
  isActive,
  onToggleActive,
  measurePoints = [],
  onClearMeasure,
  depthStats,
  depthMap,
  mapWidth = 256,
  mapHeight = 256
}) {
  // Compute real-world scaled metrics between Point A and Point B
  let measurement = null;
  let profilePoints = [];

  if (measurePoints.length === 2) {
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];

    // Three.js world scale conversion factor (calibrated to GSD meters)
    const scaleFactor = 12.5; // meters per Three.js unit
    const dx = (p2.x - p1.x) * scaleFactor;
    const dy = (p2.y - p1.y) * scaleFactor * 1.8; // Vertical elevation
    const dz = (p2.z - p1.z) * scaleFactor;

    const horizontalRun = Math.sqrt(dx * dx + dz * dz);
    const verticalHeight = Math.abs(dy);
    const directDistance = Math.sqrt(horizontalRun * horizontalRun + dy * dy);
    const slopeAngle = Math.atan2(verticalHeight, Math.max(1, horizontalRun)) * (180 / Math.PI);
    const slopeGrade = (verticalHeight / Math.max(1, horizontalRun)) * 100;

    // Generate Elevation Profile cross-section samples
    const numSamples = 24;
    for (let i = 0; i <= numSamples; i++) {
      const alpha = i / numSamples;
      // Linear interpolation in 3D
      const curX = p1.x + (p2.x - p1.x) * alpha;
      const curZ = p1.z + (p2.z - p1.z) * alpha;

      // Sample depth map if available
      const u = (curX / 80) + 0.5;
      const v = 1.0 - ((curZ / 80) + 0.5);
      const px = Math.min(mapWidth - 1, Math.max(0, Math.floor(u * mapWidth)));
      const py = Math.min(mapHeight - 1, Math.max(0, Math.floor(v * mapHeight)));
      const depthVal = depthMap ? depthMap[py * mapWidth + px] : 0.5;
      
      const sampleElev = depthStats 
        ? Math.round(depthStats.minElevationMeters + depthVal * depthStats.peakHeightDelta)
        : Math.round(1200 + depthVal * 800);

      profilePoints.push({
        dist: Math.round(alpha * horizontalRun),
        elev: sampleElev
      });
    }

    measurement = {
      directDistance: Math.round(directDistance),
      horizontalRun: Math.round(horizontalRun),
      verticalHeight: Math.round(verticalHeight),
      slopeAngle: slopeAngle.toFixed(1),
      slopeGrade: slopeGrade.toFixed(1),
      profilePoints
    };
  }

  // Generate SVG path for elevation profile
  let svgPath = '';
  if (profilePoints.length > 1) {
    const minElev = Math.min(...profilePoints.map(p => p.elev));
    const maxElev = Math.max(...profilePoints.map(p => p.elev));
    const elevRange = maxElev - minElev || 1;

    svgPath = profilePoints.map((p, idx) => {
      const x = (idx / (profilePoints.length - 1)) * 260 + 10;
      const y = 80 - ((p.elev - minElev) / elevRange) * 60;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  return (
    <div className="rounded-xl glass-panel p-3.5 space-y-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-border/60 pb-2">
        <span className="flex items-center gap-2 text-telemetry-text font-bold">
          <Ruler className="w-3.5 h-3.5 text-cyan-glow" />
          <span>CLICK-TO-MEASURE TOOL</span>
        </span>
        <button
          onClick={() => {
            telemetryAudio.playClick();
            onToggleActive();
          }}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
            isActive 
              ? 'bg-cyan-glow text-space-bg shadow-cyan-glow' 
              : 'bg-space-elevated border border-space-border text-telemetry-muted hover:text-cyan-glow'
          }`}
        >
          {isActive ? 'TOOL ACTIVE' : 'ENABLE TOOL'}
        </button>
      </div>

      {/* Instructions / Status */}
      <div className="p-2.5 rounded-lg bg-space-bg/60 border border-space-border text-[11px] text-telemetry-muted space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-telemetry-dim uppercase text-[10px]">POINT ANCHORS:</span>
          <span className="text-cyan-glow font-bold">
            {measurePoints.length}/2 PLACED
          </span>
        </div>
        <p className="text-[10px] text-telemetry-dim font-sans leading-relaxed">
          {measurePoints.length === 0 && "Click any 3D terrain surface point to set Anchor A."}
          {measurePoints.length === 1 && "Anchor A placed. Click second point for Anchor B."}
          {measurePoints.length === 2 && "Measurement computed. Drag or rotate to inspect line."}
        </p>
      </div>

      {/* Measurement Readout Cards */}
      {measurement ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-cyan-glow/10 border border-cyan-glow/40">
              <span className="text-[9px] text-telemetry-dim block">3D DIRECT DISTANCE</span>
              <span className="text-cyan-glow font-bold text-sm">≈ {measurement.directDistance} m</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-glow/10 border border-amber-glow/40">
              <span className="text-[9px] text-telemetry-dim block">VERTICAL HEIGHT ΔZ</span>
              <span className="text-amber-glow font-bold text-sm">± {measurement.verticalHeight} m</span>
            </div>
            <div className="p-2 rounded-lg bg-space-bg/60 border border-space-border">
              <span className="text-[9px] text-telemetry-dim block">HORIZONTAL RUN</span>
              <span className="text-telemetry-text font-bold text-xs">{measurement.horizontalRun} m</span>
            </div>
            <div className="p-2 rounded-lg bg-space-bg/60 border border-space-border">
              <span className="text-[9px] text-telemetry-dim block">SLOPE GRADIENT</span>
              <span className="text-signal-green font-bold text-xs">{measurement.slopeAngle}° ({measurement.slopeGrade}%)</span>
            </div>
          </div>

          {/* Elevation Cross-Section SVG Graph */}
          <div className="p-2.5 rounded-lg bg-space-bg/80 border border-space-border space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-telemetry-dim">
              <span className="flex items-center gap-1 text-telemetry-text font-semibold">
                <TrendingUp className="w-3 h-3 text-cyan-glow" /> CROSS-SECTION ELEVATION PROFILE
              </span>
              <span className="text-cyan-glow">A ➔ B</span>
            </div>
            
            <svg viewBox="0 0 280 90" className="w-full h-20 overflow-visible">
              <defs>
                <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ED6FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3ED6FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Background grid lines */}
              <line x1="10" y1="20" x2="270" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
              <line x1="10" y1="50" x2="270" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
              <line x1="10" y1="80" x2="270" y2="80" stroke="rgba(255,255,255,0.1)" />

              {/* Terrain Line and Area */}
              {svgPath && (
                <>
                  <path 
                    d={`${svgPath} L 270 80 L 10 80 Z`} 
                    fill="url(#profileGrad)" 
                  />
                  <path 
                    d={svgPath} 
                    fill="none" 
                    stroke="#3ED6FF" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Point A and Point B Labels */}
              <circle cx="10" cy="80" r="3" fill="#3ED6FF" />
              <text x="8" y="92" fill="#8B93A7" fontSize="8" fontFamily="monospace">PT A</text>

              <circle cx="270" cy="80" r="3" fill="#FFB454" />
              <text x="250" y="92" fill="#8B93A7" fontSize="8" fontFamily="monospace">PT B</text>
            </svg>
          </div>

          <button
            onClick={() => {
              telemetryAudio.playClick();
              onClearMeasure();
            }}
            className="w-full py-1.5 rounded-lg bg-space-elevated hover:bg-space-elevated/80 border border-space-border text-telemetry-muted hover:text-signal-coral text-[10px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RESET MEASUREMENT PINS</span>
          </button>
        </div>
      ) : (
        <div className="py-6 text-center text-telemetry-dim text-[11px] font-sans">
          Click two points on the 3D terrain canvas to inspect elevation profile and distance.
        </div>
      )}
    </div>
  );
}
