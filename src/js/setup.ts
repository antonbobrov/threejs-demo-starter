import { Plane } from './Plane';
import { Webgl } from './webgl';

export function setup() {
  const container = document.getElementById('scene');
  if (!container) {
    return;
  }

  const webgl = new Webgl(container);
  webgl.play();

  const plane = new Plane({
    webgl,
    settings: {
      noiseOctaves: 8,
      noiseScale: 5,
    },
  });

  console.log(plane);
}
