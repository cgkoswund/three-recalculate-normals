import * as THREE from "three";

const faceCount = (intersectionPointsArray) => {
  let intersects = intersectionPointsArray;

  //loop through array and compare positions to ensure no two points are repeating.
  //since its by ordered distance, repeating points are going to be next to each other always
  //ie if points[i] == points[i+1], pop[i]
  for (let i = 0; i < intersectionPointsArray.length; i++) {
    while (
      intersects[i + 1] &&
      intersects[i].distance == intersects[i + 1].distance
    ) {
      intersects.splice(i, 1);
    }
    if (intersects[i + 1]) {
    } else break;
  }
  return intersects.length;
};
const isFlipped = (faceArray) => {
  const count = faceCount(faceArray);
  if (count % 2 == 0) return true;
  else return false;
};
const RecalculateNormals = (mesh) => {
  const meshMaterial = mesh.material;

  //double sided material for raycasting to work
  mesh.material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

  const tempMesh = new THREE.Mesh(new THREE.BufferGeometry());
  console.log(tempMesh.geometry);
  tempMesh.geometry.copy(mesh.geometry);
  mesh.geometry.computeVertexNormals(true);

  const pos = mesh.geometry.attributes.position.array;
  const norm = mesh.geometry.attributes.normal.array;
  const indices = mesh.geometry.index;

  const raycaster = new THREE.Raycaster();
  let rayOrigin = new THREE.Vector3(0, 0.1, -10);
  let rayDirection = new THREE.Vector3(0, 0, 1);

  if (indices) {
    console.log("has indices");
    for (let i = 0; i < indices.array.length / 3; i++) {
      const faceCentre = [
        (pos[indices.array[i * 3] * 3] +
          pos[indices.array[i * 3 + 1] * 3] +
          pos[indices.array[i * 3 + 2] * 3]) /
          3,
        (pos[indices.array[i * 3] * 3 + 1] +
          pos[indices.array[i * 3 + 1] * 3 + 1] +
          pos[indices.array[i * 3 + 2] * 3 + 1]) /
          3,
        (pos[indices.array[i * 3] * 3 + 2] +
          pos[indices.array[i * 3 + 1] * 3 + 2] +
          pos[indices.array[i * 3 + 2] * 3 + 2]) /
          3,
      ];
      const faceNormal = [
        (norm[indices.array[i * 3] * 3] +
          norm[indices.array[i * 3 + 1] * 3] +
          norm[indices.array[i * 3 + 2] * 3]) /
          3,
        (norm[indices.array[i * 3] * 3 + 1] +
          norm[indices.array[i * 3 + 1] * 3 + 1] +
          norm[indices.array[i * 3 + 2] * 3 + 1]) /
          3,
        (norm[indices.array[i * 3] * 3 + 2] +
          norm[indices.array[i * 3 + 1] * 3 + 2] +
          norm[indices.array[i * 3 + 2] * 3 + 2]) /
          3,
      ];

      rayOrigin = new THREE.Vector3(...faceCentre);
      rayDirection = new THREE.Vector3(...faceNormal).normalize();
      raycaster.set(rayOrigin, rayDirection);
      const intersects = raycaster.intersectObject(mesh, false);
      if (isFlipped(intersects)) {
        //flip normals
        const buffer = indices.array[i * 3];
        indices.array[i * 3] = indices.array[i * 3 + 1];
        indices.array[i * 3 + 1] = buffer;
        console.log("FLIPPING NORMALS");
      }
    }
  } else {
    console.log("no indices");

    for (let i = 0; i < pos.length / 9; i++) {
      const faceCentre = [
        (pos[i * 9] + pos[i * 9 + 3] + pos[i * 9 + 6]) / 3,
        (pos[i * 9 + 1] + pos[i * 9 + 4] + pos[i * 9 + 7]) / 3,
        (pos[i * 9 + 2] + pos[i * 9 + 5] + pos[i * 9 + 8]) / 3,
      ];
      const faceNormal = [
        (norm[i * 9] + norm[i * 9 + 3] + norm[i * 9 + 6]) / 3,
        (norm[i * 9 + 1] + norm[i * 9 + 4] + norm[i * 9 + 7]) / 3,
        (norm[i * 9 + 2] + norm[i * 9 + 5] + norm[i * 9 + 8]) / 3,
      ];

      rayOrigin = new THREE.Vector3(...faceCentre);
      rayDirection = new THREE.Vector3(...faceNormal).normalize();
      raycaster.set(rayOrigin, rayDirection);
      const intersects = raycaster.intersectObject(mesh, false);
      console.log(faceCentre);
      console.log(intersects);
      if (isFlipped(intersects)) {
        //flip normals
        const bufferX = pos[i * 9];
        const bufferY = pos[i * 9 + 1];
        const bufferZ = pos[i * 9 + 2];

        //replace 1st with second
        pos[i * 9] = pos[i * 9 + 3]; //x
        pos[i * 9 + 1] = pos[i * 9 + 4]; //y
        pos[i * 9 + 2] = pos[i * 9 + 5]; //z

        //replace second with buffer (1st)
        pos[i * 9 + 3] = bufferX;
        pos[i * 9 + 4] = bufferY;
        pos[i * 9 + 5] = bufferZ;
        console.log("FLIPPING NORMALS");
      }
    }
  }
  //return to original material
  mesh.material = meshMaterial;
};

export default RecalculateNormals;
