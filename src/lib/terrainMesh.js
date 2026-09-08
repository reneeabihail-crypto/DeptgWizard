import * as THREE from 'three';
import { COLORMAPS } from './depthPipeline';

export const SHADING_MODES = {
  TEXTURE: 'texture',
  HYPSOMETRIC: 'hypsometric',
  WIREFRAME: 'wireframe',
  HILLSHADE: 'hillshade',
  CONFIDENCE: 'confidence',
  DISASTER_DIFF: 'disaster_diff'
};

/**
 * Builds or updates the 3D terrain mesh geometry and material
 */
export function buildTerrainMesh({
  depthMap,
  confidenceMap,
  diffMap,
  mapWidth = 256,
  mapHeight = 256,
  textureElement,
  terrainSize = 80,
  reliefExaggeration = 2.0,
  shadingMode = SHADING_MODES.TEXTURE,
  waterLevel = 0.08
}) {
  const segments = 200;
  const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
  geometry.rotateX(-Math.PI / 2); // Lay flat on X-Z plane, Y is elevation

  const positions = geometry.attributes.position;
  const count = positions.count;
  const colors = new Float32Array(count * 3);

  const maxDisplacement = (terrainSize * 0.28) * reliefExaggeration;

  // Vertex displacement & color mapping
  for (let i = 0; i < count; i++) {
    const u = (positions.getX(i) / terrainSize) + 0.5;
    const v = 1.0 - ((positions.getZ(i) / terrainSize) + 0.5); // Invert V to match image coordinates

    const px = Math.min(mapWidth - 1, Math.max(0, Math.floor(u * mapWidth)));
    const py = Math.min(mapHeight - 1, Math.max(0, Math.floor(v * mapHeight)));
    const mapIdx = py * mapWidth + px;

    const depthVal = depthMap ? depthMap[mapIdx] : 0;
    const elevationY = depthVal * maxDisplacement;
    positions.setY(i, elevationY);

    // Color generation based on mode
    if (shadingMode === SHADING_MODES.HYPSOMETRIC) {
      const col = getHypsometricRGB(depthVal);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    } else if (shadingMode === SHADING_MODES.CONFIDENCE && confidenceMap) {
      const conf = confidenceMap[mapIdx] || 0.8;
      // High conf: Green, Low conf: Coral Red
      if (conf > 0.6) {
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.85;
        colors[i * 3 + 2] = 0.4;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.35;
        colors[i * 3 + 2] = 0.35;
      }
    } else if (shadingMode === SHADING_MODES.DISASTER_DIFF && diffMap) {
      const delta = diffMap[mapIdx] || 0;
      if (delta < -0.06) {
        // Scour / Collapse: Coral Red
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.25;
        colors[i * 3 + 2] = 0.25;
      } else if (delta > 0.06) {
        // Accumulation / Mudflow: Amber
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.2;
      } else {
        // Stable terrain: Muted neutral
        colors[i * 3] = 0.35;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.45;
      }
    }
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  // Create Material
  let material;
  if (shadingMode === SHADING_MODES.TEXTURE && textureElement) {
    const texture = new THREE.CanvasTexture(textureElement);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: false,
    });
  } else if (shadingMode === SHADING_MODES.WIREFRAME) {
    material = new THREE.MeshBasicMaterial({
      color: 0x3ED6FF,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
  } else if (shadingMode === SHADING_MODES.HILLSHADE) {
    material = new THREE.MeshLambertMaterial({
      color: 0xD0D6E0,
      flatShading: false,
    });
  } else {
    // Vertex color modes (Hypsometric, Confidence, Disaster Diff)
    material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.7,
      metalness: 0.1,
      flatShading: false,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'terrainMesh';

  // Base Skirt (Curtain to close off open underside of terrain)
  const skirtGeom = new THREE.BoxGeometry(terrainSize, 1.5, terrainSize);
  const skirtMat = new THREE.MeshStandardMaterial({
    color: 0x131722,
    roughness: 0.9,
  });
  const skirt = new THREE.Mesh(skirtGeom, skirtMat);
  skirt.position.y = -0.75;
  mesh.add(skirt);

  return mesh;
}

function getHypsometricRGB(t) {
  if (t < 0.15) {
    return { r: 0.15, g: 0.35, b: 0.75 }; // Sea / Valley floor
  } else if (t < 0.45) {
    const p = (t - 0.15) / 0.3;
    return { r: 0.2 + 0.2 * p, g: 0.6 + 0.15 * p, b: 0.25 }; // Vegetation
  } else if (t < 0.75) {
    const p = (t - 0.45) / 0.3;
    return { r: 0.65 + 0.25 * p, g: 0.5 - 0.15 * p, b: 0.25 }; // Ridge
  } else {
    const p = (t - 0.75) / 0.25;
    return { r: 0.85 + 0.15 * p, g: 0.85 + 0.15 * p, b: 0.9 + 0.1 * p }; // Snow peak
  }
}
