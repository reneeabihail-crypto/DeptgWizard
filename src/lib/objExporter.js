/**
 * In-browser .OBJ terrain mesh exporter for GIS/CAD software
 */
export function exportTerrainToOBJ(mesh, filename = 'depthwizard_terrain.obj') {
  if (!mesh || !mesh.geometry) return;

  const geom = mesh.geometry;
  const positions = geom.attributes.position;
  const normals = geom.attributes.normal;
  const uvs = geom.attributes.uv;
  const indices = geom.index;

  let output = `# DepthWizard 3D Terrain Reconstructed Mesh\n`;
  output += `# Problem Statement: ISRO SIH26175 - Single-View Height Estimation\n`;
  output += `# Generated: ${new Date().toISOString()}\n\n`;

  // Vertices
  for (let i = 0; i < positions.count; i++) {
    output += `v ${positions.getX(i).toFixed(4)} ${positions.getY(i).toFixed(4)} ${positions.getZ(i).toFixed(4)}\n`;
  }

  // UV coordinates
  if (uvs) {
    for (let i = 0; i < uvs.count; i++) {
      output += `vt ${uvs.getX(i).toFixed(4)} ${uvs.getY(i).toFixed(4)}\n`;
    }
  }

  // Normals
  if (normals) {
    for (let i = 0; i < normals.count; i++) {
      output += `vn ${normals.getX(i).toFixed(4)} ${normals.getY(i).toFixed(4)} ${normals.getZ(i).toFixed(4)}\n`;
    }
  }

  // Faces
  output += `s 1\n`;
  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const a = indices.getX(i) + 1;
      const b = indices.getX(i + 1) + 1;
      const c = indices.getX(i + 2) + 1;
      output += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
    }
  } else {
    for (let i = 1; i <= positions.count; i += 3) {
      output += `f ${i}/${i}/${i} ${i + 1}/${i + 1}/${i + 1} ${i + 2}/${i + 2}/${i + 2}\n`;
    }
  }

  // Trigger browser download
  const blob = new Blob([output], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
