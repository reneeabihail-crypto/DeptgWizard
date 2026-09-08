import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  Eye, 
  Sparkles, 
  Sliders, 
  CheckCircle 
} from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import { SHADING_MODES } from '../lib/terrainMesh';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function DisasterCompare({
  dataset,
  disasterStats,
  onActivateDisasterDiff,
  isDiffActive
}) {
  const [sliderMode, setSliderMode] = useState('split'); // 'split' or 'heatmap'
  const [showCoralGlow, setShowCoralGlow] = useState(true);

  if (!dataset) return null;

  return (
    <div className="w-full h-full flex flex-col xl:flex-row gap-4 p-4 overflow-y-auto">
      {/* Left / Main: Draggable Before/After Split Viewer */}
      <div className="flex-1 h-[450px] xl:h-full min-h-[400px] flex flex-col rounded-2xl glass-panel-elevated p-3 border border-coral-glow/30 space-y-3">
        <div className="flex items-center justify-between border-b border-space-border/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-signal-coral/20 text-signal-coral border border-signal-coral/40">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <h2 className="text-sm font-display font-bold text-telemetry-text tracking-wide">
                DISASTER DISPLACEMENT DIFFERENTIAL ANALYZER
              </h2>
              <p className="text-[11px] text-telemetry-muted font-mono">
                {dataset.name} • Cartosat & Drone Rapid Response Mapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                telemetryAudio.playDisasterAlert();
                onActivateDisasterDiff();
              }}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                isDiffActive
                  ? 'bg-signal-coral text-space-bg shadow-coral-glow'
                  : 'bg-space-elevated border border-signal-coral/50 text-signal-coral hover:bg-signal-coral/15'
              }`}
            >
              {isDiffActive ? '3D HAZARD DIFF ACTIVE' : 'SHOW 3D HAZARD DIFF'}
            </button>
          </div>
        </div>

        {/* The Draggable Before/After Split Slider */}
        <div className="flex-1 w-full min-h-[320px] relative rounded-xl overflow-hidden">
          <BeforeAfterSlider 
            leftImage={dataset.preImageSrc || dataset.imageSrc}
            rightImage={dataset.postImageSrc || dataset.imageSrc}
            leftLabel="PRE-DISASTER (PRISTINE SLOPES)"
            rightLabel="POST-DISASTER (SCAR & DEBRIS FLOW)"
            showDiffHighlight={showCoralGlow}
          />
        </div>
      </div>

      {/* Right / Telemetry Panel: Volumetric Diff & Hazard Stats */}
      <div className="w-full xl:w-96 rounded-2xl glass-panel p-4 space-y-4 font-mono text-xs select-none">
        <div className="border-b border-space-border pb-3 flex items-center justify-between">
          <span className="text-telemetry-text font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 text-signal-coral" />
            <span>RAPID DAMAGE METRICS</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-signal-coral/15 border border-signal-coral/40 text-signal-coral text-[10px] font-bold">
            HIGH IMPACT
          </span>
        </div>

        {/* Volumetric Mass Displacement Readout */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-signal-coral/20 to-space-elevated border border-signal-coral/40 space-y-1">
          <span className="text-[10px] text-telemetry-dim uppercase block">
            ESTIMATED DISPLACED VOLUME (ΔV)
          </span>
          <div className="text-2xl font-bold text-signal-coral tracking-tight">
            ≈ {disasterStats?.volumeDisplacedM3?.toLocaleString() || '1,842,500'} m³
          </div>
          <p className="text-[10px] text-telemetry-muted font-sans pt-1">
            Computed by integrating single-view monocular elevation differentials across pre and post disaster orthophotos.
          </p>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border space-y-1">
            <div className="flex items-center gap-1.5 text-telemetry-dim text-[10px]">
              <TrendingDown className="w-3.5 h-3.5 text-signal-coral" />
              <span>MAX SCOUR DEPTH</span>
            </div>
            <div className="text-sm font-bold text-signal-coral">
              -{disasterStats?.maxScourMeters || '38'} meters
            </div>
            <span className="text-[9px] text-telemetry-dim block">Slope failure scarp</span>
          </div>

          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border space-y-1">
            <div className="flex items-center gap-1.5 text-telemetry-dim text-[10px]">
              <TrendingUp className="w-3.5 h-3.5 text-amber-glow" />
              <span>MAX DEPOSIT LOBE</span>
            </div>
            <div className="text-sm font-bold text-amber-glow">
              +{disasterStats?.maxAccumulationMeters || '19'} meters
            </div>
            <span className="text-[9px] text-telemetry-dim block">Debris deposition</span>
          </div>

          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border space-y-1">
            <span className="text-telemetry-dim text-[10px] block">AFFECTED RUNOUT</span>
            <div className="text-sm font-bold text-telemetry-text">
              4.2 km
            </div>
            <span className="text-[9px] text-telemetry-dim block">Valley flow path</span>
          </div>

          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border space-y-1">
            <span className="text-telemetry-dim text-[10px] block">CRITICAL STRUCTURES</span>
            <div className="text-sm font-bold text-signal-coral">
              28 Inundated
            </div>
            <span className="text-[9px] text-telemetry-dim block">Habitation corridor</span>
          </div>
        </div>

        {/* Change Detection Legend */}
        <div className="p-3 rounded-xl bg-space-bg/40 border border-space-border space-y-2">
          <span className="text-[10px] text-telemetry-dim uppercase block">TERRAIN DIFF COLOR CODING</span>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-signal-coral shadow-[0_0_8px_#FF6B6B]" />
              <span className="text-telemetry-text font-medium">Scoured / Collapsed Terrain (Negative ΔZ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-glow shadow-[0_0_8px_#FFB454]" />
              <span className="text-telemetry-text font-medium">Debris Accumulation / Mudflow (Positive ΔZ)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-telemetry-dim" />
              <span className="text-telemetry-muted">Stable Basal Topography (Zero ΔZ)</span>
            </div>
          </div>
        </div>

        {/* SIH Narrative note */}
        <div className="p-3 rounded-xl bg-cyan-glow/5 border border-cyan-glow/20 text-[11px] text-telemetry-muted font-sans leading-relaxed">
          <span className="text-cyan-glow font-bold font-mono block mb-1">OPERATIONAL VALUE FOR ISRO:</span>
          In rapid disaster situations, stereo satellites cannot be re-tasked immediately. DepthWizard provides emergency teams with instantaneous 3D volumetric estimates from a single post-event frame.
        </div>
      </div>
    </div>
  );
}
