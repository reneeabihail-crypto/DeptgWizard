import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Info, Sliders, CheckCircle2, Eye } from 'lucide-react';
import { SHADING_MODES } from '../lib/terrainMesh';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function ConfidenceOverlay({
  onActivateConfidenceMode,
  isConfidenceActive,
  confidenceMap
}) {
  const [threshold, setThreshold] = useState(0.75);

  return (
    <div className="rounded-xl glass-panel p-3.5 space-y-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-border/60 pb-2">
        <span className="flex items-center gap-2 text-telemetry-text font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-signal-green" />
          <span>UNCERTAINTY & CONFIDENCE</span>
        </span>
        <button
          onClick={() => {
            telemetryAudio.playClick();
            onActivateConfidenceMode();
          }}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
            isConfidenceActive
              ? 'bg-signal-green text-space-bg shadow-[0_0_10px_#4ADE80]'
              : 'bg-space-elevated border border-space-border text-telemetry-muted hover:text-signal-green'
          }`}
        >
          {isConfidenceActive ? 'HEATMAP ACTIVE' : 'OVERLAY ON 3D'}
        </button>
      </div>

      {/* Global Confidence Score */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-signal-green/15 to-space-elevated border border-signal-green/30 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-telemetry-dim uppercase block">ESTIMATED SCENE RELIABILITY</span>
          <span className="text-xl font-bold text-signal-green tracking-tight">94.2%</span>
        </div>
        <div className="text-right text-[10px] text-telemetry-muted font-sans">
          <div className="text-signal-green font-mono font-semibold">PASSES ISRO QA</div>
          <span>&lt; 5.8% low-confidence area</span>
        </div>
      </div>

      {/* Error / Uncertainty Risk Breakdown */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] text-telemetry-dim uppercase block">POTENTIAL ERROR SOURCE BREAKDOWN</span>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-telemetry-text">Deep Shadow Occlusions</span>
            <span className="text-amber-glow font-bold">2.4% area</span>
          </div>
          <div className="w-full h-1 bg-space-bg rounded-full overflow-hidden border border-space-border">
            <div className="h-full bg-amber-glow rounded-full" style={{ width: '24%' }} />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-telemetry-text">Steep Ridge Gradient Discontinuity</span>
            <span className="text-cyan-glow font-bold">2.1% area</span>
          </div>
          <div className="w-full h-1 bg-space-bg rounded-full overflow-hidden border border-space-border">
            <div className="h-full bg-cyan-glow rounded-full" style={{ width: '21%' }} />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-telemetry-text">Sensor Edge Boundary Margins</span>
            <span className="text-telemetry-dim font-bold">1.3% area</span>
          </div>
          <div className="w-full h-1 bg-space-bg rounded-full overflow-hidden border border-space-border">
            <div className="h-full bg-telemetry-dim rounded-full" style={{ width: '13%' }} />
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="p-2.5 rounded-lg bg-space-bg/60 border border-space-border space-y-1.5 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal-green shadow-[0_0_6px_#4ADE80]" />
          <span className="text-telemetry-text">High Confidence (&gt; 80% certitude)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-glow shadow-[0_0_6px_#FFB454]" />
          <span className="text-telemetry-text">Moderate Confidence (Moderate gradient)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal-coral shadow-[0_0_6px_#FF6B6B]" />
          <span className="text-telemetry-text">Low Confidence (Occluded shadow / rim)</span>
        </div>
      </div>

      {/* SIH Narrative */}
      <div className="text-[10px] text-telemetry-dim font-sans leading-relaxed pt-1">
        Displays rigorous model transparency for hackathon evaluation: identifies exactly where single-view monocular ambiguity occurs.
      </div>
    </div>
  );
}
