import React from 'react';
import { 
  Box, 
  Columns, 
  AlertTriangle, 
  Ruler, 
  ShieldCheck, 
  Grid, 
  UploadCloud,
  Layers
} from 'lucide-react';
import { telemetryAudio } from '../lib/audioTelemetry';

export const NAV_MODES = {
  WORKSPACE: 'workspace',
  SPLIT: 'split',
  DISASTER: 'disaster',
  MEASURE: 'measure',
  CONFIDENCE: 'confidence',
  BATCH: 'batch',
};

export default function SidebarNav({ activeMode, onSelectMode, onOpenUpload }) {
  const navItems = [
    {
      id: NAV_MODES.WORKSPACE,
      label: '3D Flythrough',
      sublabel: 'Interactive Mesh & Drone Camera',
      icon: Box,
      accent: 'cyan'
    },
    {
      id: NAV_MODES.SPLIT,
      label: 'Before/After Split',
      sublabel: '2D Photo vs 3D Elevation Sync',
      icon: Columns,
      accent: 'cyan'
    },
    {
      id: NAV_MODES.DISASTER,
      label: 'Disaster Assessment',
      sublabel: 'Landslide Diff & Volumetric Loss',
      icon: AlertTriangle,
      accent: 'amber'
    },
    {
      id: NAV_MODES.MEASURE,
      label: 'Click-to-Measure',
      sublabel: '3D Raycast & Cross-Section Profile',
      icon: Ruler,
      accent: 'cyan'
    },
    {
      id: NAV_MODES.CONFIDENCE,
      label: 'Uncertainty Map',
      sublabel: 'AI Error & Occlusion Overlay',
      icon: ShieldCheck,
      accent: 'green'
    },
    {
      id: NAV_MODES.BATCH,
      label: 'Regional Stitching',
      sublabel: 'Multi-Tile Terrain Merging (F9)',
      icon: Grid,
      accent: 'cyan'
    }
  ];

  return (
    <aside className="w-16 md:w-64 border-r border-space-border bg-space-panel/95 backdrop-blur-md flex flex-col justify-between select-none z-20 transition-all">
      {/* Navigation Buttons */}
      <div className="py-4 space-y-1.5 px-2">
        <div className="hidden md:block px-3 py-1.5 text-[10px] font-mono uppercase text-telemetry-dim tracking-widest">
          OPERATION MODES
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                telemetryAudio.playClick();
                onSelectMode(item.id);
              }}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative ${
                isActive
                  ? 'bg-space-elevated border border-cyan-glow/40 text-cyan-glow shadow-[0_0_15px_rgba(62,214,255,0.12)]'
                  : 'hover:bg-space-elevated/60 text-telemetry-muted hover:text-telemetry-text border border-transparent'
              }`}
              title={item.label}
            >
              {/* Active cyan pip */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-glow shadow-[0_0_8px_#3ED6FF]" />
              )}
              
              <div className={`p-1.5 rounded-md ${
                isActive 
                  ? 'bg-cyan-glow/15 text-cyan-glow' 
                  : 'bg-space-bg/50 text-telemetry-muted group-hover:text-cyan-glow'
              } transition-colors`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="hidden md:block overflow-hidden">
                <div className={`text-xs font-mono font-medium truncate ${isActive ? 'text-cyan-glow font-bold' : 'text-telemetry-text'}`}>
                  {item.label}
                </div>
                <div className="text-[10px] text-telemetry-dim truncate">
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Upload & Quick Data Selector */}
      <div className="p-3 border-t border-space-border space-y-2">
        <button
          onClick={() => {
            telemetryAudio.playClick();
            onOpenUpload();
          }}
          className="w-full flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-cyan-glow/20 to-cyan-glow/10 border border-cyan-glow/40 hover:border-cyan-glow text-cyan-glow hover:shadow-[0_0_15px_rgba(62,214,255,0.25)] transition-all text-xs font-mono font-semibold"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden md:inline">UPLOAD IMAGE</span>
        </button>
        <div className="hidden md:block text-[10px] font-mono text-center text-telemetry-dim">
          ISRO Remote Sensing v2.4
        </div>
      </div>
    </aside>
  );
}
