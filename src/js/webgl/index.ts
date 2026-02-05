import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Callbacks, IOnResize, onResize, vevet } from 'vevet';

import { IWebglCallbacksMap, IWebglProps } from './types';

export class Webgl {
  private _props: IWebglProps;

  private _canvas: HTMLCanvasElement;

  private _camera: PerspectiveCamera;

  private _renderer: WebGLRenderer;

  private _scene: Scene;

  private _callbacks: Callbacks<IWebglCallbacksMap>;

  private _resizer: IOnResize;

  private _width: number;

  private _height: number;

  private _stats: Stats;

  private _clock: Clock;

  private _orbits: OrbitControls;

  get props() {
    return this._props;
  }

  get container() {
    return this._container;
  }

  get callbacks() {
    return this._callbacks;
  }

  get scene() {
    return this._scene;
  }

  get renderer() {
    return this._renderer;
  }

  get camera() {
    return this._camera;
  }

  get time() {
    return this._clock.elapsedTime;
  }

  constructor(
    private _container: HTMLElement,
    initProps?: IWebglProps,
  ) {
    const defaultProps: IWebglProps = {
      near: 1,
      far: 10000,
    };

    this._props = { ...defaultProps, ...initProps };

    // Save initial sizes
    this._width = this._container.offsetWidth;
    this._height = this._container.offsetHeight;

    // Create canvas
    this._canvas = document.createElement('canvas');
    _container.appendChild(this._canvas);

    // Create camera
    this._camera = new PerspectiveCamera(
      this.fov,
      this.aspect,
      this._props.near,
      this._props.far,
    );
    this._camera.position.set(0, 0, this.perspective);

    // Create renderer
    this._renderer = new WebGLRenderer({
      ...this._props,
      canvas: this._canvas,
    });

    // Stats
    this._stats = new Stats();
    _container.appendChild(this._stats.dom);

    // Clock
    this._clock = new Clock();

    // Orbit controls
    this._orbits = new OrbitControls(this._camera, this._canvas);
    this._orbits.enableDamping = true;

    // Create scene
    this._scene = new Scene();

    // Create viewport callbacks
    this._resizer = onResize({
      element: _container,
      callback: () => this.resize(),
    });

    // Create callbacks
    this._callbacks = new Callbacks();

    // resize for the first time
    this.resize();

    // Create an animation frame
    this._renderer.setAnimationLoop(this.render.bind(this));
  }

  /** Resize the scene */
  public resize() {
    this._width = this._container.offsetWidth;
    this._height = this._container.offsetHeight;

    this._camera.fov = this.fov;
    this._camera.aspect = this.aspect;
    this._camera.position.set(0, 0, this.perspective);
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(this.width, this.height);
    this._renderer.setPixelRatio(Math.min(vevet.dpr, 2));

    this.callbacks.emit('resize', undefined);

    this.render();
  }

  /** Renderer width */
  get width() {
    return this._width;
  }

  /** Renderer height */
  get height() {
    return this._height;
  }

  /** Aspect ratio */
  private get aspect() {
    return this._width / this._height;
  }

  /** Camera FOV */
  private get fov() {
    const height = this._container.offsetHeight;
    const perspective = this._props.perspective ?? 2000;

    return (
      this._props.fov ||
      180 * ((2 * Math.atan(height / 2 / perspective)) / Math.PI)
    );
  }

  /** Camera perspective */
  private get perspective() {
    return this._props.perspective ?? 2000;
  }

  /** Render the scene */
  public render() {
    this.callbacks.emit('render', undefined);

    this._clock.getElapsedTime();
    this._orbits.update();

    if (this.width > 0 && this.height > 0) {
      this._renderer.render(this._scene, this._camera);
    }

    this._stats.update();
  }

  /** Destroy the manager */
  destroy() {
    this._canvas.remove();

    this._renderer.dispose();
    this._stats.dom.remove();

    this._callbacks.destroy();
    this._resizer?.remove();
  }
}
