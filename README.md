# 🛰️ DepthWizard — Single-View Height Estimation & 3D Flythrough

> **SIH Problem Statement**: SIH26175  
> **Sponsoring Organization**: ISRO (Indian Space Research Organisation)  
> **Domain**: Remote Sensing, Monocular Elevation Synthesis & Geospatial 3D Flythrough

---

## 📌 Executive Summary
**DepthWizard** turns any single 2D satellite, aerial, or drone photograph into an explorable, flyable 3D terrain environment — instantly, without requiring stereo camera rigs, LiDAR passes, or multi-view photogrammetry.

Traditional 3D terrain reconstruction requires expensive stereo imagery or aerial LiDAR. DepthWizard bypasses these limitations using monocular elevation synthesis to reconstruct digital elevation models (DEM), deliver cinematic spline flythroughs, perform click-to-measure structural analysis, and compute post-disaster volumetric displacement.

---

## 🚀 Key Features

| Feature ID | Module | Capability Description |
| :--- | :--- | :--- |
| **F1** | **Ingest & Preprocessing** | Drag & drop satellite/aerial imagery (PNG/JPG/GeoTIFF) with automatic resolution scaling. |
| **F2** | **Elevation Depth Synthesis** | Monocular elevation extraction with colormaps (Inferno, Turbo, Hypsometric, Grayscale). |
| **F3** | **WebGL2 3D Terrain Engine** | Displaced high-density plane geometry (40,000 vertices) with custom lighting and relief scale ($0.8\times$ to $4.0\times$). |
| **F4** | **Cinematic Auto-Flythrough** | Smooth 3D `CatmullRomCurve3` camera trajectories with Drone HUD (Altitude, Airspeed, Pitch, Heading). |
| **F5** | **Synchronized Split View** | Interactive draggable before/after divider comparing flat 2D orthophotos against 3D elevation. |
| **F6** | **Click-to-Measure Tool** | Three.js raycasting to measure 3D distance, horizontal run, vertical $\Delta Z$, slope %, and **cross-section profile**. |
| **F7** | **Disaster Assessment Mode** | Pre vs Post comparison, 3D coral red hazard diff, and volumetric displacement estimation ($\Delta V\text{ m}^3$). |
| **F8** | **Confidence & Uncertainty Map** | Detection of model uncertainty in deep shadow occlusions, steep gradients, and sensor borders. |
| **F9** | **Batch Regional Stitching** | Multi-quadrant tile stitcher harmonizing adjacent single-view tiles into continuous $360\text{ km}^2$ models. |
| **Export** | **CAD / GIS Interoperability** | One-click export of 3D terrain as Wavefront `.OBJ`, 16-bit PNG depth map, and CSV elevation matrix. |

---

## 🏗️ System Architecture

```
                                    ┌────────────────────────────┐
                                    │  Single 2D Satellite Photo │
                                    │ (Cartosat, Aerial, Drone)  │
                                    └─────────────┬──────────────┘
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │    Monocular Elevation & Photometric Pipeline    │
                        │   (Luminance, Gradient & Topological Cues)       │
                        └─────────────┬──────────────────────┬─────────────┘
                                      │                      │
                                      ▼                      ▼
                       ┌────────────────────────┐  ┌─────────────────────┐
                       │  2D Elevation Depth    │  │  Confidence Map &   │
                       │  Map & Colormaps       │  │  Uncertainty Masks  │
                       └──────────────┬─────────┘  └─────────┬───────────┘
                                      │                      │
                                      ▼                      ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                       Three.js WebGL2 3D Rendering Stage                   │
    ├─────────────────────────────┬───────────────────────────────┬───────────────┤
    │  Dynamic Vertex             │  Catmull-Rom Flythrough       │  Raycaster    │
    │  Displacement & Sun Shadow  │  Spline Flight Director       │  Measurement  │
    └─────────────────────────────┴───────────────────────────────┴───────────────┘
                                                  │
                        ┌─────────────────────────┴───────────────────────┐
                        │                                                 │
                        ▼                                                 ▼
        ┌───────────────────────────────┐               ┌────────────────────────────────┐
        │  Export 3D Mesh (.OBJ / .MTL) │               │  Disaster Damage Differential  │
        │  Export PNG Depth / CSV Grid  │               │  & Volumetric Assessment (ΔV)  │
        └───────────────────────────────┘               └────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Installation
```bash
git clone https://github.com/your-repo/DepthWizard.git
cd DepthWizard
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🎯 3-Minute Hackathon Demo Script (For Judges)

1. **The Problem (0:00 - 0:30)**:
   - *"Stereo satellites require dual-satellite passes, and LiDAR flights cost thousands of dollars per hour. In disaster response or archival data, only one image exists. DepthWizard creates flyable 3D terrain from a single 2D image."*
2. **Terrain & Auto-Flythrough (0:30 - 1:15)**:
   - Point to the Himalayan terrain rendering at 60 FPS in WebGL2.
   - Click **"AUTO FLYTHROUGH"** — watch the camera glide down the valley.
   - Toggle shading modes: **"ELEVATION"** (hypsometric colors) and **"WIREFRAME"**.
3. **Click-to-Measure (1:15 - 1:55)**:
   - Click **"Click-to-Measure"** in the sidebar. Click a mountain peak (Point A) and valley floor (Point B).
   - Point to the real-time distance readout ($\approx 142\text{ m}$), vertical height difference ($\Delta Z$), and the dynamic **cross-section elevation profile graph**.
4. **Disaster Assessment (1:55 - 2:35)**:
   - Select **"Disaster Assessment"** in the sidebar.
   - Drag the before/after slider across the Wayanad landslide scene.
   - Point out the **Volumetric Loss ($\Delta V \approx 1,842,500\text{ m}^3$)** and click **"SHOW 3D HAZARD DIFF"** to display the coral red displacement overlay.
5. **Rigorous Transparency & Export (2:35 - 3:00)**:
   - Click **"Uncertainty Map"** to show where model confidence drops in deep shadows.
   - Click **"EXPORT 3D/DATA"** to demonstrate standard `.OBJ` download for Blender, ArcGIS, and QGIS.

---

## 🛰️ Preloaded ISRO Benchmark Datasets

1. **Ladakh Himalayan Range**:
   - High-relief alpine ridge & glacial valley (ISRO Cartosat-2 PAN/MX, $0.65\text{m}$ GSD).
2. **Bengaluru URSC Tech Campus**:
   - High-density urban structures and planar roofs (ISRO Aerial Photogrammetry Suite, $0.25\text{m}$ GSD).
3. **Wayanad Landslide Disaster Zone**:
   - Pre- and post-landslide disaster response with active debris scouring and hazard mapping ($0.40\text{m}$ GSD).

---

## 📄 License
Developed for the Smart India Hackathon (SIH26175). MIT License.
