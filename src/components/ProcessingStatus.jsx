import React, { useEffect, useState } from 'react';
import { Activity, Layers, Box, Navigation, CheckCircle2 } from 'lucide-react';

export default function ProcessingStatus({ isProcessing, onFinished }) {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    { label: 'Analyzing image luminance & texture gradients...', icon: Activity },
    { label: 'Estimating monocular elevation depth cues...', icon: Layers },
    { label: 'Reconstructing 3D terrain surface mesh (40,000 vertices)...', icon: Box },
    { label: 'Calibrating Catmull-Rom flythrough spline trajectories...', icon: Navigation },
  ];

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onFinished) onFinished();
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing) return null;

  const StageIcon = stages[currentStage].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-bg/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md rounded-2xl glass-panel-elevated p-6 space-y-5 border border-cyan-glow/40 shadow-2xl relative overflow-hidden">
        {/* Radar scanning line effect */}
        <div className="radar-sweep" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/15 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow">
            <StageIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-telemetry-text tracking-wider uppercase">
              DEPTH ESTIMATION ENGINE
            </h3>
            <span className="text-[11px] font-mono text-cyan-glow">
              STAGE {currentStage + 1} OF {stages.length}
            </span>
          </div>
        </div>

        {/* Current Active Task Text */}
        <div className="p-3 rounded-xl bg-space-bg/60 border border-space-border text-xs font-mono text-telemetry-text flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
          <span>{stages[currentStage].label}</span>
        </div>

        {/* Progress Stages Checklist */}
        <div className="space-y-2 pt-1">
          {stages.map((st, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-2.5 text-[11px] font-mono transition-opacity ${
                  isCurrent ? 'text-cyan-glow font-bold opacity-100' : isCompleted ? 'text-signal-green opacity-80' : 'text-telemetry-dim opacity-40'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-signal-green" />
                ) : (
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                    isCurrent ? 'border-cyan-glow text-cyan-glow animate-spin' : 'border-telemetry-dim'
                  }`}>
                    {idx + 1}
                  </div>
                )}
                <span>{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-space-bg rounded-full overflow-hidden border border-space-border">
          <div 
            className="h-full bg-gradient-to-r from-cyan-glow to-signal-green rounded-full transition-all duration-300"
            style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
