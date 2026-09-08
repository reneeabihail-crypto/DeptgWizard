import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Volume2, 
  VolumeX, 
  Download, 
  Layers, 
  Activity, 
  Satellite, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function Header({ 
  activeDataset, 
  activeMode, 
  onOpenExport, 
  fps = 60,
  reliefExaggeration,
  onReliefChange
}) {
  const [muted, setMuted] = useState(false);
  const [timeTicker, setTimeTicker] = useState(new Date().toTimeString().slice(0, 8));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(new Date().toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = telemetryAudio.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      telemetryAudio.playClick();
    }
  };

  return (
    <header className="h-16 border-b border-space-border bg-space-panel/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & ISRO SIH Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow">
            <Compass className="w-5 h-5 animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-signal-green shadow-[0_0_8px_#4ADE80]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-bold tracking-wider text-telemetry-text">
                DEPTH<span className="text-cyan-glow text-cyan-glow">WIZARD</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-glow/15 border border-cyan-glow/30 text-cyan-glow tracking-widest font-semibold">
                ISRO SIH26175
              </span>
            </div>
            <p className="text-xs text-telemetry-muted font-sans flex items-center gap-1.5">
              <span>Single-View Height Estimation & 3D Flythrough</span>
              <span className="text-telemetry-dim">•</span>
              <span className="text-signal-green flex items-center gap-1 font-mono text-[11px]">
                <Radio className="w-3 h-3 animate-pulse" /> 60 FPS WebGL2
              </span>
            </p>
          </div>
        </div>

        {/* Active Scene Chip */}
        {activeDataset && (
          <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-space-elevated/70 border border-space-border text-xs">
            <Satellite className="w-3.5 h-3.5 text-cyan-glow" />
            <div>
              <div className="text-[11px] font-mono text-telemetry-text font-medium leading-none">
                {activeDataset.name}
              </div>
              <div className="text-[10px] text-telemetry-muted font-mono leading-none mt-1">
                {activeDataset.location} • {activeDataset.sensor}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Live Mission Telemetry Readouts */}
      <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-lg bg-space-bg/60 border border-space-border/80 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
          <span className="text-telemetry-muted text-[11px]">UTC CLK:</span>
          <span className="text-cyan-glow font-bold">{timeTicker}</span>
        </div>
        <div className="h-4 w-px bg-space-border" />
        <div className="flex items-center gap-2">
          <span className="text-telemetry-muted text-[11px]">ELEVATION EXAGGERATION:</span>
          <div className="flex items-center gap-1.5">
            <input 
              type="range" 
              min="0.8" 
              max="4.0" 
              step="0.1" 
              value={reliefExaggeration}
              onChange={(e) => onReliefChange(parseFloat(e.target.value))}
              className="w-20 cursor-pointer" 
              title="Vertical Relief Exaggeration"
            />
            <span className="text-amber-glow font-bold w-10 text-right">{reliefExaggeration.toFixed(1)}x</span>
          </div>
        </div>
        <div className="h-4 w-px bg-space-border" />
        <div className="flex items-center gap-1.5 text-signal-green text-[11px]">
          <Activity className="w-3.5 h-3.5" />
          <span>INFERENCE: ON-DEVICE FAST</span>
        </div>
      </div>

      {/* Right: Sound, Actions, Export */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-lg bg-space-elevated/70 border border-space-border hover:border-cyan-glow/40 text-telemetry-muted hover:text-cyan-glow transition-all"
          title={muted ? "Unmute Audio Telemetry" : "Mute Audio Telemetry"}
        >
          {muted ? <VolumeX className="w-4 h-4 text-telemetry-dim" /> : <Volume2 className="w-4 h-4 text-cyan-glow" />}
        </button>

        <button
          onClick={() => {
            telemetryAudio.playClick();
            onOpenExport();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-glow/15 border border-cyan-glow/40 hover:bg-cyan-glow/25 text-cyan-glow text-xs font-mono font-medium tracking-wide shadow-[0_0_12px_rgba(62,214,255,0.15)] hover:shadow-[0_0_20px_rgba(62,214,255,0.3)] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT 3D/DATA</span>
        </button>
      </div>
    </header>
  );
}
