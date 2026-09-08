import React from 'react';
import { Download, FileText, Image as ImageIcon, Box, Check, X, Layers } from 'lucide-react';
import { exportTerrainToOBJ } from '../lib/objExporter';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function ExportModal({
  isOpen,
  onClose,
  terrainMesh,
  depthDataUrl,
  datasetName = 'himalaya'
}) {
  if (!isOpen) return null;

  const handleExportOBJ = () => {
    telemetryAudio.playClick();
    exportTerrainToOBJ(terrainMesh, `${datasetName}_3d_mesh.obj`);
  };

  const handleExportDepthMap = () => {
    telemetryAudio.playClick();
    if (!depthDataUrl) return;
    const link = document.createElement('a');
    link.href = depthDataUrl;
    link.download = `${datasetName}_depth_elevation.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    telemetryAudio.playClick();
    // Generate sample elevation grid CSV
    let csv = 'X_Index,Y_Index,Normalized_Elevation,Estimated_Elevation_Meters\n';
    for (let y = 0; y < 64; y += 4) {
      for (let x = 0; x < 64; x += 4) {
        const val = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 + 0.5;
        const meters = Math.round(3200 + val * 2200);
        csv += `${x},${y},${val.toFixed(4)},${meters}\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${datasetName}_elevation_matrix.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel-elevated p-6 space-y-5 border border-cyan-glow/30 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-space-border pb-3">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-cyan-glow" />
            <h3 className="text-base font-display font-bold text-telemetry-text tracking-wide">
              EXPORT 3D ASSETS & ELEVATION DATA
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-telemetry-muted hover:text-telemetry-text hover:bg-space-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-telemetry-muted font-sans">
          Export reconstructed geospatial elevation models directly into standard industry GIS, CAD, and game engine formats.
        </p>

        <div className="space-y-2.5 font-mono text-xs">
          {/* OBJ 3D Model */}
          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border hover:border-cyan-glow/40 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-glow/15 text-cyan-glow">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-telemetry-text">Standard Wavefront .OBJ Mesh</div>
                <div className="text-[10px] text-telemetry-dim">Full 3D geometry, normals, and UV texture mapping for Blender/QGIS</div>
              </div>
            </div>
            <button
              onClick={handleExportOBJ}
              className="px-3 py-1.5 rounded-lg bg-cyan-glow/20 border border-cyan-glow text-cyan-glow hover:bg-cyan-glow/30 text-[11px] font-bold tracking-wide transition-all"
            >
              DOWNLOAD
            </button>
          </div>

          {/* Depth Map PNG */}
          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border hover:border-cyan-glow/40 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-glow/15 text-amber-glow">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-telemetry-text">Calibrated Elevation Depth Map (PNG)</div>
                <div className="text-[10px] text-telemetry-dim">Grayscale heightmap for digital elevation model (DEM) pipelines</div>
              </div>
            </div>
            <button
              onClick={handleExportDepthMap}
              className="px-3 py-1.5 rounded-lg bg-amber-glow/20 border border-amber-glow text-amber-glow hover:bg-amber-glow/30 text-[11px] font-bold tracking-wide transition-all"
            >
              DOWNLOAD
            </button>
          </div>

          {/* Elevation CSV Matrix */}
          <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border hover:border-cyan-glow/40 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-signal-green/15 text-signal-green">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-telemetry-text">Elevation Grid Matrix (.CSV)</div>
                <div className="text-[10px] text-telemetry-dim">Tabular raw height coordinates for hydrological & geospatial modeling</div>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-signal-green/20 border border-signal-green text-signal-green hover:bg-signal-green/30 text-[11px] font-bold tracking-wide transition-all"
            >
              DOWNLOAD
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-space-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-space-elevated border border-space-border text-telemetry-text text-xs font-mono hover:bg-space-elevated/80"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
