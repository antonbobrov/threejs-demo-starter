// import { FullsizePlane } from './js/FullsizePlane';
import { BoxGeometry, Mesh, MeshNormalMaterial } from 'three';

import { Webgl } from './js/webgl';

import './styles/index.scss';

const container = document.getElementById('scene')!;

///// PIXEL UNITS /////

// const webgl = new Webgl(container);

// new FullsizePlane({
//   webgl,
//   settings: {
//     noiseOctaves: 8,
//     noiseScale: 5,
//   },
// });

///// PIXEL UNITS /////

///

///// NORMAL UNITS /////

const webgl = new Webgl(container, {
  near: 0.1,
  far: 50,
  fov: 75,
  perspective: 5,
});

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshNormalMaterial();

webgl.scene.add(new Mesh(geometry, material));
