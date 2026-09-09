# 🛰️ DepthWizard — Single-View Height Estimation & 3D Flythrough

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


## 📄 License
Developed for the Smart India Hackathon (SIH26175). MIT License.
