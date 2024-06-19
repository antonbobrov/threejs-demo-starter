import { WebglManager } from '../webgl/Manager';

export type TSettings = {
  noiseOctaves: number;
  noiseScale: number;
};

export type TProps = {
  manager: WebglManager;
  settings: TSettings;
};
