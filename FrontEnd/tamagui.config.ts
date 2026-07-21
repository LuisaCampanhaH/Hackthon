import { createTamagui } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';

// @tamagui/config's animation driver type doesn't structurally match
// CreateTamaguiProps in this version pairing; harmless at runtime, so only
// the animations key (not the whole config) is loosened to `any`.
const config = createTamagui({
  ...defaultConfig,
  animations: defaultConfig.animations as any,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required shape for Tamagui's declaration-merging config augmentation
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
