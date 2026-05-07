<script setup lang="ts">
import type {
  PfColorPickerFormat,
  PfColorPickerHsl,
  PfColorPickerRgb,
  PfColorPickerValue,
} from './index'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { PfButton } from '@/components/pf/pf-button'
import { PfHelp } from '@/components/pf/pf-help'

type HsvaColor = {
  h: number
  s: number
  v: number
  a: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    format?: PfColorPickerFormat
    swatches?: string[]
    hideContrastRatio?: boolean
    hideDefaultSwatches?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: '#2f7f6f',
    format: 'hex',
    swatches: () => [],
    hideContrastRatio: false,
    hideDefaultSwatches: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'valueChange', value: PfColorPickerValue): void
}>()

const DEFAULT_SWATCHES = ['#F8371A', '#F97C1B', '#FAC81C', '#3FD0B6', '#2CADF6', '#6462FC']
const panelRef = ref<HTMLElement | null>(null)
const colorType = ref<PfColorPickerFormat>(props.format)
const colorHsv = ref<HsvaColor>(hexToHsva(props.modelValue || '#2f7f6f'))

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
    colorHsv.value = hexToHsva(value)
  },
)

watch(
  () => props.format,
  (value) => {
    colorType.value = value
  },
)

const currentValue = computed<PfColorPickerValue>(() => ({
  hex: hsvaToHex(colorHsv.value),
  hsl: hsvaToHsla(colorHsv.value),
  rgb: hsvaToRgba(colorHsv.value),
}))

const mergedSwatches = computed(() => {
  const values = props.hideDefaultSwatches
    ? props.swatches
    : [...DEFAULT_SWATCHES, ...props.swatches]
  return Array.from(new Set(values.map(normalizeHexColor))).filter(Boolean)
})

const saturationPanelStyle = computed(() => ({
  backgroundColor: `hsl(${colorHsv.value.h} 100% 50%)`,
}))

const saturationThumbStyle = computed(() => ({
  left: `${colorHsv.value.s}%`,
  top: `${100 - colorHsv.value.v}%`,
}))

const hueTrackStyle = {
  background:
    'linear-gradient(90deg, rgb(255 0 0) 0%, rgb(255 255 0) 17%, rgb(0 255 0) 33%, rgb(0 255 255) 50%, rgb(0 0 255) 67%, rgb(255 0 255) 83%, rgb(255 0 0) 100%)',
}

const contrastRatios = computed(() => {
  const rgb = hsvaToRgba(colorHsv.value)
  const luminance = getRelativeLuminance(rgb)
  return {
    dark: Number(((1 + 0.05) / (luminance + 0.05)).toFixed(2)),
    light: Number(((luminance + 0.05) / 0.05).toFixed(2)),
  }
})

const updateColor = (nextColor: HsvaColor) => {
  const normalized = {
    h: ((nextColor.h % 360) + 360) % 360,
    s: clamp(nextColor.s, 0, 100),
    v: clamp(nextColor.v, 0, 100),
    a: clamp(nextColor.a, 0, 1),
  }

  colorHsv.value = normalized
  emit('update:modelValue', hsvaToHex(normalized))
  emit('valueChange', {
    hex: hsvaToHex(normalized),
    hsl: hsvaToHsla(normalized),
    rgb: hsvaToRgba(normalized),
  })
}

const setColorFromHex = (hex: string) => {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return
  updateColor(hexToHsva(normalized))
}

const onHueInput = (event: Event) => {
  const nextHue = Number((event.target as HTMLInputElement).value)
  updateColor({
    ...colorHsv.value,
    h: Number.isFinite(nextHue) ? nextHue : colorHsv.value.h,
  })
}

const updateSaturationFromPoint = (event: PointerEvent) => {
  if (!panelRef.value) return

  const rect = panelRef.value.getBoundingClientRect()
  const offsetX = clamp(event.clientX - rect.left, 0, rect.width)
  const offsetY = clamp(event.clientY - rect.top, 0, rect.height)

  updateColor({
    ...colorHsv.value,
    s: (offsetX / rect.width) * 100,
    v: 100 - (offsetY / rect.height) * 100,
  })
}

const onPanelPointerDown = (event: PointerEvent) => {
  updateSaturationFromPoint(event)

  const handleMove = (moveEvent: PointerEvent) => updateSaturationFromPoint(moveEvent)
  const handleUp = () => {
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', handleUp)
  }

  window.addEventListener('pointermove', handleMove)
  window.addEventListener('pointerup', handleUp)
}

const setHslChannel = (channel: 'h' | 's' | 'l', rawValue: string | number) => {
  const nextHsl = { ...currentValue.value.hsl }
  nextHsl[channel] = Number(rawValue)
  updateColor(hslaToHsva(nextHsl))
}

const setRgbChannel = (channel: 'r' | 'g' | 'b', rawValue: string | number) => {
  const nextRgb = { ...currentValue.value.rgb }
  nextRgb[channel] = Number(rawValue)
  updateColor(rgbaToHsva(nextRgb))
}

function normalizeHexColor(value: string) {
  const cleaned = value.trim().replace(/^#/, '')
  if (cleaned.length === 3 && /^[\da-fA-F]{3}$/.test(cleaned)) {
    return `#${cleaned
      .split('')
      .map((item) => item + item)
      .join('')
      .toUpperCase()}`
  }

  if (cleaned.length === 6 && /^[\da-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`
  }

  return ''
}

function hexToHsva(hex: string): HsvaColor {
  return rgbaToHsva(hexToRgba(hex))
}

function hexToRgba(hex: string): PfColorPickerRgb {
  const normalized = normalizeHexColor(hex) || '#000000'
  const parts = normalized.slice(1)
  return {
    r: Number.parseInt(parts.slice(0, 2), 16),
    g: Number.parseInt(parts.slice(2, 4), 16),
    b: Number.parseInt(parts.slice(4, 6), 16),
    a: 1,
  }
}

function rgbaToHsva(color: PfColorPickerRgb): HsvaColor {
  const red = clamp(Number(color.r), 0, 255) / 255
  const green = clamp(Number(color.g), 0, 255) / 255
  const blue = clamp(Number(color.b), 0, 255) / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }

  return {
    h: (hue + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
    a: clamp(Number(color.a ?? 1), 0, 1),
  }
}

function hsvaToRgba(color: HsvaColor): PfColorPickerRgb {
  const hue = ((color.h % 360) + 360) % 360
  const saturation = clamp(color.s, 0, 100) / 100
  const value = clamp(color.v, 0, 100) / 100
  const chroma = value * saturation
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const match = value - chroma

  let red = 0
  let green = 0
  let blue = 0

  if (hue < 60) [red, green, blue] = [chroma, x, 0]
  else if (hue < 120) [red, green, blue] = [x, chroma, 0]
  else if (hue < 180) [red, green, blue] = [0, chroma, x]
  else if (hue < 240) [red, green, blue] = [0, x, chroma]
  else if (hue < 300) [red, green, blue] = [x, 0, chroma]
  else [red, green, blue] = [chroma, 0, x]

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
    a: clamp(color.a, 0, 1),
  }
}

function hsvaToHex(color: HsvaColor) {
  const rgb = hsvaToRgba(color)
  const toHex = (value: number) => value.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

function hsvaToHsla(color: HsvaColor): PfColorPickerHsl {
  const saturation = clamp(color.s, 0, 100) / 100
  const value = clamp(color.v, 0, 100) / 100
  const lightness = value * (1 - saturation / 2)
  const nextSaturation =
    lightness === 0 || lightness === 1
      ? 0
      : (value - lightness) / Math.min(lightness, 1 - lightness)

  return {
    h: Math.round(color.h),
    s: Math.round(nextSaturation * 100),
    l: Math.round(lightness * 100),
    a: clamp(color.a, 0, 1),
  }
}

function hslaToHsva(color: PfColorPickerHsl): HsvaColor {
  const lightness = clamp(Number(color.l), 0, 100) / 100
  const saturation = clamp(Number(color.s), 0, 100) / 100
  const value = lightness + saturation * Math.min(lightness, 1 - lightness)
  const nextSaturation = value === 0 ? 0 : 2 * (1 - lightness / value)

  return {
    h: ((Number(color.h) % 360) + 360) % 360,
    s: nextSaturation * 100,
    v: value * 100,
    a: clamp(Number(color.a ?? 1), 0, 1),
  }
}

function getRelativeLuminance(color: PfColorPickerRgb) {
  const toSrgb = (value: number) => {
    const channel = clamp(value, 0, 255) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }

  const red = toSrgb(color.r)
  const green = toSrgb(color.g)
  const blue = toSrgb(color.b)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot>
        <PfButton variant="outline" :disabled="props.disabled" class="justify-between min-w-40">
          <template #prefix>
            <span
              class="h-4 w-4 rounded-full border border-border shadow-[inset_0_1px_1px_hsl(var(--foreground)/0.08)]"
              :style="{ backgroundColor: currentValue.hex }"
            ></span>
          </template>
          <span>{{ currentValue.hex }}</span>
          <template #suffix>
            <div class="i-tabler-chevron-down text-muted-foreground"></div>
          </template>
        </PfButton>
      </slot>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="start" side="bottom" :side-offset="8" class="w-[360px] p-0">
      <div class="space-y-4 p-4" @pointerdown.stop @click.stop>
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <pf-text as="p" class="font-medium mb-0">颜色选择器</pf-text>
            <span class="text-xs text-muted-foreground">当前值：{{ currentValue.hex }}</span>
          </div>

          <div
            ref="panelRef"
            class="relative h-42 cursor-crosshair overflow-hidden rounded-xl border border-border"
            :style="saturationPanelStyle"
            @pointerdown.prevent="onPanelPointerDown"
          >
            <div class="absolute inset-0 bg-[linear-gradient(90deg,#fff,transparent)]"></div>
            <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent,#000)]"></div>
            <div
              class="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.28)]"
              :style="saturationThumbStyle"
            ></div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>色相</span>
              <span>{{ Math.round(colorHsv.h) }}°</span>
            </div>
            <input
              class="pf-color-picker-range"
              type="range"
              min="0"
              max="360"
              :value="Math.round(colorHsv.h)"
              :style="hueTrackStyle"
              @input="onHueInput"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <PfButton variant="outline" class="w-22 justify-between uppercase">
                <span>{{ colorType }}</span>
                <template #suffix>
                  <div class="i-tabler-chevron-down text-muted-foreground"></div>
                </template>
              </PfButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" side="bottom" :side-offset="6">
              <DropdownMenuRadioGroup
                :model-value="colorType"
                @update:model-value="(value) => (colorType = value as PfColorPickerFormat)"
              >
                <DropdownMenuRadioItem value="hex">HEX</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="hsl">HSL</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rgb">RGB</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div class="min-w-0 flex-1">
            <Input
              v-if="colorType === 'hex'"
              :model-value="currentValue.hex"
              @update:model-value="(value) => setColorFromHex(String(value))"
            />

            <div v-else-if="colorType === 'hsl'" class="grid grid-cols-3 gap-2">
              <Input
                :model-value="Math.round(currentValue.hsl.h)"
                @update:model-value="(value) => setHslChannel('h', value)"
              />
              <Input
                :model-value="Math.round(currentValue.hsl.s)"
                @update:model-value="(value) => setHslChannel('s', value)"
              />
              <Input
                :model-value="Math.round(currentValue.hsl.l)"
                @update:model-value="(value) => setHslChannel('l', value)"
              />
            </div>

            <div v-else class="grid grid-cols-3 gap-2">
              <Input
                :model-value="currentValue.rgb.r"
                @update:model-value="(value) => setRgbChannel('r', value)"
              />
              <Input
                :model-value="currentValue.rgb.g"
                @update:model-value="(value) => setRgbChannel('g', value)"
              />
              <Input
                :model-value="currentValue.rgb.b"
                @update:model-value="(value) => setRgbChannel('b', value)"
              />
            </div>
          </div>
        </div>

        <div v-if="mergedSwatches.length" class="space-y-2">
          <pf-text as="p" class="text-sm text-muted-foreground mb-0">常用颜色</pf-text>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in mergedSwatches"
              :key="color"
              type="button"
              class="h-6 w-6 rounded-full border border-border ring-2 ring-transparent ring-offset-2 ring-offset-popover transition-all hover:scale-105"
              :class="currentValue.hex === color ? 'ring-primary' : ''"
              :style="{ backgroundColor: color }"
              :aria-label="`选择颜色 ${color}`"
              @click="setColorFromHex(color)"
            ></button>
          </div>
        </div>

        <div
          v-if="!props.hideContrastRatio"
          class="rounded-xl border border-border bg-muted/35 px-3 py-3"
        >
          <div class="mb-2 flex items-center gap-2">
            <pf-text as="p" class="font-medium mb-0">对比度参考</pf-text>
            <PfHelp position="right">
              <template #content>
                <div class="max-w-64 space-y-2 text-xs leading-5">
                  <p class="mb-0">对比度用于衡量文字和背景之间的可读性，数值越高越清晰。</p>
                  <p class="mb-0">基础可读：对应 WCAG 的 AA 标准，普通正文建议至少达到 4.5:1。</p>
                  <p class="mb-0">增强可读：对应 WCAG 的 AAA 标准，普通正文建议至少达到 7:1。</p>
                </div>
              </template>
            </PfHelp>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg border border-border bg-background px-3 py-3">
              <div class="mb-2 flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-black"
                  :style="{ backgroundColor: currentValue.hex }"
                >
                  A
                </div>
                <div>
                  <pf-text as="p" class="text-sm font-medium mb-0">浅色界面</pf-text>
                  <pf-text as="p" class="text-xs text-muted-foreground mb-0"
                    >假设文字使用深色</pf-text
                  >
                </div>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm text-muted-foreground">对比值 {{ contrastRatios.light }}</span>
                <div class="flex items-center gap-2">
                  <span
                    class="pf-color-badge"
                    :class="contrastRatios.light >= 4.5 ? 'pf-color-badge-pass' : ''"
                    >基础可读</span
                  >
                  <span
                    class="pf-color-badge"
                    :class="contrastRatios.light >= 7 ? 'pf-color-badge-pass' : ''"
                    >增强可读</span
                  >
                </div>
              </div>
            </div>

            <div class="rounded-lg border border-border bg-background px-3 py-3">
              <div class="mb-2 flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                  :style="{ backgroundColor: currentValue.hex }"
                >
                  A
                </div>
                <div>
                  <pf-text as="p" class="text-sm font-medium mb-0">深色界面</pf-text>
                  <pf-text as="p" class="text-xs text-muted-foreground mb-0"
                    >假设文字使用浅色</pf-text
                  >
                </div>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm text-muted-foreground">对比值 {{ contrastRatios.dark }}</span>
                <div class="flex items-center gap-2">
                  <span
                    class="pf-color-badge"
                    :class="contrastRatios.dark >= 4.5 ? 'pf-color-badge-pass' : ''"
                    >基础可读</span
                  >
                  <span
                    class="pf-color-badge"
                    :class="contrastRatios.dark >= 7 ? 'pf-color-badge-pass' : ''"
                    >增强可读</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
.pf-color-picker-range {
  width: 100%;
  height: 0.9rem;
  border-radius: 9999px;
  appearance: none;
  border: 1px solid hsl(var(--border));
}

.pf-color-picker-range::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid white;
  background: hsl(var(--foreground));
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.18);
}

.pf-color-picker-range::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid white;
  background: hsl(var(--foreground));
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.18);
}

.pf-color-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid hsl(var(--border));
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.pf-color-badge-pass {
  border-color: transparent;
  background: color-mix(in srgb, hsl(var(--success)) 18%, transparent);
  color: hsl(var(--success));
}
</style>
