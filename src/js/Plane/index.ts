import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import {
  TCreateDatGuiSettingsReturns,
  createDatGuiSettings,
} from '@anton.bobrov/react-dat-gui';
import { TProps, TSettings } from './types';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import simplexNoise from '../shaders/simplexNoise.glsl';

export class Plane {
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

  private _gui: TCreateDatGuiSettingsReturns<TSettings>;

  private _destructors: (() => void)[] = [];

  constructor(private _props: TProps) {
    const { webgl, settings } = _props;

    // Save initial sizes
    this._initWidth = webgl.width;
    this._initHeight = webgl.height;

    // Create geometry
    this._geometry = new PlaneGeometry(
      this._initWidth,
      this._initHeight,
      20,
      20,
    );

    // Create shader material
    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader: simplexNoise + fragmentShader,
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

    // create gui
    this._gui = createDatGuiSettings({
      name: 'PlaneElement',
      data: settings,
      parameters: {
        noiseOctaves: { type: 'number', min: 1, max: 16, step: 1 },
        noiseScale: { type: 'number', min: 0.5, max: 50, step: 0.05 },
      },
      isOpen: true,
      onChange: (data) => {
        this._material.uniforms.u_noiseScale.value = data.noiseScale;
        this._material.defines.NOISE_OCTAVES = data.noiseOctaves;

        this._material.needsUpdate = true;
      },
    });

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

    uniforms.u_time.value += 1 * webgl.raf.fpsFactor;
  }

  /** Destroy the scene */
  public destroy() {
    this.webgl.scene.remove(this._mesh);
    this._material.dispose();
    this._geometry.dispose();

    this._gui.destroy();

    this._destructors.forEach((destruct) => destruct());
  }
}
