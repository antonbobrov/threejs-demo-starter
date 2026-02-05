import { Webgl } from '../webgl';

export type TSettings = {
  noiseOctaves: number;
  noiseScale: number;
};

export type TProps = {
  webgl: Webgl;
  settings: TSettings;
};
