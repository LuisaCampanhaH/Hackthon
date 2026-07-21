// Colors converted from the design's OKLCH tokens to sRGB hex, since RN's
// color parser doesn't understand oklch() strings. See design handoff doc
// (design_handoff_gestao_medicamentos/README.md) for the source values.

export const lightColors = {
  bg: '#F6F3ED',
  surface: '#FEFDFA',
  surfaceAlt: '#EFEBE2',
  border: '#D6D0C6',
  textPrimary: '#1F1A14',
  textSecondary: '#595149',
  textMuted: '#837C74',
  primary: '#006E2F',
  primaryDark: '#005016',
  primaryTint: '#CBEFD6',
  onPrimary: '#F9FDFA',
  success: '#008E32',
  successTint: '#CEF4D2',
  successText: '#004E0F',
  warn: '#DF0000',
  warnTint: '#FFD6C2',
  warnText: '#A50000',
  gold: '#CFA508',
  goldTint: '#F7EBC6',
  goldText: '#6C4400',
  tabInactive: '#82897C',
  alertBg: '#FFE1D2',
  alertIconBg: '#D80000',
  alertTitle: '#430F0D',
  alertBody: '#522C1F',
  alertPrimaryBg: '#C90000',
  alertSecondaryBorder: '#C20000',
  alertSecondaryFg: '#970000',
  onWarn: '#FFFFFF',
  overlaySubtle: 'rgba(0,0,0,0.07)',
};

export const darkColors: typeof lightColors = {
  bg: '#0C110C',
  surface: '#161D16',
  surfaceAlt: '#212921',
  border: '#323B32',
  textPrimary: '#F0EEE9',
  textSecondary: '#B1AEA4',
  textMuted: '#7D7A71',
  primary: '#3BB360',
  primaryDark: '#008942',
  primaryTint: '#062F19',
  onPrimary: '#000A03',
  success: '#41BA5D',
  successTint: '#093213',
  successText: '#87E496',
  warn: '#FF372B',
  warnTint: '#49150F',
  warnText: '#FFA28E',
  gold: '#DDB227',
  goldTint: '#392C01',
  goldText: '#EEC96C',
  tabInactive: '#82897C',
  alertBg: '#2C0806',
  alertIconBg: '#F52027',
  alertTitle: '#FFDFD6',
  alertBody: '#E1B1A4',
  alertPrimaryBg: '#F52027',
  alertSecondaryBorder: '#EE3533',
  alertSecondaryFg: '#FF9985',
  onWarn: '#FFFFFF',
  overlaySubtle: 'rgba(255,255,255,0.10)',
};

export type ColorTokens = typeof lightColors;

export const radii = {
  lg: 20,
  md: 16,
  sm: 12,
  squircle: 14,
  pill: 999,
};

// A single explicit pixel scale used everywhere instead of Tamagui's $-token
// shorthands, so spacing stays deterministic and matches the design spec's
// literal numbers rather than whatever the token scale happens to resolve to.
export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  section: 26,
  cardPad: 26,
  cardPadSm: 20,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  hero: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 8,
  },
  dropdown: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;
