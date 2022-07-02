# three-recalculate-normals

A simple raycasting based solution to correct normals for imported models in threeJS. The algorithm assumes the models are manifold (e.g exported from CAD).

To use this project:
`npm install` in terminal

To use the recalculation module alone,

1.  Download `src/recalculateNormals.js`,
2.  `import RecalculateNormals from "./recalculateNormals";` to import the module
3.  `RecalculateNormals(yourMesh)` to correct the normals to face outside. This assumes the model is already water-tight/manifold
