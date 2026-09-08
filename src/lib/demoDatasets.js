/**
 * Pre-configured ISRO Remote Sensing Demo Datasets
 * Zero-latency fallback guarantee for SIH presentation
 */

export const DEMO_DATASETS = [
  {
    id: 'himalaya',
    name: 'Ladakh Himalayan Ridge & Valley',
    subtext: 'ISRO Cartosat-2 High-Res Panchromatic/Multispectral',
    type: 'Alpine Mountain Terrain',
    thumbnail: '/samples/himalaya.jpg',
    imageSrc: '/samples/himalaya.jpg',
    location: '34.1526° N, 77.5771° E',
    sensor: 'Cartosat-2 PAN/MX',
    gsd: '0.65m GSD',
    baseElevation: 3240,
    maxElevation: 5420,
    defaultRelief: 2.2,
    description: 'Extreme alpine topography featuring sharp arêtes, glacial cirques, scree moraines, and high valley floors. Demonstrates monocular depth estimation on complex high-contrast shadow casting.',
    cameraSettings: {
      position: [0, 45, 65],
      target: [0, 5, 0]
    }
  },
  {
    id: 'urban',
    name: 'Bengaluru URSC Tech Campus',
    subtext: 'ISRO Airborne High-Altitude Aerial Survey',
    type: 'Urban & Structural Infrastructure',
    thumbnail: '/samples/urban.jpg',
    imageSrc: '/samples/urban.jpg',
    location: '12.9716° N, 77.5946° E',
    sensor: 'ISRO Aerial Photogrammetry Suite',
    gsd: '0.25m GSD',
    baseElevation: 885,
    maxElevation: 965,
    defaultRelief: 1.4,
    description: 'High-density urban layout with geometric multi-story buildings, solar rooftop arrays, transit corridors, and green courtyards. Highlights planar roof elevation estimation.',
    cameraSettings: {
      position: [0, 55, 55],
      target: [0, 2, 0]
    }
  },
  {
    id: 'disaster',
    name: 'Wayanad Landslide Disaster Zone',
    subtext: 'Emergency Disaster Assessment (Pre vs Post)',
    type: 'Disaster Rapid Response',
    thumbnail: '/samples/disaster_after.jpg',
    imageSrc: '/samples/disaster_after.jpg',
    preImageSrc: '/samples/disaster_before.jpg',
    postImageSrc: '/samples/disaster_after.jpg',
    location: '11.5204° N, 76.1284° E',
    sensor: 'Disaster Monitoring Constellation & Drone Orthomosaic',
    gsd: '0.40m GSD',
    baseElevation: 720,
    maxElevation: 1340,
    defaultRelief: 1.8,
    isDisasterPair: true,
    description: 'Catastrophic debris flow and slope failure. Shows single-view before/after 3D volumetric difference estimation, scour depth measurement, and hazard mapping in coral red.',
    cameraSettings: {
      position: [0, 50, 60],
      target: [0, 0, 0]
    }
  }
];
