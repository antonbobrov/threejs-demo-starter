import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial } from 'three';

import fragmentShader from './shaders/fragment.glsl';
import simplexNoise from './shaders/simplexNoise.glsl';
import vertexShader from './shaders/vertex.glsl';
import { TProps } from './types';

export class FullsizePlane {
  private get props() {
    return this._props;
  }

  private get webgl() {
    return this._props.webgl;
  }

  private _initWidth: number;

  private _initHeight: number;

  private _mesh: Mesh;

  private _geometry: PlaneGeometry;

  private _material: ShaderMaterial;

  private _destructors: (() => void)[] = [];

  constructor(private _props: TProps) {
    const { webgl, settings } = _props;

    // Save initial sizes
    this._initWidth = webgl.width;
    this._initHeight = webgl.height;

    // Create geometry
    this._geometry = new PlaneGeometry(this._initWidth, this._initHeight, 2, 2);

    // Create shader material
    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader: simplexNoise + fragmentShader,
      side: DoubleSide,
      uniforms: {
        u_time: { value: 0 },
        u_aspect: { value: this._initWidth / this._initHeight },
        u_noiseScale: { value: settings.noiseScale },
      },
      defines: {
        NOISE_OCTAVES: settings.noiseOctaves,
      },
    });

    // create mesh
    this._mesh = new Mesh(this._geometry, this._material);
    webgl.scene.add(this._mesh);

    // Resize
    this._destructors.push(webgl.callbacks.on('resize', () => this._resize()));

    // Render
    this._destructors.push(webgl.callbacks.on('render', () => this._render()));
  }

  /** Resize the scene */
  private _resize() {
    const { width, height } = this.webgl;

    // calculate mesh scale
    const widthScale = width / this._initWidth;
    const heightScale = height / this._initHeight;

    // set mesh scale
    this._mesh.scale.set(widthScale, heightScale, 1);

    // uniforms
    this._material.uniforms.u_aspect.value = width / height;
  }

  /** Render the scene */
  private _render() {
    const { webgl } = this.props;
    const { uniforms } = this._material;

    uniforms.u_time.value = webgl.time;
  }

  /** Destroy the scene */
  public destroy() {
    this.webgl.scene.remove(this._mesh);
    this._material.dispose();
    this._geometry.dispose();

    this._destructors.forEach((destruct) => destruct());
  }
}
