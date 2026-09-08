import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import SidebarNav, { NAV_MODES } from './components/SidebarNav';
import Viewport3D from './components/Viewport3D';
import ImageUploadCard from './components/ImageUploadCard';
import DepthMapViewer from './components/DepthMapViewer';
import MeasurementTool from './components/MeasurementTool';
import DisasterCompare from './components/DisasterCompare';
import ConfidenceOverlay from './components/ConfidenceOverlay';
import BatchStitching from './components/BatchStitching';
import ProcessingStatus from './components/ProcessingStatus';
import ExportModal from './components/ExportModal';
import BeforeAfterSlider from './components/BeforeAfterSlider';

import { DEMO_DATASETS } from './lib/demoDatasets';
import { 
  estimateDepthFromImage, 
  generateDepthDataUrl, 
  calculateDisasterDifference,
  COLORMAPS 
} from './lib/depthPipeline';
import { SHADING_MODES } from './lib/terrainMesh';
import { telemetryAudio } from './lib/audioTelemetry';
import { ChevronRight, ChevronLeft, Layers, Sliders, Eye } from 'lucide-react';

export default function App() {
  // Navigation & Dataset State
  const [activeMode, setActiveMode] = useState(NAV_MODES.WORKSPACE);
  const [activeDatasetId, setActiveDatasetId] = useState('himalaya');
  const [customDataset, setCustomDataset] = useState(null);

  // Depth Data & Pipeline State
  const [depthData, setDepthData] = useState(null);
  const [depthDataUrl, setDepthDataUrl] = useState(null);
  const [depthStats, setDepthStats] = useState(null);
  const [disasterStats, setDisasterStats] = useState(null);
  const [activeColormap, setActiveColormap] = useState(COLORMAPS.INFERNO);

  // 3D Viewport Controls
  const [shadingMode, setShadingMode] = useState(SHADING_MODES.TEXTURE);
  const [reliefExaggeration, setReliefExaggeration] = useState(2.0);
  const [isFlythroughActive, setIsFlythroughActive] = useState(false);
  
  // Measurement Tool State
  const [isMeasureActive, setIsMeasureActive] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);

  // Modals & Panels
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Active dataset object
  const currentDataset = customDataset || DEMO_DATASETS.find(d => d.id === activeDatasetId) || DEMO_DATASETS[0];

  // Process Dataset & Generate Elevation Depth Map
  const processImage = useCallback(async (dataset) => {
    setIsProcessing(true);
    
    // Load image into HTML Image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataset.imageSrc;

    img.onload = async () => {
      // 1. Monocular depth estimation
      const result = await estimateDepthFromImage(img, {
        resolution: 256,
        baseElevation: dataset.baseElevation,
        maxElevation: dataset.maxElevation,
        gsd: dataset.gsd
      });

      // 2. Generate 2D colormap URL
      const dataUrl = generateDepthDataUrl(result.depthMap, result.width, result.height, activeColormap);

      // 3. Handle disaster comparison if disaster dataset
      let diffResults = null;
      if (dataset.isDisasterPair && dataset.preImageSrc) {
        const preImg = new Image();
        preImg.crossOrigin = 'anonymous';
        preImg.src = dataset.preImageSrc;
        
        preImg.onload = async () => {
          const preResult = await estimateDepthFromImage(preImg, {
            resolution: 256,
            baseElevation: dataset.baseElevation,
            maxElevation: dataset.maxElevation,
            gsd: dataset.gsd
          });

          diffResults = calculateDisasterDifference(
            preResult.depthMap, 
            result.depthMap, 
            result.width, 
            result.height
          );

          setDisasterStats(diffResults);

          setDepthData({
            depthMap: result.depthMap,
            confidenceMap: result.confidenceMap,
            diffMap: diffResults.diffMap,
            width: result.width,
            height: result.height,
            textureImage: img
          });
        };
      } else {
        setDepthData({
          depthMap: result.depthMap,
          confidenceMap: result.confidenceMap,
          diffMap: null,
          width: result.width,
          height: result.height,
          textureImage: img
        });
      }

      setDepthDataUrl(dataUrl);
      setDepthStats(result.stats);
      setReliefExaggeration(dataset.defaultRelief || 2.0);
    };
  }, [activeColormap]);

  // Initial load
  useEffect(() => {
    processImage(currentDataset);
  }, [activeDatasetId, customDataset]);

  // Update depth map preview when colormap changes
  useEffect(() => {
    if (depthData && depthData.depthMap) {
      const url = generateDepthDataUrl(depthData.depthMap, depthData.width, depthData.height, activeColormap);
      setDepthDataUrl(url);
    }
  }, [activeColormap, depthData]);

  // Handlers
  const handleSelectDataset = (id) => {
    setCustomDataset(null);
    setActiveDatasetId(id);
    setMeasurePoints([]);
    setIsFlythroughActive(false);
    if (id === 'disaster') {
      setActiveMode(NAV_MODES.DISASTER);
    }
  };

  const handleCustomUpload = (data) => {
    const newDs = {
      id: 'custom_' + Date.now(),
      name: data.name || 'User Aerial Survey Capture',
      subtext: 'Monocular Custom Ingest',
      type: 'Custom Aerial / Satellite Photo',
      thumbnail: data.imageSrc,
      imageSrc: data.imageSrc,
      location: 'Custom Coordinates',
      sensor: 'Drone / Aerial Sensor',
      gsd: 'Estimated 0.35m GSD',
      baseElevation: 500,
      maxElevation: 1200,
      defaultRelief: 2.0,
      description: 'Single-view custom photograph processed via client-side monocular elevation inference.'
    };
    setCustomDataset(newDs);
    setMeasurePoints([]);
    setIsFlythroughActive(false);
    setActiveMode(NAV_MODES.WORKSPACE);
  };

  const handleMeasurePointAdd = (pt) => {
    if (measurePoints.length >= 2) {
      setMeasurePoints([pt]);
    } else {
      setMeasurePoints([...measurePoints, pt]);
    }
  };

  const handleClearMeasure = () => {
    setMeasurePoints([]);
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === NAV_MODES.MEASURE) {
      setIsMeasureActive(true);
      setIsRightPanelOpen(true);
    } else if (mode === NAV_MODES.CONFIDENCE) {
      setShadingMode(SHADING_MODES.CONFIDENCE);
      setIsRightPanelOpen(true);
    } else if (mode === NAV_MODES.DISASTER) {
      if (activeDatasetId !== 'disaster') {
        setActiveDatasetId('disaster');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-space-bg text-telemetry-text overflow-hidden font-sans">
      {/* Top Mission Control Header */}
      <Header 
        activeDataset={currentDataset}
        activeMode={activeMode}
        onOpenExport={() => setIsExportOpen(true)}
        reliefExaggeration={reliefExaggeration}
        onReliefChange={setReliefExaggeration}
      />

      {/* Main Container: Sidebar + Central Stage + Right Inspection Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Mode Rail */}
        <SidebarNav 
          activeMode={activeMode}
          onSelectMode={handleModeChange}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* Central Viewport Area */}
        <main className="flex-1 relative h-full overflow-hidden bg-space-bg cyber-grid">
          {activeMode === NAV_MODES.DISASTER ? (
            <DisasterCompare 
              dataset={currentDataset}
              disasterStats={disasterStats}
              isDiffActive={shadingMode === SHADING_MODES.DISASTER_DIFF}
              onActivateDisasterDiff={() => {
                setShadingMode(
                  shadingMode === SHADING_MODES.DISASTER_DIFF 
                    ? SHADING_MODES.TEXTURE 
                    : SHADING_MODES.DISASTER_DIFF
                );
                setActiveMode(NAV_MODES.WORKSPACE);
              }}
            />
          ) : activeMode === NAV_MODES.SPLIT ? (
            <div className="w-full h-full p-4">
              <BeforeAfterSlider 
                leftImage={currentDataset.imageSrc}
                rightImage={depthDataUrl || currentDataset.imageSrc}
                leftLabel="2D SATELLITE ORTHOPHOTO"
                rightLabel="RECONSTRUCTED 3D ELEVATION"
              />
            </div>
          ) : activeMode === NAV_MODES.BATCH ? (
            <BatchStitching 
              onApplyStitchedTerrain={() => setActiveMode(NAV_MODES.WORKSPACE)}
            />
          ) : (
            // Default 3D Viewport Workspace
            <Viewport3D 
              depthData={depthData}
              activeDataset={currentDataset}
              reliefExaggeration={reliefExaggeration}
              shadingMode={shadingMode}
              onShadingChange={setShadingMode}
              isMeasureActive={isMeasureActive}
              measurePoints={measurePoints}
              onMeasurePointAdd={handleMeasurePointAdd}
              onClearMeasure={handleClearMeasure}
              isFlythroughActive={isFlythroughActive}
              onToggleFlythrough={() => setIsFlythroughActive(!isFlythroughActive)}
            />
          )}

          {/* Collapsible Right Panel Toggle Button */}
          {activeMode === NAV_MODES.WORKSPACE || activeMode === NAV_MODES.MEASURE || activeMode === NAV_MODES.CONFIDENCE ? (
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className="absolute top-4 right-4 z-20 p-1.5 rounded-lg glass-panel hover:border-cyan-glow/40 text-telemetry-muted hover:text-cyan-glow transition-all"
              title={isRightPanelOpen ? "Collapse Telemetry Deck" : "Expand Telemetry Deck"}
            >
              {isRightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          ) : null}
        </main>

        {/* Right Collapsible Inspection Panel */}
        {isRightPanelOpen && (activeMode === NAV_MODES.WORKSPACE || activeMode === NAV_MODES.MEASURE || activeMode === NAV_MODES.CONFIDENCE) && (
          <aside className="w-80 border-l border-space-border bg-space-panel/95 backdrop-blur-md p-3.5 space-y-3.5 overflow-y-auto z-20 select-none animate-fadeIn">
            {/* Depth Map Viewer */}
            <DepthMapViewer 
              depthDataUrl={depthDataUrl}
              depthStats={depthStats}
              activeColormap={activeColormap}
              onColormapChange={setActiveColormap}
            />

            {/* Click-to-Measure Tool */}
            <MeasurementTool 
              isActive={isMeasureActive}
              onToggleActive={() => setIsMeasureActive(!isMeasureActive)}
              measurePoints={measurePoints}
              onClearMeasure={handleClearMeasure}
              depthStats={depthStats}
              depthMap={depthData?.depthMap}
              mapWidth={depthData?.width}
              mapHeight={depthData?.height}
            />

            {/* Confidence & Uncertainty Overlay */}
            <ConfidenceOverlay 
              isConfidenceActive={shadingMode === SHADING_MODES.CONFIDENCE}
              onActivateConfidenceMode={() => {
                setShadingMode(
                  shadingMode === SHADING_MODES.CONFIDENCE 
                    ? SHADING_MODES.TEXTURE 
                    : SHADING_MODES.CONFIDENCE
                );
              }}
              confidenceMap={depthData?.confidenceMap}
            />
          </aside>
        )}
      </div>

      {/* Modals */}
      <ImageUploadCard 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectDataset={handleSelectDataset}
        onCustomImageUpload={handleCustomUpload}
        activeDatasetId={activeDatasetId}
      />

      <ExportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        terrainMesh={null}
        depthDataUrl={depthDataUrl}
        datasetName={currentDataset.id}
      />

      <ProcessingStatus 
        isProcessing={isProcessing}
        onFinished={() => setIsProcessing(false)}
      />
    </div>
  );
}
