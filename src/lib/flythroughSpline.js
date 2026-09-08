import * as THREE from 'three';

export const FLIGHT_MODES = {
  RIDGE_PATROL: 'ridge_patrol',
  ORBIT_RECON: 'orbit_recon',
  TOPOGRAPHIC_DIVE: 'topographic_dive'
};

/**
 * Generates 3D spline curves suited for the terrain bounds
 */
export function createFlythroughCurves(terrainSize = 80, maxElevation = 25) {
  const half = terrainSize / 2;

  // 1. Ridge Patrol: Sweeping cinematic s-curve flying through valleys and ridges
  const ridgePoints = [
    new THREE.Vector3(-half * 0.9, maxElevation * 0.9, -half * 0.9),
    new THREE.Vector3(-half * 0.4, maxElevation * 0.5, -half * 0.2),
    new THREE.Vector3(0, maxElevation * 0.4, half * 0.1),
    new THREE.Vector3(half * 0.4, maxElevation * 0.6, -half * 0.3),
    new THREE.Vector3(half * 0.85, maxElevation * 0.8, half * 0.8),
    new THREE.Vector3(0, maxElevation * 1.1, half * 0.95),
    new THREE.Vector3(-half * 0.7, maxElevation * 0.95, 0),
    new THREE.Vector3(-half * 0.9, maxElevation * 0.9, -half * 0.9), // Closed loop
  ];
  const ridgeCurve = new THREE.CatmullRomCurve3(ridgePoints, true, 'centripetal', 0.5);

  // 2. Orbit Recon: 360-degree orbital surveillance around center
  const orbitPoints = [];
  const radius = terrainSize * 0.75;
  const numOrbitPoints = 12;
  for (let i = 0; i < numOrbitPoints; i++) {
    const angle = (i / numOrbitPoints) * Math.PI * 2;
    const altitude = maxElevation * (0.85 + Math.sin(angle * 2) * 0.2);
    orbitPoints.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      altitude,
      Math.sin(angle) * radius
    ));
  }
  const orbitCurve = new THREE.CatmullRomCurve3(orbitPoints, true, 'centripetal', 0.5);

  // 3. Topographic Dive: High altitude inspection swooping into low-altitude skimming
  const divePoints = [
    new THREE.Vector3(0, maxElevation * 1.8, -half * 1.1),
    new THREE.Vector3(-half * 0.5, maxElevation * 1.2, -half * 0.5),
    new THREE.Vector3(-half * 0.2, maxElevation * 0.35, 0),
    new THREE.Vector3(half * 0.3, maxElevation * 0.3, half * 0.3),
    new THREE.Vector3(half * 0.6, maxElevation * 0.7, half * 0.7),
    new THREE.Vector3(0, maxElevation * 1.5, half * 1.0),
    new THREE.Vector3(0, maxElevation * 1.8, -half * 1.1),
  ];
  const diveCurve = new THREE.CatmullRomCurve3(divePoints, true, 'centripetal', 0.5);

  return {
    [FLIGHT_MODES.RIDGE_PATROL]: ridgeCurve,
    [FLIGHT_MODES.ORBIT_RECON]: orbitCurve,
    [FLIGHT_MODES.TOPOGRAPHIC_DIVE]: diveCurve,
  };
}

/**
 * Computes camera position and lookAt target for normalized parameter t in [0, 1]
 */
export function getCameraFlythroughFrame(curve, t, lookAheadOffset = 0.04) {
  if (!curve) return null;

  // Normalized t in [0, 1]
  const normT = ((t % 1) + 1) % 1;
  const lookT = (((t + lookAheadOffset) % 1) + 1) % 1;

  const position = curve.getPointAt(normT);
  const lookAt = curve.getPointAt(lookT);

  // Calculate tangent for pitch/banking calculation
  const tangent = curve.getTangentAt(normT);
  const pitch = Math.asin(Math.max(-1, Math.min(1, -tangent.y))) * (180 / Math.PI);
  const heading = Math.atan2(tangent.x, tangent.z) * (180 / Math.PI);

  return {
    position,
    lookAt,
    telemetry: {
      altitudeMeters: Math.round(position.y * 35 + 500),
      airspeedKnots: Math.round(85 + Math.abs(tangent.y) * 40),
      pitchDegrees: Math.round(pitch),
      headingDegrees: Math.round((heading + 360) % 360),
    }
  };
}
