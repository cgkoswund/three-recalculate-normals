import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import RecalculateNormals from "./recalculateNormals";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

scene.add(new THREE.AxesHelper());

//lights
const light = new THREE.DirectionalLight();
scene.add(light);
const lightA = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(lightA);

//Meshes
let coneGeo = new THREE.ConeGeometry(0.1, 0.3, 8, 8);
const coneMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const coneMesh = new THREE.Mesh(coneGeo, coneMat);
scene.add(coneMesh);

const testCubeGeo = new THREE.BoxGeometry(1, 1, 1);
const testCubeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const testCubeMesh = new THREE.Mesh(testCubeGeo, testCubeMat);
scene.add(testCubeMesh);

/**
 *
 * Simulate missing faces
 */
const messUpSomeNormals = (mesh) => {
  // mesh.geometry = mesh.geometry.toNonIndexed();

  /*** HANDLE INDEXED GEOMETRY  */
  if (mesh.geometry.index) {
    for (let i = 0; i < mesh.geometry.index.length / 6; i++) {
      //flip half of the  faces
      const buffer = mesh.geometry.index.array[i * 3];
      mesh.geometry.index.array[i * 3] = mesh.geometry.index.array[i * 3 + 1];
      mesh.geometry.index.array[i * 3 + 1] = buffer;
    }
  } else {
    /**HANDLE NON INDEXED GEOMETRY */
    const pos = mesh.geometry.attributes.position.array;
    for (let i = 0; i < pos.length / 18; i++) {
      //flip half of the faces
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
    }
  }
};
//mess up some normals
messUpSomeNormals(testCubeMesh);

//fix messed up normals <-----------Only line required to use module
RecalculateNormals(testCubeMesh);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
const controls = new OrbitControls(camera, renderer.domElement);

const tick = () => {
  window.requestAnimationFrame(tick);
  controls.update();
  renderer.render(scene, camera);
};
tick();
