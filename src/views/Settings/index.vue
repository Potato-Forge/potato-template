<script setup lang="ts">
import { Icon } from '@iconify/vue'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  THEME_PRESETS,
  getCustomThemeTokens,
  getThemeDisplayLabel,
  type ThemeMode,
  type ThemePresetKey,
} from '@/lib/theme-settings'
import { useSystemStore } from '@/store/systemStore'

const systemStore = useSystemStore()
const { themeSettings, resolvedThemeMode } = storeToRefs(systemStore)

const themeModes: Array<{ value: ThemeMode; label: string; description: string; icon: string }> = [
  {
    value: 'light',
    label: '浅色',
    description: '始终使用浅色界面，适合明亮环境。',
    icon: 'tabler:sun-high',
  },
  {
    value: 'dark',
    label: '深色',
    description: '始终使用深色界面，减少夜间眩光。',
    icon: 'tabler:moon-stars',
  },
  {
    value: 'system',
    label: '跟随系统',
    description: '自动跟随系统的暗亮模式变化。',
    icon: 'tabler:device-desktop',
  },
]

const presetEntries = Object.entries(THEME_PRESETS) as Array<
  [ThemePresetKey, (typeof THEME_PRESETS)[ThemePresetKey]]
>

const setThemeMode = (mode: ThemeMode) => {
  systemStore.setThemeMode(mode)
}

const setThemePreset = (preset: ThemePresetKey) => {
  systemStore.setThemePreset(preset)
}

const setCustomThemeColor = (color: string) => {
  systemStore.setCustomThemeColor(color)
}

const setThemeColorSource = () => {
  systemStore.setThemeColorSource('custom')
}

const tokenStyle = (token: string) => ({
  backgroundColor: `hsl(${token})`,
})

const currentModeLabel = computed(() => {
  return resolvedThemeMode.value === 'dark' ? '深色' : '浅色'
})

const currentPresetLabel = computed(() => getThemeDisplayLabel(themeSettings.value))
const customTokens = computed(() => getCustomThemeTokens(themeSettings.value.customColor))
const isCustomColorActive = computed(() => themeSettings.value.colorSource === 'custom')
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <section class="rounded-2xl border border-border bg-card px-6 py-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">主题设置</pf-text>
          <pf-text as="p" class="max-w-3xl text-muted-foreground mb-0">
            管理当前设备的界面模式和主题主色。切换后会立即应用到主按钮、焦点轮廓和选中态。
          </pf-text>
        </div>

        <div
          class="grid gap-3 rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground sm:grid-cols-2"
        >
          <div>
            当前界面模式：<span class="font-medium text-foreground">{{ currentModeLabel }}</span>
          </div>
          <div>
            当前主题主色：<span class="font-medium text-foreground">{{ currentPresetLabel }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <section class="rounded-2xl border border-border bg-card px-5 py-5">
        <div class="mb-4 space-y-1">
          <pf-text as="h2" class="text-xl">主题模式</pf-text>
          <pf-text as="p" class="text-muted-foreground mb-0">
            控制全局暗亮模式。选择“跟随系统”后，系统主题变化会自动生效。
          </pf-text>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <button
            v-for="item in themeModes"
            :key="item.value"
            type="button"
            class="rounded-2xl border px-4 py-4 text-left transition-colors"
            :class="
              themeSettings.mode === item.value
                ? 'border-primary bg-primary/8 text-foreground'
                : 'border-border bg-background hover:border-primary/35 hover:bg-muted'
            "
            @click="setThemeMode(item.value)"
          >
            <div class="mb-3 flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary"
                >
                  <Icon :icon="item.icon" class="text-xl" />
                </div>
                <div>
                  <pf-text as="p" class="font-medium mb-0">{{ item.label }}</pf-text>
                </div>
              </div>
              <div
                class="h-3 w-3 rounded-full"
                :class="themeSettings.mode === item.value ? 'bg-primary' : 'bg-border'"
              ></div>
            </div>
            <pf-text as="p" class="text-sm text-muted-foreground mb-0">
              {{ item.description }}
            </pf-text>
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-card px-5 py-5">
        <div class="mb-4 space-y-1">
          <pf-text as="h2" class="text-xl">主题主色</pf-text>
          <pf-text as="p" class="text-muted-foreground mb-0">
            可以使用预设主题色，也可以通过自定义颜色生成一套自己的主色系统。
          </pf-text>
        </div>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_320px]">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="[presetKey, preset] in presetEntries"
              :key="presetKey"
              type="button"
              class="rounded-2xl border px-4 py-4 text-left transition-colors"
              :class="
                themeSettings.colorSource === 'preset' && themeSettings.preset === presetKey
                  ? 'border-primary bg-primary/8 text-foreground'
                  : 'border-border bg-background hover:border-primary/35 hover:bg-muted'
              "
              @click="setThemePreset(presetKey)"
            >
              <div class="mb-3 flex items-center justify-between gap-3">
                <pf-text as="p" class="font-medium mb-0">{{ preset.label }}</pf-text>
                <div
                  class="h-3 w-3 rounded-full"
                  :class="
                    themeSettings.colorSource === 'preset' && themeSettings.preset === presetKey
                      ? 'bg-primary'
                      : 'bg-border'
                  "
                ></div>
              </div>

              <div class="mb-3 flex items-center gap-2">
                <div
                  class="h-8 flex-1 rounded-xl border border-border"
                  :style="tokenStyle(preset.tokens.light.primary)"
                ></div>
                <div
                  class="h-8 flex-1 rounded-xl border border-border"
                  :style="tokenStyle(preset.tokens.dark.primary)"
                ></div>
              </div>

              <pf-text as="p" class="text-sm text-muted-foreground mb-0">
                浅色 / 深色双模式下均提供配套强调色。
              </pf-text>
            </button>
          </div>

          <div
            class="rounded-2xl border px-4 py-4 transition-colors"
            :class="
              isCustomColorActive ? 'border-primary bg-primary/8' : 'border-border bg-background'
            "
            @click="setThemeColorSource"
          >
            <div class="mb-4 flex items-start justify-between gap-3">
              <div>
                <pf-text as="h3" class="text-lg mb-1">自定义颜色</pf-text>
                <pf-text as="p" class="text-sm text-muted-foreground mb-0">
                  使用颜色选择器生成自己的主题主色，并自动派生浅色与深色配套状态。
                </pf-text>
              </div>
              <div
                class="h-3 w-3 rounded-full"
                :class="isCustomColorActive ? 'bg-primary' : 'bg-border'"
              ></div>
            </div>

            <div class="mb-4 flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-xl border border-border shadow-[inset_0_1px_0_hsl(var(--foreground)/0.08)]"
                :style="{ backgroundColor: themeSettings.customColor }"
              ></div>
              <div class="min-w-0">
                <pf-text as="p" class="font-medium mb-0">{{ themeSettings.customColor }}</pf-text>
                <pf-text as="p" class="text-xs text-muted-foreground mb-0">
                  选择后会自动切换为自定义颜色模式。
                </pf-text>
              </div>
            </div>

            <div class="mb-4 grid grid-cols-2 gap-2">
              <div
                class="rounded-xl border border-border px-3 py-3"
                :style="tokenStyle(customTokens.light.primary)"
              >
                <pf-text as="p" class="text-xs opacity-70 mb-1">浅色主色</pf-text>
                <pf-text as="p" class="font-medium mb-0">Primary</pf-text>
              </div>
              <div
                class="rounded-xl border border-border px-3 py-3 text-white"
                :style="tokenStyle(customTokens.dark.primary)"
              >
                <pf-text as="p" class="text-xs opacity-70 mb-1">深色主色</pf-text>
                <pf-text as="p" class="font-medium mb-0">Primary</pf-text>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <PfColorPicker
                :model-value="themeSettings.customColor"
                @update:model-value="setCustomThemeColor"
              >
                <PfButton variant="outline" class="min-w-36 justify-between" @click.stop>
                  <template #prefix>
                    <span
                      class="h-4 w-4 rounded-full border border-border"
                      :style="{ backgroundColor: themeSettings.customColor }"
                    ></span>
                  </template>
                  选择颜色
                  <template #suffix>
                    <div class="i-tabler-color-picker text-muted-foreground"></div>
                  </template>
                </PfButton>
              </PfColorPicker>

              <PfButton
                variant="ghost"
                type="button"
                class="text-muted-foreground"
                @click.stop="setThemeColorSource"
              >
                使用当前自定义颜色
              </PfButton>
            </div>
          </div>
        </div>
      </section>
    </section>
  </PageLayout>
</template>
