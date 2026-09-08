import React, { useState } from 'react';
import { Grid, Sparkles, Layers, CheckCircle2, RefreshCw, Box, ArrowRight } from 'lucide-react';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function BatchStitching({ onApplyStitchedTerrain }) {
  const [isStitching, setIsStitching] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const tiles = [
    { id: 'tile_nw', name: 'Tile NW (Ridge Summit)', coords: '34.18°N, 77.52°E', status: 'Aligned' },
    { id: 'tile_ne', name: 'Tile NE (Glacial Valley)', coords: '34.18°N, 77.60°E', status: 'Aligned' },
    { id: 'tile_sw', name: 'Tile SW (Gorge Basin)', coords: '34.12°N, 77.52°E', status: 'Aligned' },
    { id: 'tile_se', name: 'Tile SE (Scree Moraine)', coords: '34.12°N, 77.60°E', status: 'Aligned' },
  ];

  const handleStartStitch = () => {
    telemetryAudio.playScan();
    setIsStitching(true);
    setStitchProgress(0);
    setIsCompleted(false);

    const interval = setInterval(() => {
      setStitchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsStitching(false);
          setIsCompleted(true);
          telemetryAudio.playLockOn();
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col items-center justify-center select-none overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl glass-panel-elevated p-6 space-y-6 border border-cyan-glow/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-space-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-telemetry-text tracking-wide">
                REGIONAL BATCH TILE STITCHING (F9 STRETCH PIPELINE)
              </h2>
              <p className="text-xs text-telemetry-muted font-sans mt-0.5">
                Harmonize adjacent single-view satellite captures into a seamless continuous regional 3D DEM
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow text-xs font-mono font-semibold">
            MULTI-QUAD STITCHER
          </span>
        </div>

        {/* 2x2 Grid of Adjacent Satellite Tiles */}
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {tiles.map((tile, idx) => (
            <div 
              key={tile.id}
              className={`p-3 rounded-xl border transition-all ${
                isCompleted 
                  ? 'border-signal-green/60 bg-signal-green/10 shadow-[0_0_12px_rgba(74,222,128,0.2)]' 
                  : isStitching 
                  ? 'border-cyan-glow/50 bg-cyan-glow/5 animate-pulse'
                  : 'border-space-border bg-space-bg/60'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="text-telemetry-text font-bold">{tile.name}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-green" />
                ) : (
                  <span className="text-telemetry-dim text-[10px]">T{idx + 1}</span>
                )}
              </div>
              <div className="text-[10px] font-mono text-telemetry-dim">{tile.coords}</div>
              <div className="mt-2 h-12 rounded-lg bg-space-elevated overflow-hidden relative flex items-center justify-center">
                <img 
                  src="/samples/himalaya.jpg" 
                  alt={tile.name} 
                  className={`w-full h-full object-cover opacity-60 filter ${
                    idx === 0 ? '' : idx === 1 ? 'hue-rotate-15' : idx === 2 ? 'hue-rotate-30' : 'hue-rotate-45'
                  }`}
                />
                <span className="absolute text-[9px] font-mono font-bold text-telemetry-text bg-space-bg/80 px-1.5 py-0.5 rounded">
                  TILE #{idx + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stitching Progress Bar */}
        {isStitching && (
          <div className="space-y-2 font-mono text-xs max-w-lg mx-auto">
            <div className="flex justify-between text-[11px]">
              <span className="text-cyan-glow flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> HARMONIZING BOUNDARY ELEVATION CONTOURS...
              </span>
              <span className="text-cyan-glow font-bold">{stitchProgress}%</span>
            </div>
            <div className="w-full h-2 bg-space-bg rounded-full overflow-hidden border border-space-border">
              <div 
                className="h-full bg-gradient-to-r from-cyan-glow via-amber-glow to-signal-green rounded-full transition-all duration-300"
                style={{ width: `${stitchProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          {!isCompleted ? (
            <button
              disabled={isStitching}
              onClick={handleStartStitch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-glow to-cyan-dim hover:from-cyan-dim hover:to-cyan-glow text-space-bg font-mono font-bold text-xs tracking-wider shadow-cyan-glow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isStitching ? 'STITCHING 4 TILES...' : 'STITCH 4 REGIONAL TILES (360 KM²)'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-signal-green/15 border border-signal-green/40 text-signal-green font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>360 KM² REGIONAL DEM SEAMLESSLY MERGED</span>
              </div>
              <button
                onClick={handleStartStitch}
                className="px-3 py-2 rounded-xl bg-space-elevated border border-space-border text-telemetry-muted hover:text-telemetry-text text-xs font-mono flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> RE-RUN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
