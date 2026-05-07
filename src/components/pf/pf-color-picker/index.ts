export { default as PfColorPicker } from './PfColorPicker.vue'

export type PfColorPickerFormat = 'hex' | 'hsl' | 'rgb'

export interface PfColorPickerHsl {
  h: number
  s: number
  l: number
  a: number
}

export interface PfColorPickerRgb {
  r: number
  g: number
  b: number
  a: number
}

export interface PfColorPickerValue {
  hex: string
  hsl: PfColorPickerHsl
  rgb: PfColorPickerRgb
}
