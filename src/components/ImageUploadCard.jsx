import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle, X } from 'lucide-react';
import { DEMO_DATASETS } from '../lib/demoDatasets';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function ImageUploadCard({
  isOpen,
  onClose,
  onSelectDataset,
  onCustomImageUpload,
  activeDatasetId
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        telemetryAudio.playScan();
        onCustomImageUpload({
          name: file.name.replace(/\.[^/.]+$/, ""),
          imageSrc: e.target.result,
          width: img.width,
          height: img.height,
          sizeBytes: file.size
        });
        onClose();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl glass-panel-elevated p-6 space-y-6 border border-cyan-glow/30 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-space-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-glow" />
              <h2 className="text-base font-display font-bold tracking-wide text-telemetry-text">
                INGEST SATELLITE / AERIAL IMAGERY
              </h2>
            </div>
            <p className="text-xs text-telemetry-muted font-sans mt-0.5">
              Select an ISRO-calibrated demo scene or upload any single 2D aerial photograph
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-telemetry-muted hover:text-telemetry-text hover:bg-space-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-cyan-glow bg-cyan-glow/10 shadow-cyan-glow' 
              : 'border-space-border hover:border-cyan-glow/50 bg-space-bg/40'
          }`}
        >
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-12 h-12 rounded-full bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-sm font-mono font-medium text-telemetry-text">
            Drop satellite or drone photo here, or <span className="text-cyan-glow underline underline-offset-2">browse file</span>
          </div>
          <p className="text-xs text-telemetry-dim font-sans mt-1">
            Supports PNG, JPG, GeoTIFF exports • Minimum recommended: 512×512px
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 text-signal-coral text-xs font-mono">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Preloaded Demo Scenarios */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-telemetry-dim flex items-center justify-between">
            <span>PRELOADED CALIBRATED BENCHMARKS</span>
            <span className="text-signal-green text-[11px]">ZERO-LATENCY FALLBACK READY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_DATASETS.map((ds) => {
              const isSelected = activeDatasetId === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => {
                    telemetryAudio.playClick();
                    onSelectDataset(ds.id);
                    onClose();
                  }}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-cyan-glow bg-space-elevated shadow-cyan-sm' 
                      : 'border-space-border hover:border-cyan-glow/40 bg-space-bg/60'
                  }`}
                >
                  <div className="h-24 w-full overflow-hidden relative">
                    <img 
                      src={ds.thumbnail} 
                      alt={ds.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-bg via-transparent to-transparent" />
                    <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-space-bg/80 border border-space-border text-cyan-glow">
                      {ds.sensor.split(' ')[0]}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-mono font-bold text-telemetry-text truncate">
                      {ds.name}
                    </div>
                    <div className="text-[10px] text-telemetry-muted truncate mt-0.5">
                      {ds.type}
                    </div>
                    <div className="text-[9px] font-mono text-amber-glow mt-1">
                      {ds.baseElevation}m - {ds.maxElevation}m
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
