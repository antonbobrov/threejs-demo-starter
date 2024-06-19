import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import { NCallbacks } from '@anton.bobrov/vevet-init';
import {
  TCreateDatGuiSettingsReturns,
  createDatGuiSettings,
} from '@anton.bobrov/react-dat-gui';
import { TProps, TSettings } from './types';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import simplexNoise from '../webgl/shaders/simplexNoise.glsl';

export class PlaneElement {
  private get props() {
    return this._props;
  }

  private _startSize: { width: number; height: number };

  private _mesh: Mesh;

  private _geometry: PlaneGeometry;

  private _material: ShaderMaterial;

  private _gui: TCreateDatGuiSettingsReturns<TSettings>;

  private _callbacks: NCallbacks.IAddedCallback[] = [];

  constructor(private _props: TProps) {
    const { manager, settings } = _props;
    const { width: startWidth, height: startHeight } = manager;

    // save initial sizes
    this._startSize = { width: startWidth, height: startHeight };

    // create geometry
    this._geometry = new PlaneGeometry(startWidth, startHeight, 20, 20);

    // create shader material
    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader: simplexNoise + fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_aspect: { value: startWidth / startHeight },
        u_noiseScale: { value: settings.noiseScale },
      },
      defines: {
        NOISE_OCTAVES: settings.noiseOctaves,
      },
    });

    // create mesh
    this._mesh = new Mesh(this._geometry, this._material);
    manager.scene.add(this._mesh);

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

    // resize
    this._callbacks.push(manager.callbacks.add('resize', () => this._resize()));

    // render
    this._callbacks.push(manager.callbacks.add('render', () => this._render()));
  }

  /** Resize the scene */
  private _resize() {
    const { _startSize: startSize, props } = this;
    const { width, height } = props.manager;

    // calculate mesh scale
    const widthScale = width / startSize.width;
    const heightScale = height / startSize.height;

    // set mesh scale
    this._mesh.scale.set(widthScale, heightScale, 1);

    // uniforms
    this._material.uniforms.u_aspect.value = width / height;
  }

  /** Render the scene */
  private _render() {
    const { easeMultiplier } = this.props.manager;
    const { uniforms } = this._material;

    uniforms.u_time.value += 1 * easeMultiplier;
  }

  /** Destroy the scene */
  public destroy() {
    this.props.manager.scene.remove(this._mesh);
    this._material.dispose();
    this._geometry.dispose();

    this._gui.destroy();

    this._callbacks.forEach((event) => event.remove());
  }
}
