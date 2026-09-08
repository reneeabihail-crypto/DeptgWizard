import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  Crosshair, 
  Sun, 
  Gauge, 
  Navigation,
  Compass,
  Layers
} from 'lucide-react';
import { buildTerrainMesh, SHADING_MODES } from '../lib/terrainMesh';
import { createFlythroughCurves, getCameraFlythroughFrame, FLIGHT_MODES } from '../lib/flythroughSpline';
import { telemetryAudio } from '../lib/audioTelemetry';

export default function Viewport3D({
  depthData,
  activeDataset,
  reliefExaggeration = 2.0,
  shadingMode = SHADING_MODES.TEXTURE,
  onShadingChange,
  isMeasureActive = false,
  measurePoints = [],
  onMeasurePointAdd,
  onClearMeasure,
  onMeasureComplete,
  isFlythroughActive = false,
  onToggleFlythrough
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const terrainMeshRef = useRef(null);
  const flythroughCurvesRef = useRef(null);
  const measureMarkersGroupRef = useRef(null);
  const sunLightRef = useRef(null);

  // Flythrough animation state
  const [flightMode, setFlightMode] = useState(FLIGHT_MODES.RIDGE_PATROL);
  const [flightSpeed, setFlightSpeed] = useState(1.0);
  const [flightT, setFlightT] = useState(0);
  const [telemetry, setTelemetry] = useState({
    altitudeMeters: 1420,
    airspeedKnots: 95,
    pitchDegrees: -4,
    headingDegrees: 184
  });

  // Sun azimuth & altitude
  const [sunAzimuth, setSunAzimuth] = useState(135);
  const [sunElevation, setSunElevation] = useState(45);
  const [showLightingControls, setShowLightingControls] = useState(false);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0E14);
    scene.fog = new THREE.FogExp2(0x0A0E14, 0.005);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    camera.position.set(0, 50, 75);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Append canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't clip under ground
    controls.minDistance = 10;
    controls.maxDistance = 250;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.HemisphereLight(0xD0E5FF, 0x131722, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFF7E6, 1.6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    const d = 60;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 6. Measure Markers Group
    const measureGroup = new THREE.Group();
    scene.add(measureGroup);
    measureMarkersGroupRef.current = measureGroup;

    // 7. Window Resize
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animFrameId;
    let lastTime = performance.now();
    let currentT = 0;

    const animate = (time) => {
      animFrameId = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Handle Flythrough
      if (isFlythroughActive && flythroughCurvesRef.current) {
        controls.enabled = false;
        const curve = flythroughCurvesRef.current[flightMode];
        if (curve) {
          const tIncrement = (delta * 0.04 * flightSpeed);
          currentT = (currentT + tIncrement) % 1.0;
          setFlightT(currentT);

          const frame = getCameraFlythroughFrame(curve, currentT);
          if (frame) {
            camera.position.copy(frame.position);
            camera.lookAt(frame.lookAt);
            setTelemetry(frame.telemetry);
          }
        }
      } else {
        controls.enabled = true;
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Sun Lighting Position
  useEffect(() => {
    if (!sunLightRef.current) return;
    const radAzimuth = (sunAzimuth * Math.PI) / 180;
    const radElev = (sunElevation * Math.PI) / 180;
    const dist = 100;
    const x = Math.sin(radAzimuth) * Math.cos(radElev) * dist;
    const y = Math.sin(radElev) * dist;
    const z = Math.cos(radAzimuth) * Math.cos(radElev) * dist;
    sunLightRef.current.position.set(x, y, z);
  }, [sunAzimuth, sunElevation]);

  // Rebuild Terrain Mesh on data or relief change
  useEffect(() => {
    if (!sceneRef.current || !depthData) return;

    // Remove existing terrain mesh
    if (terrainMeshRef.current) {
      sceneRef.current.remove(terrainMeshRef.current);
      if (terrainMeshRef.current.geometry) terrainMeshRef.current.geometry.dispose();
      if (terrainMeshRef.current.material) {
        if (Array.isArray(terrainMeshRef.current.material)) {
          terrainMeshRef.current.material.forEach(m => m.dispose());
        } else {
          terrainMeshRef.current.material.dispose();
        }
      }
    }

    // Build new terrain mesh
    const textureImg = depthData.textureImage || null;
    const mesh = buildTerrainMesh({
      depthMap: depthData.depthMap,
      confidenceMap: depthData.confidenceMap,
      diffMap: depthData.diffMap,
      mapWidth: depthData.width,
      mapHeight: depthData.height,
      textureElement: textureImg,
      terrainSize: 80,
      reliefExaggeration,
      shadingMode,
    });

    sceneRef.current.add(mesh);
    terrainMeshRef.current = mesh;

    // Generate flythrough curves for this terrain
    const maxElev = 22 * reliefExaggeration;
    flythroughCurvesRef.current = createFlythroughCurves(80, maxElev);
  }, [depthData, reliefExaggeration, shadingMode]);

  // Handle Raycasting for Click-to-Measure
  const handlePointerDown = useCallback((e) => {
    if (!isMeasureActive || !containerRef.current || !cameraRef.current || !terrainMeshRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObject(terrainMeshRef.current, false);

    if (intersects.length > 0) {
      const hit = intersects[0].point;
      telemetryAudio.playLockOn();
      onMeasurePointAdd({
        x: hit.x,
        y: hit.y,
        z: hit.z,
      });
    }
  }, [isMeasureActive, onMeasurePointAdd]);

  // Update Visual Measure Markers (Pins & Line)
  useEffect(() => {
    const group = measureMarkersGroupRef.current;
    if (!group) return;

    // Clear previous markers
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (measurePoints.length === 0) return;

    // Add Beacon Pins
    measurePoints.forEach((pt, idx) => {
      const pinColor = idx === 0 ? 0x3ED6FF : 0xFFB454;
      
      // Pin pole
      const poleGeom = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
      poleGeom.translate(0, 1.5, 0);
      const poleMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pole = new THREE.Mesh(poleGeom, poleMat);
      pole.position.set(pt.x, pt.y, pt.z);

      // Pin head sphere
      const headGeom = new THREE.SphereGeometry(0.8, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.set(pt.x, pt.y + 3.2, pt.z);

      // Light glow ring
      const ringGeom = new THREE.RingGeometry(0.8, 1.4, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: pinColor, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.8 
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(pt.x, pt.y + 0.1, pt.z);

      group.add(pole);
      group.add(head);
      group.add(ring);
    });

    // Add Connecting Laser Line
    if (measurePoints.length === 2) {
      const p1 = new THREE.Vector3(measurePoints[0].x, measurePoints[0].y + 0.5, measurePoints[0].z);
      const p2 = new THREE.Vector3(measurePoints[1].x, measurePoints[1].y + 0.5, measurePoints[1].z);
      
      const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x3ED6FF,
        dashSize: 1,
        gapSize: 0.5,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      group.add(line);
    }
  }, [measurePoints]);

  // Camera Quick Preset Handlers
  const setCameraPreset = (type) => {
    if (!cameraRef.current || !controlsRef.current) return;
    telemetryAudio.playClick();
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (type === 'nadir') {
      // Top down
      cam.position.set(0, 95, 0.1);
      ctrl.target.set(0, 0, 0);
    } else if (type === 'iso') {
      // Isometric 45
      cam.position.set(55, 45, 55);
      ctrl.target.set(0, 5, 0);
    } else if (type === 'horizon') {
      // Low angle ridge view
      cam.position.set(0, 14, 55);
      ctrl.target.set(0, 10, 0);
    }
    ctrl.update();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-space-bg select-none">
      {/* Three.js Canvas Container */}
      <div 
        ref={containerRef} 
        onPointerDown={handlePointerDown}
        className={`w-full h-full ${isMeasureActive ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
      />

      {/* Floating Shading & Render Mode Pill Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl glass-panel shadow-glass border border-space-border/80">
        {[
          { id: SHADING_MODES.TEXTURE, label: 'TEXTURE' },
          { id: SHADING_MODES.HYPSOMETRIC, label: 'ELEVATION' },
          { id: SHADING_MODES.WIREFRAME, label: 'WIREFRAME' },
          { id: SHADING_MODES.HILLSHADE, label: 'HILLSHADE' },
          { id: SHADING_MODES.CONFIDENCE, label: 'CONFIDENCE' },
          ...(depthData?.diffMap ? [{ id: SHADING_MODES.DISASTER_DIFF, label: 'DISASTER DIFF' }] : [])
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              telemetryAudio.playClick();
              onShadingChange(mode.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
              shadingMode === mode.id
                ? 'bg-cyan-glow/20 border border-cyan-glow text-cyan-glow shadow-[0_0_10px_rgba(62,214,255,0.2)]'
                : 'text-telemetry-muted hover:text-telemetry-text hover:bg-space-elevated'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Camera View Angle Presets & Sun Light Control (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-lg glass-panel">
          <button
            onClick={() => setCameraPreset('nadir')}
            className="px-2 py-1 rounded text-[10px] font-mono text-telemetry-muted hover:text-cyan-glow hover:bg-space-elevated transition-colors"
            title="Nadir (Top-Down Ortho View)"
          >
            NADIR (90°)
          </button>
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2 py-1 rounded text-[10px] font-mono text-telemetry-muted hover:text-cyan-glow hover:bg-space-elevated transition-colors"
            title="Isometric Perspective View"
          >
            ISOMETRIC (45°)
          </button>
          <button
            onClick={() => setCameraPreset('horizon')}
            className="px-2 py-1 rounded text-[10px] font-mono text-telemetry-muted hover:text-cyan-glow hover:bg-space-elevated transition-colors"
            title="Horizon Low Skim View"
          >
            HORIZON
          </button>
        </div>

        {/* Sun Azimuth Control Toggle */}
        <button
          onClick={() => setShowLightingControls(!showLightingControls)}
          className={`p-2 rounded-lg glass-panel transition-colors ${
            showLightingControls ? 'text-amber-glow border-amber-glow/40' : 'text-telemetry-muted hover:text-amber-glow'
          }`}
          title="Adjust Sun Azimuth / Shadow Angle"
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Sun Lighting Controls Popover */}
      {showLightingControls && (
        <div className="absolute top-16 right-4 z-20 w-64 p-3 rounded-xl glass-panel-elevated space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-telemetry-text font-semibold">
            <span className="flex items-center gap-1.5 text-amber-glow">
              <Sun className="w-3.5 h-3.5" /> SUN POSITION
            </span>
            <span className="text-[10px] text-telemetry-dim">AZIMUTH / ELEV</span>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-telemetry-muted mb-1">
              <span>AZIMUTH ANGLE</span>
              <span className="text-cyan-glow">{sunAzimuth}°</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              value={sunAzimuth} 
              onChange={(e) => setSunAzimuth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-telemetry-muted mb-1">
              <span>SOLAR ELEVATION</span>
              <span className="text-amber-glow">{sunElevation}°</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="85" 
              value={sunElevation} 
              onChange={(e) => setSunElevation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Flythrough HUD / Mission Control Telemetry Deck (Bottom Center) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[92%] max-w-2xl rounded-xl glass-panel-elevated p-3 flex flex-col gap-2.5 shadow-2xl border border-cyan-glow/20">
        <div className="flex items-center justify-between">
          {/* Left: Play/Pause Flythrough & Flight Mode */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                telemetryAudio.playClick();
                onToggleFlythrough();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all ${
                isFlythroughActive
                  ? 'bg-amber-glow/20 border border-amber-glow text-amber-glow shadow-[0_0_15px_rgba(255,180,84,0.3)]'
                  : 'bg-cyan-glow/20 border border-cyan-glow text-cyan-glow shadow-[0_0_15px_rgba(62,214,255,0.25)] hover:bg-cyan-glow/30'
              }`}
            >
              {isFlythroughActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isFlythroughActive ? 'PAUSE FLIGHT' : 'AUTO FLYTHROUGH'}</span>
            </button>

            {/* Flight Path Mode Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-space-bg/60 p-0.5 rounded-lg border border-space-border text-[10px] font-mono">
              {[
                { id: FLIGHT_MODES.RIDGE_PATROL, label: 'RIDGE' },
                { id: FLIGHT_MODES.ORBIT_RECON, label: 'ORBIT' },
                { id: FLIGHT_MODES.TOPOGRAPHIC_DIVE, label: 'DIVE' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    telemetryAudio.playClick();
                    setFlightMode(mode.id);
                  }}
                  className={`px-2 py-1 rounded transition-colors ${
                    flightMode === mode.id 
                      ? 'bg-cyan-glow/20 text-cyan-glow font-bold' 
                      : 'text-telemetry-muted hover:text-telemetry-text'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center/Right: Live Drone HUD Telemetry Indicators */}
          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="text-right">
              <span className="text-[10px] text-telemetry-dim block">ALTITUDE</span>
              <span className="text-cyan-glow font-bold">{telemetry.altitudeMeters}m</span>
            </div>
            <div className="h-5 w-px bg-space-border" />
            <div className="text-right">
              <span className="text-[10px] text-telemetry-dim block">AIRSPEED</span>
              <span className="text-signal-green font-bold">{telemetry.airspeedKnots} kts</span>
            </div>
            <div className="h-5 w-px bg-space-border" />
            <div className="text-right">
              <span className="text-[10px] text-telemetry-dim block">HEADING</span>
              <span className="text-amber-glow font-bold">{telemetry.headingDegrees}°</span>
            </div>
          </div>
        </div>

        {/* Flight Scrubber Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-telemetry-dim w-12">PATH T</span>
          <div className="flex-1 relative h-1.5 bg-space-bg rounded-full overflow-hidden border border-space-border">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-glow to-amber-glow rounded-full transition-all duration-75"
              style={{ width: `${(flightT * 100).toFixed(1)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-cyan-glow w-10 text-right">
            {(flightT * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Measure Tool Active Helper Banner */}
      {isMeasureActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl glass-panel-elevated border border-cyan-glow/50 text-cyan-glow text-xs font-mono flex items-center gap-3 animate-pulse shadow-cyan-glow">
          <Crosshair className="w-4 h-4 text-cyan-glow" />
          <span>
            {measurePoints.length === 0 
              ? 'CLICK POINT A ON TERRAIN TO START MEASUREMENT'
              : measurePoints.length === 1
              ? 'CLICK POINT B TO CALCULATE ELEVATION & DISTANCE'
              : 'MEASUREMENT COMPLETE • CLICK AGAIN TO RE-MEASURE'}
          </span>
          {measurePoints.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearMeasure();
              }}
              className="ml-2 px-2 py-0.5 rounded bg-space-bg border border-space-border text-[10px] text-telemetry-muted hover:text-signal-coral"
            >
              CLEAR
            </button>
          )}
        </div>
      )}
    </div>
  );
}
