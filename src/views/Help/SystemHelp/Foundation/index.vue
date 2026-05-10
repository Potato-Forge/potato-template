<script setup lang="ts">
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  designHeroBadgeStyle,
  radiusScale,
  shadowScale,
  spacingScale,
  typeScale,
} from '@/views/Help/designGuidelines'

const radiusPreviewMap: Record<string, string> = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  '2xl': '1.25rem',
  full: '9999px',
}

const spacingPreviewBlocks = ['3.5rem', '2.5rem', '4.5rem']
</script>

<template>
  <PageLayout mode="flow" background="transparent" class="min-h-0 gap-4">
    <section class="rounded-2xl border border-border bg-card px-6 py-5">
      <div class="flex items-start justify-between gap-6">
        <div class="space-y-3">
          <pf-text as="h1" class="text-3xl">排版与空间</pf-text>
          <pf-text as="p" class="max-w-3xl text-muted-foreground mb-0">
            这一页只约束与实现直接相关的基础样式：字阶、间距、圆角和阴影。页面里的 subtitle、description 和 help 文案都应提供实际提示，而不是重复标题。
          </pf-text>
        </div>

        <div
          class="hidden md:flex items-center rounded-full border px-4 py-2 text-sm font-medium"
          :style="designHeroBadgeStyle"
        >
          Foundation
        </div>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">字阶与文本角色</pf-text>
        <div class="space-y-4">
          <div
            v-for="item in typeScale"
            :key="item.token"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <span class="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {{ item.token }}
              </span>
              <span class="text-xs text-muted-foreground">{{ item.className }}</span>
            </div>
            <pf-text :variant="item.token as 'h1' | 'h2' | 'h3' | 'body' | 'caption'" class="mb-2">
              {{ item.sample }}
            </pf-text>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.usage }}</pf-text>
          </div>
        </div>
      </PfCard>

      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">文本约束</pf-text>
        <div class="space-y-3 text-sm text-muted-foreground">
          <p class="mb-0">标题使用 font-headline，正文使用 font-body，代码与快捷键使用 mono。</p>
          <p class="mb-0">正文默认使用 foreground，说明类文本使用 muted-foreground，不继续增加私有灰色文字类。</p>
          <p class="mb-0">帮助页、设置页和大块容器中的标题层级按 h1 → h2 → h3 递进，同层标题不混用尺寸。</p>
        </div>
      </PfCard>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">间距刻度</pf-text>
        <div class="space-y-3">
          <div
            v-for="item in spacingScale"
            :key="item.token"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ item.token }}</pf-text>
              <span class="text-xs text-primary">{{ item.size }}</span>
            </div>
            <div class="mb-3 rounded-xl border border-dashed border-border/70 bg-card px-4 py-3">
              <div class="flex items-center" :style="{ gap: item.size }">
                <div
                  v-for="block in spacingPreviewBlocks"
                  :key="block"
                  class="h-3 rounded-full bg-primary/70"
                  :style="{ width: block }"
                ></div>
              </div>
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.usage }}</pf-text>
          </div>
        </div>
      </PfCard>

      <PfCard class="p-5 gap-4">
        <pf-text as="h3" class="mb-0">圆角与阴影</pf-text>
        <div class="space-y-3">
          <div
            v-for="item in radiusScale"
            :key="item.token"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ item.token }}</pf-text>
              <span class="text-xs text-primary">{{ item.value }}</span>
            </div>
            <div class="mb-3 flex items-center gap-3 rounded-xl border border-dashed border-border/70 bg-card px-4 py-3">
              <div
                class="h-12 flex-1 border border-border bg-content-surface"
                :style="{ borderRadius: radiusPreviewMap[item.token] }"
              ></div>
              <div
                class="h-10 w-18 border border-primary/25 bg-primary/10"
                :style="{ borderRadius: radiusPreviewMap[item.token] }"
              ></div>
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ item.usage }}</pf-text>
          </div>

          <div
            v-for="shadow in shadowScale"
            :key="shadow.token"
            class="rounded-2xl border border-border bg-background px-4 py-4"
          >
            <div class="mb-2 flex items-center justify-between gap-3">
              <pf-text as="h4" class="mb-0">{{ shadow.token }}</pf-text>
              <span class="text-xs text-primary">{{ shadow.className }}</span>
            </div>
            <div class="mb-3 rounded-xl border border-dashed border-border/70 bg-card px-4 py-4">
              <div
                class="rounded-2xl border border-border bg-background px-4 py-3"
                :class="shadow.className"
              >
                <pf-text as="p" class="mb-1 text-sm text-foreground">示例容器</pf-text>
                <pf-text as="p" class="mb-0 text-xs text-muted-foreground">
                  用来观察当前阴影在内容卡片上的层级感。
                </pf-text>
              </div>
            </div>
            <pf-text as="p" class="mb-0 text-sm text-muted-foreground">{{ shadow.usage }}</pf-text>
          </div>
        </div>
      </PfCard>
    </section>
  </PageLayout>
</template>

<style scoped></style>